'use strict';

let AWS = require('aws-sdk'),
  config = require('../config/environment'),
  DOC = require('dynamodb-doc'),
  ddb = new AWS.DynamoDB(config.dynamoDbConfig);


module.exports = {
  DBClient: new DOC.DynamoDB(ddb)
};

