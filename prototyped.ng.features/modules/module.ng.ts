/// <reference path="../imports.d.ts" />
/// <reference path="cli/module.ng.ts" />
/// <reference path="edge/module.ng.ts" />

angular.module('prototyped.ng.features', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.features.views',
    'prototyped.ng.features.styles',

// Define sub modules
    'prototyped.cli',
    'prototyped.edge',
])

// Extend appConfig with module config
    .config(['appConfigProvider', function (appConfigProvider) {

        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.features': {
                active: true,
                hideInBrowserMode: true,
            }
        });

        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/proto/explore',
                priority: 100,
                menuitem: {
                    label: 'Features',
                    icon: 'fa fa-flask',
                    state: 'proto.cmd',
                },
                cardview: {
                    style: typeof require !== 'undefined' ? 'img-advanced' : 'img-advanced-restricted',
                    title: 'Advanced Feature Detection',
                    desc: 'Samples based on feature detection. Some may not be available for your browser or operating system.'
                },
                visible: function () {
                    var opts = appConfig['prototyped.ng.features']
                    return opts && opts.hideInBrowserMode
                        ? typeof require !== 'undefined'
                        : appConfig.options.showDefaultItems || !opts.hideInBrowserMode;
                },
            });
            appConfig.routers.push({
                url: '/imports',
                abstract: true,
                priority: 100,
                menuitem: {
                    label: 'Imports',
                    icon: 'fa fa-cloud-download',
                    state: 'proto.edge',
                },
                cardview: {
                    style: 'img-editor',
                    title: 'Import Additional Modules',
                    desc: 'Load from external sources, modify and/or export to an online repository.'
                },
                visible: function () {
                    var opts = appConfig['prototyped.ng.features']
                    return opts && opts.hideInBrowserMode;
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
                    'left@': { templateUrl: 'views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'views/index.tpl.html',
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