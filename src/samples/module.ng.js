'use strict';

angular.module('myApp.samples', [
    'myApp.samples.fillText',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
            .state('samples', {
                url: '/samples',
                abstract: true,
            })
            .state('samples.info', {
                url: '/info',
                views: {
                    'left@': { templateUrl: 'samples/left.html' },
                    'main@': {
                        templateUrl: 'samples/main.html',
                        controller: 'sampleViewController'
                    },
                }
            })

    }])

    .controller('sampleViewController', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
        // Define the model
        var context = $scope.samples = {
            busy: true,
            utils: {
                list: function (path, callback) {
                    var list = [];
                    try {
                    } catch (ex) {
                        console.error(ex.message);
                        $scope.appCmd.error = ex;
                    }
                    return list;
                }
            },
        };

        // Apply updates (including async)
        var updates = {};
        try {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true,
                };

            } else {
                // Not available
                updates.hasNode = false;
                updates.busy = false;
            }
        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        } finally {
            // Extend updates for scope
            angular.extend(context, updates);
        }
    }])

;