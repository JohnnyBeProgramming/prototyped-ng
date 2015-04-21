/// <reference path="../../imports.d.ts" />
/// <reference path="typings/raven/RavenService.ts" />
/// <reference path="typings/google/GoogleErrorService.ts" />
/// <reference path="typings/SampleErrorService.ts" />
/// <reference path="typings/LogInterceptor.ts" />
/// <reference path="typings/ErrorHttpInterceptor.ts" />
/// <reference path="typings/ExceptionHandlerFactory.ts" />
/// <reference path="typings/config.ts" />

angular.module('prototyped.ng.samples.errorHandlers', [
    'prototyped.ng.config'
])
    .config(['appConfigProvider', (appConfigProvider) => {
        // Configure module
        appConfigProvider
            .config('errorHandlers', proto.ng.samples.errorHandlers.ErrorHandlers)
            .config('googleConfig', {
                publicKey: 'UA-61791366-1',
            })
            .config('ravenConfig', {
                publicKey: 'https://e94eaeaab36f4d14a99e0472e85ba289@app.getsentry.com/36391',
            });
    }])
    .config(['$stateProvider', ($stateProvider) => {
        // Set up the states
        $stateProvider
            .state('samples.errors', {
                url: '/errors',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/errorHandlers/main.tpl.html',
                        controller: 'errorHandlersController'
                    },
                }
            })
    }])
    .config(['$provide', '$httpProvider', proto.ng.samples.errorHandlers.ConfigureProviders])

    .factory('$exceptionHandler', ['$log', 'appNode', function ($log, appNode) {
        var instance = new proto.ng.samples.errorHandlers.ExceptionHandlerFactory($log, appNode);
        return function (exception, cause) {
            instance.handleException(exception, cause);
        };
    }])
    .factory('errorHttpInterceptor', ['$log', '$q', function ($log, $q) {
        return new proto.ng.samples.errorHandlers.ErrorHttpInterceptor($log, $q);
    }])

    .service('ravenService', ['$rootScope', '$log', 'appConfig', proto.ng.samples.errorHandlers.raven.RavenService])
    .service('googleErrorService', ['$rootScope', '$log', 'appConfig', proto.ng.samples.errorHandlers.google.GoogleErrorService])
    .service('sampleErrorService', ['$rootScope', '$log', 'appConfig', 'appState', 'ravenService', 'googleErrorService', proto.ng.samples.errorHandlers.SampleErrorService])

    .controller('errorHandlersController', ['$rootScope', '$scope', function ($rootScope, $scope) {
        $scope.$watch('appState.logs.length', function () {
            $rootScope.$applyAsync(() => { });
        });
    }])

    .run(['$rootScope', function ($rootScope) {

        // Track basic JavaScript errors
        window.addEventListener('error', function (ex: any) {
            $rootScope.$applyAsync(() => {
                proto.ng.samples.errorHandlers.HandleException('Javascript Error', ex, {
                    cause: 'Unhandled exception',
                    location: ex.filename + ':  ' + ex.lineno,
                });
            });
        });

        // Track AJAX errors (jQuery API)
        $(document).ajaxError(function (e, request, settings) {
            $rootScope.$applyAsync(() => {
                var ex = new Error('Problem loading: ' + settings.url);
                proto.ng.samples.errorHandlers.HandleException('Ajax Error', ex, {
                    cause: 'Response Error',
                    location: settings.url,
                    result: e.result,
                });
            });
        });

    }])

    .run(['$rootScope', 'sampleErrorService', function ($rootScope, sampleErrorService) {
        angular.extend($rootScope, {
            sampleErrors: sampleErrorService,
        });
    }])