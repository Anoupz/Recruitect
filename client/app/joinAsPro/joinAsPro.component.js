'use strict';

import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './joinAsPro.routes';

export class MainController {
  $onInit() {
    jQuery('.header').removeClass('main-header');
  }
}

export default angular.module('recruitectApp.joinAsPro', [uiRouter])
  .config(routing)
  .component('joinAsPro', {
    template: require('./joinAsPro.html'),
    controller: MainController
  })
  .name;

