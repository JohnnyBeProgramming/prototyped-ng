'use strict';

angular.module('myApp.samples.interceptors', [])
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

    .constant('interceptorConfig', {
        debug: true,
        enabled: false,
        getPersisted: function (cname) {
            var name = cname + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return '';
        },
        setPersisted: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + ((exdays || 7) * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },
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
    })
.service('httpInterceptor', ['$rootScope', '$q', 'interceptorConfig', function ($rootScope, $q, cfg) {
    var service = this;

    // Request interceptor (pre-fetch)
    service.request = function (config) {
        if (cfg.debug) {
            console.groupCollapsed(' -> Requesting: ' + config.url);
            console.log(config);
            console.groupEnd();
        }
        return config;
    };

    service.requestError = function (rejection) {
        if (cfg.debug) {
            console.groupCollapsed(' -> Bad Request!');
            console.error(rejection);
            console.groupEnd();
        }
        return $q.reject(rejection);
    };

    service.response = function (response) {
        if (cfg.debug) {
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
        if (cfg.debug) {
            console.groupCollapsed(' <- Bad Response!');
            console.error(rejection);
            console.groupEnd();
        }
        return $q.reject(rejection);
    };

}])
.config(['$httpProvider', 'interceptorConfig', function ($httpProvider, cfg) {

    // Get the value from persisted store
    cfg.enabled = cfg.getPersisted('interceptors.enabled') == '1';

    // Register interceptors
    if (cfg.enabled) {
        if (cfg.debug) console.log(' - Attaching interceptors...');

        // Attach Angular's interceptor
        $httpProvider.interceptors.push('httpInterceptor');

        // Extend the base ajax request handler
        cfg.extendXMLHttpRequest();
    }

}])

.controller('interceptorsController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', 'interceptorConfig', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, cfg) {
    // Define the model
    var context = $scope.interceptors = {
        busy: true,
        apply: function () {
            // Set the persisted value                
            var val = cfg.enabled ? '0' : '1';
            cfg.setPersisted('interceptors.enabled', val);
            $window.location.reload(true);
        },
        isPatched: function () {
            return cfg.enabled;
        },
        triggerBadRequest: function () {
            $state.go('samples.interceptors.badRequest');
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

.run(['$state', '$templateCache', 'interceptorConfig', function ($state, $templateCache, cfg) {

}])
;