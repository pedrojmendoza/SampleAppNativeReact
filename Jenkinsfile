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

        // stash APK
        stash includes: 'android/app/build/outputs/apk/app-release.apk', name: 'APK'
      }
      post {
        always {
          sh 'docker exec android sh -c "cd /my-app && rm -rf .npm && rm -rf node_modules && rm -rf .config && rm -rf package-lock.json && rm -rf android/build && rm -rf android/.gradle && rm -rf android/app/build"'
          sh 'docker stop android'
        }
      }
    }

    stage ('End to end testing') {
      steps {
        unstash 'APK'
        sh "zip -r test_bundle.zip tests/ wheelhouse/ requirements.txt"
        sh "scripts/scheduleDeviceFarmTest.sh arn:aws:devicefarm:us-west-2:264359801351:project:d10ad03e-8060-49d1-bf7d-5ad3b9260ed8 arn:aws:devicefarm:us-west-2:264359801351:devicepool:d10ad03e-8060-49d1-bf7d-5ad3b9260ed8/7cefba36-444d-4912-a3ab-469e9ecc9e65 us-west-2 ${env.GIT_COMMIT}"
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
        sh 'cd android && fastlane supply --track beta --track_promote_to production --skip_upload_apk true --skip_upload_metadata true --skip_upload_images true --skip_upload_screenshots true'
      }
    }
  }
}
