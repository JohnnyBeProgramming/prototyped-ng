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
                    'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/console/views/main.tpl.html',
                        controller: 'proto.ng.commands.ConsoleController',
                    },
                }
            })

    }])

    .controller('proto.ng.commands.ConsoleController', [
        '$scope',
        proto.ng.commands.ConsoleController
    ])
