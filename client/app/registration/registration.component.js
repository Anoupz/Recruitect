'use strict';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import registerRouting from './registration.routes';

export class RegistrationController {
  $http;
  signUpData = {
    email: '',
    phoneNumber: '',
    password: ''
  };
    /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    jQuery('.header').removeClass('main-header');
  }

  continue() {
    this.$http.post('/api/users/createUser', this.signUpData)
      .then(() => {
        console.log('user created');
      })
      .catch(() => {
        console.log('user not created');
      });
  }
}

export default angular.module('registration', [uiRouter])
.config(registerRouting)
.component('registration', {
  template: require('./registration.html'),
  controller: RegistrationController
})
.name;
