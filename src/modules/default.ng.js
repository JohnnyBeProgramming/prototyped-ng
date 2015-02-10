'use strict';

angular.module('myApp.default', [
    'views/default.tpl.html', // Requires template
    'ui.router',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
          .state('home', {
              url: '/',
              views: {
                  'main@': {
                      templateUrl: 'views/default.tpl.html',
                      controller: 'HomeViewCtrl'
                  },
              }
          })
    }])

    .controller('HomeViewCtrl', ['$scope', '$window', '$location', '$timeout', function ($scope, $window, $location, $timeout) {
        // ToDo: Add code for home controller         
    }]);