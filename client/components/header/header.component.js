'use strict';

import angular from 'angular';

export class HeaderComponent {}

export default angular.module('component.header', [])
  .component('header', {
    template: require('./header.html'),
    controller: HeaderComponent
  })
  .name;

