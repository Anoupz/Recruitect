'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('registration', {
    url: '/register',
    template: '<registration></registration>'
  });
}
