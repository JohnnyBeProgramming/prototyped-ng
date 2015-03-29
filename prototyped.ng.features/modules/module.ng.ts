/// <reference path="../imports.d.ts" />

angular.module('prototyped.ng.features', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.features.views',
    'prototyped.ng.features.styles',
])

// Extend appConfig with module config
    .config(['appConfigProvider', function (appConfigProvider) {

        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.features': {
                active: true,
            }
        });
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/features',
                menuitem: {
                    label: 'Explore',
                },
                cardview: {
                    style: 'img-advanced',
                    title: 'Advanced Feature Detection',
                    desc: 'Based on feature detection. Some features are available for specific operating systems only.'
                },
            });
        }
    }])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
            .state('features', {
                url: '/features',
                abstract: true,
            })
            .state('features.info', {
                url: '',
                views: {
                    'left@': { templateUrl: 'features/left.tpl.html' },
                    'main@': {
                        templateUrl: 'features/main.tpl.html',
                        controller: 'featuresViewController'
                    },
                }
            })

    }])

    .controller('featuresViewController', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
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