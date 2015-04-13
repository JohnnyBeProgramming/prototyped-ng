/// <reference path="../../imports.d.ts" />

angular.module('prototyped.ng.samples.decorators', [])
    .config(['appConfigProvider', function (appConfigProvider) {
        appConfigProvider.set({
            'interceptors': {
                debug: false,
                enabled: appConfigProvider.getPersisted('interceptors.enabled') == '1',
                extendXMLHttpRequest: function () {
                    var appConfig = appConfigProvider.$get();
                    var cfg = appConfig['interceptors'];

                    // Do some magic with the ajax request handler
                    var callback = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
                        var me = this;
                        var arg = arguments;
                        var ctx = { async: async };
                        if (cfg.enabled) {
                            // Check for auth info
                            if (user || pass) {
                                // Extended with auth info
                                angular.extend(ctx, {
                                    username: user,
                                    password: pass
                                });
                            }
                            console.log(' - [ Ajax ] ( ' + (async ? 'Async' : 'Sync') + ' ) => ', url, ctx);
                            // Call the original function
                            if (callback) {
                                callback.apply(me, arg);
                            }
                            /*
                            appConfig['decorators'].promptme(true, url)
                                .then(() => {
                                    // Call the original function
                                    if (callback) {
                                        callback.apply(me, arg);
                                    }
                                },
                                () => {
                                    console.warn('Cancelled Request: ', url);
                                });
                            */
                        } else {
                            // Call the original function
                            if (callback) {
                                callback.apply(me, arg);
                            }
                        }
                    };
                },
            },
        });
    }])
    .config(['$httpProvider', 'appConfigProvider', function ($httpProvider, appConfigProvider) {
        // Extend the base ajax request handler
        var appConfig = appConfigProvider.$get();
        var cfg = appConfig['interceptors'];
        if (cfg) {
            cfg.extendXMLHttpRequest();
        }

        // Attach Angular's interceptor
        $httpProvider.interceptors.push('httpInterceptor');

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

                try {
                    if (response.data && response.status === 200) {
                        var inp = $(response.data);
                        if (inp.length) inp.each((i, elem: any) => {
                            //$(elem).addClass('glow-blue');
                            $(elem).css('color', '#0094ff');
                            $(elem).css('border', '1px dashed #0094ff');
                            $(elem).css('box-shadow', '0 0 2px #0094ff');
                        });
                        var out = $('<p>').append(inp.clone()).html();
                        if (out) {
                            response.data = out;
                        }
                    }
                } catch (ex) {
                }
                /*
                 * appConfig['decorators'].promptme(true, response)
                    .then(() => {
                        console.groupCollapsed(' <- Responding: ' + response.config.url);
                        console.log(response);
                        console.groupEnd();
                    },
                    () => {
                        console.log('Cancelled Request: ', response);
                    });
                 */
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

// -----------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------

    .config(['appConfigProvider', function (appConfigProvider) {
        appConfigProvider.set({
            'decorators': {
                debug: false,
                enabled: appConfigProvider.getPersisted('decorators.enabled') == '1',
                promptme: null,
                filters: [
                    function (include, item) {
                        // Exclude loading bar delegates
                        if (/(loading-bar)/i.test(item.filename)) return false;
                        return include;
                    },
                    function (include, item) {
                        // Ignore routing...?
                        if (/(angular-ui-router)/i.test(item.filename)) return false;
                        return include;
                    },
                    /*
                    function (include, item) {
                        if (/(localhost)/i.test(item.hostname)) return true;
                        return include;
                    },
                    function (include, item) {
                        if (/(localhost)/i.test(item.hostname)) return true;
                        return include;
                    },
                    function (include, item) {
                        if (/(scope\.decorators\.openModalWindow)/i.test(item.source)) return false;
                        return include;
                    },
                    function (include, item) {
                        if (/(Scope\._scope\.ok)/i.test(item.source)) return false;
                        return include;
                    },
                    */
                    function (include, item) {
                        return include
                            || /(scope\.decorators\.fcall)/i.test(item.source);
                    },
                    function (include, item) {
                        return include
                            || /(scope\.decorators\.runPromiseAction)/i.test(item.source);
                    },
                ],
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
    }])
    .config(['$provide', 'appConfigProvider', function ($provide, appConfigProvider) {
        var appConfig = appConfigProvider.$get();
        var cfg = appConfig['decorators'];

        // Our decorator will get called when / if the $q service needs to be
        // instantiated in the application. It is made available as the
        // "$delegate" reference (made available as an override in the "locals"
        // used to .invoke() the method. Other services can be injected by name.
        // --
        // NOTE: This decorator MUST RETURN the "$q" service, otherwise, $q will
        // be undefined within the application.
        function decorateQService($delegate, $exceptionHandler) {

            // Create a "natural" reference to our delegate for use locally.
            var $q = $delegate;

            // Monkey-patch our fcall() method.
            $q.fcall = fcall;

            var proxy;
            proxy = $q.defer; $q.defer = function () {
                // Use default call-through if not enabled...
                if (!cfg.enabled) return proxy.apply(this, arguments);
                var result, value;
                var info = <any>{
                    startAt: Date.now(),
                };
                try {

                    // Try and get the original result
                    result = proxy.apply(this, arguments);

                    // Execute extended functionality....
                    var timeString = new Date(info.startAt).toLocaleTimeString();
                    if (cfg.debug) console.groupCollapsed('[ ' + timeString + ' ] Promised action intercepted...');

                    info.resultAt = Date.now();
                    info.stack = [];

                    var stubResolve = result.resolve;
                    var stubReject = result.reject;
                    var callTime = (info.resultAt - info.startAt);
                    if (cfg.debug) console.info('[ ' + callTime + ' ms ] Execution time.');

                    // Build a stack trace
                    var stack = (<any>new Error('dummy')).stack
                        .replace(/^[^\(]+?[\n$]/gm, '')
                        .replace(/^\s+at\s+/gm, '')
                        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                        .split('\n').splice(1);


                    // Parse each line and store
                    var passCount = 0;
                    var failCount = 0;
                    if (cfg.debug) console.debug('-------------------------------------------------------------------------------');
                    if (stack.length) stack.forEach(function (line, i) {

                        // Extrack the function name and url location from the string
                        var match = /(.+)(\s+)(\()(.+)(\))(\s*)/i.exec(line);
                        if (match) {
                            var item = <any>{
                                source: match[1].trim(),
                                rawUrl: match[4].trim(),
                            };

                            var parts = /(\w+:\/\/)([^\/]+)(\/)(.+\/)(.+.js)(:)?(\d+)?(:)?(\d+)?/i.exec(item.rawUrl);
                            if (parts) {
                                item.protocol = parts[1];
                                item.hostname = parts[2];
                                item.basepath = parts[4];
                                item.filename = parts[5];
                                item.fullname = item.basepath + '/' + item.filename;
                                item.line = parts.length > 7 ? parts[7] : null;
                                item.char = parts.length > 9 ? parts[9] : null;
                            }

                            var filterResult = undefined;
                            cfg.filters.forEach(function (filter) {
                                filterResult = item.match = filter(filterResult, item);
                            });

                            if (filterResult === true) {
                                // Includes takes pref.
                                if (cfg.debug) console.info(' @ [ ' + item.hostname + ' ] \t' + item.filename + ' => ' + item.source);
                                passCount++;
                            } else if (filterResult === false) {
                                // Some excludes found...
                                if (cfg.debug) console.warn(' @ [ ' + item.hostname + ' ] \t' + item.filename + ' => ' + item.source);
                                failCount++;
                            } else {
                                // No filters matched...
                                if (cfg.debug) console.debug(' @ [ ' + item.hostname + ' ] \t' + item.filename + ' => ' + item.source);
                            }

                            info.stack.push(item);
                        }

                    });
                    if (cfg.debug) console.debug('-------------------------------------------------------------------------------');
                    if (cfg.debug) console.debug(' - Filters [ ' + passCount + ' Passed, ' + failCount + ' Failed ]');

                    var attach = undefined; // Default Action
                    if (passCount > 0) {
                        attach = true;
                    }
                    else if (failCount > 0) {
                        attach = false;
                    }

                    if (attach) {
                        if (cfg.debug) console.debug(' - Attaching stubs...');

                        // Override the resolve function
                        result.resolve = function (answer) {
                            var _this = this;
                            var _args = arguments;
                            var timeString = new Date().toLocaleTimeString();
                            if (cfg.promptme) {
                                // Intercept the method 
                                cfg.promptme(true, answer)
                                    .then(function (revised) {
                                        // Set the result
                                        console.info('[ ' + timeString + ' ] Intercepted Result.', revised);
                                        stubResolve.apply(_this, _args);
                                    }, function (revised) {
                                        // Reject the result
                                        console.info('[ ' + timeString + ' ] Intercepted Rejection.', revised);
                                        stubReject.apply(_this, _args);
                                    });
                            } else {
                                // Apply action directly
                                if (cfg.debug) console.info('[ ' + timeString + ' ] Accepting promise.');
                                stubResolve.apply(_this, _args);
                            }
                        };

                        // Override the reject function
                        result.reject = function (reason) {
                            var _this = this;
                            var _args = arguments;
                            if (cfg.promptme) {
                                // Intercept the method 
                                cfg.promptme(false, reason)
                                    .then(function (revised) {
                                        // Set the result
                                        console.info('[ ' + timeString + ' ] Intercepted Result.', revised);
                                        stubResolve.apply(_this, _args);
                                    }, function (revised) {
                                        // Reject the result
                                        console.info('[ ' + timeString + ' ] Intercepted Rejection.', revised);
                                        stubReject.apply(_this, _args);
                                    });
                            } else {
                                // Apply action directly
                                if (cfg.debug) console.warn('[ ' + timeString + ' ] Rejecting promise.');
                                stubReject.apply(_this, _args);
                            }
                        };
                    } else {

                    }
                } catch (ex) {
                    // Something went wrong!
                    info.error = ex;
                    console.error(ex);
                } finally {
                    // Record end time
                    info.endedAt = Date.now();
                    var fullTime = (info.endedAt - info.startAt) - callTime;
                    if (cfg.debug) console.info('[ ' + fullTime + ' ms ] Execution Overhead.');
                    if (cfg.debug) console.groupEnd();
                }

                return result;
            };

            // Return the original delegate as our instance of $q.
            return ($q);


            // ---
            // PUBLIC METHODS.
            // ---


            // I invoke the given function using the given arguments. If the
            // invocation is successful, it will result in a resolved promise;
            // if it throws an error, it will result in a rejected promise,
            // passing the error object through as the "reason."
            // --
            // The possible method signatures:
            // --
            // .fcall( methodReference )
            // .fcall( methodReference, argsArray )
            // .fcall( context, methodReference, argsArray )
            // .fcall( context, methodName, argsArrray )
            // .fcall( context, methodReference )
            // .fcall( context, methodName )
            function fcall() {

                try {
                    var components = parseArguments(arguments);
                    var context = components.context;
                    var method = components.method;
                    var inputs = components.inputs;

                    return ($q.when(method.apply(context, inputs)));
                } catch (error) {
                    // We want to pass the error off to the core exception
                    // handler. But, we want to protect ourselves against any
                    // errors there. While it is unlikely that this will error,
                    // if the app has added an exception interceptor, it's
                    // possible something could go wrong.
                    try {
                        $exceptionHandler(error);
                    } catch (loggingError) {
                        // Nothing we can do here.
                    }
                    return ($q.reject(error));
                }
            }

            // ---
            // PRIVATE METHODS.
            // ---

            // I parse the .fcall() arguments into a normalized structure that is
            // ready for consumption.
            function parseArguments(args) {

                // First, let's deal with the non-ambiguous arguments. If there
                // are three arguments, we know exactly which each should be.
                if (args.length === 3) {

                    var context = args[0];
                    var method = args[1];
                    var inputs = args[2];

                    // Normalize the method reference.
                    if (angular.isString(method)) {

                        method = context[method];

                    }

                    return ({
                        context: context,
                        method: method,
                        inputs: inputs
                    });

                }

                // If we have only one argument to work with, then it can only be
                // a direct method reference.
                if (args.length === 1) {

                    return ({
                        context: null,
                        method: args[0],
                        inputs: []
                    });

                }

                // Now, we have to look at the ambiguous arguments. If w have
                // two arguments, we don't immediately know which of the following
                // it is:
                // --
                // .fcall( methodReference, argsArray )
                // .fcall( context, methodReference )
                // .fcall( context, methodName )
                // --
                // Since the args array is always passed as an Array, it means
                // that we can determine the signature by inspecting the last
                // argument. If it's a function, then we don't have any argument
                // inputs.
                if (angular.isFunction(args[1])) {

                    return ({
                        context: args[0],
                        method: args[1],
                        inputs: []
                    });

                    // And, if it's a string, then don't have any argument inputs.
                } else if (angular.isString(args[1])) {

                    // Normalize the method reference.
                    return ({
                        context: args[0],
                        method: args[0][args[1]],
                        inputs: []
                    });

                    // Otherwise, the last argument is the arguments input and we
                    // know, in that case, that we don't have a context object to
                    // deal with.
                } else {

                    return ({
                        context: null,
                        method: args[0],
                        inputs: args[1]
                    });

                }

            }
        }

        $provide.decorator("$q", decorateQService);
    }])

    .controller('decoratorsController', ['$rootScope', '$scope', '$state', '$stateParams', '$modal', '$q', '$timeout', '$window', 'appConfig', function ($rootScope, $scope, $state, $stateParams, $modal, $q, $timeout, $window, appConfig) {
        var cfg = appConfig['decorators'];


        // Define the model
        var context = $scope.decorators = <any>{
            fcall: function () {
                // Clear last result
                context.error = null;
                context.fcallState = null;

                $timeout(() => {

                }, 1500).then(
                    (value) => {
                        context.lastStatus = true;
                        context.fcallState = 'Resolved';
                        context.lastResult = 'Timeout Passed';
                    },
                    (error) => {
                        context.lastStatus = false;
                        context.fcallState = 'Rejected';
                        context.lastResult = 'Timeout Failed: ' + error.message;
                    });

            },
            runPromiseAction: function () {
                // Clear last result
                context.error = null;
                context.lastResult = null;
                context.confirmStatus = null;

                // Add new promised action
                context
                    .getPromisedAction()
                    .then(function onSuccess(result) {
                        context.confirmStatus = true;
                        context.lastStatus = true;
                        context.lastResult = result;
                    }, function onRejected(error) {
                        context.confirmStatus = false;
                        context.lastStatus = false;
                        context.lastResult = error;
                    });
            },
            getPromisedAction: function (callback) {
                var deferred = $q.defer();
                $rootScope.$applyAsync(function () {
                    if (confirm('Pass Action?')) {
                        var result = 'The action was passed @ ' + new Date().toLocaleTimeString();
                        deferred.resolve(result);
                    } else {
                        var err = new Error('The action was rejected @ ' + new Date().toLocaleTimeString());
                        deferred.reject(err);
                    }
                });
                return deferred.promise;
            },
            openModalWindow: function (templateUrl, status, result) {
                var modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    controller: function ($scope, $modalInstance) {
                        $scope.status = status;
                        $scope.result = result;

                        // Delegate the controller logic
                        cfg.modalController($scope, $modalInstance);
                    },
                    size: 'sm',
                    resolve: {
                        decorators: function () {
                            console.log(' - Get Decorators...', $scope);
                            return $scope.decorators;
                        }
                    }
                });
                return modalInstance;
            },
        };

        $scope.interceptors = {
            triggerAjaxRequest: function () {
                /*
                var url = "http://www.filltext.com/?delay=0&callback=?";
                var opts = {
                    business: '{business}',
                    firstname: '{firstName}',
                    lastname: '{lastName}',
                    email: '{email}',
                    tel: '{phone|format}',
                    city: '{city}',
                    active: '{bool|n}',
                };
                $.getJSON(url, opts)
                    .done(function (data) {
                        $rootScope.$applyAsync(() => {
                            $scope.decorators.lastStatus = true;
                            $scope.interceptors.ajaxResult = JSON.stringify(data);
                            $scope.interceptors.ajaxStatus = true;
                        });
                    })
                    .fail(function (xhr, desc, err) {
                        $rootScope.$applyAsync(() => {
                            $scope.decorators.lastStatus = true;
                            $scope.interceptors.ajaxResult = JSON.stringify({ desc: desc, error: err });
                            $scope.interceptors.ajaxStatus = true;
                        });
                    });
                */

                var url = 'samples/left.tpl.html'; //window.location.href;
                $scope.decorators.lastStatus = null;
                $scope.interceptors.ajaxStatus = null;
                $.ajax(url, {
                    contentType: 'text/html',
                    success: function (data) {
                        $rootScope.$applyAsync(() => {
                            $scope.decorators.lastStatus = true;
                            $scope.interceptors.ajaxStatus = true;
                            context.ajaxResult = data;
                            context.lastResult = 'AJAX Result: ' + url;
                        });
                    },
                    error: function (xhr, desc, ex) {
                        $rootScope.$applyAsync(() => {
                            $scope.decorators.lastStatus = false;
                            $scope.interceptors.ajaxStatus = false;
                            context.lastResult = 'AJAX Error: [ ' + desc + ' ] ' + ex || url;
                        });
                    },
                });
            },
        };

    }])

    .controller('interceptModalController', ['$scope', '$modalInstance', 'status', 'result', function ($scope, $modalInstance, status, result) {
        $scope.status = status;
        $scope.result = result;

        // Define modal scope
        $scope.allowEmpty = typeof result === 'undefined';
        $scope.action = status ? 'Accept' : 'Reject';
        $scope.modalAction = (typeof status !== 'undefined') ? 'resp' : 'req';
        $scope.promisedValue = status ? result : undefined;
        $scope.rejectValue = !status ? result : new Error("Interceptor rejected the action.");
        $scope.getStatus = function () { return $scope.action == 'Accept'; };
        $scope.getResult = function () { return $scope.getStatus() ? $scope.promisedValue : $scope.rejectValue; };
        $scope.getType = function () {
            var result = $scope.getResult();
            return (typeof result);
        };
        $scope.getBody = function () { return JSON.stringify($scope.getResult()); };
        $scope.setToggle = function (val) {
            $scope.allowEmpty = val;
        };
        $scope.ok = function () {
            if (!$scope.allowEmpty && !$scope.promisedValue) {
                alert($scope.allowEmpty);
                return;
            }
            $modalInstance.close($scope.promisedValue);
        };
        $scope.cancel = function () {
            if (!$scope.allowEmpty && !$scope.rejectValue) {
                return;
            }
            $modalInstance.dismiss($scope.rejectValue);
        };
    }])
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
