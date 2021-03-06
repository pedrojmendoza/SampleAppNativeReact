#!/bin/bash

# $1 -> projectArn -> "arn:aws:devicefarm:us-west-2:264359801351:project:d10ad03e-8060-49d1-bf7d-5ad3b9260ed8"
# $2 -> devicePoolArn -> "arn:aws:devicefarm:us-west-2:264359801351:devicepool:d10ad03e-8060-49d1-bf7d-5ad3b9260ed8/7cefba36-444d-4912-a3ab-469e9ecc9e65" or "arn:aws:devicefarm:us-west-2:264359801351:devicepool:d10ad03e-8060-49d1-bf7d-5ad3b9260ed8/7c31c2ce-d140-4687-b89d-38893d4dfc6e"
# $3 -> awsRegion -> us-west-2
# $4 -> runName -> 1
# $5 -> platform -> android/ios

set -e

if [ $5 == "android" ]
then
  UPLOAD_TYPE="ANDROID_APP"
  UPLOAD_FILE="android/app/build/outputs/apk/app-release.apk"
  UPLOAD_NAME="app-release.apk"
else
  UPLOAD_TYPE="IOS_APP"
  #UPLOAD_FILE="ios/build/Build/Products/Release-iphoneos/mynativeapp.ipa"
  UPLOAD_FILE="mynativeapp.ipa"
  UPLOAD_NAME="mynativeapp.ipa"
fi

UPLOAD_OUTPUT=$(aws devicefarm create-upload --project-arn $1 --name $UPLOAD_NAME --type $UPLOAD_TYPE --region $3)
UPLOAD_URL=$(echo $UPLOAD_OUTPUT | jq -r ".upload.url")
APP_ARN=$(echo $UPLOAD_OUTPUT | jq -r ".upload.arn")
curl -v -T $UPLOAD_FILE $UPLOAD_URL
echo "Uploading app file to: $UPLOAD_URL"

UPLOAD_TESTS_OUTPUT=$(aws devicefarm create-upload --project-arn $1 --name test_bundle.zip --type APPIUM_PYTHON_TEST_PACKAGE --region $3)
UPLOAD_TESTS_URL=$(echo $UPLOAD_TESTS_OUTPUT | jq -r ".upload.url")
TESTS_ARN=$(echo $UPLOAD_TESTS_OUTPUT | jq -r ".upload.arn")
curl -v -T test_bundle.zip $UPLOAD_TESTS_URL
echo "Uploading tests to: $UPLOAD_TESTS_URL"

# TODO -> Replace hardcoded sleep with proper validation of uploaded files being avail?
sleep 10s

SCHEDULE_RUN_OUTPUT=$(aws devicefarm schedule-run --project-arn $1 --name $4 --app-arn $APP_ARN --test type=APPIUM_PYTHON,testPackageArn=$TESTS_ARN --device-pool-arn $2 --region $3)
RUN_ARN=$(echo $SCHEDULE_RUN_OUTPUT | jq -r ".run.arn")
echo "Run $RUN_ARN scheduled ..."

while [ $(aws devicefarm get-run --arn $RUN_ARN --region $3 | jq -r ".run.status") != "COMPLETED" ]
do
  echo "Waiting for run to finish ..."
  sleep 15s
done

if [ $(aws devicefarm get-run --arn $RUN_ARN --region $3 | jq -r ".run.result") != "PASSED" ]
then
  echo $(aws devicefarm get-run --arn $RUN_ARN --region $3 | jq -r ".run.counters")
  exit 1
fi
