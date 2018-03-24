#!/usr/bin/env groovy
pipeline {
  agent any

  environment {
    S3_SECRETS_BUCKET = 'menpedro-playstore-secrets'
    ANDROID_HOME = '/Users/menpedro/Library/Android/sdk'
  }

  triggers {
    pollSCM('* * * * *')
  }

  stages {
    stage('Unit test') {
      agent {
        docker {
          image 'node:6'
        }
      }
      environment {
        HOME="."
      }
      steps {
        sh "npm config set proxy ${env.HTTP_PROXY}"
        sh "npm config set https-proxy ${env.HTTPS_PROXY}"
        sh "npm install"
        sh "CI=true npm test"
      }
    }

    stage('Security test') {
      steps {
        sh "docker run -v ${env.WORKSPACE}:/target -e HTTP_PROXY -e HTTPS_PROXY --rm stono/hawkeye"
      }
    }

    stage ('Grab secrets') {
      steps {
        // download secrets from S3
        sh "aws s3 cp s3://${env.S3_SECRETS_BUCKET}/google-play.json google-play.json"
        sh "aws s3 cp s3://${env.S3_SECRETS_BUCKET}/gradle.properties ./android/gradle.properties"
        sh "aws s3 cp s3://${env.S3_SECRETS_BUCKET}/my-release-key.keystore ./android/app/my-release-key.keystore"

        // stash secrets
        stash includes: 'google-play.json, android/gradle.properties, android/app/my-release-key.keystore', name: 'secrets'
      }
    }

    stage ('Build Android APK') {
      steps {
        // unstash secrets
        unstash 'secrets'

        // launch android sdk container
        sh "docker run -tid -v ${env.WORKSPACE}:/my-app -e HTTP_PROXY -e HTTPS_PROXY --name android --rm javiersantos/android-ci:latest"

        // install node
        sh "docker exec android sh -c 'mkdir /node'"
        sh "docker exec android sh -c 'cd /node && curl -sL https://nodejs.org/dist/v8.10.0/node-v8.10.0-linux-x64.tar.gz | tar xz --strip-components=1'"

        // npm install
        sh "docker exec android sh -c 'export PATH=$PATH:/node/bin && export HOME=. && cd /my-app && npm config set proxy ${env.HTTP_PROXY} && npm config set https-proxy ${env.HTTPS_PROXY} && npm install'"

        // gradle
        sh "docker exec android sh -c 'export PATH=$PATH:/node/bin && export HOME=. && cd /my-app/android && ./gradlew assembleRelease'"

        // emulator
        //sh "docker exec android sh -c '/sdk/tools/bin/sdkmanager \"system-images;android-25;google_apis;arm64-v8a\"'"
        //sh "docker exec android sh -c 'yes | /sdk/tools/bin/sdkmanager --licenses'"
        //sh "docker exec android sh -c 'echo \"no\" | /sdk/tools/bin/avdmanager create avd -n Nexus_5X_API_25 -k \"system-images;android-25;google_apis;arm64-v8a\" -f'"
        //sh "docker exec android sh -c 'export HOME=/root && cd /sdk/tools && emulator -avd Nexus_5X_API_25 -no-snapshot-load -no-skin -no-audio -no-window &'"

        // appium and e2e tests
        //sh "docker exec android sh -c 'export PATH=$PATH:/node/bin && export HOME=. && cd /my-app && npm run start:appium &'"
        //sh "docker exec android sh -c 'export PATH=$PATH:/node/bin && export HOME=. && cd /my-app && CI=true npm run test:e2e:android'"

        // stash APK
        sh "docker exec android sh -c 'chown jenkins /my-app/android/app/build/outputs/apk/app-release.apk"
        stash includes: '/my-app/android/app/build/outputs/apk/app-release.apk', name: 'APK'
      }
      post {
        always {
          sh 'docker exec android sh -c "cd /my-app && rm -rf .npm && rm -rf node_modules && rm -rf .config && rm -rf package-lock.json && rm -rf android/build && rm -rf android/.gradle && rm -rf android/app/build"'
          sh 'docker stop android'
        }
      }
    }

    stage ('Deploy to PlayStore BETA') {
      agent {
        docker {
          image 'ruby'
        }
      }
      steps {
        unstash 'secrets'
        unstash 'APK'
        sh 'gem install fastlane --verbose'
        sh 'cd android && fastlane supply --apk app/build/outputs/apk/app-release.apk --track beta'
      }
    }

    stage ('Promote to PlayStore PROD') {
      options {
          timeout(time: 5, unit: 'MINUTES')
      }
      input {
        message "Promote deployment to PROD?"
        ok "Yes, we should."
        submitter "admin"
      }
      agent {
        docker {
          image 'ruby'
        }
      }
      steps {
        unstash 'secrets'
        sh 'gem install fastlane --verbose'
        sh 'cd android && fastlane supply upload_to_play_store --track beta --track_promote_to production --skip_upload_apk true --skip_upload_metadata true --skip_upload_images true --skip_upload_screenshots true'
      }
    }
  }
}
