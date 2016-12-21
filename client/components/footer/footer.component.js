'use strict';

import angular from 'angular';

export class FooterComponent {}

export default angular.module('components.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent
  })
  .name;

