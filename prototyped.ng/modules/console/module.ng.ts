/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/ConsoleController.ts"/>

angular.module('prototyped.console', [
    'ui.router'
])

    .config(['$stateProvider', function ($stateProvider) {

        // Define the UI states
        $stateProvider
            .state('proto.console', {
                url: '/console',
                views: {
                    //'left@': { templateUrl: 'views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/console/views/main.tpl.html',
                        controller: 'proto.ng.commands.ConsoleController',
                    },
                }
            })

            .state('proto.logs', {
                url: '/logs',
                views: {
                    //'left@': { templateUrl: 'views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/console/views/logs.tpl.html',
                        //controller: 'proto.ng.commands.ConsoleController',
                    },
                }
            })


    }])

    .controller('proto.ng.commands.ConsoleController', [
        '$scope',
        '$log',
        proto.ng.commands.ConsoleController
    ])
