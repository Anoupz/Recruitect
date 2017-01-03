'use strict';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import registerRouting from './registration.routes';

export class RegistrationController {
  $onInit() {
    jQuery('.header').removeClass('main-header');
  }
}

export default angular.module('registration', [uiRouter])
.config(registerRouting)
.component('registration', {
  template: require('./registration.html'),
  controller: RegistrationController
})
.name;
