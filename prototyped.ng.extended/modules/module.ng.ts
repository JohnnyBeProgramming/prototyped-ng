/// <reference path="../imports.d.ts" />

angular.module('prototyped.ng.extended', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.extended.views',
    'prototyped.ng.extended.styles',

    // Define sub modules
])

// Extend appConfig with module config
    .config(['appConfigProvider', 'appStateProvider', function (appConfigProvider, appStateProvider) {
        // Define module state
        appStateProvider
            .config('prototyped.ng.extended', {
                active: true,
                hideInBrowserMode: true,
            })
            .define('extended', {
                url: '/extend',
                priority: 100,
                state: {
                    url: '/extend',
                    abstract: true,
                },
                menuitem: {
                    label: 'Extenders',
                    icon: 'fa fa-flask',
                    state: 'extended.info',
                },
                cardview: {
                    style: 'img-extended',
                    title: 'Extended Functionality',
                    desc: 'Dynamically load and extend features. Inject new modules into the current runtime.'
                },
            })
            .state('extended.info', {
                url: '',
                views: {
                    'left@': { templateUrl: 'views/extended/left.tpl.html' },
                    'main@': {
                        templateUrl: 'views/extended/index.tpl.html',
                        controller: 'extenderViewController'
                    },
                }
            })

    }])

    .controller('extenderViewController', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
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

    .run(['$templateCache', 'appState', function ($templateCache, appState) {
        appState.importStyle($templateCache, 'assets/css/extended.min.css');
    }])
