'use strict';

angular.module('prototyped', [
    // Define sub modules
    'prototyped.cmd',
])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        // Define redirects
        $urlRouterProvider.when('/prototyped', '/prototyped/cmd');

        // Now set up the states
        $stateProvider
            .state('prototyped', {
                url: '/prototyped',
                abstract: true,
            })

    }])
