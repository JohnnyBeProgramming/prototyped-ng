﻿/// <reference path="../../imports.d.ts" />

angular.module('myApp.samples.compression', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.compression', {
            url: '/compression',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/compression/main.tpl.html',
                    controller: 'compressionController'
                }
            }
        });
    }]).service('lzwCompressor', function () {
    angular.extend(this, {
        encode: function (s) {
            var dict = {};
            var data = (s + "").split("");
            var out = [];
            var currChar;
            var phrase = data[0];
            var code = 256;
            for (var i = 1; i < data.length; i++) {
                currChar = data[i];
                if (dict[phrase + currChar] != null) {
                    phrase += currChar;
                } else {
                    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                    dict[phrase + currChar] = code;
                    code++;
                    phrase = currChar;
                }
            }
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            for (var i = 0; i < out.length; i++) {
                out[i] = String.fromCharCode(out[i]);
            }
            return out.join("");
        },
        decode: function (s) {
            var dict = {};
            var data = (s + "").split("");
            var currChar = data[0];
            var oldPhrase = currChar;
            var out = [currChar];
            var code = 256;
            var phrase;
            for (var i = 1; i < data.length; i++) {
                var currCode = data[i].charCodeAt(0);
                if (currCode < 256) {
                    phrase = data[i];
                } else {
                    phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                }
                out.push(phrase);
                currChar = phrase.charAt(0);
                dict[code] = oldPhrase + currChar;
                code++;
                oldPhrase = phrase;
            }
            return out.join("");
        }
    });
}).controller('compressionController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', 'lzwCompressor', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, lzwCompressor) {
        // Define the compressor
        var compressor = {
            lzw: lzwCompressor,
            scsu: {
                encode: function (input) {
                    return new SCSU().compress(input);
                },
                decode: function (input) {
                    return new SCSU().decompress(input);
                }
            }
        };

        // Define the model
        var context = $scope.compression = {
            busy: true,
            target: 'lzw',
            compressText: function (text) {
                $rootScope.$applyAsync(function () {
                    console.groupCollapsed(' - Compressing text: ' + text.length + ' bytes...');

                    // Get the raw text payload
                    var payload = context.text;

                    // Run the compression (if required)
                    var ident = context.target || 'lzw';
                    var worker = compressor[ident];
                    if (worker && worker.encode) {
                        // Compress payload
                        payload = worker.encode(payload);
                    }

                    var enc = (ident == 'lzw') ? '' : ',"' + ident + '"';

                    // Set the result
                    context.resType = context.target;
                    context.result = payload;
                    context.ready = true;

                    // Build a url of the script
                    var url = 'javascript:try { ' + JSON.stringify(payload) + "['']().decompress(alert" + enc + ")" + ' } catch (ex) { alert(ex.message) }';
                    context.scriptUrl = url;

                    var btnTrigger = $('#runAsScript');
                    if (btnTrigger) {
                        btnTrigger.attr('href', url);
                    }

                    console.info(' - Compressed size: ' + text.length + ' bytes.');
                    console.groupEnd();
                });
            },
            clearResult: function () {
                // Compress text...
                context.result = null;
                context.ready = false;
            },
            runAsScript: function () {
                try  {
                    console.groupCollapsed(' - Executing as script...');

                    context.runSuccess = null;
                    $rootScope.$applyAsync(function () {
                        console.debug(' - Running payload...', context.scriptUrl);
                        $window.location.url = context.scriptUrl;

                        context.runSuccess = true;
                    });
                } catch (ex) {
                    context.runSuccess = false;
                    console.error(' - Error: ' + ex.message, ex);
                } finally {
                    console.groupEnd();
                }
            },
            getPercentage: function () {
                return 100 - (100.0 * context.result.length / context.text.length);
            },
            getSampleText: function (url) {
                // Get some sample text
                var request = $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'text',
                    success: function (data) {
                        // Update text box with text
                        $rootScope.$applyAsync(function () {
                            context.text = data;
                        });
                    }
                });
            }
        };

        $scope.$watch('compression.target', function () {
            if (context.result && context.resType != context.target) {
                // Update compressed result with new compression type
                context.compressText(context.text);
            }
        });

        // Apply updates (including async)
        var updates = {};
        try  {
            // Get some sample text
            context.getSampleText('assets/lib/test.js');

            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
    }]).run([
    '$state', '$templateCache', function ($state, $templateCache) {
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('myApp.samples.decorators', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.decorators', {
            url: '/decorators',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/decorators/main.tpl.html',
                    controller: 'decoratorsController'
                }
            }
        });
    }]).constant('decoratorConfig', {
    debug: false,
    enabled: false,
    filters: [
        function (include, item) {
            // Exclude loading bar delegates
            if (/(loading-bar)/i.test(item.filename))
                return false;
            return include;
        },
        function (include, item) {
            // Ignore routing...?
            if (/(angular-ui-router)/i.test(item.filename))
                return false;
            return include;
        },
        function (include, item) {
            return include || /(scope\.decorators\.runPromiseAction)/i.test(item.source);
        }
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
        _scope.getStatus = function () {
            return _scope.action == 'Accept';
        };
        _scope.getResult = function () {
            return _scope.getStatus() ? _scope.promisedValue : _scope.rejectValue;
        };
        _scope.getType = function () {
            var result = _scope.getResult();
            return (typeof result);
        };
        _scope.getBody = function () {
            return JSON.stringify(_scope.getResult());
        };
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
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return '';
    },
    setPersisted: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + ((exdays || 7) * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
}).config([
    '$provide', 'decoratorConfig', function ($provide, cfg) {
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
            proxy = $q.defer;
            $q.defer = function () {
                var result, value;
                var info = {
                    startAt: Date.now()
                };
                try  {
                    var timeString = new Date(info.startAt).toLocaleTimeString();
                    if (cfg.debug)
                        console.groupCollapsed('[ ' + timeString + ' ] Promised action intercepted...');

                    // Try and get the original result
                    result = proxy.apply(this, arguments);
                    info.resultAt = Date.now();
                    info.stack = [];

                    var stubResolve = result.resolve;
                    var stubReject = result.reject;
                    var callTime = (info.resultAt - info.startAt);
                    if (cfg.debug)
                        console.info('[ ' + callTime + ' ms ] Execution time.');

                    // Build a stack trace
                    var stack = (new Error('dummy')).stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n').splice(1);

                    // Parse each line and store
                    var passCount = 0;
                    var failCount = 0;
                    if (cfg.debug)
                        console.debug('-------------------------------------------------------------------------------');
                    stack.forEach(function (line, i) {
                        // Extrack the function name and url location from the string
                        var match = /(.+)(\s+)(\()(.+)(\))(\s*)/i.exec(line);
                        if (match) {
                            var item = {
                                source: match[1].trim(),
                                rawUrl: match[4].trim()
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
                                if (cfg.debug)
                                    console.info(' @ [ ' + item.hostname + ' ] \t' + item.filename + ' => ' + item.source);
                                passCount++;
                            } else if (filterResult === false) {
                                // Some excludes found...
                                if (cfg.debug)
                                    console.warn(' @ [ ' + item.hostname + ' ] \t' + item.filename + ' => ' + item.source);
                                failCount++;
                            } else {
                                // No filters matched...
                                if (cfg.debug)
                                    console.debug(' @ [ ' + item.hostname + ' ] \t' + item.filename + ' => ' + item.source);
                            }

                            info.stack.push(item);
                        }
                    });
                    if (cfg.debug)
                        console.debug('-------------------------------------------------------------------------------');
                    if (cfg.debug)
                        console.debug(' - Filters [ ' + passCount + ' Passed, ' + failCount + ' Failed ]');

                    var attach = undefined;
                    if (passCount > 0) {
                        attach = true;
                    } else if (failCount > 0) {
                        attach = false;
                    }

                    if (attach) {
                        if (cfg.debug)
                            console.debug(' - Attaching stubs...');

                        // Override the resolve function
                        result.resolve = function (answer) {
                            var _this = this;
                            var _args = arguments;
                            var timeString = new Date().toLocaleTimeString();
                            if (cfg.promptme) {
                                // Intercept the method
                                cfg.promptme(true, answer).then(function (revised) {
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
                                if (cfg.debug)
                                    console.info('[ ' + timeString + ' ] Accepting promise.');
                                stubResolve.apply(_this, _args);
                            }
                        };

                        // Override the reject function
                        result.reject = function (reason) {
                            var _this = this;
                            var _args = arguments;
                            if (cfg.promptme) {
                                // Intercept the method
                                cfg.promptme(false, reason).then(function (revised) {
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
                                if (cfg.debug)
                                    console.warn('[ ' + timeString + ' ] Rejecting promise.');
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
                    if (cfg.debug)
                        console.info('[ ' + fullTime + ' ms ] Execution Overhead.');
                    if (cfg.debug)
                        console.groupEnd();
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
                try  {
                    var components = parseArguments(arguments);
                    var context = components.context;
                    var method = components.method;
                    var inputs = components.inputs;

                    return ($q.when(method.apply(context, inputs)));
                } catch (error) {
                    try  {
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
    }]).controller('decoratorsController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$modal', '$q', '$timeout', '$window', 'decoratorConfig', function ($rootScope, $scope, $state, $stateParams, $modal, $q, $timeout, $window, cfg) {
        // Define the model
        var context = $scope.decorators = {
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
                $q.fcall(loadSomething, [1, 2, 3]).then(function handleResolve(value) {
                    context.fcallState = 'Resolved';
                    console.log("Resolved!");
                    console.log(value);
                }, function handleReject(error) {
                    context.fcallState = 'Rejected';
                    context.error = error;
                    console.warn("Rejected!");
                    console.warn(error);
                });

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
                context.getPromisedAction().then(function onSuccess(result) {
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
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
    }]).run([
    '$modal', 'decoratorConfig', function ($modal, cfg) {
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
    }]);
/// <reference path="../../imports.d.ts" />

angular.module('myApp.samples.errorHandlers', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.errors', {
            url: '/errors',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/errorHandlers/main.tpl.html',
                    controller: 'errorHandlersController'
                }
            }
        });
    }]).factory('$exceptionHandler', [
    '$window', '$log', 'appNode', function ($window, $log, appNode) {
        // Catch all angular errors to Sentry (via RavenJS, if defined)
        function setUpdatedErrorMessage(args, prefix) {
            var ex = args.length > 0 ? args[0] : {};
            if (ex.message) {
                ex.message = prefix + ex.message;
            }
            $log.error.apply($log, args);
        }
        if ($window.Raven) {
            console.log(' - Using the RavenJS exception handler.');
            var ctx = { tags: { source: "Angular Unhandled Exception" } };
            return function (exception, cause) {
                // Update the exception message
                setUpdatedErrorMessage(arguments, 'Internal [ EX ]: ');
                Raven.captureException(exception, ctx);
            };
        } else if (appNode.active) {
            console.log(' - Using node webkit specific exception handler.');
            return function (exception, cause) {
                setUpdatedErrorMessage(arguments, 'Internal [ NW ]: ');
                // ToDo: Hook in some routing or something...
            };
        } else {
            console.log(' - Using the default logging exception handler.');
            return function (exception, cause) {
                setUpdatedErrorMessage(arguments, 'Internal [ JS ]: ');
            };
        }
    }]).factory('errorHttpInterceptor', [
    '$window', '$q', function ($window, $q) {
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
    }]).config([
    '$provide', '$httpProvider', function ($provide, $httpProvider) {
        // Register error handler
        $httpProvider.interceptors.push('errorHttpInterceptor');

        // Intercept all log messages
        $provide.decorator('$log', [
            '$delegate', 'appStatus', function ($delegate, appStatus) {
                // Define interceptor method
                function intercept(func, callback) {
                    // Save the original function
                    return function () {
                        var args = [].slice.call(arguments);
                        callback.apply(null, args);
                        func.apply($delegate, args);
                    };
                }

                function attach(msgType, msgDesc, msgExt) {
                    var itm = {
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
                $delegate.debug = intercept($delegate.debug, function (msg) {
                    if (show.all || show.debug)
                        attach('debug', msg);
                });
                $delegate.log = intercept($delegate.log, function (msg) {
                    attach('log', msg);
                });
                $delegate.info = intercept($delegate.info, function (msg) {
                    attach('info', msg);
                });
                $delegate.warn = intercept($delegate.warn, function (msg, ext) {
                    attach('warn', msg, ext);
                });
                $delegate.error = intercept($delegate.error, function (msg, ext) {
                    attach('error', msg, ext);
                });

                // Return delegate
                return $delegate;
            }]);
    }]).value('ravenConfig', {
    isEnabled: true,
    isOnline: false,
    publicKey: ''
}).controller('errorHandlersController', [
    '$scope', '$log', '$window', '$location', '$timeout', 'ravenConfig', function ($scope, $log, $window, $location, $timeout, ravenConfig) {
        $scope.state = {
            editMode: false,
            cfgRaven: ravenConfig,
            ajaxCfg: {
                current: null,
                getDesc: function (itm) {
                    var cfg = $scope.state.ajaxCfg;
                    switch (cfg.current) {
                        case cfg.errHttp:
                            return 'Ajax Error (HTTP)';
                        case cfg.errSuccess:
                            return 'Ajax Error (Success)';
                        case cfg.errFailed:
                            return 'Ajax Error (Failed)';
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
                        success: function (result) {
                        },
                        error: function (xhr) {
                        }
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
                        error: function (xhr) {
                        }
                    });
                },
                errFailed: function () {
                    $.ajax({
                        url: "/missing.index.html",
                        dataType: "text/html",
                        success: function (result) {
                        },
                        error: function (xhr) {
                            console.warn(" - Ajax Error [" + xhr.status + "] " + xhr.statusText);
                            window['ajaxOnErrorSample'].dont.exist++;
                        }
                    });
                }
            }
        };
        $scope.detect = function () {
            var started = Date.now();
            try  {
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
                    error: ex.message
                };
            }
        };
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
                }
            }).install();
            ravenConfig.isOnline = true;
        };
        $scope.disconnect = function () {
            console.info(' - Clearing Raven...');
            Raven.uninstall();
            ravenConfig.isOnline = false;
        };
        $scope.setupRaven = function (ravenConfig) {
            if (!$window.Raven)
                return;
            try  {
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
            try  {
                $log.info(' - About to break something...');
                Raven.context(ctx, function () {
                    window['managedSampleError'].dont.exist++;
                });
            } catch (ex) {
                // throw ex; // this will also be caught by the global Angular exception handler
                $log.warn(' - Exception caught and swallowed.');
            }
        };
        $scope.throwAjaxException = function () {
            console.info(' - Doing AJAX request...');
            // XXXXXXXXXXXXXXXXXXXX
        };
        $scope.throwAngularException = function () {
            console.info(' - About to break Angular...');
            $scope.missing.ngSampleError++;
        };
        $scope.throwTimeoutException = function () {
            console.info(' - Setting timeout...');
            setTimeout(function () {
                console.info(' - Entering timeout...');
                window['timeoutSampleError'].dont.exist++;
                console.info(' - Exit timeout...');
            }, 3 * 1000);
        };
        $scope.getStatusColor = function () {
            var cssRes = ' ';
            var active = $scope.state.cfgRaven.isOnline;
            if (active) {
                cssRes += $scope.state.cfgRaven.isEnabled ? 'text-success' : 'text-danger';
            } else {
                cssRes += 'text-danger';
            }
            return cssRes;
        };
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
        };
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
            if ($window.Raven) {
                // Clear prev setup
            }
            if (ravenConfig.publicKey) {
                $scope.setupRaven(ravenConfig);
            } else {
                ravenConfig.isEnabled = false;
            }
            $scope.state.editMode = false;
        };
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('myApp.samples.interceptors', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.interceptors', {
            url: '/interceptors',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/interceptors/main.tpl.html',
                    controller: 'interceptorsController'
                }
            }
        }).state('samples.interceptors.badRequest', {
            url: '/badRequest',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/interceptors/bad.filename'
                }
            }
        });
    }]).constant('interceptorConfig', {
    debug: true,
    enabled: false,
    getPersisted: function (cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
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
    }
}).service('httpInterceptor', [
    '$rootScope', '$q', 'interceptorConfig', function ($rootScope, $q, cfg) {
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
    }]).config([
    '$httpProvider', 'interceptorConfig', function ($httpProvider, cfg) {
        // Get the value from persisted store
        cfg.enabled = cfg.getPersisted('interceptors.enabled') == '1';

        // Register interceptors
        if (cfg.enabled) {
            if (cfg.debug)
                console.log(' - Attaching interceptors...');

            // Attach Angular's interceptor
            $httpProvider.interceptors.push('httpInterceptor');

            // Extend the base ajax request handler
            cfg.extendXMLHttpRequest();
        }
    }]).controller('interceptorsController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', 'interceptorConfig', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, cfg) {
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
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
    }]).run([
    '$state', '$templateCache', 'interceptorConfig', function ($state, $templateCache, cfg) {
    }]);
/// <reference path="../../imports.d.ts" />

angular.module('myApp.samples.notifications', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.notifications', {
            url: '/notifications',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/notifications/main.tpl.html',
                    controller: 'notificationsController'
                }
            }
        });
    }]).constant('notificationsConfig', {
    debug: true,
    enabled: false,
    getPersisted: function (cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return '';
    },
    setPersisted: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + ((exdays || 7) * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },
    notify: function (title, opts, eventHandlers) {
        if ('Notification' in window) {
            // Create a new notification messsage
            var notification = new Notification(title, opts);

            // Add event handlers
            if (eventHandlers) {
                angular.extend(notification, eventHandlers);
            }

            /*
            {
            onclick: function () {
            console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
            },
            onclose: function () {
            console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
            },
            onerror: function () {
            console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
            },
            onshow: function () {
            console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
            },
            }
            */
            return notification;
        } else {
            // Default to console window
            console.info(title, opts);
        }
    },
    hookNotifications: function (callback, notFound) {
        if ('Notification' in window) {
            // API supported, request permission and notify
            window['Notification'].requestPermission(function (status) {
                if (callback) {
                    callback(status);
                }
            });
        } else {
            // API not supported
            console.warn(' - Web notifications not supported by your browser...');
            if (notFound) {
                notFound();
            }
        }
    }
}).config([
    '$httpProvider', 'notificationsConfig', function ($httpProvider, cfg) {
        // Get the value from persisted store
        cfg.enabled = cfg.getPersisted('notifications.enabled') == '1';

        // Register the notification api
        if (cfg.enabled) {
            cfg.hookNotifications(function () {
                if (cfg.debug)
                    console.log(' - Notifications enabled.');
            }, function () {
                if (cfg.debug)
                    console.warn(' - Notifications not available.');
            });
        }
    }]).controller('notificationsController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', 'notificationsConfig', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, cfg) {
        // Define the model
        var context = $scope.notifications = {
            busy: true,
            apply: function () {
                // Set the persisted value
                var opts;
                var val = cfg.enabled ? '0' : '1';
                if (val) {
                    opts = {
                        tag: 'notifications.enabled',
                        icon: 'assets/favicon.png',
                        body: 'Success! Web notifications are now enabled.'
                    };
                } else {
                    opts = {
                        tag: 'notifications.disabled',
                        icon: 'assets/favicon.png',
                        body: 'Removed. Web notifications are now disabled.'
                    };
                }

                cfg.hookNotifications(function () {
                    $rootScope.$applyAsync(function () {
                        // Set active flag and update UI
                        var isActive = cfg.enabled = (status == 'granted');
                        if (isActive) {
                            // Display a notification message too the user
                            cfg.notify('Web Notifications', opts);
                        } else if (status == 'denied') {
                            console.log(' - User declined...');
                        }
                        $window.location.reload(true);
                    });
                });
                cfg.setPersisted('notifications.enabled', val);
            },
            isPatched: function () {
                return cfg.enabled;
            },
            triggerNotification: function () {
                // Display a notification message too the user
                cfg.notify('Web Notifications', {
                    tag: 'ctx_' + Date.now(),
                    icon: 'assets/favicon.png',
                    body: 'Notifications are supported by your browser.'
                });
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
    }]).run([
    '$state', '$templateCache', 'notificationsConfig', function ($state, $templateCache, cfg) {
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('myApp.samples.sampleData', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.sampleData', {
            url: '/sampleData',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/sampleData/main.tpl.html',
                    controller: 'sampleDataController'
                }
            }
        });
    }]).controller('sampleDataController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$q', function ($rootScope, $scope, $state, $stateParams, $q) {
        // Define the model
        var context = $scope.sampleData = {
            busy: true,
            rows: 10,
            args: [
                { id: 'business', val: '{business}' },
                { id: 'firstname', val: '{firstName}' },
                { id: 'lastname', val: '{lastName}' },
                { id: 'email', val: '{email}' },
                { id: 'tel', val: '{phone|format}' },
                { id: 'city', val: '{city}' },
                { id: 'active', val: '{bool|n}' }
            ],
            test: function () {
                try  {
                    // Set busy flag
                    context.busy = true;

                    // Build requested fields
                    var data = {};
                    context.args.forEach(function (obj) {
                        if (obj.id)
                            data[obj.id] = obj.val;
                    });

                    // Define the request
                    var req = angular.extend(data, {
                        'rows': context.rows
                    });

                    // Define the request data
                    context.fetch(req).then(function (data) {
                        context.resp = data;
                    }).catch(function (error) {
                        context.error = error;
                    }).finally(function () {
                        $rootScope.$applyAsync(function () {
                            context.busy = false;
                        });
                    });

                    // Define the request and response handlers
                    console.debug(' - Requesting...');
                } catch (ex) {
                    context.error = ex;
                }
            },
            fetch: function (data) {
                var url = "http://www.filltext.com/?delay=0&callback=?";
                var deferred = $q.defer();

                $.getJSON(url, data).done(function (data) {
                    deferred.resolve(data);
                }).fail(function (xhr, desc, err) {
                    var error = new Error('Error [' + xhr.status + ']: ' + xhr.statusText + ' - ' + err);
                    deferred.reject(error);
                });

                return deferred.promise;
            },
            getArgs: function () {
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
    }]);
/// <reference path="../../imports.d.ts" />

angular.module('myApp.samples.styles3d', []).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.styles3d', {
            url: '/styles3d',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/styles3d/main.tpl.html',
                    controller: 'styles3dController'
                }
            }
        });
    }]).service('style3dUniverse', [function () {
        var universe = {
            screen: null,
            pointer: null,
            camera: null,
            locals: [],
            images: [],
            init: function (screen, pointer, camera) {
                universe.screen = screen;
                universe.pointer = pointer;
                universe.camera = camera;
            },
            load: function () {
                universe.images = $('#scene').find('[data-transform]');
                for (var i = 0, n = universe.images.length; i < n; i++) {
                    var elem = universe.images[i];
                    var s = $(elem).attr('data-transform');
                    elem.style.transform = s;
                    elem.style.webkitTransform = s;
                    elem.style.visibility = 'visible';
                    universe.locals.push(s);
                }
            },
            run: function () {
                // Render frames one frame at a time...
                // This queues the next one
                requestAnimationFrame(universe.run);

                // Transform images
                var globalcamera = universe.camera.move();
                for (var i = 0, elem; elem = universe.images[i]; i++) {
                    var s = globalcamera + universe.locals[i];
                    elem.style.transform = s;
                    elem.style.webkitTransform = s;
                }
            }
        };

        return universe;
    }]).controller('styles3dController', [
    '$rootScope', '$scope', 'style3dUniverse', function ($rootScope, $scope, style3dUniverse) {
        function Ease(speed, val) {
            this.speed = speed;
            this.target = val;
            this.value = val;
        }
        Ease.prototype.ease = function (target) {
            this.value += (target - this.value) * this.speed;
        };

        function runStyle3D() {
            // Initialise the viewing engine
            var screen = ge1doot.screen.init("screen", null, true);
            var pointer = screen.pointer.init({
                move: function () {
                    // Only allow user to look up/down, not over top, bottom
                    if (pointer.drag.y > 270)
                        pointer.drag.y = 270;
                    if (pointer.drag.y < -270)
                        pointer.drag.y = -270;
                }
            });
            var camera = {
                angle: { x: 0, y: 0, ease: { x: 0, y: 0 } },
                pos: { x: 0, z: 0 },
                vel: { x: 0.1, z: 0.1 },
                fov: new Ease(0.01, 100),
                move: function () {
                    this.angle.y = -(this.angle.ease.y += (pointer.drag.x - this.angle.ease.y) * 0.06) / 3;
                    this.angle.x = (this.angle.ease.x += (pointer.drag.y - this.angle.ease.x) * 0.06) / 3;
                    this.fov.ease(pointer.active ? 200 : 500);
                    var a = this.angle.y * Math.PI / 180;
                    var x = -Math.sin(a) * this.vel.x;
                    var z = Math.cos(a) * this.vel.z;
                    this.pos.x += x;
                    this.pos.z += z;
                    if (pointer.active) {
                        if ((this.pos.x > 190 && x > 0) || (this.pos.x < -190 && x < 0))
                            this.vel.x *= 0.9;
                        else {
                            if (this.vel.x < 0.1)
                                this.vel.x = 1;
                            if (this.vel.x < 5)
                                this.vel.x *= 1.1;
                        }
                        if ((this.pos.z > 190 && z > 0) || (this.pos.z < -190 && z < 0))
                            this.vel.z *= 0.9;
                        else {
                            if (this.vel.z < 0.1)
                                this.vel.z = 1;
                            if (this.vel.z < 5)
                                this.vel.z *= 1.1;
                        }
                    } else {
                        this.vel.x *= 0.9;
                        this.vel.z *= 0.9;
                    }
                    a = Math.cos(this.angle.x * Math.PI / 180);
                    var mx = -(1 * Math.cos((this.angle.y - 90) * Math.PI / 180) * a) * (500 - this.fov.value * 0.5);
                    var mz = -(1 * Math.sin((this.angle.y - 90) * Math.PI / 180) * a) * (500 - this.fov.value * 0.5);
                    var my = Math.sin(this.angle.x * Math.PI / 180) * 200;
                    return "perspective(" + this.fov.value + "px) rotateX(" + this.angle.x + "deg) " + "rotateY(" + this.angle.y + "deg) translateX(" + (this.pos.x + mx) + "px) translateY(" + my + "px) translateZ(" + (this.pos.z + mz) + "px)";
                }
            };
            style3dUniverse.init(screen, pointer, camera);
            style3dUniverse.load();

            // Request (queue) the first animation frame...
            requestAnimationFrame(style3dUniverse.run);
        }

        // Load required libraries if not defined
        if (typeof ge1doot !== 'undefined') {
            runStyle3D();
        } else if (typeof $script !== 'undefined') {
            console.log(' - Loading Styles3D....');
            $script(['assets/lib/screen.js'], function () {
                runStyle3D();
            });
        } else
            throw new Error('Failed to initialise. $script missing....');
    }]).run([
    '$state', function ($state) {
    }]);
/// <reference path="../imports.d.ts" />
/// <reference path="compression/module.ng.ts" />
/// <reference path="decorators/module.ng.ts" />
/// <reference path="errorHandlers/module.ng.ts" />
/// <reference path="interceptors/module.ng.ts" />
/// <reference path="notifications/module.ng.ts" />
/// <reference path="sampleData/module.ng.ts" />
/// <reference path="styles3d/module.ng.ts" />
angular.module('prototyped.ng.samples', [
    'prototyped.ng.samples.views',
    'myApp.samples.errorHandlers',
    'myApp.samples.sampleData',
    'myApp.samples.decorators',
    'myApp.samples.interceptors',
    'myApp.samples.notifications',
    'myApp.samples.compression',
    'myApp.samples.styles3d'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples', {
            url: '/samples',
            abstract: true
        }).state('samples.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/main.tpl.html',
                    controller: 'sampleViewController'
                }
            }
        });
    }]).controller('sampleViewController', [
    '$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
        // Define the model
        var context = $scope.sample = {
            busy: true,
            text: '',
            utils: {
                list: function (path, callback) {
                    var list = [];
                    try  {
                    } catch (ex) {
                        context.error = ex;
                        console.error(ex.message);
                    }
                    return list;
                }
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
    }]);
//# sourceMappingURL=prototyped.ng.samples.base.js.map
