/// <reference path="../../imports.d.ts" />

angular.module('myApp.samples.decorators', [])
    .config(['$stateProvider', function ($stateProvider) {

        // Now set up the states
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

    .constant('decoratorConfig', {
        debug: false,
        enabled: false,
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
                    || /(scope\.decorators\.runPromiseAction)/i.test(item.source);
            },
        ],
        promptme: undefined,
        template: 'samples/decorators/dialogs/interceptor.tpl.html',
        modalController: function ($scope, $modalInstance) {
            // Define modal scope
            var _scope = $scope;
            var status = $scope.status;
            var result = $scope.result;
            _scope.allowEmpty = typeof result === 'undefined';
            _scope.action = status ? 'Accept' : 'Reject';
            _scope.modalAction = (typeof status !== 'undefined') ? 'resp' : 'req';
            _scope.promisedValue = status ? result : undefined;
            _scope.rejectValue = !status ? result : new Error("Interceptor rejected the action.");
            _scope.getStatus = function () { return _scope.action == 'Accept'; };
            _scope.getResult = function () { return _scope.getStatus() ? _scope.promisedValue : _scope.rejectValue; };
            _scope.getType = function () {
                var result = _scope.getResult();
                return (typeof result);
            };
            _scope.getBody = function () { return JSON.stringify(_scope.getResult()); };
            _scope.setToggle = function (val) {
                _scope.allowEmpty = val;
            };
            _scope.ok = function () {
                if (!_scope.allowEmpty && !_scope.promisedValue) {
                    alert(_scope.allowEmpty);
                    return;
                }
                $modalInstance.close(_scope.promisedValue);
            };
            _scope.cancel = function () {
                if (!_scope.allowEmpty && !_scope.rejectValue) {
                    return;
                }
                $modalInstance.dismiss(_scope.rejectValue);
            };
        },
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
        }
    })
    .config(['$provide', 'decoratorConfig', function ($provide, cfg) {
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
                var result, value;
                var info = <any>{
                    startAt: Date.now(),
                };
                try {
                    var timeString = new Date(info.startAt).toLocaleTimeString();
                    if (cfg.debug) console.groupCollapsed('[ ' + timeString + ' ] Promised action intercepted...');

                    // Try and get the original result
                    result = proxy.apply(this, arguments);
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
                    stack.forEach(function (line, i) {

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
                                filterResult = filter(filterResult, item);
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

        // Register a decorator for the $q service.
        cfg.enabled = cfg.getPersisted('monkeyPatching.enabled') == '1';
        if (cfg.enabled) {
            $provide.decorator("$q", decorateQService);
        }

    }])

    .controller('decoratorsController', ['$rootScope', '$scope', '$state', '$stateParams', '$modal', '$q', '$timeout', '$window', 'decoratorConfig', function ($rootScope, $scope, $state, $stateParams, $modal, $q, $timeout, $window, cfg) {
        // Define the model
        var context = $scope.decorators = <any>{
            busy: true,
            apply: function () {
                // Set the persisted value                
                var val = cfg.enabled ? '0' : '1';
                cfg.setPersisted('monkeyPatching.enabled', val);
                $window.location.reload(true);
            },
            fcall: function () {
                // Clear last result
                context.error = null;
                context.fcallState = null;

                // Invoke the loadSomething() method with given arguments - .fcall() will
                // return a promise even if the method invocation fails.
                $q.fcall(loadSomething, [1, 2, 3])
                    .then(
                        function handleResolve(value) {
                            context.fcallState = 'Resolved';
                            console.log("Resolved!");
                            console.log(value);
                        },
                        function handleReject(error) {
                            context.fcallState = 'Rejected';
                            context.error = error;
                            console.warn("Rejected!");
                            console.warn(error);
                        }
                    );

                // ---
                // PRIVATE METHODS.
                // ---
                // I load some data and return a promise.
                function loadSomething(a, b, c) {
                    // Using this special case to demonstrate the FAILURE path that will
                    // raise an exception ( to see if .fcall() can catch it ).
                    if ((a === 1) && (b === 2) && (c === 3)) {
                        throw (new Error("InvalidArguments"));
                    }
                    return ($q.when("someValue"));
                }
            },
            isPatched: function () {
                return cfg.enabled;
            },
            runPromiseAction: function () {
                // Clear last result
                context.error = null;
                context.lastResult = null;

                // Add new promised action
                context
                    .getPromisedAction()
                    .then(function onSuccess(result) {
                        context.lastStatus = true;
                        context.lastResult = result;
                    }, function onRejected(error) {
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

    .run(['$modal', 'decoratorConfig', function ($modal, cfg) {
        //console.warn(' - Started: ', cfg);

        // Hook the interceptor function
        if (cfg.enabled) {
            cfg.promptme = function (status, result) {
                return $modal.open({
                    templateUrl: cfg.template,
                    controller: function ($scope, $modalInstance) {
                        $scope.status = status;
                        $scope.result = result;

                        // Delegate the controller logic
                        cfg.modalController($scope, $modalInstance);
                    },
                    size: 'sm',
                    resolve: {}
                }).result;
            };
        }
    }])
;