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
    .config(['appConfigProvider', 'appStateProvider', function (appConfigProvider, appStateProvider) {

        // Define module configuration
        appConfigProvider
            .config('prototyped.ng.features', {
                active: true,
                hideInBrowserMode: true,
            });

        // Define module routes
        var opts = appConfigProvider.current.modules['prototyped.ng.features'];
        appStateProvider
            .define('/proto/explore', {
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
                    return opts && opts.hideInBrowserMode
                        ? typeof require !== 'undefined'
                        : appConfigProvider.current.options.showDefaultItems || !opts.hideInBrowserMode;
                },
            })
            .define('/imports', {
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
                    return opts && opts.hideInBrowserMode;
                },
            });

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