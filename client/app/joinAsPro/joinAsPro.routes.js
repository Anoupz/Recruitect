'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('joinAsPro', {
    url: '/joinAsPro',
    template: '<join-as-pro></join-as-pro>'
  });
}
