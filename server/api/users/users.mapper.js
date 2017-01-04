'use strict';

import moment from 'moment';
const util = require('util');

/*eslint-disable */
export default function usersAPIMapper(body) {
  let uniqueId = Math.floor((Math.random() * 100) + 1);
  return {
    UserId: uniqueId,
    Items: [,{EmailId: util.isNullOrUndefined(body.email) ? null : body.email,
    PhoneNumber: body.phoneNumber,
    HashPassword: body.password,
    CreationDate: moment().format("DD/MM/YYYY"),
    ItemId: uniqueId
    }]
  };
}
/*eslint-enable */
