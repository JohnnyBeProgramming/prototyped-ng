/// <reference path="../../imports.d.ts" />

angular.module('prototyped.ng.samples.compression', []).config([
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
                    try  {
                        var scsu = new SCSU();
                        if (scsu._isCompressible()) {
                            return scsu.compress(input);
                        } else
                            throw new Error('Input string cannot be compressed by SCSU!');
                    } catch (ex) {
                        alert(ex.message);
                    }
                },
                decode: function (input) {
                    try  {
                        var scsu = new SCSU();
                        return scsu.decompress(input);
                    } catch (ex) {
                        alert(ex.message);
                    }
                }
            },
            html: {
                encode: function (input) {
                    return encodeURIComponent(input);
                },
                decode: function (input) {
                    return decodeURIComponent(input);
                }
            },
            base64: {
                encode: function (input) {
                    return btoa(input);
                },
                decode: function (input) {
                    return atob(input);
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
angular.module('prototyped.ng.samples.decorators', []).config([
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
/// <reference path="RavenService.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                (function (raven) {
                    var RavenErrorHandler = (function () {
                        function RavenErrorHandler(service) {
                            this.service = service;
                            this.name = 'raven';
                            this.label = 'Sentry via RavenJS';
                        }
                        Object.defineProperty(RavenErrorHandler.prototype, "enabled", {
                            get: function () {
                                return this.service.isEnabled;
                            },
                            set: function (state) {
                                this.service.isEnabled = state;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        RavenErrorHandler.prototype.attach = function () {
                            var isOnline = this.service.detect();
                            this.service.isEnabled = true;
                            this.service.handler.enabled = true;
                        };

                        RavenErrorHandler.prototype.dettach = function () {
                            this.service.isEnabled = false;
                            this.service.handler.enabled = false;
                        };
                        return RavenErrorHandler;
                    })();
                    raven.RavenErrorHandler = RavenErrorHandler;
                })(errorHandlers.raven || (errorHandlers.raven = {}));
                var raven = errorHandlers.raven;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="RavenErrorHandler.ts" />

var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                (function (raven) {
                    var RavenService = (function () {
                        function RavenService($rootScope, $log, appConfig) {
                            this.$rootScope = $rootScope;
                            this.$log = $log;
                            this.appConfig = appConfig;
                            this.editMode = false;
                            this.isOnline = false;
                            this.isEnabled = false;
                            this.lastError = null;
                            this.config = appConfig.ravenConfig;
                            this.handler = new raven.RavenErrorHandler(this);
                            appConfig.errorHandlers.push(this.handler);
                        }
                        RavenService.prototype.detect = function () {
                            var _this = this;
                            try  {
                                // Load required libraries if not defined
                                console.info(' - Detecting RavenJS...');
                                var url = 'https://cdn.ravenjs.com/1.1.18/raven.min.js';
                                if (typeof Raven === 'undefined') {
                                    this.$log.info('Loading: ' + url);
                                    this.handler.busy = true;
                                    $.getScript(url, function (data, textStatus, jqxhr) {
                                        _this.$rootScope.$applyAsync(function () {
                                            _this.handler.busy = false;
                                            _this.init();
                                        });
                                    });
                                } else {
                                    this.init();
                                }
                            } catch (ex) {
                                this.isOnline = false;
                                this.lastError = ex;
                            }
                            return this.isOnline;
                        };

                        RavenService.prototype.init = function () {
                            // Check for Raven.js and auto-load
                            if (!this.isOnline && this.config.publicKey) {
                                this.$log.log('Initialising RavenJS....');
                                this.setupRaven();
                            }
                        };

                        RavenService.prototype.connect = function (publicKey) {
                            var _this = this;
                            try  {
                                this.lastError = null;
                                Raven.config(publicKey, {
                                    shouldSendCallback: function (data) {
                                        // Only return true if data should be sent
                                        var isActive = publicKey && _this.isEnabled;
                                        if (isActive) {
                                            _this.$rootScope.$applyAsync(function () {
                                                _this.$log.info('Sending Raven: "' + data.message + '"...');
                                            });
                                        }
                                        return isActive;
                                    },
                                    dataCallback: function (data) {
                                        // Add something to data
                                        return data;
                                    }
                                }).install();

                                this.isOnline = true;
                            } catch (ex) {
                                this.isOnline = false;
                                this.lastError = ex;
                            }
                        };

                        RavenService.prototype.disconnect = function () {
                            if (typeof Raven !== 'undefined') {
                                Raven.uninstall();
                            }
                            this.isOnline = false;
                        };

                        RavenService.prototype.setupRaven = function () {
                            if (typeof Raven === 'undefined')
                                return;
                            try  {
                                // Disconnect for any prev sessions
                                if (this.isOnline) {
                                    this.disconnect();
                                }

                                // Try to connect with public key
                                this.connect(this.config.publicKey);

                                // Success
                                console.info(' - Done.');
                            } catch (ex) {
                                // Something went wrong
                                console.warn(' - RavenJS failed to initialise.');
                                throw ex;
                            }
                        };
                        return RavenService;
                    })();
                    raven.RavenService = RavenService;
                })(errorHandlers.raven || (errorHandlers.raven = {}));
                var raven = errorHandlers.raven;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="GoogleErrorService.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                (function (google) {
                    var GoogleErrorHandler = (function () {
                        function GoogleErrorHandler(service) {
                            this.service = service;
                            this.name = 'google';
                            this.label = 'Google Analytics';
                        }
                        Object.defineProperty(GoogleErrorHandler.prototype, "enabled", {
                            get: function () {
                                return this.service.isEnabled;
                            },
                            set: function (state) {
                                this.service.isEnabled = state;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        GoogleErrorHandler.prototype.attach = function () {
                            var isOnline = this.service.detect();
                            this.service.isEnabled = true;
                            this.service.handler.enabled = true;
                        };

                        GoogleErrorHandler.prototype.dettach = function () {
                            this.service.isEnabled = false;
                            this.service.handler.enabled = false;
                        };
                        return GoogleErrorHandler;
                    })();
                    google.GoogleErrorHandler = GoogleErrorHandler;
                })(errorHandlers.google || (errorHandlers.google = {}));
                var google = errorHandlers.google;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="GoogleErrorHandler.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                (function (google) {
                    var GoogleErrorService = (function () {
                        function GoogleErrorService($rootScope, $log, appConfig) {
                            this.$rootScope = $rootScope;
                            this.$log = $log;
                            this.appConfig = appConfig;
                            this.editMode = false;
                            this.isOnline = false;
                            this.isEnabled = false;
                            this.lastError = null;
                            this.config = appConfig.googleConfig;
                            this.handler = new google.GoogleErrorHandler(this);
                            appConfig.errorHandlers.push(this.handler);
                        }
                        GoogleErrorService.prototype.detect = function () {
                            try  {
                                // Load required libraries if not defined
                            } catch (ex) {
                                this.isOnline = false;
                                this.lastError = ex;
                            }
                            return this.isOnline;
                        };

                        GoogleErrorService.prototype.init = function () {
                            // Check for Raven.js and auto-load
                            if (!this.isOnline && this.config.publicKey) {
                                this.$log.log(' - Initialising Google Services....');
                                this.setupGoogle();
                            }
                        };

                        GoogleErrorService.prototype.connect = function (publicKey) {
                            try  {
                                //service.isOnline = true;
                            } catch (ex) {
                                this.isOnline = false;
                                this.lastError = ex;
                            }
                        };

                        GoogleErrorService.prototype.disconnect = function () {
                            this.isOnline = false;
                        };

                        GoogleErrorService.prototype.setupGoogle = function () {
                            if (typeof google === 'undefined')
                                return;
                            try  {
                                // Disconnect for any prev sessions
                                if (this.isOnline) {
                                    this.disconnect();
                                }

                                // Try to connect with public key
                                this.connect(this.config.publicKey);
                            } catch (ex) {
                                // Something went wrong
                                this.$log.warn('Google services failed to initialise.');
                                throw ex;
                            }
                        };
                        return GoogleErrorService;
                    })();
                    google.GoogleErrorService = GoogleErrorService;
                })(errorHandlers.google || (errorHandlers.google = {}));
                var google = errorHandlers.google;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                var SampleErrorService = (function () {
                    function SampleErrorService($rootScope, $log, appConfig, raven, googleErrorService) {
                        this.$rootScope = $rootScope;
                        this.$log = $log;
                        this.appConfig = appConfig;
                        this.raven = raven;
                        this.googleErrorService = googleErrorService;
                        this.enabled = true;
                    }
                    SampleErrorService.prototype.checkChanged = function (handler) {
                        this.$rootScope.$applyAsync(function () {
                            if (!handler)
                                return;
                            if (!handler.enabled) {
                                if (handler.attach) {
                                    handler.attach();
                                } else {
                                    handler.enabled = true;
                                }
                            } else if (handler.enabled) {
                                if (handler.dettach) {
                                    handler.dettach();
                                } else {
                                    handler.enabled = false;
                                }
                            }
                        });
                    };

                    SampleErrorService.prototype.throwManagedException = function () {
                        var _this = this;
                        this.$rootScope.$applyAsync(function () {
                            var ctx = { tags: { source: "Sample Managed Exception" } };
                            try  {
                                _this.$log.info('About to break something...');
                                Raven.context(ctx, function () {
                                    window['does not exist'].managedSampleError++;
                                });
                            } catch (ex) {
                                // throw ex; // this will also be caught by the global Angular exception handler
                                _this.$log.warn('Exception caught and swallowed.');
                            }
                        });
                    };

                    SampleErrorService.prototype.throwAjaxException = function () {
                        var _this = this;
                        this.$rootScope.$applyAsync(function () {
                            _this.$log.info('Doing AJAX request...');

                            // XXXXXXXXXXXXXXXXXXXX
                            var ajaxCfg = {
                                current: null,
                                getDesc: function (itm) {
                                    var cfg = ajaxCfg;
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
                                    var call = ajaxCfg.current;
                                    if (!call) {
                                        call = ajaxCfg.errHttp;
                                    }
                                    call();
                                },
                                select: function (itm) {
                                    ajaxCfg.current = itm;
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
                                            window['does not exist'].ajaxOnSuccessSample++;
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
                                            window['does not exist'].ajaxOnErrorSample++;
                                        }
                                    });
                                }
                            };
                        });
                    };

                    SampleErrorService.prototype.throwAngularException = function () {
                        var _this = this;
                        this.$rootScope.$applyAsync(function () {
                            _this.$log.info('About to break Angular...');
                            _this.$rootScope.missing.ngSampleError++;
                        });
                    };

                    SampleErrorService.prototype.throwTimeoutException = function () {
                        this.$log.info('Setting timeout...');
                        setTimeout(function () {
                            var _this = this;
                            this.$rootScope.$applyAsync(function () {
                                _this.$log.info('Entering timeout...');
                                window['does not exist'].timeoutSampleError++;
                                _this.$log.info('Exit timeout...');
                            });
                        }, 2 * 1000);
                    };
                    return SampleErrorService;
                })();
                errorHandlers.SampleErrorService = SampleErrorService;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                var LogInterceptor = (function () {
                    function LogInterceptor($delegate, appStatus) {
                        this.$delegate = $delegate;
                        this.appStatus = appStatus;
                        this.init();
                    }
                    LogInterceptor.prototype.init = function () {
                        var _this = this;
                        // Intercept messages
                        var show = this.appStatus.config;
                        var $delegate = this.$delegate;

                        $delegate.debug = this.intercept($delegate.debug, function (msg) {
                            if (show.all || show.debug)
                                _this.attach('debug', msg);
                        });
                        $delegate.log = this.intercept($delegate.log, function (msg) {
                            _this.attach('log', msg);
                        });
                        $delegate.info = this.intercept($delegate.info, function (msg) {
                            _this.attach('info', msg);
                        });
                        $delegate.warn = this.intercept($delegate.warn, function (msg, ext) {
                            _this.attach('warn', msg, ext);
                        });
                        $delegate.error = this.intercept($delegate.error, function (msg, ext) {
                            _this.attach('error', msg.message ? msg.message : msg, ext);
                        });

                        return this;
                    };

                    LogInterceptor.prototype.intercept = function (func, callback) {
                        var _this = this;
                        return function () {
                            var args = [].slice.call(arguments);
                            callback.apply(null, args);
                            func.apply(_this.$delegate, args);
                        };
                    };

                    LogInterceptor.prototype.attach = function (msgType, msgDesc, msgExt) {
                        var itm = {
                            type: msgType,
                            desc: msgDesc,
                            time: Date.now()
                        };
                        if (msgExt) {
                            itm.ext = msgExt;
                        }
                        this.appStatus.logs.push(itm);
                    };
                    return LogInterceptor;
                })();
                errorHandlers.LogInterceptor = LogInterceptor;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                var ErrorHttpInterceptor = (function () {
                    function ErrorHttpInterceptor($log, $q) {
                        this.$log = $log;
                        this.$q = $q;
                    }
                    ErrorHttpInterceptor.prototype.responseError = function (rejection) {
                        this.$log.error('HTTP response error: ' + rejection.config || rejection.status);
                        if (typeof Raven !== 'undefined') {
                            var ctx = {
                                tags: { source: "Angular Http Interceptor" }
                            };
                            var err = new Error('HTTP response error');
                            Raven.captureException(err, angular.extend(ctx, {
                                extra: {
                                    config: rejection.config,
                                    status: rejection.status
                                }
                            }));
                        }
                        return this.$q.reject(rejection);
                    };
                    return ErrorHttpInterceptor;
                })();
                errorHandlers.ErrorHttpInterceptor = ErrorHttpInterceptor;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                var ExceptionHandlerFactory = (function () {
                    function ExceptionHandlerFactory($log, appNode) {
                        this.$log = $log;
                        this.appNode = appNode;
                    }
                    ExceptionHandlerFactory.prototype.handleException = function (exception, cause) {
                        if (typeof Raven !== 'undefined') {
                            this.setUpdatedErrorMessage(arguments, 'Exception [ EX ]: ');
                            var ctx = {
                                tags: { source: "Angular Unhandled Exception" }
                            };
                            Raven.captureException(exception, ctx);
                        } else if (this.appNode.active) {
                            // ToDo: Hook in some routing or something...
                            this.setUpdatedErrorMessage(arguments, 'Exception [ NW ]: ');
                        } else {
                            this.setUpdatedErrorMessage(arguments, 'Exception [ JS ]: ');
                        }
                    };

                    ExceptionHandlerFactory.prototype.setUpdatedErrorMessage = function (args, prefix) {
                        var ex = args.length > 0 ? args[0] : {};
                        if (ex.message) {
                            ex.message = prefix + ex.message;
                        }
                        this.$log.error.apply(this.$log, args);
                    };
                    return ExceptionHandlerFactory;
                })();
                errorHandlers.ExceptionHandlerFactory = ExceptionHandlerFactory;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="LogInterceptor.ts" />
/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (_errorHandlers) {
                function ConfigureErrorHandlers(appConfigProvider) {
                    appConfigProvider.set({
                        'errorHandlers': [
                            {
                                name: 'proto',
                                locked: true,
                                enabled: true,
                                label: 'Prototyped Handlers'
                            }
                        ]
                    });
                }
                _errorHandlers.ConfigureErrorHandlers = ConfigureErrorHandlers;

                function ConfigureRaven(appConfigProvider) {
                    appConfigProvider.set({
                        'ravenConfig': {
                            publicKey: 'https://e94eaeaab36f4d14a99e0472e85ba289@app.getsentry.com/36391'
                        }
                    });
                }
                _errorHandlers.ConfigureRaven = ConfigureRaven;

                function ConfigureProviders($provide, $httpProvider) {
                    // Register http error handler
                    $httpProvider.interceptors.push('errorHttpInterceptor');

                    // Intercept all log messages
                    $provide.decorator('$log', [
                        '$delegate', 'appStatus', function ($delegate, appStatus) {
                            // Define the interceptor
                            var interceptor = new proto.ng.samples.errorHandlers.LogInterceptor($delegate, appStatus);

                            // Return the original delegate
                            return $delegate;
                        }]);
                }
                _errorHandlers.ConfigureProviders = ConfigureProviders;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
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
]).config(['appConfigProvider', proto.ng.samples.errorHandlers.ConfigureErrorHandlers]).config(['appConfigProvider', proto.ng.samples.errorHandlers.ConfigureRaven]).config(['$provide', '$httpProvider', proto.ng.samples.errorHandlers.ConfigureProviders]).config([
    '$stateProvider', function ($stateProvider) {
        // Set up the states
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
    '$log', 'appNode', function ($log, appNode) {
        var instance = new proto.ng.samples.errorHandlers.ExceptionHandlerFactory($log, appNode);
        return function (exception, cause) {
            instance.handleException(exception, cause);
        };
        /*
        
        // Catch all angular errors to Sentry (via RavenJS, if defined)
        function setUpdatedErrorMessage(args, prefix) {
        var ex = args.length > 0 ? args[0] : {};
        if (ex.message) {
        ex.message = prefix + ex.message;
        }
        $log.error.apply($log, args);
        }
        if (typeof Raven !== 'undefined') {
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
        */
    }]).factory('errorHttpInterceptor', [
    '$log', '$q', function ($log, $q) {
        return new proto.ng.samples.errorHandlers.ErrorHttpInterceptor($log, $q);
    }]).service('ravenService', ['$rootScope', '$log', 'appConfig', proto.ng.samples.errorHandlers.raven.RavenService]).service('googleErrorService', ['$rootScope', '$log', 'appConfig', proto.ng.samples.errorHandlers.google.GoogleErrorService]).service('sampleErrorService', ['$rootScope', '$log', 'appConfig', 'ravenService', 'googleErrorService', proto.ng.samples.errorHandlers.SampleErrorService]).controller('errorHandlersController', [
    '$scope', '$log', function ($scope, $log) {
    }]).run([
    '$rootScope', 'appStatus', 'sampleErrorService', function ($rootScope, appStatus, sampleErrorService) {
        angular.extend($rootScope, {
            appStatus: appStatus,
            sampleErrors: sampleErrorService
        });
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.ng.samples.interceptors', []).config([
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
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    var String = (function () {
        function String() {
        }
        String.Format = function (format, values, useLocale) {
            if (typeof useLocale === "undefined") { useLocale = false; }
            var result = '';
            for (var i = 0; ;) {
                // Find the next opening or closing brace
                var open = format.indexOf('{', i);
                var close = format.indexOf('}', i);
                if ((open < 0) && (close < 0)) {
                    // Not found: copy the end of the string and break
                    result += format.slice(i);
                    break;
                }
                if ((close > 0) && ((close < open) || (open < 0))) {
                    if (format.charAt(close + 1) !== '}')
                        throw new Error('Format Error: StringFormatBraceMismatch');
                    result += format.slice(i, close + 1);
                    i = close + 2;
                    continue;
                }

                // Copy the string before the brace
                result += format.slice(i, open);
                i = open + 1;

                // Check for double braces (which display as one and are not arguments)
                if (format.charAt(i) === '{') {
                    result += '{';
                    i++;
                    continue;
                }

                // Find the closing brace
                if (close < 0)
                    throw new Error('format stringFormatBraceMismatch');

                // Get the string between the braces, and split it around the ':' (if any)
                var brace = format.substring(i, close);
                var colonIndex = brace.indexOf(':');
                var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);
                if (isNaN(argNumber))
                    throw new Error('format stringFormatInvalid');
                var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
                var arg = values[argNumber];
                if (typeof (arg) === "undefined" || arg === null) {
                    arg = '';
                }

                // If it has a toFormattedString method, call it.  Otherwise, call toString()
                if (arg.toFormattedString) {
                    result += arg.toFormattedString(argFormat);
                } else if (useLocale && arg.localeFormat) {
                    result += arg.localeFormat(argFormat);
                } else if (arg.format) {
                    result += arg.format(argFormat);
                } else
                    result += arg.toString();

                i = close + 1;
            }

            return result;
        };
        String.FormatFilter = function (input, template) {
            if (!input)
                return template;
            if (!input.length)
                input = [input]; // Convert to array
            return String.Format(template, input);
        };
        String.FormatNumber = function (input, template) {
            // Inspired by: https://code.google.com/p/javascript-number-formatter/source/browse/format.js
            if (!template || isNaN(+input)) {
                return template;
            }

            //convert any string to number according to formation sign.
            var v = (template.charAt(0) == '-') ? -v : +v;
            var isNegative = v < 0 ? v = -v : 0;

            //search for separator for grp & decimal, anything not digit, not +/- sign, not #.
            var result = template.match(/[^\d\-\+#]/g);
            var Decimal = (result && result[result.length - 1]) || '.';
            var Group = (result && result[1] && result[0]) || ',';

            //split the decimal for the format string if any.
            var m = template.split(Decimal);

            //Fix the decimal first, toFixed will auto fill trailing zero.
            var val = v.toFixed(m[1] && m[1].length);
            val = +(val) + ''; //convert number to string to trim off *all* trailing decimal zero(es)

            //fill back any trailing zero according to format
            var pos_trail_zero = m[1] && m[1].lastIndexOf('0');
            var part = val.split('.');

            //integer will get !part[1]
            if (!part[1] || part[1] && part[1].length <= pos_trail_zero) {
                val = (+val).toFixed(pos_trail_zero + 1);
            }
            var szSep = m[0].split(Group);
            m[0] = szSep.join(''); //join back without separator for counting the pos of any leading 0.

            var pos_lead_zero = m[0] && m[0].indexOf('0');
            if (pos_lead_zero > -1) {
                while (part[0].length < (m[0].length - pos_lead_zero)) {
                    part[0] = '0' + part[0];
                }
            } else if (+part[0] == 0) {
                part[0] = '';
            }

            var dx = val.split('.');
            dx[0] = part[0];

            //process the first group separator from decimal (.) only, the rest ignore.
            //get the length of the last slice of split result.
            var pos_separator = (szSep[1] && szSep[szSep.length - 1].length);
            if (pos_separator) {
                var integer = dx[0];
                var str = '';
                var offset = integer.length % pos_separator;
                for (var i = 0, l = integer.length; i < l; i++) {
                    str += integer.charAt(i); //ie6 only support charAt for sz.

                    //-pos_separator so that won't trail separator on full length
                    if (!((i - offset + 1) % pos_separator) && i < l - pos_separator) {
                        str += Group;
                    }
                }
                dx[0] = str;
            }

            dx[1] = (m[1] && dx[1]) ? Decimal + dx[1] : "";
            return (isNegative ? '-' : '') + dx[0] + dx[1];
        };
        return String;
    })();
    proto.String = String;
})(proto || (proto = {}));

String.prototype.Formatted = function () {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    return proto.String.Format(this, args);
};
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (utils) {
        var Networking = (function () {
            function Networking() {
            }
            Networking.GetClientInfo = function (window) {
                var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                if (xmlhttp) {
                    xmlhttp.open("GET", "http://api.hostip.info/get_html.php", false); // True for async...

                    /* Async
                    xmlhttp.onload = function (e) {
                    if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                    // defer.resolve(xmlhttp.responseText);
                    console.info(xmlhttp.responseText);
                    } else {
                    //defer.reject(error);
                    console.warn(xmlhttp.statusText);
                    }
                    }
                    };
                    xmlhttp.onerror = function (error) {
                    //defer.reject(error);
                    console.error(xmlhttp.statusText);
                    };
                    */
                    xmlhttp.send();

                    var info = {};
                    var resp = xmlhttp.responseText;
                    var data = resp.split("\n");
                    for (var i = 0; data.length >= i; i++) {
                        if (data[i]) {
                            var parts = data[i].split(":");
                            var objDef = (parts.length > 1) && (typeof parts[1] !== 'undefined');
                            if (objDef) {
                                var objKey = parts[0].trim();
                                var objVal = parts[1].trim();
                                if (objKey == 'Country' && objVal.indexOf('Unknown Country') >= 0) {
                                    objVal = null;
                                }
                                if (objKey == 'City' && objVal.indexOf('Unknown City') >= 0) {
                                    objVal = null;
                                }
                                eval('info.' + objKey + ' = objVal');
                            }
                        }
                    }
                    return info;
                }

                return null;
            };

            Networking.GetCurrentIP = function (window) {
                var info = this.GetClientInfo(window);
                if (info) {
                    return info.IP;
                }
                return null;
            };
            return Networking;
        })();
        utils.Networking = Networking;

        var GeoPoint = (function () {
            function GeoPoint(label, lat, lng, zoom) {
                if (typeof zoom === "undefined") { zoom = 8; }
                this.Label = label;
                this.Lat = lat;
                this.Lng = lng;
                this.Zoom = zoom;
            }
            GeoPoint.prototype.getPosition = function () {
                return new google.maps.LatLng(this.Lat, this.Lng);
            };
            return GeoPoint;
        })();
        utils.GeoPoint = GeoPoint;

        var GeoFactory = (function () {
            function GeoFactory($rootScope, $q) {
                this.$rootScope = $rootScope;
                this.$q = $q;
                console.log(' - [ Geo ] Factory Created...');
            }
            GeoFactory.prototype.GetPosition = function () {
                var _this = this;
                var defer = this.$q.defer();

                navigator.geolocation.getCurrentPosition(function (position) {
                    _this.$rootScope.$applyAsync(function () {
                        defer.resolve(position);
                    });
                }, function (error) {
                    _this.$rootScope.$applyAsync(function () {
                        defer.reject(error);
                    });
                });

                return defer.promise;
            };

            GeoFactory.FormatLatitude = function (input, template) {
                return (!input) ? null : GeoFactory.ConvertDDToDMS(true, input, template);
            };
            GeoFactory.FormatLongitude = function (input, template) {
                return (!input) ? null : GeoFactory.ConvertDDToDMS(false, input, template);
            };

            GeoFactory.ParseDMS = function (input) {
                var parts = [];
                var regEx = input.split(/[^\d\w]+/);
                for (var i = 0; i < regEx.length; i++) {
                    parts.push(parseFloat(regEx[1]));
                }
                return {
                    lat: GeoFactory.ConvertDMSToDD(parts[0], parts[1], parts[2], parts[3]),
                    lng: GeoFactory.ConvertDMSToDD(parts[4], parts[5], parts[6], parts[7])
                };
            };

            GeoFactory.ConvertDMSToDD = function (degrees, minutes, seconds, direction) {
                var dd = degrees + minutes / 60 + seconds / (60 * 60);
                if (direction == "S" || direction == "W") {
                    dd = dd * -1; // Invert number
                }
                return dd;
            };
            GeoFactory.ConvertDDToDMS = function (northToSouth, input, template) {
                // Example Output: 54°21′44″N
                if (!template)
                    template = '{0}°{1}′{2}″{3}';
                var dir = northToSouth ? (input > 0 ? 'N' : 'S') : (input > 0 ? 'E' : 'W');
                var inp = Math.abs(input);
                var deg = Math.floor(inp);
                var min = Math.floor((inp - deg) * 60);
                var sec = Math.floor(((inp - deg) * 60 - min) * 60);
                var dm = (min >= 10 ? '' + min : '0' + min);
                var ds = (sec >= 10 ? '' + sec : '0' + sec);
                return deg + '°' + dm + '′' + ds + '″' + dir;
            };
            return GeoFactory;
        })();
        utils.GeoFactory = GeoFactory;

        var GoogleMapper = (function () {
            function GoogleMapper(args) {
                this.MapArgs = args;
            }
            GoogleMapper.prototype.initMaps = function (callback) {
                var _this = this;
                // Async load the google maps API and set up the callback
                var apiUrl = 'https://maps.googleapis.com/maps/api/js';
                var apiHnd = 'protoGoogleMapper';
                var apiArg = $.extend(this.MapArgs, {
                    callback: apiHnd
                });

                // Check if already loaded (patch onLoad if needed)
                if (apiHnd in window) {
                    if (callback) {
                        var func = window[apiHnd];
                        if (window[apiHnd].loaded) {
                            callback();
                        } else {
                            window[apiHnd] = function () {
                                func();
                                callback();
                            };
                        }
                    }
                    return;
                }

                // Declare the global callback
                window[apiHnd] = function () {
                    // Bind the map to the element
                    _this.bindMaps();

                    // Check for handler
                    if (callback) {
                        callback();
                    }

                    // Delete callback
                    window[apiHnd].loaded = true;
                };

                // Can't use the jXHR promise because 'script' doesn't support 'callback=?'
                $.ajax({ dataType: 'script', data: apiArg, url: apiUrl });
            };

            GoogleMapper.prototype.getMap = function () {
                return this.MapTarg;
            };

            GoogleMapper.prototype.isMapsDefined = function () {
                return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
            };

            GoogleMapper.prototype.bindMaps = function () {
                // Ensure google maps available
                if (this.isMapsDefined()) {
                    console.log(' - [ Geo ] Init Google maps...');

                    // Set default position
                    if (!this.Position) {
                        this.Position = new google.maps.LatLng(0, 0);
                    }

                    // Define position and the map options
                    var pos = this.Position;
                    var opt = this.Options = {
                        zoom: 5,
                        center: pos,
                        mapTypeControlOptions: {
                            mapTypeIds: [
                                google.maps.MapTypeId.HYBRID,
                                google.maps.MapTypeId.ROADMAP,
                                google.maps.MapTypeId.SATELLITE,
                                google.maps.MapTypeId.TERRAIN
                            ]
                        },
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    };

                    // Load the maps
                    var div = this.MapElem = document.getElementById('map-canvas');
                    var map = this.MapTarg = new google.maps.Map(div, opt);
                    if (map) {
                        // Load more map options
                        map.setCenter(this.Position);
                    }

                    console.log(' - [ Geo ] Google maps loaded.');
                } else {
                    console.warn(' - [ Geo ] Warning: Google maps is not available...');
                }
            };

            GoogleMapper.prototype.createMarker = function (lat, lng, obj) {
                if (typeof obj === "undefined") { obj = {}; }
                // Return a new instance of a marker
                return new google.maps.Marker($.extend(obj, {
                    position: new google.maps.LatLng(lat, lng),
                    map: this.MapTarg
                }));
            };

            GoogleMapper.prototype.setPosition = function (lat, lng, zoom) {
                var pos = new google.maps.LatLng(lat, lng);
                if (pos && this.MapTarg) {
                    console.log(' - [ Geo ] Changing map position to [ ' + lat + ' , ' + lng + ' ]');

                    // Update the map view port
                    this.MapTarg.setCenter(pos);
                    this.Position = pos;

                    // Position set on map successfuly
                    return true;
                } else {
                    // Save the current position
                    this.Position = pos;

                    // Deferred action, position saved
                    return false;
                }
            };
            return GoogleMapper;
        })();
        utils.GoogleMapper = GoogleMapper;
    })(proto.utils || (proto.utils = {}));
    var utils = proto.utils;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
///<reference path="proto.ts"/>
///<reference path="proto.utils.ts"/>
var proto;
(function (proto) {
    (function (samples) {
        (function (location) {
            var GeoController = (function () {
                function GeoController($rootScope, $scope, geo) {
                    this.$rootScope = $rootScope;
                    this.$scope = $scope;
                    this.geo = geo;
                    // Link to current scope
                    this.$scope.geoCtrl = this;

                    // Load resources
                    this.init();
                }
                GeoController.prototype.init = function () {
                    var _this = this;
                    this.initMaps(function (map) {
                        // Load sample data
                        _this.getSamples();

                        // Request network and geo location info
                        _this.getClientInfoPassive(function (response) {
                            _this.$rootScope.$applyAsync(function () {
                                _this.setClientInfoResponse(response);
                            });
                        });
                    });
                };

                GeoController.prototype.setClientInfoResponse = function (response) {
                    if (response) {
                        // Set the client info
                        this.$scope.client = this.Client = response;

                        // Get results
                        var ip = response.ip;
                        var org = response.org;
                        var city = response.city;
                        var region = response.region;
                        var country = response.country;
                        var hostname = response.hostname;

                        // Parse Lat Long
                        var lat, lng;
                        var loc = response.loc;
                        if (loc) {
                            var ll = loc.split(',');
                            if (ll.length > 1) {
                                lat = ll[0];
                                lng = ll[1];
                            }
                        }
                        if (lat && lng) {
                            var lbl = country + ' ( ' + ip + ' )';
                            var pin = new proto.utils.GeoPoint(lbl, lat, lng, 3);
                            var url = 'https://chart.googleapis.com/chart?chst=d_simple_text_icon_left&chld=' + country + '|14|FFF|flag_' + country.toLowerCase() + '|20|FFF|333';

                            // Set the country of origin
                            this.setGeoPoint(pin, {
                                icon: 'http://maps.gstatic.com/mapfiles/markers2/dd-via.png'
                            }, {
                                content: '<div>' + lbl + '</div>'
                            });
                        }
                    }
                };
                GeoController.prototype.getClientInfoPassive = function (callback) {
                    // Request client info from online service
                    $.get("http://ipinfo.io", function (response) {
                        if (callback) {
                            callback(response);
                        }
                    }, "jsonp");
                };

                GeoController.prototype.initMaps = function (callback) {
                    var _this = this;
                    // Define the google mapper class
                    this.Mapper = new proto.utils.GoogleMapper({
                        'v': '3.exp',
                        //'key': apiKey,
                        'sensor': false,
                        'libraries': 'places,weather'
                    });

                    // Start the mapper class
                    this.Mapper.initMaps(function () {
                        var map = _this.Mapper.getMap();
                        if (map) {
                            // Load resources
                            _this.loadMaps(map);
                        }

                        // Maps loaded, update UI...
                        _this.$rootScope.$applyAsync(function () {
                            if (callback)
                                callback(map);
                        });
                    });
                };
                GeoController.prototype.loadMaps = function (map) {
                    // Load additional map resources
                    var transitLayer = new google.maps.TransitLayer();
                    transitLayer.setMap(map);

                    var cloudLayer = new google.maps.weather.CloudLayer();
                    cloudLayer.setMap(map);

                    var objClass = eval('google.maps.weather.WeatherLayer');
                    var weatherLayer = new objClass({
                        temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
                    });
                    weatherLayer.setMap(map);
                };

                GeoController.prototype.getStatus = function () {
                    var lbl = 'Unavailable';
                    if (this.$scope.client) {
                        lbl = this.$scope.client.hostname || this.$scope.client.city || this.$scope.client.country ? 'Somewhere in ' + this.$scope.client.country : 'Locating...';
                    }
                    if (this.$scope.position) {
                        lbl = this.$scope.position.coords ? 'Position Found' : (this.$scope.position.isBusy ? 'Requesting...' : 'Request Declined');
                    }
                    return lbl;
                };

                GeoController.prototype.getPosition = function () {
                    var _this = this;
                    console.info(' - [ Geo ] Requesting position...');
                    this.$scope.position = {
                        timestamp: Date.now(),
                        isBusy: true
                    };

                    // Request the current GPS position from browser
                    this.geo.GetPosition().then(function (position) {
                        console.log(' - [ Geo ] Position found!');

                        // Update current position
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        _this.$scope.position = position;
                        _this.Mapper.setPosition(lat, lng);

                        // Set a marker at current location
                        if (!_this.Marker) {
                            // Create a mew marker
                            var marker = _this.Marker = _this.Mapper.createMarker(lat, lng, {
                                title: 'Your Location',
                                animation: google.maps.Animation.DROP,
                                icon: 'http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png'
                            });

                            // Add the info window
                            var infowindow = new google.maps.InfoWindow({ content: '<em>Your current location</em>' });
                            var map = _this.Mapper ? _this.Mapper.getMap() : null;
                            if (map) {
                                // Add click event to pin
                                google.maps.event.addListener(marker, 'click', function () {
                                    infowindow.open(map, marker);
                                });
                                infowindow.open(map, marker);
                                map.setZoom(16);

                                if (position.coords.accuracy) {
                                    var accuracyZone = {
                                        strokeColor: '#0000FF',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: '#61d8f3',
                                        fillOpacity: 0.15,
                                        map: map,
                                        center: marker.getPosition(),
                                        radius: position.coords.accuracy
                                    };

                                    // Add the circle for this city to the map.
                                    var zoneCircle = new google.maps.Circle(accuracyZone);
                                }
                            }
                        } else {
                            // Update existing
                            _this.Marker.setPosition(new google.maps.LatLng(lat, lng));
                        }
                    }, function (ex) {
                        console.error(' - [ Geo ] ' + (ex.message || 'Request denied.'));

                        // Update UI state
                        _this.$scope.position = {
                            timestamp: Date.now(),
                            failed: true
                        };
                    });
                };

                GeoController.prototype.setGeoPoint = function (point, opts, infoWindowOpts) {
                    var lat = point.Lat;
                    var lng = point.Lng;
                    var key = '' + lat + '_' + lng;
                    var pin = null;
                    if (!pin) {
                        var opts = $.extend(opts || {}, {
                            title: point.Label
                        });
                        if (!opts.icon) {
                            opts.icon = 'http://maps.gstatic.com/mapfiles/markers2/icon_greenC.png';
                        }
                        pin = this.Mapper.createMarker(lat, lng, opts);

                        //this.PinsPOI[key] = pin;
                        // Add the info window
                        if (infoWindowOpts) {
                            var map = this.Mapper ? this.Mapper.getMap() : null;
                            if (map) {
                                var opts = $.extend(infoWindowOpts, {});
                                if (!opts.content) {
                                    opts.content = '<div>' + point.Label + '</div>';
                                }

                                var infowindow = new google.maps.InfoWindow(opts);
                                infowindow.open(map, pin);

                                // Add click event to pin
                                google.maps.event.addListener(pin, 'click', function () {
                                    infowindow.open(map, pin);
                                });
                            }
                        }
                    }
                    if (this.Mapper) {
                        this.Mapper.setPosition(lat, lng);
                    }
                };

                GeoController.prototype.setPosition = function (lat, lng) {
                    if (this.Mapper) {
                        this.Mapper.setPosition(lat, lng);
                    }
                };

                GeoController.prototype.hasSamples = function () {
                    return this.Samples && this.Samples.length > 0;
                };

                GeoController.prototype.getSamples = function () {
                    // Ensure maps loaded
                    if (!this.Mapper || !this.Mapper.isMapsDefined())
                        return [];

                    // Define if not exist
                    if (!this.Samples) {
                        this.Samples = [
                            new proto.utils.GeoPoint('New York', 40.7056258, -73.97968, 10),
                            new proto.utils.GeoPoint('London', 51.5286416, -0.1015987, 10),
                            new proto.utils.GeoPoint('Paris', 48.8588589, 2.3470599, 12),
                            new proto.utils.GeoPoint('Amsterdam', 52.3747158, 4.8986166, 12),
                            new proto.utils.GeoPoint('Cape Town', -33.919892, 18.425713, 9),
                            new proto.utils.GeoPoint('Hong Kong', 22.3700556, 114.1535941, 11),
                            new proto.utils.GeoPoint('Sydney', -33.7969235, 150.9224326, 10)
                        ];
                    }
                    return this.Samples;
                };
                return GeoController;
            })();
            location.GeoController = GeoController;
        })(samples.location || (samples.location = {}));
        var location = samples.location;
    })(proto.samples || (proto.samples = {}));
    var samples = proto.samples;
})(proto || (proto = {}));
// ----------------------------------------------------------------------
// Geo Locator sample definition
// ----------------------------------------------------------------------
///<reference path="../../imports.d.ts"/>
///<reference path="controllers/GeoController.ts"/>
angular.module('prototyped.ng.samples.location', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        $stateProvider.state('samples.location', {
            url: '/location',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/location/views/main.tpl.html',
                    controller: 'proto.samples.GeoController',
                    constrollerAs: 'geoCtrl'
                }
            }
        });
    }]).config([
    '$provide', function ($provide) {
        // Define a decorator to check duration of request
        $provide.decorator("geo", function ($delegate) {
            return {
                locate: function () {
                    var start = Date.now();
                    var result = $delegate.locate();
                    result.always(function () {
                        console.info("Geo location took: " + (Date.now() - start) + "ms");
                    });
                    return result;
                }
            };
        });
    }]).factory('geo', ['$q', '$rootScope', function ($q, $rootScope) {
        return new proto.utils.GeoFactory($rootScope, $q);
    }]).service('geoService', ['$q', '$rootScope', function ($q, $rootScope) {
        return new proto.utils.GeoFactory($rootScope, $q);
    }]).filter('latitude', [function () {
        return proto.utils.GeoFactory.FormatLatitude;
    }]).filter('longitude', [function () {
        return proto.utils.GeoFactory.FormatLongitude;
    }]).filter('formatted', [function () {
        return proto.String.FormatFilter;
    }]).controller('proto.samples.GeoController', [
    '$rootScope',
    '$scope',
    'geoService',
    proto.samples.location.GeoController
]).run([
    '$rootScope', function ($rootScope) {
    }]);
/// <reference path="../../imports.d.ts" />

angular.module('prototyped.ng.samples.notifications', []).config([
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
    }]).service('notifyService', [
    '$rootScope', function ($rootScope) {
        var notify = {
            enabled: false,
            options: {},
            message: function (title, opts, eventHandlers) {
                // Register the notification api
                if (notify.enabled) {
                    notify.hookNotifications(function () {
                        $rootScope.$applyAsync(function () {
                            notify.ready = true;
                            notify.enabled = true;

                            // Notifications enabled by user
                            if ('Notification' in window) {
                                // Create a new notification messsage
                                var notification = new Notification(title, opts);
                                if (eventHandlers) {
                                    // Add event handlers
                                    angular.extend(notification, eventHandlers);
                                }
                            }
                            console.debug(' - Notifications enabled.');
                        });
                    }, function () {
                        notify.ready = false;
                        notify.enabled = false;

                        // User canceled or not available, default to console window
                        console.warn(' - Desktop notifications not available.');
                        $rootScope.$applyAsync(function () {
                            notify.defaultNotify(title, opts);
                        });
                    });
                } else {
                    notify.ready = false;
                    notify.enabled = false;

                    // Notifications disabled, default to console window
                    $rootScope.$applyAsync(function () {
                        notify.defaultNotify(title, opts);
                    });
                }
            },
            defaultNotify: function (title, opts) {
                if ('alertify' in window) {
                    window['alertify'].log(opts.body, opts.type, 3000);
                } else {
                    // Default to console window
                    console.info(opts.body, opts);
                }
            },
            hookAlertify: function (callback, notFound) {
                if (notify.options.alertify) {
                    $rootScope.$applyAsync(function () {
                        angular.extend(notify.options.alertify || {}, {
                            enabled: !notify.options.alertify.enabled
                        });
                    });
                    return false;
                }

                console.debug(' - Loading Alertify...');
                notify.options.alertify = {
                    busy: true
                };
                var url = 'https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js';
                $.getScript(url).done(function (script, textStatus) {
                    $rootScope.$applyAsync(function () {
                        console.debug(' - Alertify loaded.');
                        notify.options.alertify = {
                            enabled: true
                        };
                    });
                    if (callback) {
                        callback(script, textStatus);
                    }
                }).fail(function (jqxhr, settings, exception) {
                    $rootScope.$applyAsync(function () {
                        console.warn(' - Alertify failed to loaded.');
                        notify.options.alertify = {
                            enabled: false
                        };
                    });
                    if (notFound) {
                        notFound(exception, jqxhr, settings);
                    }
                });
            },
            hookNotifications: function (callback, notFound) {
                if ('Notification' in window) {
                    // API supported, request permission and notify
                    window['Notification'].requestPermission(function (status) {
                        var isActive = notify.enabled = (status == 'granted');
                        if (isActive) {
                            // Display a notification message too the user
                            if (callback) {
                                callback(status);
                            }
                        } else if (status == 'denied') {
                            if (notFound) {
                                notFound();
                            }
                        }
                    });
                } else {
                    // API not supported
                    console.warn(' - Web notifications not supported by your browser...');
                    if (notFound) {
                        notFound();
                    }
                }
            },
            isPatched: function () {
                return notify.enabled;
            },
            triggerNotification: function (message, opts) {
                var msgOpts = {
                    tag: notify.sameDialog ? 'notify' : 'ctx_' + Date.now(),
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Information_icon.svg/200px-Information_icon.svg.png',
                    title: 'Web Notifications',
                    body: message
                };
                angular.extend(msgOpts, opts || {});

                // Display a notification message too the user
                notify.message(msgOpts.title, msgOpts);
            }
        };

        return notify;
    }]).controller('notificationsController', [
    '$rootScope', '$scope', 'notifyService', function ($rootScope, $scope, notify) {
        $scope.notifySuccess = function (message, opts) {
            opts = opts || {};
            var enabled = notify.options.alertify && notify.options.alertify.enabled;
            if (enabled && 'alertify' in window) {
                window['alertify'].success(message, 3000);
            } else {
                notify.triggerNotification('Action Succeeded', angular.extend(opts, {
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Crystal_Clear_action_apply.png',
                    body: message
                }));
            }
        };
        $scope.notifyFailure = function (message, opts) {
            opts = opts || {};
            var enabled = notify.options.alertify && notify.options.alertify.enabled;
            if (enabled && 'alertify' in window) {
                window['alertify'].error(message, 3000);
            } else {
                notify.triggerNotification('Action Failed', angular.extend(opts, {
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Crystal_Clear_action_button_cancel.png/50px-Crystal_Clear_action_button_cancel.png',
                    body: message
                }));
            }
        };
        $scope.methods = [
            {
                name: 'alert',
                label: 'Alert Dialog',
                action: function (title, message, opts) {
                    var enabled = notify.options.alertify && notify.options.alertify.enabled;
                    if (enabled) {
                        window['alertify'].alert(message);
                    } else {
                        alert(message);
                    }
                },
                enabled: function () {
                    return true;
                }
            },
            {
                name: 'confirm',
                label: 'Confirmation',
                action: function (title, message, opts) {
                    var enabled = notify.options.alertify && notify.options.alertify.enabled;
                    if (enabled) {
                        window['alertify'].confirm(message, function (val) {
                            if (!notify.showResult)
                                return;
                            if (val) {
                                $scope.notifySuccess('Confirm returned: ' + JSON.stringify(val));
                            } else {
                                $scope.notifyFailure('Confirm was canceled');
                            }
                        });
                    } else {
                        var val = confirm(message);
                        if (!notify.showResult)
                            return;
                        if (val) {
                            $scope.notifySuccess('Confirm returned: ' + JSON.stringify(val));
                        } else {
                            $scope.notifyFailure('Confirm was canceled');
                        }
                    }
                },
                enabled: function () {
                    return true;
                }
            },
            {
                name: 'prompt',
                label: 'User Prompt',
                action: function (title, message, opts) {
                    var enabled = notify.options.alertify && notify.options.alertify.enabled;
                    var input = 'Test Input';
                    if (enabled) {
                        window['alertify'].prompt(message, function (e, val) {
                            if (!notify.showResult)
                                return;
                            if (e) {
                                $scope.notifySuccess('Prompt returned: ' + JSON.stringify(val));
                            } else {
                                $scope.notifyFailure('Prompt was canceled');
                            }
                        }, input);
                    } else {
                        var val = prompt(message, input);
                        if (!notify.showResult)
                            return;
                        if (val) {
                            $scope.notifySuccess('Prompt returned: ' + JSON.stringify(val));
                        } else {
                            $scope.notifyFailure('Prompt was canceled');
                        }
                    }
                },
                enabled: function () {
                    return true;
                }
            },
            {
                name: 'notify',
                label: 'Notification',
                action: function (title, message, opts) {
                    if (notify.enabled) {
                        notify.triggerNotification(title, opts);
                    } else if (notify.options.alertify && notify.options.alertify.enabled) {
                        notify.triggerNotification(title, opts);
                    } else {
                        console.groupCollapsed('Notification: ' + message);
                        console.debug(' - Title: ', title);
                        console.debug(' - Options: ', opts);
                        console.groupEnd();
                    }
                },
                enabled: function () {
                    return notify.enabled || notify.options.alertify && notify.options.alertify.enabled;
                }
            }
        ];

        if (notify) {
            notify.ready = null;
            notify.addAlertify = false;
            notify.showResult = true;
            notify.sameDialog = true;
            notify.current = $scope.methods[0];
            notify.hookNotifications(function () {
                // Notifications enabled by user
                $rootScope.$applyAsync(function () {
                    notify.ready = true;
                    notify.enabled = true;
                    console.debug(' - Desktop notifications active.');
                });
            }, function () {
                // User canceled or not available
                $rootScope.$applyAsync(function () {
                    notify.ready = true;
                    notify.enabled = false;
                    console.warn(' - Desktop notifications not available.');
                });
            });
        }
    }]).run([
    '$rootScope', 'notifyService', function ($rootScope, notifyService) {
        // Link the notification service globally
        angular.extend($rootScope, {
            notify: notifyService
        });
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.ng.samples.sampleData', []).config([
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

angular.module('prototyped.ng.samples.styles3d', []).config([
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
    '$rootScope', '$scope', '$http', 'style3dUniverse', function ($rootScope, $scope, $http, style3dUniverse) {
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
        } else {
            console.log(' - Loading Styles3D....');
            $.getScript('assets/lib/screen.js', function (data, textStatus, jqxhr) {
                runStyle3D();
            });
        }
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
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.samples.views',
    'prototyped.ng.samples.styles',
    'prototyped.ng.samples.errorHandlers',
    'prototyped.ng.samples.sampleData',
    'prototyped.ng.samples.location',
    'prototyped.ng.samples.decorators',
    'prototyped.ng.samples.interceptors',
    'prototyped.ng.samples.notifications',
    'prototyped.ng.samples.compression',
    'prototyped.ng.samples.styles3d'
]).config([
    'appConfigProvider', function (appConfigProvider) {
        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.samples': {
                active: true
            }
        });
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/samples',
                menuitem: {
                    label: 'Samples',
                    icon: 'fa fa-share-alt',
                    state: 'samples.info'
                },
                cardview: {
                    style: 'img-sandbox',
                    title: 'Prototyped Sample Code',
                    desc: 'A selection of samples to test, play and learn about web technologies.'
                }
            });
        }
    }]).config([
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
    }]).directive('bsSwitch', function ($parse, $timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function link(scope, element, attrs, controller) {
            var isInit = false;

            /**
            * Return the true value for this specific checkbox.
            * @returns {Object} representing the true view value; if undefined, returns true.
            */
            var getTrueValue = function () {
                if (attrs.type === 'radio') {
                    return attrs.value || $parse(attrs.ngValue)(scope) || true;
                }
                var trueValue = ($parse(attrs.ngTrueValue)(scope));
                if (!angular.isString(trueValue)) {
                    trueValue = true;
                }
                return trueValue;
            };

            /**
            * Get a boolean value from a boolean-like string, evaluating it on the current scope.
            * @param value The input object
            * @returns {boolean} A boolean value
            */
            var getBooleanFromString = function (value) {
                return scope.$eval(value) === true;
            };

            /**
            * Get a boolean value from a boolean-like string, defaulting to true if undefined.
            * @param value The input object
            * @returns {boolean} A boolean value
            */
            var getBooleanFromStringDefTrue = function (value) {
                return (value === true || value === 'true' || !value);
            };

            /**
            * Returns the value if it is truthy, or undefined.
            *
            * @param value The value to check.
            * @returns the original value if it is truthy, {@link undefined} otherwise.
            */
            var getValueOrUndefined = function (value) {
                return (value ? value : undefined);
            };

            /**
            * Get the value of the angular-bound attribute, given its name.
            * The returned value may or may not equal the attribute value, as it may be transformed by a function.
            *
            * @param attrName  The angular-bound attribute name to get the value for
            * @returns {*}     The attribute value
            */
            var getSwitchAttrValue = function (attrName) {
                var map = {
                    'switchRadioOff': getBooleanFromStringDefTrue,
                    'switchActive': function (value) {
                        return !getBooleanFromStringDefTrue(value);
                    },
                    'switchAnimate': getBooleanFromStringDefTrue,
                    'switchLabel': function (value) {
                        return value ? value : '&nbsp;';
                    },
                    'switchIcon': function (value) {
                        if (value) {
                            return '<span class=\'' + value + '\'></span>';
                        }
                    },
                    'switchWrapper': function (value) {
                        return value || 'wrapper';
                    },
                    'switchInverse': getBooleanFromString,
                    'switchReadonly': getBooleanFromString
                };
                var transFn = map[attrName] || getValueOrUndefined;
                return transFn(attrs[attrName]);
            };

            /**
            * Set a bootstrapSwitch parameter according to the angular-bound attribute.
            * The parameter will be changed only if the switch has already been initialized
            * (to avoid creating it before the model is ready).
            *
            * @param element   The switch to apply the parameter modification to
            * @param attr      The name of the switch parameter
            * @param modelAttr The name of the angular-bound parameter
            */
            var setSwitchParamMaybe = function (element, attr, modelAttr) {
                if (!isInit) {
                    return;
                }
                var newValue = getSwitchAttrValue(modelAttr);
                element.bootstrapSwitch(attr, newValue);
            };

            var setActive = function (active) {
                setSwitchParamMaybe(element, 'disabled', 'switchActive');
            };

            /**
            * If the directive has not been initialized yet, do so.
            */
            var initMaybe = function () {
                // if it's the first initialization
                if (!isInit) {
                    var viewValue = (controller.$modelValue === getTrueValue());
                    isInit = !isInit;

                    // Bootstrap the switch plugin
                    if ('bootstrapSwitch' in element) {
                        element.bootstrapSwitch({
                            radioAllOff: getSwitchAttrValue('switchRadioOff'),
                            disabled: getSwitchAttrValue('switchActive'),
                            state: viewValue,
                            onText: getSwitchAttrValue('switchOnText'),
                            offText: getSwitchAttrValue('switchOffText'),
                            onColor: getSwitchAttrValue('switchOnColor'),
                            offColor: getSwitchAttrValue('switchOffColor'),
                            animate: getSwitchAttrValue('switchAnimate'),
                            size: getSwitchAttrValue('switchSize'),
                            labelText: attrs.switchLabel ? getSwitchAttrValue('switchLabel') : getSwitchAttrValue('switchIcon'),
                            wrapperClass: getSwitchAttrValue('switchWrapper'),
                            handleWidth: getSwitchAttrValue('switchHandleWidth'),
                            labelWidth: getSwitchAttrValue('switchLabelWidth'),
                            inverse: getSwitchAttrValue('switchInverse'),
                            readonly: getSwitchAttrValue('switchReadonly')
                        });
                    }
                    if (attrs.type === 'radio') {
                        controller.$setViewValue(controller.$modelValue);
                    } else {
                        controller.$setViewValue(viewValue);
                    }
                }
            };

            /**
            * Listen to model changes.
            */
            var listenToModel = function () {
                attrs.$observe('switchActive', function (newValue) {
                    var active = getBooleanFromStringDefTrue(newValue);

                    // if we are disabling the switch, delay the deactivation so that the toggle can be switched
                    if (!active) {
                        $timeout(function () {
                            setActive(active);
                        });
                    } else {
                        // if we are enabling the switch, set active right away
                        setActive(active);
                    }
                });

                function modelValue() {
                    return controller.$modelValue;
                }

                // When the model changes
                scope.$watch(modelValue, function (newValue) {
                    initMaybe();
                    if (newValue !== undefined) {
                        element.bootstrapSwitch('state', newValue === getTrueValue(), false);
                    }
                }, true);

                // angular attribute to switch property bindings
                var bindings = {
                    'switchRadioOff': 'radioAllOff',
                    'switchOnText': 'onText',
                    'switchOffText': 'offText',
                    'switchOnColor': 'onColor',
                    'switchOffColor': 'offColor',
                    'switchAnimate': 'animate',
                    'switchSize': 'size',
                    'switchLabel': 'labelText',
                    'switchIcon': 'labelText',
                    'switchWrapper': 'wrapperClass',
                    'switchHandleWidth': 'handleWidth',
                    'switchLabelWidth': 'labelWidth',
                    'switchInverse': 'inverse',
                    'switchReadonly': 'readonly'
                };

                var observeProp = function (prop, bindings) {
                    return function () {
                        attrs.$observe(prop, function () {
                            setSwitchParamMaybe(element, bindings[prop], prop);
                        });
                    };
                };

                for (var prop in bindings) {
                    attrs.$observe(prop, observeProp(prop, bindings));
                }
            };

            /**
            * Listen to view changes.
            */
            var listenToView = function () {
                if (attrs.type === 'radio') {
                    // when the switch is clicked
                    element.on('change.bootstrapSwitch', function (e) {
                        // discard not real change events
                        if ((controller.$modelValue === controller.$viewValue) && (e.target.checked !== $(e.target).bootstrapSwitch('state'))) {
                            // $setViewValue --> $viewValue --> $parsers --> $modelValue
                            // if the switch is indeed selected
                            if (e.target.checked) {
                                // set its value into the view
                                controller.$setViewValue(getTrueValue());
                            } else if (getTrueValue() === controller.$viewValue) {
                                // otherwise if it's been deselected, delete the view value
                                controller.$setViewValue(undefined);
                            }
                        }
                    });
                } else {
                    // When the checkbox switch is clicked, set its value into the ngModel
                    element.on('switchChange.bootstrapSwitch', function (e) {
                        // $setViewValue --> $viewValue --> $parsers --> $modelValue
                        controller.$setViewValue(e.target.checked);
                    });
                }
            };

            // Listen and respond to view changes
            listenToView();

            // Listen and respond to model changes
            listenToModel();

            // On destroy, collect ya garbage
            scope.$on('$destroy', function () {
                element.bootstrapSwitch('destroy');
            });
        }
    };
}).directive('bsSwitch', function () {
    return {
        restrict: 'E',
        require: 'ngModel',
        template: '<input bs-switch>',
        replace: true
    };
});
;angular.module('prototyped.ng.samples.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('samples/compression/main.tpl.html',
    '<div id=CompressionView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a class="btn btn-default" href="" ng-click=compression.clearResult() ng-if=compression.ready>Cancel</a> <a class="btn btn-default" ng-class="{ \'btn-primary\': !compression.ready && compression.text.length }" href="" ng-click=compression.compressText(compression.text) ng-disabled=!compression.text.length>Compress Text</a> <a id=runAsScript ng-disabled=!compression.ready class="btn btn-default" ng-class="{ \'btn-primary\': compression.ready }">Run As Script</a></span><h4>Dynamic Compression <small>Encode strings and urls into more compact forms.</small></h4><hr><div class=row><div class=col-md-6><div class="btn-group pull-right"><button class="btn btn-default btn-xs dropdown-toggle" type=button data-toggle=dropdown aria-expanded=false>Samples <span class=caret></span></button><ul class=dropdown-menu role=menu><li><a href="" ng-click="compression.getSampleText(\'assets/lib/sp.js\')">JavaScript #1</a></li><li><a href="" ng-click="compression.getSampleText(\'assets/lib/test.js\')">JavaScript #2</a></li><li><a href="" ng-click="compression.getSampleText(\'assets/css/test.css\')">CSS Styles #1</a></li><li><a href="" ng-click="compression.getSampleText(\'assets/css/test.min.css\')">CSS Styles #2</a></li></ul></div><h5>Enter text to compress: <small ng-if=compression.text.length>{{ compression.text.length | toBytes }}, uncompressed</small></h5><textarea ng-model=compression.text ng-disabled=compression.result style="width: 100%; min-height: 480px" placeholder="Enter some text here..."></textarea></div><div class=col-md-6><span class=pull-right>Use Compression:<select ng-model=compression.target><option value="">default</option><option value=lzw>lzw</option><option value=scsu>scsu</option><option value=html>html</option><option value=base64>base64</option></select></span><h5>Compressed Text: <small ng-if=compression.result.length>{{ compression.result.length | toBytes }}, {{ compression.getPercentage() | number:2 }}% reduction</small></h5><textarea ng-model=compression.result ng-disabled=!compression.result style="width: 100%; min-height: 480px" readonly></textarea></div></div><hr><div ng:if=compression.error class="alert alert-danger"><b>Error:</b> {{ compression.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/decorators/dialogs/interceptor.tpl.html',
    '<div class=modal-body style="min-height: 180px; padding: 6px"><ul class="nav nav-tabs"><li role=presentation ng-class="{ \'active\' : (modalAction == \'req\') }"><a href="" ng-click="modalAction = \'req\'">Request Details</a></li><li role=presentation ng-class="{ \'active\' : (modalAction == \'resp\') }"><a href="" ng-click="modalAction = \'resp\'">Return Result</a></li></ul><div class=thumbnail style="border-top: none; margin-bottom: 0; border-top-left-radius: 0; border-top-right-radius: 0"><form ng-switch=modalAction style="margin-top: 6px"><div ng-if=statusMsg class="alert alert-warning" style="padding: 8px; margin: 0">{{ statusMsg }}</div><div ng-switch-default class=docked><em class=text-muted style="padding: 6px; margin: 50px auto">Select an action to start with...</em></div><div ng-switch-when=req><h5>Request Details <small>More about the source</small></h5><p>...</p></div><div ng-switch-when=resp><h5>Result Returned <small ng-if=!status class="text-danger pull-right"><i class="fa fa-close"></i> Rejected</small> <small ng-if=status class="text-success pull-right"><i class="fa fa-check"></i> Responded</small></h5><div class="input-group input-group-sm"><span class=input-group-addon id=sizing-addon3>Type</span> <input class=form-control ng-value=getType() ng-readonly=true placeholder=undefined aria-describedby=sizing-addon3> <span class=input-group-btn><button type=button ng-disabled=true class="btn btn-default dropdown-toggle" data-toggle=dropdown aria-expanded=false>Edit <span class=caret></span></button><ul class="dropdown-menu dropdown-menu-right" role=menu><li><a href=#>Accepted Reply</a></li><li><a href=#>Rejection Reason</a></li><li class=divider></li><li><a href=#>Reset to Defaults</a></li></ul></span></div><textarea ng-class="{ \'alert alert-danger\':!getStatus(), \'alert alert-success\':getStatus() }" ng-readonly=true ng-bind=getBody() style="width: 100%; min-height: 160px; margin:0"></textarea><div class=input-group><div ng-click=setToggle(!allowEmpty) style="padding-left: 8px"><i class=fa ng-class="{ \'fa-check\':allowEmpty, \'fa-close\':!allowEmpty }"></i> <span>Allow empty value as return value</span></div></div></div></form></div></div><div class=modal-footer><button id=btnCancel ng-disabled="!allowEmpty && !rejectValue" class="btn btn-danger pull-left" ng-click=cancel()>Reject Action</button> <button id=btnUpdate ng-disabled="!allowEmpty && !promisedValue" class="btn btn-success pull-right" ng-click=ok()>Complete Action</button></div>');
  $templateCache.put('samples/decorators/main.tpl.html',
    '<div id=DecoratorView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=decorators.busy ng-click=decorators.apply() class=btn ng-class="{ \'btn-primary\': !decorators.isPatched(), \'btn-success\': decorators.isPatched() }">{{ decorators.isPatched() ? \'Application Patched!\' : \'Apply Monkey Patches\' }}</a></span><h4>Patching Services <small>Monkey patching the normal behaviour of your application.</small></h4><hr><p>By making use of angular\'s <a href=https://docs.angularjs.org/api/auto/service/$provide>$provide decorators</a>, we patch the <a href=https://docs.angularjs.org/api/ng/service/$q>$q service</a> to intercept any promised actions and take over the reply mechanism.</p><p>After the initial investigation, it quickly became clear there are just way too many promises to intercept and keep track of, many of them in the angular framework itself. A mechanism was required to identify (and filter out) the promises we were looking for.</p><p>With no <em>real</em> unique identifiers to work with, stack traces are used for tracking identity. In javascript, stack traces are ugly, and not always helpful, but with a little bit of regular expressions, enough sensible info can be extracted to get a picture of <em>where</em> the actions originate from. And this opens up a whole new world of oppertunities...</p><p>- This sample was inspired by <a target=_blank href=http://www.bennadel.com/blog/2775-monkey-patching-the-q-service-using-provide-decorator-in-angularjs.htm>this awesome blog post</a>. :)<br>- The idea to use stack traces was inspired from <a target=_blank href=http://www.codeovertones.com/2011/08/how-to-print-stack-trace-anywhere-in.html>this awesome blog post</a>.</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-success\': (decorators.lastStatus && decorators.lastResult), \'btn-danger\': (!decorators.lastStatus && decorators.lastResult.message) }" href="" ng-click=decorators.runPromiseAction()>Run Promised Action</a> <a class="btn btn-default" ng-class="{ \'btn-warning\':decorators.isPatched(), \'btn-success\': decorators.fcallState == \'Resolved\', \'btn-danger\': decorators.fcallState == \'Rejected\' }" href="" ng-click=decorators.fcall() ng-disabled=!decorators.isPatched()>Call Marshalled Function</a></p><hr><div ng:if=decorators.error class="alert alert-danger"><b>Error:</b> {{ decorators.error.message || \'Something went wrong.\' }}</div><div ng:if=!decorators.error><div class="alert alert-success" ng-if="decorators.lastStatus === true"><b>Accepted:</b> {{ decorators.lastResult || \'No additional information specified.\' }}</div><div class="alert alert-danger" ng-if="decorators.lastStatus === false"><b>Rejected:</b> {{ (decorators.lastResult.message || decorators.lastResult) || \'No additional information specified.\' }}</div></div></div></div></div>');
  $templateCache.put('samples/errorHandlers/main.tpl.html',
    '<div ng:cloak style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link rel=stylesheet resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input type=checkbox ng:show="sampleErrors.result !== null" ng:model=sampleErrors.enabled bs:switch switch:size=mini switch:inverse=true></span><h4>Exception Handling <small>Error reporting and client-side exception handling</small></h4><hr><div class=row><div class=col-md-3><div><h5>Throw Exceptions</h5><div class="btn-group btn-group-vertical" role=group style="width: 100%" aria-label=...><input type=button class="btn btn-default" value="Catch Managed Error" ng-click="sampleErrors.throwManagedException()"> <input type=button class="btn btn-default" value="AngularJS Error" ng-click="sampleErrors.throwAngularException()"> <input type=button class="btn btn-default" value="Create Ajax Error" ng-click="sampleErrors.throwAjaxException()"> <input type=button class="btn btn-default" value="Timeout Error" ng-click="sampleErrors.throwTimeoutException()"> <input type=button class="btn btn-default" value="Unhandled Exception" onclick="sampleError.dontExist++"></div></div></div><div ng-class="{ \'col-md-6\':sampleErrors.enabled, \'col-md-9\': !sampleErrors.enabled }"><span class=pull-right><a href="" ng-click="appStatus.logs = []">Clear</a></span><h5>Event Logs</h5><table class="table table-hover table-condensed"><thead><tr><th style="width: 80px">Time</th><th style="width: 64px">Type</th><th>Description</th></tr></thead><tbody><tr ng-if=!appStatus.logs.length><td colspan=3><em>No event have been logged...</em></td></tr><tr ng-repeat="row in appStatus.logs | listReverse" ng-class="{ \'text-info inactive-gray\':row.type==\'debug\', \'text-info\':row.type==\'info\', \'text-warning glow-orange\':row.type==\'warn\', \'text-danger glow-red\':row.type==\'error\' }"><td>{{ row.time | date:\'hh:mm:ss\' }}</td><td>{{ row.type }}</td><td><div class=ellipsis style="width: 100%">{{ row.desc }}</div></td></tr></tbody></table><div class="alert alert-info" ng-if=!appStatus.logs.length><h5>Inspired by these blogs:</h5><ul><li><a target=_blank href=http://www.davecap.com/post/46522098029/using-sentry-raven-js-with-angularjs-to-catch>http://www.davecap.com</a></li><li><a target=_blank href=http://bahmutov.calepin.co/catch-all-errors-in-angular-app.html>http://bahmutov.calepin.co</a></li></ul></div></div><div ng-class="{ \'col-md-3\':sampleErrors.enabled, \'hide\': !sampleErrors.enabled }"><div><h5>Exception Handlers</h5><form class=thumbnail><div style="padding: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !handler.enabled && handler.locked }" ng:repeat="handler in appConfig.errorHandlers"><label><input type=checkbox ng-disabled=handler.locked ng-checked=handler.enabled ng-click=sampleErrors.checkChanged(handler)> <span ng-if=!handler.busy><strong ng:if=handler.enabled>{{ handler.label }}</strong> <span ng:if=!handler.enabled>{{ handler.label }}</span></span> <span ng-if=handler.busy><i class="fa fa-spinner fa-spin"></i> <em>Loading third-party scripts...</em></span></label></div></div></form></div><div ng:if="sampleErrors.raven.isEnabled && !sampleErrors.raven.handler.busy"><span class=pull-right style="padding: 3px"><b ng:if=sampleErrors.raven.isOnline class=glow-green>Online</b> <b ng:if=!sampleErrors.raven.isOnline class=glow-red>Offline</b></span><h5>Sentry and RavenJS</h5><div style="padding: 0 8px"><div ng-show=sampleErrors.raven.isOnline><a href="" class=pull-right ng:click="sampleErrors.raven.isOnline = false;"><i class="glyphicon glyphicon-remove"></i></a><div class=ellipsis><b>Public Key:</b> <a ng-href="{{ sampleErrors.raven.config.publicKey }}" target=_blank class=inactive-text>{{ sampleErrors.raven.config.publicKey }}</a></div></div><form class=form-inline role=form ng-show=!sampleErrors.raven.isOnline><div class=form-group><label for=sentryKey>Sentry public key (required)</label><div class=input-group><input class="form-control input-sm" id=sentryKey ng:model=sampleErrors.raven.config.publicKey placeholder="https://<-key->@app.getsentry.com/12345"><div class=input-group-btn><a class="btn btn-sm btn-default" ng-class="{ \'btn-danger\': sampleErrors.raven.lastError, \'btn-primary\': sampleErrors.raven.config.publicKey, \'btn-default\': !sampleErrors.raven.config.publicKey }" ng-disabled=!sampleErrors.raven.config.publicKey ng-click=sampleErrors.raven.connect(sampleErrors.raven.config.publicKey)>Set</a></div></div></div></form><br><div class="alert alert-success" ng-if=sampleErrors.raven.isOnline>You are now ready to post ravens to your online sentry account.</div><div class="alert alert-danger" ng-if="!sampleErrors.raven.isOnline && sampleErrors.raven.lastError">{{ sampleErrors.raven.lastError.message }}</div><div class="alert alert-info" ng-if="!sampleErrors.raven.isOnline && !sampleErrors.raven.lastError"><a target=_blank href="https://www.getsentry.com/welcome/">Sentry</a> is a third party online service used to track errors. <a target=_blank href="http://raven-js.readthedocs.org/en/latest/">RavenJS</a> is used on the client-side to catch and send events on to Sentry.</div></div></div></div></div></div></div></div>');
  $templateCache.put('samples/interceptors/main.tpl.html',
    '<div id=InterceptorView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=interceptors.busy ng-click=interceptors.apply() class=btn ng-class="{ \'btn-primary\': !interceptors.isPatched(), \'btn-success\': interceptors.isPatched() }">{{ interceptors.isPatched() ? \'Interceptors Active\' : \'Enable Interceptors\' }}</a></span><h4>HTTP Interceptors <small>Register and utilise Angular\'s interceptors.</small></h4><hr><p>...</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-warning\': interceptors.isPatched(), \'btn-success\': interceptors.fcallState == \'Resolved\', \'btn-danger\': interceptors.fcallState == \'Rejected\' }" href="" ng-click=interceptors.triggerBadRequest() ng-disabled=!interceptors.isPatched()>Create Bad Request</a></p><hr><div ng:if=interceptors.error class="alert alert-danger"><b>Error:</b> {{ interceptors.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=samples.info><i class=fa ng-class="{ \'fa-refresh glow-blue animate-glow\': samples.busy, \'fa-cubes glow-green\': !samples.busy, \'fa-warning glow-red animate-glow\': samples.error }"></i>&nbsp; Samples Home Page</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.notifications><i class="fa fa-comment"></i> Web Notifications</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.errors><i class="fa fa-life-ring"></i> Exception Handlers</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.compression><i class="fa fa-file-archive-o"></i> Dynamic Encoders</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.sampleData><i class="fa fa-gears"></i> Online Sample Data</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.interceptors><i class="fa fa-crosshairs"></i> HTTP Interceptors</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.decorators><i class="fa fa-plug"></i> Service Decorators</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.location><i class="fa fa-crosshairs"></i> Geo Location Tracking</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.styles3d><i class="fa fa-codepen"></i> Exploring Styles 3D</a></li></ul>');
  $templateCache.put('samples/location/views/aside.tpl.html',
    '<ul class="nav nav-list ng-cloak"><li><h5>Current Location</h5><div class=thumbnail><div class="row nav-label"><span class=col-sm-3>Status</span> <b class=col-sm-9 ng-class="{\'text-success\' : position.coords, \'text-inactive\' : client || position.isBusy, \'text-error\':position.failed, \'text-danger\' : !client && !position.coords && !position.failed && !position.isBusy }"><i class=glyphicon ng-class="{\'glyphicon-ok\' : position.coords, \'glyphicon-refresh\' : position.isBusy, \'glyphicon-exclamation-sign\' : !position.coords && !position.isBusy }"></i> {{ geoCtrl.getStatus() }}</b></div><div class="row nav-label" ng-show=position.coords><span class=col-sm-3>Long</span> <b class=col-sm-9>{{ position.coords.longitude | longitude }}</b></div><div class="row nav-label" ng-show=position.coords><span class=col-sm-3>Latt</span> <b class=col-sm-9>{{ position.coords.latitude | latitude }}</b></div><div class="row nav-label" ng-show=position.coords.accuracy><span class=col-sm-3>Accuracy</span> <b class=col-sm-9>{{ position.coords.accuracy | formatted:\'{0} meters\' || \'n.a.\' }}</b></div></div></li><li ng-if=geoCtrl.hasSamples()><h5>Popular Locations</h5><div class=thumbnail><div ng-repeat="loc in geoCtrl.getSamples()"><a href="" ng-click=geoCtrl.setGeoPoint(loc)><i class="glyphicon glyphicon-screenshot"></i> <span class=nav-label>{{ loc.Label }}</span></a></div></div></li><li ng-show="(client || position)"><h5>Additional Info</h5><div class=thumbnail><div class="row nav-label" ng-show=client.country><div class=col-sm-3>Country</div><b class="col-sm-9 ellipse">{{ client.country }}</b></div><div class="row nav-label" ng-show=client.city><div class=col-sm-3>City</div><b class="col-sm-9 ellipse">{{ client.city }}</b></div><div class="row nav-label" ng-show=client.ip><div class=col-sm-3>TCP/IP</div><b class="col-sm-9 ellipse">{{ client.ip }}</b></div><div class="row nav-label" ng-show=position.timestamp><span class=col-sm-3>Updated</span> <b class="col-sm-9 ellipse">{{ position.timestamp | date:\'HH:mm a Z\' || \'n.a.\' }}</b></div><div class="row nav-label" ng-show=position.coords.speed><span class=col-sm-3>Speed</span> <b class="col-sm-9 ellipse">{{ position.coords.speed | formatted:\'{0} m/s\' }}</b></div><div class="row nav-label" ng-show=position.coords.altitude><span class=col-sm-3>Altitude</span> <b class="col-sm-9 ellipse">{{ position.coords.altitude | formatted:\'{0} meters\' }}</b></div><div class="row nav-label" ng-show=position.coords.heading><span class=col-sm-3>Heading</span> <b class="col-sm-9 ellipse">{{ position.coords.heading | formatted:\'{0}°\' }}</b></div></div></li></ul>');
  $templateCache.put('samples/location/views/main.tpl.html',
    '<div style="width: 100%"><div class=row><div class="col-lg-9 col-md-12 info-overview"><h5 class=page-header style="margin: 0">Geo Location <small>Find your current position on the globe.</small></h5><div ng-include="\'samples/location/views/status.tpl.html\'"></div><div id=map-canvas class="panel-contents dock-vert" style="min-height: 520px" ng-hide=isActive><div class=docked style="min-width: 640px; min-height: 480px">...</div></div></div><div class="col-lg-3 hidden-md"><div ng-include="\'samples/location/views/aside.tpl.html\'"></div></div></div></div>');
  $templateCache.put('samples/location/views/status.tpl.html',
    '<div class=alert role=alert style="margin: 0; padding: 3px; border-radius:0" ng-class="{ \'alert-danger\':position.failed, \'alert-info\': position.isBusy, \'alert-success\': position.coords, \'alert-warning\': !position }" ng-show=!geoCtrl.hideStatus><a href="" style="color: #000; text-decoration: none" class=pull-right data-dismiss=alert><i class="glyphicon glyphicon-remove" aria-hidden=true></i></a> <a href="" style="color: #000; text-decoration: none" ng-click=geoCtrl.getPosition()><i class=glyphicon ng-class="{ \'glyphicon-eye-close\':position.failed, \'glyphicon-refresh\': position.isBusy, \'glyphicon-ok\': position.coords, \'glyphicon-eye-open\': !position }"></i> <span ng-if="!position && !client">Locating your current position...</span> <span ng-if="!position.failed && !position.coords && !position.isBusy && client"><b>Please Note:</b> Tracking you (passively) via your IP address. <em>Click here for a more accurate position.</em></span> <span ng-if="!position.failed && !position.coords && position.isBusy"><b>Requesting:</b> Please accept or discard the request for your current location...</span> <span ng-if=position.failed><b>Warning:</b> You declined to share your location info, passively tracking your IP address...</span> <span ng-if=position.coords><b>Success:</b> Current position found via browser. Processing info...</span></a></div>');
  $templateCache.put('samples/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><h4>Prototyped Samples <small>Beware, code monkeys at play... ;)</small></h4><hr><p ui:view=body>.....</p><hr></div></div></div>');
  $templateCache.put('samples/notifications/main.tpl.html',
    '<div id=NotificationView style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link rel=stylesheet resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.core.css"><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.default.min.css"><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input type=checkbox ng:show="notify.ready !== null" ng:model=notify.enabled bs:switch switch:size=mini switch:inverse=true></span><h4>{{ notify.isPatched() ? \'Desktop\' : \'Browser\' }} Notifications <small>Various mechanisms of user notification in HTML5.</small></h4><hr><p ng-show="notify.ready === null"><em><i class="fa fa-spinner fa-spin"></i> <b>Requesting Access:</b> Desktop notifications...</em> <span><a href="" ng-click="notify.ready = false">cancel</a></span></p><div ng-show="notify.ready !== null" class=row><div class=col-md-3><div><h5>Notification Types</h5><div class=thumbnail><div style="padding: 0 8px"><div class=radio ng-class="{ \'inactive-gray\': !method.enabled() }" ng-repeat="method in methods"><label><input type=radio name=optionsMethods id=option_method_{{method.name}} value="{{ method.name }}" ng-disabled=!method.enabled() ng-click="notify.current = method" ng-checked="notify.current.name == method.name"> <span ng-if="(notify.current.name != method.name)">{{ method.label }}</span> <strong ng-if="(notify.current.name == method.name)">{{ method.label }}</strong></label></div></div></div></div><div ng-show="notify.current.name == \'notify\'"><h5>Message Styling</h5><form class=thumbnail><div class=form-group><label for=exampleIcon>Icon File</label><input type=file id=exampleIcon><p class=help-block>Image to display with message.</p></div></form></div></div><div ng-class="{ \'col-md-6\':notify.enabled, \'col-md-9\': !notify.enabled }"><h5>Create a new message</h5><form class=thumbnail ng-disabled=notify.ready ng-init="msgOpts = { title: \'Web Notification\', body: \'This is a test message.\'}"><div style="padding: 8px"><div class=form-group><label for=exampleTitle>Message Title</label><input class=form-control id=exampleTitle placeholder="Enter title" ng-model=msgOpts.title></div><div class=form-group><label for=exampleMessage>Message Body Text</label><textarea class=form-control rows=5 class=form-control id=exampleMessage ng-model=msgOpts.body placeholder="Enter body text"></textarea></div><span class=pull-right ng-show="notify.current.name != \'alert\'" style="margin: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.showResult }"><label><input type=checkbox ng-model=notify.showResult> Show Result</label></div></span> <span class=pull-right ng-show="notify.current.name != \'alert\'" style="margin: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.sameDialog }"><label><input type=checkbox ng-model=notify.sameDialog> Recycle Dialog</label></div></span> <button type=submit class="btn btn-default" ng-class="{ \'btn-success\': notify.isPatched(), \'btn-primary\': notify.ready !== null && !notify.isPatched() }" ng-click="notify.current.action(msgOpts.title, msgOpts.body, msgOpts)">Create Message</button></div></form></div><div ng-class="{ \'col-md-3\':notify.enabled, \'hide\': !notify.enabled }"><div><h5>Notification Extenders</h5><form class=thumbnail><div style="padding: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.enabled }"><label><input type=checkbox ng-model=notify.enabled> Desktop Notifications</label></div><div class=checkbox ng-class="{ \'inactive-gray\': !notify.options.alertify.enabled }"><label><input type=checkbox ng-checked=notify.options.alertify.enabled ng-click=notify.hookAlertify()> <span ng-if=!notify.options.alertify.busy>Extend with <a target=_blank href="http://fabien-d.github.io/alertify.js/">AlertifyJS</a></span> <span ng-if=notify.options.alertify.busy><i class="fa fa-spinner fa-spin"></i> <em>Loading third-party scripts...</em></span></label></div></div></form></div><div ng-show=notify.enabled><h5>System Notifications Active</h5><div class="alert alert-success"><b>Note:</b> All notifications get redirected to your OS notification system.</div></div></div></div><div ng:if=notify.error class="alert alert-danger"><b>Error:</b> {{ notify.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/sampleData/main.tpl.html',
    '<div id=SampleDataView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=sampleData.busy ng-click=sampleData.test() class="btn btn-primary">Fetch Sample Data</a></span><h4>Online Sample Data <small>Directly from the cloud! Supplied by this awesome API: <a href="http://www.filltext.com/" target=_blank>http://www.filltext.com/</a></small></h4><hr><div ng:if=sampleData.error class="alert alert-danger"><b>Error:</b> {{ sampleData.error.message || \'Something went wrong. :(\' }}</div><div class=row><div class=col-md-3><h5>Define Fields <small>( {{ sampleData.args.length }} defined )</small> <small class=pull-right><a href="" ng-click="sampleData.args.push({ id: \'myField\', val: \'\'})"><i class="fa fa-plus"></i></a></small></h5><div class=thumbnail><div style="display: flex; width: auto; padding: 3px" ng-repeat="arg in sampleData.args"><span style="flex-basis: 20px; flex-grow:0; flex-shrink:0"><input checked type=checkbox ng-click="sampleData.args.splice(sampleData.args.indexOf(arg), 1)" aria-label=...></span><div style="flex-basis: 64px; flex-grow:0; flex-shrink:0"><input style="width: 100%" aria-label=... ng-model=arg.id></div><div style="flex-grow:1; flex-shrink:1"><input style="width: 100%" aria-label=... ng-model=arg.val></div></div></div></div><div class=col-md-9><h5>Results View <small ng:if=sampleData.resp.length>( {{ sampleData.resp.length }} total )</small></h5><table class=table><thead><tr><th ng-repeat="arg in sampleData.args">{{ arg.id }}</th></tr></thead><tbody><tr ng-if=!sampleData.resp><td colspan="{{ sampleData.args.length }}"><em>Nothing to show yet. Fetch some data first...</em></td></tr><tr ng-repeat="row in sampleData.resp"><td ng-repeat="arg in sampleData.args">{{ row[arg.id] }}</td></tr></tbody></table></div></div></div></div></div>');
  $templateCache.put('samples/styles3d/main.tpl.html',
    '<div id=mainview style="width: 100%"><div>Inspired by this post: <a href=http://www.dhteumeuleu.com/apparently-transparent/source>http://www.dhteumeuleu.com/apparently-transparent/source</a></div><div id=screen><div id=scene><div class="f sky" data-transform="rotateX(-90deg) translateZ(-300px)"></div><div class=wall data-transform=translateZ(-500px)></div><div class=wall data-transform="rotateY(-90deg) translateZ(-500px)"></div><div class=wall data-transform="rotateY(90deg) translateZ(-500px)"></div><div class=wall data-transform="rotateY(180deg) translateZ(-500px)"></div><iframe class="f bottom" data-transform="rotateX(90deg) translateZ(-300px)" src=//www.prototyped.info style="background-image: none"></iframe></div></div></div><style>html {\n' +
    '        -ms-touch-action: none;\n' +
    '        -ms-content-zooming: none;\n' +
    '    }\n' +
    '\n' +
    '    .sky {\n' +
    '        width: 1000px;\n' +
    '        height: 1000px;\n' +
    '        visibility: visible;\n' +
    '        background-image: url(http://thegirlbythesea.com/wp-content/uploads/2010/03/prairie-sky-2.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(-90deg) translateZ(-300px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(-90deg) translateZ(-300px);\n' +
    '    }\n' +
    '\n' +
    '    .bottom {\n' +
    '        width: 1000px;\n' +
    '        height: 1000px;\n' +
    '        visibility: visible;\n' +
    '        background-image: url(http://www.momorialcards.com/images/light_textured_backround.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(90deg) translateZ(-300px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(90deg) translateZ(-300px);\n' +
    '    }\n' +
    '\n' +
    '    .wall {\n' +
    '        width: 1000px;\n' +
    '        height: 600px;\n' +
    '        visibility: visible;\n' +
    '        background-image: url(http://www.mergedmv.com/wp-content/uploads/2015/02/black-brick-wall-background.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) translateZ(-500px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) translateZ(-500px);        \n' +
    '    }\n' +
    '\n' +
    '    #mainview {\n' +
    '        width: 100%;\n' +
    '        height: 100%;\n' +
    '        min-height: 600px;\n' +
    '        position: relative;\n' +
    '        display: flex;\n' +
    '    }\n' +
    '\n' +
    '    #screen {\n' +
    '        position: absolute;\n' +
    '        left: 0;\n' +
    '        top: 0;\n' +
    '        right: 0;\n' +
    '        bottom: 0;\n' +
    '        cursor: pointer;\n' +
    '        background: #000;\n' +
    '        user-select: none;\n' +
    '        overflow: hidden;\n' +
    '    }\n' +
    '\n' +
    '    #scene {\n' +
    '        position: absolute;\n' +
    '        top: 50%;\n' +
    '        left: 50%;\n' +
    '        width: 0;\n' +
    '        height: 0;\n' +
    '        transform: translateZ(1000px);\n' +
    '        -webkit-transform: translateZ(1000px);\n' +
    '    }\n' +
    '\n' +
    '        #scene [data-transform] {\n' +
    '            position: absolute;\n' +
    '            visibility: hidden;\n' +
    '            margin: -300px -500px;\n' +
    '            backface-visibility: hidden;\n' +
    '            -webkit-backface-visibility: hidden;\n' +
    '            image-rendering: optimizeSpeed;\n' +
    '            image-rendering: -moz-crisp-edges;\n' +
    '            image-rendering: -o-crisp-edges;\n' +
    '            image-rendering: -webkit-optimize-contrast;\n' +
    '            image-rendering: optimize-contrast;\n' +
    '            -ms-interpolation-mode: nearest-neighbor;\n' +
    '        }\n' +
    '\n' +
    '        #scene .f {\n' +
    '            margin: -500px -500px;\n' +
    '        }\n' +
    '\n' +
    '        #scene .s {\n' +
    '            width: 252px;\n' +
    '            height: 600px;\n' +
    '            margin: -300px -126px;\n' +
    '        }</style>');
}]);
;angular.module('prototyped.ng.samples.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/samples.min.css',
    "body .sample-info{padding:8px}"
  );

}]);