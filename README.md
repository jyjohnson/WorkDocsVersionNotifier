# AWS WorkDocs Client Notifier

## Background
This is a simple AWS CDK project that when deployed notifies my team when AWS releases a new WorkDoc client (Windows) version. By default the WorkDocs client will auto-update, however in our environment (Citrix VDI/Azure WVD) we had to disable that. But I wanted to know when a new version was released (at present AWS does not provide this). Looking in the client logs, I noticed that the app uses this web page to determine if there is a new version: https://d3f2hupz96ggz3.cloudfront.net/Windows/Updates.xml 

## So what does this project deploy?
### Lambda function (NodeJS)
- parses the XML page to retrieve the production version number (xpath).
- compares the web page value to the value in Parameter Store
- if not equal, publish message to SNS topic and update Parameter Store

### SSM Parameter Store
- stores current *known* version number (which may not be the latest)

### EventBridge Cron Rule
- Runs the Lambda function every 4 hours. 

## Dependencies
- @aws-cdk/aws-lambda-nodejs ("experimental")
-- note that I had to manually apply a patch - see https://github.com/aws/aws-cdk/issues/11693
- NodeJS modules 'xpath' and 'xmldom' 
- Currently hardcoded to use an existing SNS Topic.

## Open for feedback/improvements
- I'm using this to learn AWS CDK... If you have comments, suggestions, etc, please create an issue, PR, etc. Thanks!

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
