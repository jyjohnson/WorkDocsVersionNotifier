import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import {Rule, Schedule} from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
 
/*******************
Temporary patch - see https://github.com/aws/aws-cdk/issues/11693
********************/

export class WorkDocNotifierStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //create IAM Role for Lambda function 
    const lambdarole = new iam.Role(this, 'wd-client-notifier', {
      roleName: 'WDNotifierRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ]
    });
   
    lambdarole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'cloudwatch:*',
        'cloudwatchlogs:*',
        'lambda:InvokeFunction',
        'sns:Publish',
        'ssm:DeleteParameter',
        'ssm:GetParameter*',
        'ssm:PutParameter',
        's3:*'
      ]
    }));

    //create the Paramater Store value to hold current version
    new ssm.StringParameter(this, 'wd-prod-version', {
      parameterName: 'wd-prod-version',
      description: 'Current WD Client version',
      stringValue: '1.0.5626.0'
    });

    //create the Lambda function
    const parsewebpagefunction = new lambdaNode.NodejsFunction(this, 'wd-version-check', {
      entry: './lib/lambda-parse-xml.js',  // code loaded from "lib" directory
      handler: 'handler',                   // file is "'lambda-parse-xml.js", function is "handler",
      role: lambdarole.withoutPolicyUpdates()
    }); 

    //create eventbridge to fire lambda every 4 hours 
    var eventrule = new Rule(this, 'workdoc-lambda-rule',{ 
      schedule: Schedule.expression('cron(0 */4 * * ? *)'),
      targets: [new targets.LambdaFunction(parsewebpagefunction)]
    });

  }
}
