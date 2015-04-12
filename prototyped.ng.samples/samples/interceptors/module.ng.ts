/// <reference path="../../imports.d.ts" />

angular.module('prototyped.ng.samples.interceptors', [])

    .config(['appConfigProvider', function (appConfigProvider) {
        appConfigProvider.set({
            'interceptors': {
                debug: true,
                enabled: appConfigProvider.getPersisted('interceptors.enabled') == '1',
                extendXMLHttpRequest: function () {
                    // Do some magic with the ajax request handler
                    var callback = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
                        var ctx = {};

                        // Check for auth info
                        if (user || pass) {
                            // Extended with auth info
                            angular.extend(ctx, {
                                username: user,
                                password: pass
                            });
                        }
                        console.log(' - [ Ajax ] ( ' + (async ? 'Async' : 'Sync') + ' ) => ' + url + ' => ', ctx);

                        // Call the original function
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                    };

                    console.log(' - Extended the "XMLHttpRequest" object.');
                },
            },
        });
    }])
    .config(['$httpProvider', 'appConfigProvider', function ($httpProvider, appConfigProvider) {
        var appConfig = appConfigProvider.$get();
        var cfg = appConfig['interceptors'];

        if (cfg.enabled) {
            // Attach Angular's interceptor
            $httpProvider.interceptors.push('httpInterceptor');

            // Extend the base ajax request handler
            console.log(' - Attaching interceptors...');
            cfg.extendXMLHttpRequest();
        }
    }])
    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
            .state('samples.interceptors', {
                url: '/interceptors',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/interceptors/main.tpl.html',
                        controller: 'interceptorsController'
                    },
                }
            })
            .state('samples.interceptors.badRequest', {
                url: '/badRequest',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/interceptors/bad.filename',
                    },
                }
            })
    }])

    .service('httpInterceptor', ['$rootScope', '$q', 'appConfig', function ($rootScope, $q, appConfig) {
        var cfg = appConfig['interceptors'];
        var service = this;

        // Request interceptor (pre-fetch)
        service.request = function (config) {
            if (cfg.enabled) {
                console.groupCollapsed(' -> Requesting: ' + config.url);
                console.log(config);
                console.groupEnd();
            }
            return config;
        };

        service.requestError = function (rejection) {
            if (cfg.enabled) {
                console.groupCollapsed(' -> Bad Request!');
                console.error(rejection);
                console.groupEnd();
            }
            return $q.reject(rejection);
        };

        service.response = function (response) {
            if (cfg.enabled) {
                console.groupCollapsed(' <- Responding: ' + response.config.url);
                console.log(response);
                console.groupEnd();
            }

            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }

            return response;
        };

        service.responseError = function (rejection) {
            if (cfg.enabled) {
                console.groupCollapsed(' <- Bad Response!');
                console.error(rejection);
                console.groupEnd();
            }
            return $q.reject(rejection);
        };

    }])

    .controller('interceptorsController', ['$scope', '$state', function ($scope, $state) {
        // Define the model controller
        var context = $scope.interceptors = {
            triggerBadRequest: function () {
                $state.go('samples.interceptors.badRequest');
            },
        };
    }])

    .run(['$state', 'appConfig', function ($state, appConfig) {
    }])
