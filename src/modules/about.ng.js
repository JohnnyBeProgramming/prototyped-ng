'use strict';

angular.module('myApp.about', [
    'ngRoute'
])

    .config(['$stateProvider', function ($stateProvider) {

        // Define the UI states
        $stateProvider
          .state('about', {
              url: '/about',
              abstract: true,              
          })
          .state('about.info', {
              url: '/info',
              views: {
                  'menu@': { templateUrl: 'views/about/menu.html' },
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/info.html' },
              }
          })
          .state('about.contact', {
              url: '^/contact',
              views: {
                  'menu@': { templateUrl: 'views/about/menu.html' },
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/contact.html' },
              }
          })

    }])

    .controller('AboutViewCtrl', [function () {
    }]);