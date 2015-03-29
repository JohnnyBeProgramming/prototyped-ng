/// <reference path="../imports.d.ts" />
/// <reference path="compression/module.ng.ts" />
/// <reference path="decorators/module.ng.ts" />
/// <reference path="errorHandlers/module.ng.ts" />
/// <reference path="interceptors/module.ng.ts" />
/// <reference path="notifications/module.ng.ts" />
/// <reference path="sampleData/module.ng.ts" />
/// <reference path="styles3d/module.ng.ts" />

angular.module('prototyped.ng.samples', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.samples.views',

    'myApp.samples.errorHandlers',
    'myApp.samples.sampleData',
    'myApp.samples.location',
    'myApp.samples.decorators',
    'myApp.samples.interceptors',
    'myApp.samples.notifications',
    'myApp.samples.compression',
    'myApp.samples.styles3d',
])

// Extend appConfig with module config
    .config(['appConfigProvider', function (appConfigProvider) {

        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.samples': {
                active: true,
            }
        });
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/samples',
                menuitem: {
                    label: 'Samples',
                },
                cardview: {
                    style: 'img-sandbox',
                    title: 'Prototyped Sample Code',
                    desc: 'A selection of samples to test, play and learn about web technologies.'
                },
            });
        }
    }])

    .config(['$stateProvider', function ($stateProvider) {
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

    .controller('sampleViewController', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
        // Define the model
        var context: any = $scope.sample = {
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
        };

        // Apply updates (including async)
        var updates = <any>{};
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