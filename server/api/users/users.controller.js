/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 */

'use strict';

import awsClient from '../../helpers/awsClient';
import mapper from './users.mapper';

// Gets a list of all users
module.exports = {
  index: (req, res) => {
    var params = {
      TableName: 'Users',
      Key: {
        UserId: 15
      }
    };
    awsClient.DBClient.getItem(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        res.json(JSON.stringify(data));
      }
    });
  },
  createUser: (req, res) => {
    let item = mapper(req.body);
    var params = {
      TableName: 'Users',
      Item: item
    };
    console.log('params', params);

    awsClient.DBClient.putItem(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        res.json('Item not created!!!', err.message);
      } else {
        res.json('Item created!!!');
      }
    });
  }
};

