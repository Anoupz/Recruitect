'use strict';

import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import uiRouter from 'angular-ui-router';


import {
  routeConfig
} from './app.config';

import main from './main/main.component';
import registration from './registration/registration.component';
import joinAsPro from './joinAsPro/joinAsPro.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import header from '../components/header/header.component';
import footer from '../components/footer/footer.component';

import './app.scss';

angular.module('recruitectApp', [ngCookies, ngResource, ngSanitize, uiRouter, main, registration, joinAsPro,
  footer, header, constants, util
])
.config(routeConfig);

angular.element(document)
  .ready(() => {
    initFoundation();
    angular.bootstrap(document, ['recruitectApp'], {
      strictDi: true
    });
  });

function initFoundation() {
  setTimeout(() => {
    $(document).foundation();
  }, 100);
}

