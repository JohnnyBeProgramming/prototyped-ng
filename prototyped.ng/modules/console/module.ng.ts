/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/ConsoleController.ts"/>

angular.module('prototyped.console', [])
    .config(['appStateProvider', function (appStateProvider) {
        // Define module state
        appStateProvider
            .state('proto.console', {
                url: '^/console',
                views: {
                    'main@': {
                        templateUrl: 'modules/console/views/main.tpl.html',
                        controller: 'proto.ng.modules.commands.ConsoleController',
                    },
                }
            })
            .state('proto.logs', {
                url: '/logs',
                views: {
                    //'left@': { templateUrl: 'views/common/components/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/console/views/logs.tpl.html',
                        //controller: 'proto.ng.modules.commands.ConsoleController',
                    },
                }
            })
    }])

    .controller('proto.ng.modules.commands.ConsoleController', [
        '$scope',
        '$log',
        proto.ng.modules.commands.ConsoleController
    ])
