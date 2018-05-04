This project demo a very simple mobile app for Android and iOS based on [React Native App](https://github.com/react-community/create-react-native-app) and supporting multiple countries by using component toggling based on environment variables.

Focus is on the CD process required to build/test/deploy the different versions of the app targeting the different countries.

## Table of Contents

* [Description](#description)
* [Pre conditions for Android](#pre-conditions-for-android)
* [Pre conditions for iOS](#pre-conditions-for-ios)
* [Steps for provisioning a new country for iOS](#steps-for-provisioning-a-new-country-for-ios)
* [TODOs](#todos)

## Description

Please refer to `Jenkinsfile.android` for the Android deployment pipeline definition and `Jenkinsfile.ios` for the iOS' one. There is no hard reason to keep them separately (just a matter of convenience during implementation to avoid changes on one platform' pipeline definition triggering the alternative one).

In order to create the corresponding pipelines, the pre-conditions listed below should be satisfied.

For the Android version of the pipeline, it has been successfully tested in an EC2 based Jenkins installation against the same codebase hosted in GitHub and my personal Google Play Store credentials and AWS S3/DeviceFarm installation.

For the iOS version of the pipeline, it has been successfully tested in an MacOS based Jenkins installation against the same codebase hosted in GitHub and my personal App Store credentials and AWS S3/DeviceFarm installation.

Pipeline includes stages for unit testing (using [Jest](https://facebook.github.io/jest/)), security testing (using [HawkEye](https://github.com/Stono/hawkeye)), APK build for 2 countries, End-to-end testing (using [Appium](http://appium.io/) + [pytest](https://docs.pytest.org/en/latest/) on [AWS DeviceFarm](https://aws.amazon.com/device-farm/)).

For the publication to stores, direct deployment to Google App Store (deployment to Beta and, manually approved in the pipeline, promotion to Prod using [fastlane](https://fastlane.tools/)) and signed APP/IPA build and direct deployment to App Store (deployment to TestFlight using [fastlane](https://fastlane.tools/) as well).

## Pre conditions for Android

1. Google Play Store apps for each country created
2. APK signing keys and Graddle's config files properly configured -> https://facebook.github.io/react-native/docs/signed-apk-android.html
3. Google credentials for publishing to PlayStore available -> https://docs.fastlane.tools/getting-started/android/setup/#collect-your-google-credentials
4. AWS Device Farm configured with a Project and Device Pool

Based on the above preconditions, the `Jenkisfile.android` (env variables and apps ids should be adjusted) and the Google and Graddle secrets uploaded in the S3 bucket (see `Jenkinsfile.android` for details on the expected object names within S3 bucket)

The machine running the Jenkins agents should have access to the S3 bucket as well as permissions to interact with the Device Farm artifacts

## Pre conditions for iOS

1. App Store apps for each country created in iTunes Connect (see details below on how to use `fastlane produce` for that)
2. Jenkins being able to use properly provisioned MacOS nodes for the xcodebuild execution
3. App Store provisioning profiles and corresponding certificates for code signing properly configured in separate (secrets) Git repo (see details below on how to use `fastlane match` for that)
4. AWS Device Farm configured with a Project and Device Pool

Based on the above preconditions, the `Jenkisfile.ios` (env variables and apps ids should be adjusted) and the App Store provisioning profiles and certificates created and uploaded in the secrets' Git repo (see `Jenkinsfile.ios` for details)

The machine running the Jenkins agents should have access to the secrets' Git repo as well as permissions to interact with the Device Farm artifacts

## Steps for provisioning a new country for iOS

1. Create new bundle ID in Apple Developer Center -> ```fastlane produce create --username pedrojmendoza@gmail.com --app_identifier com.menpedro.base64util.us --app_name "Base 64 util - US"```
2. Create certs for new bundle ID -> ```fastlane match appstore --username pedrojmendoza@gmail.com --app_identifier com.menpedro.base64util.us --git_url https://git-codecommit.us-east-1.amazonaws.com/v1/repos/AppStoreCerts```
3. Add configuration (use *ReleaseSpain* as origin) -> *XCode/Project/Info/Configurations/+* -> Changes will be reflected in `ios/mynativeapp.xcodeproj/project.pbxproj`
4. Adjust bundle id for new configuration -> *XCode/<Target>/Build Settings/Packaging/Product Bundle Identifier/Expand* -> Changes will be reflected in  `ios/mynativeapp.xcodeproj/project.pbxproj`
5. Adjust value for user defined setting for app name (*APP_DISPLAY_NAME*) -> *XCode/<Target>/Build Settings/APP_DISPLAY_NAME* -> Changes will be reflected in  `ios/mynativeapp.xcodeproj/project.pbxproj`
6. Adjust provisioning profile for new config -> *XCode/<Target>/General/Signing* -> Uncheck "Automatically manage signing" and select the corresponding profile for the new configuration -> Changes will be reflected in `ios/mynativeapp.xcodeproj/project.pbxproj`
7. Create environment file (`.env.us`) and set the environment variable to the appropiate value (`COUNTRY=US`)
8. Create new scheme for the new country -> *XCode/Product/Scheme/Manage Schemes/<Scheme>/Edit* -> *Duplicate Schema* -> *<Scheme>-US*
9. Inject environment into build process -> *XCode/Product/Scheme/Manage Schemes/<Scheme>-US/Edit* -> *Build/Pre-Actions/+/New Run Script Action* -> ```echo ".env.us" > /tmp/envfile```

## TODOs

1. Reuse common sections in `Jenkinsfile.android` (build APK) by externalizing it into a script
2. Make independent promotions to PROD for each country?
3. Replace `javiersantos/android-ci:latest` with a custom docker that also includes npm/node
4. Automate the APK version code increment (stored in `android/app/build.graddle`)
5. Extend the iOS pipeline to promote to AppStore PROD using fastline deliver? -> This might require filling in all the "admin" details in App Store
6. Automate the build number increment (stored in `ios/mynativeapp/Info.plist as CFBundleVersion`)
