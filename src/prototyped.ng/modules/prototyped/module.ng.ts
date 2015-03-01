/// <reference path="../../imports.d.ts" />
/// <reference path="../appcmd.exe/certs.ng.ts" />
/// <reference path="../sqlcmd.exe/module.ng.ts" />
/// <reference path="cmd/module.ng.ts" />

angular.module('prototyped', [
    // Define sub modules
    'prototyped.cmd',
])

    .config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {

        // Define redirects
        $urlRouterProvider.when('/prototyped', '/prototyped/cmd');

        // Now set up the states
        $stateProvider
            .state('prototyped', {
                url: '/prototyped',
                abstract: true,
            })

    }])
