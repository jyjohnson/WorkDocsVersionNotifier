"use strict";
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;
const AWS = require("aws-sdk");
const https = require("https");
const parameterStore = new AWS.SSM({ region: "us-east-1" });
const sns = new AWS.SNS({ region: "us-east-1" });

//***************** Lamnda Handler **************
exports.handler = async (event, context) => {
  
  //get the version from the web page
  let version_page = await request(
    "https://d3f2hupz96ggz3.cloudfront.net/Windows/Updates.xml"
  );
  var doc = new dom().parseFromString(version_page);
  var pubversion = xpath.select(
    "string(//item[@desc='Prod. Org: All_Others. Region: All_Others.']/enclosure/@version)",
    doc
  );
  console.log("Web page: " + pubversion.trim());

  //get the value from Parameter Store
  const param = await getParam("/wd-prod-version");
  var param_version = param.Parameter.Value;
  console.log("Parameter Store: " + param_version);

  //test equality - if not equal, send SNS and update Parameter
  if (pubversion.trim() != param_version.trim()) {
    var params = {
      Message: 'WorkDocs client has been updated to version ' + pubversion.trim() + '. Current version is: ' + param_version,
      TopicArn: 'arn:aws:sns:us-east-1:*******************' //enter your ARN
    };
    const pubsns = await sendSNS(params);
    console.log(pubsns);
    
    //update to latest version
    const updateparameter = await setParam(pubversion.trim());
    console.log(updateparameter);
  }
};

//*********** Helper Functions *****************
async function request(url) {
  return new Promise((resolve, reject) => {
    let req = https.get(url, function (res) {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve(body);
      });
    });
    req.end();
  });
}

async function getParam(param) {
  return new Promise((res, rej) => {
    parameterStore.getParameter(
      {
        Name: param,
      },
      (err, data) => {
        if (err) {
          return rej(err);
        }
        return res(data);
      }
    );
  });
}

async function sendSNS(params) {
  return new Promise((res, rej) => {
    sns.publish(params, function (err, data) {
      if (err) {
        console.log(err);
        rej(err);
      } else {
        console.log(data);
        res(data);
      }
    });
  });
}

async function setParam(param) {
  return new Promise((res, rej) => {
    parameterStore.putParameter(
      {
        Name: '/wd-prod-version',
        Value: param,
        Overwrite: true
      },
      (err, data) => {
        if (err) {
          return rej(err);
        }
        return res(data);
      }
    );
  });
}