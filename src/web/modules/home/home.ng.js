'use strict';

angular.module('myApp.home', [
    'ui.router',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
          .state('home', {
              url: '/home',
              views: {
                  'main@': {
                      templateUrl: 'views/home.tpl.html',
                      controller: 'HomeViewCtrl'
                  },
              }
          })
    }])

    .controller('HomeViewCtrl', ['$scope', '$state', function ($scope, $state) {

        // Go to default page...
        $state.go('default');

    }])
