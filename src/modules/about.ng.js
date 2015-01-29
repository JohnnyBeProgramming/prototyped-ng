'use strict';

angular.module('myApp.about', [
    'ngRoute'
])

    .config(['$stateProvider', function ($stateProvider) {

        // Define the UI states
        $stateProvider
          .state('about', {
              url: '/about',
              views: {
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/info.html' },
              }
          })
          .state('about.info', {
              url: '',
              views: {
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/info.html' },
              }
          })
          .state('about.contact', {
              url: '^/contact',
              views: {
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/contact.html' },
              }
          })

    }])

    .controller('AboutViewCtrl', [function () {
    }]);