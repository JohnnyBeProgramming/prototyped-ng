/// <reference path="../../imports.d.ts" />
declare var Raven: any;

angular.module('myApp.samples.errorHandlers', [])

    .config(['$stateProvider', function ($stateProvider) {

        // Now set up the states
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


    /* ----------------------------------------------------------------------------------------------------------
     * Inspired by these blogs: 
     *  - http://www.davecap.com/post/46522098029/using-sentry-raven-js-with-angularjs-to-catch
     *  - http://bahmutov.calepin.co/catch-all-errors-in-angular-app.html
     * ----------------------------------------------------------------------------------------------------------
     */
    .factory('$exceptionHandler', ['$window', '$log', 'appNode', function ($window, $log, appNode) {
        // Catch all angular errors to Sentry (via RavenJS, if defined)
        function setUpdatedErrorMessage(args, prefix) {
            var ex = args.length > 0 ? args[0] : {};
            if (ex.message) {
                ex.message = prefix + ex.message;
            }
            $log.error.apply($log, args);
        }
        if ($window.Raven) {
            console.debug(' - Using the RavenJS exception handler.');
            var ctx = { tags: { source: "Angular Unhandled Exception" } };
            return function (exception, cause) {
                // Update the exception message
                setUpdatedErrorMessage(arguments, 'Internal [ EX ]: ');
                Raven.captureException(exception, ctx);
            };
        } else if (appNode.active) {
            console.debug(' - Using node webkit specific exception handler.');
            return function (exception, cause) {
                setUpdatedErrorMessage(arguments, 'Internal [ NW ]: ');
                // ToDo: Hook in some routing or something...
            };
        } else {
            console.debug(' - Using the default logging exception handler.');
            return function (exception, cause) {
                setUpdatedErrorMessage(arguments, 'Internal [ JS ]: ');
            };
        }

    }])
    .factory('errorHttpInterceptor', ['$window', '$q', function ($window, $q) {
        return {
            responseError: function responseError(rejection) {
                console.error('HTTP response error: ' + rejection.config || rejection.status);
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
    .config(['$provide', '$httpProvider', function ($provide, $httpProvider) {
        // Register error handler
        $httpProvider.interceptors.push('errorHttpInterceptor');

        // Intercept all log messages
        $provide.decorator('$log', ['$delegate', 'appStatus', function ($delegate, appStatus) {

            // Define interceptor method
            function intercept(func, callback) {
                // Save the original function
                return function () {
                    var args = [].slice.call(arguments);
                    callback.apply(null, args);
                    func.apply($delegate, args)
                };
            }

            function attach(msgType, msgDesc, msgExt?) {
                var itm = <any>{
                    type: msgType,
                    desc: msgDesc,
                    time: Date.now()
                };
                if (msgExt) {
                    itm.ext = msgExt;
                }
                appStatus.logs.push(itm);
            }

            // Intercept messages
            var show = appStatus.config;
            $delegate.debug = intercept($delegate.debug, function (msg) { if (show.all || show.debug) attach('debug', msg) });
            $delegate.log = intercept($delegate.log, function (msg) { attach('log', msg) });
            $delegate.info = intercept($delegate.info, function (msg) { attach('info', msg) });
            $delegate.warn = intercept($delegate.warn, function (msg, ext) { attach('warn', msg, ext) });
            $delegate.error = intercept($delegate.error, function (msg, ext) { attach('error', msg, ext) });

            // Return delegate
            return $delegate;
        }]);

    }])
    /*
     * ----------------------------------------------------------------------------------------------------------
     */

    .value('ravenConfig', {
        isEnabled: true,
        isOnline: false,
        publicKey: '', //'https://-your-api-key-here-@app.getsentry.com/12345',
    })
    .controller('errorHandlersController', ['$scope', '$log', '$window', '$location', '$timeout', 'ravenConfig', function ($scope, $log, $window, $location, $timeout, ravenConfig) {
        $scope.state = {
            editMode: false,
            cfgRaven: ravenConfig,
            ajaxCfg: {
                current: null,
                getDesc: function (itm) {
                    var cfg = $scope.state.ajaxCfg;
                    switch (cfg.current) {
                        case cfg.errHttp: return 'Ajax Error (HTTP)';
                        case cfg.errSuccess: return 'Ajax Error (Success)';
                        case cfg.errFailed: return 'Ajax Error (Failed)';
                    }
                    return 'Ajax Error';
                },
                callError: function () {
                    var call = $scope.state.ajaxCfg.current;
                    if (!call) {
                        call = $scope.state.ajaxCfg.errHttp;
                    }
                    call();
                },
                select: function (itm) {
                    $scope.state.ajaxCfg.current = itm;
                },
                errHttp: function () {
                    $.ajax({
                        url: "/i.am.missing.html",
                        dataType: "text/html",
                        success: function (result) { },
                        error: function (xhr) { }
                    });
                },
                errSuccess: function () {
                    $.ajax({
                        url: "/index.html",
                        dataType: "text/html",
                        success: function (result) {
                            // Response recieved...
                            console.info(' - AJAX got response...');
                            window['ajaxOnSuccessSample'].dont.exist++;
                        },
                        error: function (xhr) { }
                    });
                },
                errFailed: function () {
                    $.ajax({
                        url: "/missing.index.html",
                        dataType: "text/html",
                        success: function (result) { },
                        error: function (xhr) {
                            console.warn(" - Ajax Error [" + xhr.status + "] " + xhr.statusText);
                            window['ajaxOnErrorSample'].dont.exist++;
                        }
                    });
                },
            },
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
        $scope.connect = function (publicKey) {
            console.info(' - Installing Raven...');
            Raven.config(publicKey, {
                shouldSendCallback: function (data) {
                    // Only return true if data should be sent
                    var isActive = ravenConfig.isEnabled && ravenConfig.publicKey;
                    if (isActive) {
                        console.debug(' - Sending Raven: "' + data.message + '"...');
                        //console.warn(data);
                    }
                    return isActive;
                },
                dataCallback: function (data) {
                    // Add something to data
                    return data;
                },
            }).install();
            ravenConfig.isOnline = true;
        }
        $scope.disconnect = function () {
            console.info(' - Clearing Raven...');
            Raven.uninstall();
            ravenConfig.isOnline = false;
        }
        $scope.setupRaven = function (ravenConfig) {
            if (!$window.Raven) return;
            try {

                // Disconnect for any prev sessions
                if (ravenConfig.isOnline) {
                    $scope.disconnect();
                }

                // Try to connect with public key                
                $scope.connect(ravenConfig.publicKey);

                // Success
                console.info(' - Done.');
            } catch (ex) {
                // Something went wrong
                console.warn(' - RavenJS failed to initialise.');
                throw ex;
            }
        };
        $scope.throwManagedException = function () {
            var ctx = { tags: { source: "Sample Managed Exception" } };
            try {
                $log.info(' - About to break something...');
                Raven.context(ctx, function () {
                    window['managedSampleError'].dont.exist++;
                });
            } catch (ex) {
                // throw ex; // this will also be caught by the global Angular exception handler
                $log.warn(' - Exception caught and swallowed.');
            }
        }
        $scope.throwAjaxException = function () {
            console.info(' - Doing AJAX request...');
            // XXXXXXXXXXXXXXXXXXXX
        }
        $scope.throwAngularException = function () {
            console.info(' - About to break Angular...');
            $scope.missing.ngSampleError++;
        }
        $scope.throwTimeoutException = function () {
            console.info(' - Setting timeout...');
            setTimeout(function () {
                console.info(' - Entering timeout...');
                window['timeoutSampleError'].dont.exist++;
                console.info(' - Exit timeout...');
            }, 3 * 1000);
        }
        $scope.getStatusColor = function () {
            var cssRes = ' ';
            var active = $scope.state.cfgRaven.isOnline;
            if (active) {
                cssRes += $scope.state.cfgRaven.isEnabled ? 'text-success' : 'text-danger';
            } else {
                cssRes += 'text-danger';
            }
            return cssRes;
        }
        $scope.getStatusIcon = function (activeStyle) {
            var cssRes = '';
            var active = $scope.state.cfgRaven.isOnline;
            if (activeStyle && active) {
                cssRes += activeStyle;
            } else if (active) {
                cssRes += $scope.state.cfgRaven.isEnabled ? 'glyphicon-ok-sign' : 'glyphicon-minus-sign';
            } else {
                cssRes += '';
            }
            return cssRes + $scope.getStatusColor();
        }
        $scope.getButtonStyle = function (target) {
            var css = 'btn-default';
            var state = $scope.state;
            var valid = state && state.cfgRaven && state.cfgRaven.isOnline;
            if (valid) {
                css = state.cfgRaven.isEnabled ? 'btn-primary' : 'btn-warning';
            }
            return css;
        };
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

    }]);