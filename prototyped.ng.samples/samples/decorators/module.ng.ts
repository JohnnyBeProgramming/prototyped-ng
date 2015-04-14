/// <reference path="../../imports.d.ts" />
/// <reference path="typings/HttpInterceptorService.ts" />

angular.module('prototyped.ng.samples.decorators', [])
    .config(['appConfigProvider', function (appConfigProvider) {
        appConfigProvider.set({
            'decorators': {
                debug: false,
                promptme: null,
                enabled: appConfigProvider.getPersisted('decorators.enabled') == '1',
                filters: proto.ng.samples.decorators.StackTraceUtils.filters,
            },
        });
    }])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples.decorators', {
                url: '/decorators',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/decorators/main.tpl.html',
                        controller: 'decoratorsController'
                    },
                }
            })
            .state('samples.decorators.badRequest', {
                url: '/badRequest',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/decorators/bad.filename',
                    },
                }
            })
    }])
    .config(['$provide', 'appConfigProvider', proto.ng.samples.decorators.config.ConfigureQServiceInterceptor])
    .config(['$httpProvider', 'appConfigProvider', proto.ng.samples.decorators.config.ConfigureHttpRequestInterceptor])

    .service('httpInterceptor', ['$rootScope', '$q', 'appConfig', function ($rootScope, $q, appConfig) {
        //return new proto.ng.samples.decorators.HttpInterceptorService($rootScope, $q, appConfig);

        var cfg = appConfig['decorators'];
        var service = this;

        // Request interceptor (pre-fetch)
        service.request = function (config) {
            try {
                if (cfg.debug) console.groupCollapsed(' -> Requesting: ' + config.url);
                if (cfg.enabled) {
                    if (cfg.debug) console.log(config);
                }
            } catch (ex) {
                console.warn('Fatal Request Issue: ' + ex.message);
            } finally {
                if (cfg.debug) console.groupEnd();
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
            try {
                if (cfg.debug) console.groupCollapsed(' <- Responding: ' + response.config.url);

                if (response.status === 401) {
                    $rootScope.$broadcast('unauthorized');
                }

                if (cfg.xhttp) {
                    if (cfg.debug) console.log('Response: ', response);
                    proto.ng.samples.decorators.InterceptHttpResponse(response);
                }
            } catch (ex) {
                console.warn('Fatal Response Issue: ' + ex.message);
            } finally {
                if (cfg.debug) console.groupEnd();
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

// -----------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------

    .controller('decoratorsController', ['$rootScope', '$scope', '$modal', '$q', '$timeout', 'appConfig', proto.ng.samples.decorators.controllers.DecoratorsController])
    .controller('interceptModalController', ['$scope', '$modalInstance', 'status', 'result', proto.ng.samples.decorators.controllers.InterceptModalController])

    .run(['$modal', 'appConfig', function ($modal, appConfig) {
        // Hook the interceptor function
        var cfg = appConfig['decorators'];
        cfg.promptme = function (status, result) {
            return $modal.open({
                templateUrl: 'samples/decorators/dialogs/interceptor.tpl.html',
                controller: 'interceptModalController',
                size: 'md',
                resolve: {
                    status: function () { return status; },
                    result: function () { return result; },
                }
            }).result;
        };
    }])
