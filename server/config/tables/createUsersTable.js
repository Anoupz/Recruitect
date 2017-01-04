var AWS = require('aws-sdk'),
  config = {
    region: 'us-west-2',
    endpoint: 'http://localhost:8000'
  },
  ddb = new AWS.DynamoDB(config);

var parms = {
  TableName: 'Users',
  AttributeDefinitions: [{
    AttributeName: 'UserId',
    AttributeType: 'N'
  }],
  KeySchema: [{
    AttributeName: 'UserId',
    KeyType: 'HASH'
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 25,
    WriteCapacityUnits: 25
  }
};

ddb.createTable(parms, (err, data) => {
  if (err) console.log(err, err.stack);
  else {
    console.log(data);
  }
});

