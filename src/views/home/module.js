'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'views/home/contents.html',
            controller: 'HomeViewCtrl'
        }).when('/broken', {
            templateUrl: 'views/missing/contents.html',
            controller: 'HomeViewCtrl'
        });
    }])

    /* ----------------------------------------------------------------------------------------------------------
     * Inspired by these blogs: 
     *  - http://www.davecap.com/post/46522098029/using-sentry-raven-js-with-angularjs-to-catch
     *  - http://bahmutov.calepin.co/catch-all-errors-in-angular-app.html
     * ----------------------------------------------------------------------------------------------------------
     */
    .factory('$exceptionHandler', ['$window', '$log', function ($window, $log) {
        // Catch all angular errors to Raven (if defined)
        if ($window.Raven) {
            console.log(' - Using the RavenJS exception handler.');
            var ctx = { tags: { source: "Angular Unhandled Exception" } };
            return function (exception, cause) {
                $log.error.apply($log, arguments);
                Raven.captureException(exception, ctx);
            };
        } else {
            console.log(' - Using the default logging exception handler.');
            return function (exception, cause) {
                $log.error.apply($log, arguments);
            };
        }
    }])
    .factory('errorHttpInterceptor', ['$window', '$q', function ($window, $q) {
        return {
            responseError: function responseError(rejection) {
                if ($window.Raven) {
                    var ctx = { tags: { source: "Angular Http Interceptor" } };
                    Raven.captureException(new Error('HTTP response error'), angular.extend(ctx, {
                        extra: {
                            config: rejection.config,
                            status: rejection.status
                        }
                    }));
                }
                return $q.reject(rejection);
            }
        };
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    }])
    /*
     * ----------------------------------------------------------------------------------------------------------
     */

    .value('ravenConfig', {
        isEnabled: true,
        publicKey: '', //'https://-your-api-key-here-@app.getsentry.com/12345',
    })
    .controller('HomeViewCtrl', ['$scope', '$window', '$location', '$timeout', 'ravenConfig', function ($scope, $window, $location, $timeout, ravenConfig) {
        $scope.state = {
            editMode: false,
            cfgRaven: ravenConfig,
        };
        $scope.detect = function () {
            var started = Date.now();
            try {
                // Clear prev result
                $scope.result = null;

                // Check that Raven.js was loaded
                if ($window.Raven && ravenConfig.publicKey) {
                    $scope.setupRaven(ravenConfig);
                }

                // Set the result
                $scope.state.editMode = !(ravenConfig.publicKey.length > 0);
                $scope.result = {
                    valid: true,
                    start: started,
                    ended: Date.now()
                };
            } catch (ex) {
                $scope.result = {
                    valid: false,
                    error: ex.message,
                };
            }
        }
        $scope.setupRaven = function (ravenConfig) {
            if (!$window.Raven) return;
            console.info(' - Clearing Raven...');
            Raven.uninstall();
            console.info(' - Installing Raven...');
            Raven.config(ravenConfig.publicKey, {
                shouldSendCallback: function (data) {
                    // Only return true if data should be sent
                    var isActive = ravenConfig.isEnabled && ravenConfig.publicKey;
                    if (isActive) {
                        console.debug(' - Sending Raven: "' + data.message + '"...');
                        console.debug(data);
                    }
                    return isActive;
                },
                dataCallback: function (data) {
                    // Add something to data
                    return data;
                },
            }).install();
            console.info(' - Done.');
        };
        $scope.throwManagedException = function () {
            var ctx = { tags: { source: "Sample Managed Exception" } };
            try {
                console.info(' - About to break something...');
                Raven.context(ctx, function () {
                    managedSampleError.dont.exist++;
                });
            } catch (ex) {
                // throw ex; // this will also be caught by the global Angular exception handler
            }
        }
        $scope.throwAjaxException = function () {
            console.info(' - Doing AJAX request...');
            $.ajax({
                url: "/app.js",
                //dataType:"text/*",
                success: function (result) {
                    // Response recieved...
                    console.info(' - AJAX got response...');
                    ajaxOnSuccessSample.dont.exist++;
                },
                error: function (xhr) {
                    console.warn(" - Ajax Error [" + xhr.status + "] " + xhr.statusText);
                    ajaxOnErrorSample.dont.exist++;
                }
            });
        }
        $scope.throwAngularException = function () {
            console.info(' - About to break Angular...');
            $scope.missing.ngSampleError++;
        }
        $scope.throwTimeoutException = function () {
            console.info(' - Setting timeout...');
            setTimeout(function () {
                console.info(' - Entering timeout...');
                timeoutSampleError.dont.exist++;
                console.info(' - Exit timeout...');
            }, 3 * 1000);
        }

        $scope.getStatusIcon = function (activeStyle) {
            var cssRes = '';
            var active = $scope.state.cfgRaven.isEnabled && $scope.state.cfgRaven.publicKey;
            if (activeStyle && active) {
                cssRes += activeStyle;
            } else {
                cssRes += active ? 'glyphicon-ok' : 'glyphicon-remove';
            }
            return cssRes + $scope.getStatusColor();
        }
        $scope.submitForm = function () {
            if ($window.Raven /*&& Raven.isSetup()*/) {
                // Clear prev setup
            }
            if (ravenConfig.publicKey) {
                $scope.setupRaven(ravenConfig);
            } else {
                ravenConfig.isEnabled = false;
            }
            $scope.state.editMode = false;
        }
        $scope.getStatusColor = function () {
            var cssRes = ' ';
            var active = $scope.state.cfgRaven.isEnabled && $scope.state.cfgRaven.publicKey;
            if (active) {
                cssRes += 'success';
            } else {
                cssRes += 'error';
            }
            return cssRes;
        }
    }]);