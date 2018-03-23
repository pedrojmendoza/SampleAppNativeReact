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
      agent {
        docker {
          image 'thyrlian/android-sdk'
        }
      }
      steps {
        // unstash secrets
        unstash 'secrets'

        // invoke gradlew assembleRelease
        sh "cd android && ./gradlew assembleRelease"

        // stash APK
        stash includes: 'android/app/build/outputs/apk/app-release.apk', name: 'APK'
      }
    }

    stage ('End to end test') {
      agent {
        docker {
          image 'node:6'
        }
      }
      environment {
        HOME="."
      }
      steps {
        echo "End to end test ..."
        sh "npm config set proxy ${env.HTTP_PROXY}"
        sh "npm config set https-proxy ${env.HTTPS_PROXY}"
        sh "npm install"

        // unstash APK
        unstash 'APK'

        // start emulator
        sh "${env.ANDROID_HOME}/tools/emulator -avd Nexus_5X_API_25"

        // start Appium
        sh "npm run start:appium"

        // run end-to-end test
        sh "CI=true npm run test:e2e:android"

        // post terminate emulator/appium?
      }
    }

    stage ('Deploy to PlayStore internal test') {
      steps {
        echo "Deploy to PlayStore internal test ..."
        // unstash APK
        // invoke fastlane
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
      steps {
        echo "Promote to PlayStore PROD ..."
        // invoke fastlane
      }
    }
  }
}
