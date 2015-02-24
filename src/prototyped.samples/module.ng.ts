/// <reference path="imports.d.ts" />

angular.module('myApp.samples', [
    'myApp.samples.errorHandlers',
    'myApp.samples.sampleData',
    'myApp.samples.decorators',
    'myApp.samples.interceptors',
    'myApp.samples.notifications',
    'myApp.samples.compression',
    'myApp.samples.styles3d',
])

    .config(['$stateProvider', ($stateProvider) => {
        // Now set up the states
        $stateProvider
            .state('samples', {
                url: '/samples',
                abstract: true,
            })
            .state('samples.info', {
                url: '',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/main.tpl.html',
                        controller: 'sampleViewController'
                    },
                }
            })

    }])

    .controller('sampleViewController', ['$rootScope', '$scope', '$state', ($rootScope, $scope, $state) => {
        // Define the model
        var context = $scope.sample = {
            busy: true,
            text: '',
            utils: {
                list: function (path, callback) {
                    var list = [];
                    try {
                    } catch (ex) {
                        context.error = ex;
                        console.error(ex.message);
                    }
                    return list;
                }
            },
            error: null,
        };

        // Apply async updates
        var updates = {
            busy: true,
            hasNode: false,
            error: null,
        };
        try {
            // Check for required libraries
            //updates.hasNode = typeof require !== 'undefined';
            updates.busy = false;

        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        } finally {
            // Extend updates for scope
            angular.extend(context, updates);
        }
    }])

;