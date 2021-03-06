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
    '$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', '$templateCache', 'lzwCompressor', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, $templateCache, lzwCompressor) {
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
                context.busy = true;
                context.result = 'Compressing text...';
                try  {
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
                    console.info(' - Compressed size: ' + payload.length + ' bytes.');

                    // Build a url of the script
                    var enc = (ident == 'lzw') ? '' : ',"' + ident + '"';
                    var arg = "alert" + enc;
                    var url = 'javascript:try { ' + JSON.stringify(payload) + "['']().decompress(" + arg + ")" + ' } catch (ex) { alert(ex.message) }';

                    // Set the result
                    $rootScope.$applyAsync(function () {
                        context.scriptUrl = url;
                        context.resType = context.target;
                        context.result = payload;
                        context.ready = true;
                        context.busy = false;
                    });

                    var btnTrigger = $('#runAsScript');
                    if (btnTrigger) {
                        btnTrigger.attr('href', url);
                    }
                } catch (ex) {
                    throw ex;
                } finally {
                    $rootScope.$applyAsync(function () {
                        context.busy = false;
                    });
                    console.groupEnd();
                }
            },
            clearResult: function () {
                $rootScope.$applyAsync(function () {
                    context.result = '';
                    context.ready = false;
                });
            },
            runAsScript: function () {
                try  {
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
                return 100 - (100.0 * (context.result.length || 0) / context.text.length);
            },
            getSampleText: function (url) {
                context.busy = true;

                // Get some sample text
                var contents = $templateCache.get(url);
                if (contents) {
                    // Update text box with text
                    context.text = 'Updating...';
                    $rootScope.$applyAsync(function () {
                        context.text = contents;
                        context.busy = false;
                    });
                } else {
                    context.text = 'Fetcing: ' + url;
                    var request = $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'text',
                        success: function (data) {
                            // Save in the local template cache
                            $templateCache.put(url, data);

                            // Update text box with text
                            $rootScope.$applyAsync(function () {
                                context.text = data;
                                context.busy = false;
                            });
                        },
                        error: function (error) {
                            // Update text box with text
                            $rootScope.$applyAsync(function () {
                                context.text = error.message || 'Something went wrong.';
                                context.busy = false;
                            });
                        }
                    });
                }
            }
        };

        $scope.$watch('compression.target', function () {
            if (context.result && context.resType != context.target) {
                // Update compressed result with new compression type
                context.compressText(context.text);
            }
        });
        $scope.$watch('compression.text', function () {
            if (context.text && context.result) {
                // Update compressed result with new compression type
                context.compressText(context.text);
            } else {
                $rootScope.$applyAsync(function () {
                    context.result = '';
                });
            }
        });
        $scope.$watch('compression.sampleUrl', function () {
            if (context.sampleUrl) {
                // Update compressed result with new compression type
                context.getSampleText(context.sampleUrl);
            } else {
                $rootScope.$applyAsync(function () {
                    context.text = '';
                });
            }
        });

        // Apply updates (including async)
        var updates = {};
        try  {
            // Get some sample text
            //context.getSampleText('assets/lib/test.js');
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
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (decorators) {
                (function (config) {
                    function ConfigureHttpRequestInterceptor($httpProvider, appConfigProvider) {
                        // Attach our interceptor to Angular's interceptors
                        $httpProvider.interceptors.push('httpInterceptor'); // This is defined later...

                        // Extend the base ajax request handler
                        var appConfig = appConfigProvider.$get();
                        var cfg = appConfig['decorators'];
                        if (cfg) {
                            // Do some magic with the ajax request handlers
                            var openCommand = XMLHttpRequest.prototype.open;
                            XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
                                var me = this;
                                var arg = arguments;
                                if (cfg.xhttp) {
                                    if (cfg.debug)
                                        console.log(' - [ Ajax ] ( ' + (async ? 'Async' : 'Sync') + ' ) => ', url, ctx);
                                    var ctx = {
                                        url: url,
                                        async: async,
                                        method: method
                                    };

                                    // Check for auth info
                                    if (user || pass) {
                                        // Extended with auth info
                                        angular.extend(ctx, {
                                            username: user,
                                            password: pass
                                        });
                                    }

                                    //ToDo: Promt....
                                    me._protoStack = me._protoStack || [];
                                    me._protoStack.push(ctx);

                                    // Call the original function
                                    if (openCommand) {
                                        openCommand.apply(me, arg);
                                    }
                                } else {
                                    // Call the original function
                                    if (openCommand) {
                                        openCommand.apply(me, arg);
                                    }
                                }
                            };
                            var sendCommand = XMLHttpRequest.prototype.send;
                            XMLHttpRequest.prototype.send = function () {
                                var me = this;
                                var arg = arguments;
                                if (cfg.xhttp) {
                                    var ctx = me._protoStack ? me._protoStack.pop() : null;
                                    if (ctx === null)
                                        return;

                                    var readyCommand = me.onreadystatechange;
                                    me.onreadystatechange = function (evt) {
                                        var me = this;
                                        var arg = arguments;
                                        if (cfg.xhttp) {
                                            if (ctx === null)
                                                return;
                                            if (me.readyState == 4 && me.status == 200 && me.responseText) {
                                                if (cfg.debug)
                                                    console.log(' - [ Ajax ] ( Recieved ) => ', ctx);
                                                if (cfg.promptme) {
                                                    // Intercept the method
                                                    cfg.promptme(true, me.responseText).then(function (revised) {
                                                        // Call the original function
                                                        if (readyCommand) {
                                                            readyCommand.apply(me, arg);
                                                        }
                                                    }, function (revised) {
                                                        // Reject the result
                                                    });
                                                } else {
                                                    // Call the original function
                                                    if (readyCommand) {
                                                        readyCommand.apply(me, arg);
                                                    }
                                                }
                                            }
                                            me._protoActive = null;
                                        } else {
                                            // Call the original function
                                            if (readyCommand) {
                                                readyCommand.apply(me, arg);
                                            }
                                        }
                                    };

                                    if (cfg.debug)
                                        console.log(' - [ Ajax ] ( Send ) => ', ctx);
                                    me._protoActive = ctx;

                                    // Call the original function
                                    if (sendCommand) {
                                        sendCommand.apply(me, arg);
                                    }
                                } else {
                                    // Call the original function
                                    if (sendCommand) {
                                        sendCommand.apply(me, arg);
                                    }
                                }
                            };
                        }
                    }
                    config.ConfigureHttpRequestInterceptor = ConfigureHttpRequestInterceptor;

                    function ConfigureQServiceInterceptor($provide, appConfigProvider) {
                        var appConfig = appConfigProvider.$get();
                        var cfg = appConfig['decorators'];

                        $provide.decorator("$q", decorateQService);

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
                                // Use default call-through if not enabled...
                                if (!cfg.enabled)
                                    return proxy.apply(this, arguments);
                                var result, value;
                                var info = {
                                    startAt: Date.now()
                                };
                                try  {
                                    // Try and get the original result
                                    result = proxy.apply(this, arguments);

                                    // Execute extended functionality....
                                    var timeString = new Date(info.startAt).toLocaleTimeString();
                                    if (cfg.debug)
                                        console.groupCollapsed('[ ' + timeString + ' ] Promised action intercepted...');

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
                                    if (stack.length)
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
                                                    filterResult = item.match = filter(filterResult, item);
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
                                    console.error(ex);
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
                    }
                    config.ConfigureQServiceInterceptor = ConfigureQServiceInterceptor;
                })(decorators.config || (decorators.config = {}));
                var config = decorators.config;
            })(samples.decorators || (samples.decorators = {}));
            var decorators = samples.decorators;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (_decorators) {
                (function (controllers) {
                    var DecoratorsController = (function () {
                        function DecoratorsController($rootScope, $scope, $modal, $q, $timeout, appConfig) {
                            var cfg = appConfig['decorators'];

                            // Define the model
                            var context = $scope.decorators = {
                                fcall: function () {
                                    // Clear last result
                                    context.error = null;
                                    context.fcallState = null;

                                    $timeout(function () {
                                        // Timeout action...
                                    }, 1500).then(function (value) {
                                        context.lastStatus = true;
                                        context.fcallState = 'Resolved';
                                        context.lastResult = 'Timeout Passed';
                                    }, function (error) {
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
                                    context.getPromisedAction().then(function onSuccess(result) {
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
                                triggerAjaxRequest: function () {
                                    var url = 'http://www.filltext.com/?rows=2&fname={firstName}&lname={lastName}&tel={phone|format}&address={streetAddress}&city={city}&state={usState|abbr}&zip={zip}&pretty=true';
                                    context.lastStatus = null;
                                    context.ajaxStatus = null;
                                    $.ajax(url, {
                                        contentType: 'text/html',
                                        success: function (data) {
                                            $rootScope.$applyAsync(function () {
                                                var isHtmlPartial = !/\<!doctype html\>/i.test(data);
                                                context.ajaxStatus = isHtmlPartial;
                                                context.ajaxResult = isHtmlPartial ? data : '[ <a href="' + url + '">HTML Document</a> ]';
                                                context.lastStatus = true;
                                                context.lastResult = 'AJAX Result: ' + url;
                                            });
                                        },
                                        error: function (xhr, desc, ex) {
                                            $rootScope.$applyAsync(function () {
                                                context.lastStatus = false;
                                                context.ajaxStatus = false;
                                                context.lastResult = 'AJAX Error: [ ' + desc + ' ] ' + ex || url;
                                            });
                                        }
                                    });
                                }
                            };
                        }
                        return DecoratorsController;
                    })();
                    controllers.DecoratorsController = DecoratorsController;
                })(_decorators.controllers || (_decorators.controllers = {}));
                var controllers = _decorators.controllers;
            })(samples.decorators || (samples.decorators = {}));
            var decorators = samples.decorators;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (decorators) {
                (function (controllers) {
                    var InterceptModalController = (function () {
                        function InterceptModalController($scope, $modalInstance, status, result) {
                            this.$scope = $scope;
                            this.$modalInstance = $modalInstance;
                            this.status = status;
                            this.result = result;
                            $scope.status = status;
                            $scope.result = result;

                            // Define modal scope
                            $scope.allowEmpty = typeof result === 'undefined';
                            $scope.action = status ? 'Accept' : 'Reject';
                            $scope.modalAction = (typeof status !== 'undefined') ? 'resp' : 'req';
                            $scope.promisedValue = status ? result : undefined;
                            $scope.rejectValue = !status ? result : new Error("Interceptor rejected the action.");
                            $scope.getStatus = function () {
                                return $scope.action == 'Accept';
                            };
                            $scope.getResult = function () {
                                return $scope.getStatus() ? $scope.promisedValue : $scope.rejectValue;
                            };
                            $scope.getType = function () {
                                var result = $scope.getResult();
                                return (typeof result);
                            };
                            $scope.getBody = function () {
                                return JSON.stringify($scope.getResult());
                            };
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
                        }
                        return InterceptModalController;
                    })();
                    controllers.InterceptModalController = InterceptModalController;
                })(decorators.controllers || (decorators.controllers = {}));
                var controllers = decorators.controllers;
            })(samples.decorators || (samples.decorators = {}));
            var decorators = samples.decorators;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (decorators) {
                function InterceptHttpResponse(response) {
                    if (response.data && response.status === 200) {
                        var out = DecorateHttpContents(response.data);
                        if (out) {
                            response.data = out;
                        }
                    }
                }
                decorators.InterceptHttpResponse = InterceptHttpResponse;

                function DecorateHttpContents(html) {
                    var inp = $(html);
                    if (inp.length)
                        inp.each(function (i, elem) {
                            var el = $(elem);
                            el.addClass('content-border-glow');
                            el.addClass('-before');
                        });
                    var out = $('<p>').append(inp).html();
                    return out;
                }
                decorators.DecorateHttpContents = DecorateHttpContents;

                function InterceptorAjaxRequest(evt) {
                    // Decorate the intercepted html
                    var me = evt.target;
                    var out = proto.ng.samples.decorators.DecorateHttpContents(me.responseText);
                    angular.extend(me, {
                        response: out,
                        responseText: out
                    });
                }
                decorators.InterceptorAjaxRequest = InterceptorAjaxRequest;
            })(samples.decorators || (samples.decorators = {}));
            var decorators = samples.decorators;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="typings/HttpInterceptorService.ts" />
angular.module('prototyped.ng.samples.decorators', []).config([
    'appConfigProvider', function (appConfigProvider) {
        appConfigProvider.config('decorators', {
            debug: false,
            promptme: null,
            enabled: appConfigProvider.getPersisted('decorators.enabled') == '1',
            filters: proto.ng.samples.decorators.StackTraceUtils.filters
        });
    }]).config([
    '$stateProvider', function ($stateProvider) {
        $stateProvider.state('samples.decorators', {
            url: '/decorators',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/decorators/main.tpl.html',
                    controller: 'decoratorsController'
                }
            }
        }).state('samples.decorators.badRequest', {
            url: '/badRequest',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/decorators/bad.filename'
                }
            }
        });
    }]).config(['$provide', 'appConfigProvider', proto.ng.samples.decorators.config.ConfigureQServiceInterceptor]).config(['$httpProvider', 'appConfigProvider', proto.ng.samples.decorators.config.ConfigureHttpRequestInterceptor]).service('httpInterceptor', [
    '$rootScope', '$q', 'appConfig', function ($rootScope, $q, appConfig) {
        //return new proto.ng.samples.decorators.HttpInterceptorService($rootScope, $q, appConfig);
        var cfg = appConfig['decorators'];
        var service = this;

        // Request interceptor (pre-fetch)
        service.request = function (config) {
            try  {
                if (cfg.debug)
                    console.groupCollapsed(' -> Requesting: ' + config.url);
                if (cfg.enabled) {
                    if (cfg.debug)
                        console.log(config);
                }
            } catch (ex) {
                console.warn('Fatal Request Issue: ' + ex.message);
            } finally {
                if (cfg.debug)
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
            try  {
                if (cfg.debug)
                    console.groupCollapsed(' <- Responding: ' + response.config.url);

                if (response.status === 401) {
                    $rootScope.$broadcast('unauthorized');
                }

                if (cfg.xhttp) {
                    if (cfg.debug)
                        console.log('Response: ', response);
                    proto.ng.samples.decorators.InterceptHttpResponse(response);
                }
            } catch (ex) {
                console.warn('Fatal Response Issue: ' + ex.message);
            } finally {
                if (cfg.debug)
                    console.groupEnd();
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
    }]).controller('decoratorsController', ['$rootScope', '$scope', '$modal', '$q', '$timeout', 'appConfig', proto.ng.samples.decorators.controllers.DecoratorsController]).controller('interceptModalController', ['$scope', '$modalInstance', 'status', 'result', proto.ng.samples.decorators.controllers.InterceptModalController]).run([
    '$modal', 'appConfig', function ($modal, appConfig) {
        // Hook the interceptor function
        var cfg = appConfig['decorators'];
        cfg.promptme = function (status, result) {
            return $modal.open({
                templateUrl: 'samples/decorators/dialogs/interceptor.tpl.html',
                controller: 'interceptModalController',
                size: 'md',
                resolve: {
                    status: function () {
                        return status;
                    },
                    result: function () {
                        return result;
                    }
                }
            }).result;
        };
    }]);
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (decorators) {
                var StackTraceUtils = (function () {
                    function StackTraceUtils() {
                    }
                    StackTraceUtils.filters = [
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
                            return include || /(scope\.decorators\.fcall)/i.test(item.source);
                        },
                        function (include, item) {
                            return include || /(scope\.decorators\.runPromiseAction)/i.test(item.source);
                        }
                    ];
                    return StackTraceUtils;
                })();
                decorators.StackTraceUtils = StackTraceUtils;
            })(samples.decorators || (samples.decorators = {}));
            var decorators = samples.decorators;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../../../imports.d.ts" />

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
                            this.busy = false;
                            this.name = 'raven';
                            this.label = 'Sentry via RavenJS';
                            this.locked = false;
                            this.editMode = false;
                            this.isOnline = false;
                            this.isEnabled = false;
                            this.lastError = null;
                            this.config = appConfig.ravenConfig;
                        }
                        Object.defineProperty(RavenService.prototype, "enabled", {
                            get: function () {
                                return this.isEnabled;
                            },
                            set: function (state) {
                                this.isEnabled = state;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        RavenService.prototype.handleException = function (source, ex, tags) {
                            if (!this.isOnline)
                                return;
                            if (typeof Raven !== 'undefined') {
                                this.$log.log(' - Sending Raven: "' + ex.message + '"...');
                                Raven.captureException(ex, {
                                    source: source,
                                    tags: tags
                                });
                            }
                        };

                        RavenService.prototype.detect = function () {
                            var _this = this;
                            var urlRavenJS = 'https://cdn.ravenjs.com/1.1.18/raven.min.js';
                            try  {
                                // Load required libraries if not defined
                                if (typeof Raven === 'undefined') {
                                    this.$log.log('Loading: ' + urlRavenJS);
                                    this.busy = true;
                                    $.getScript(urlRavenJS, function (data, textStatus, jqxhr) {
                                        _this.$rootScope.$applyAsync(function () {
                                            _this.busy = false;
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

                        RavenService.prototype.attach = function () {
                            var isOnline = this.detect();
                            this.isEnabled = true;
                        };

                        RavenService.prototype.dettach = function () {
                            this.isEnabled = false;
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
/// <reference path="../../../../imports.d.ts" />

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
                            this.busy = false;
                            this.name = 'google';
                            this.label = 'Google Analytics';
                            this.locked = false;
                            this.editMode = false;
                            this.isOnline = false;
                            this.isEnabled = false;
                            this.lastError = null;
                            this.config = appConfig.googleConfig;
                        }
                        Object.defineProperty(GoogleErrorService.prototype, "enabled", {
                            get: function () {
                                return this.isEnabled;
                            },
                            set: function (state) {
                                this.isEnabled = state;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        GoogleErrorService.prototype.handleException = function (source, ex, tags) {
                            if (!this.isOnline)
                                return;
                            if ('_gaq' in window) {
                                this.$log.log(' - Sending Analytics: "' + ex.message + '"...');
                                var ctx = [
                                    '_trackEvent',
                                    source,
                                    ex.message,
                                    ex.filename + ':  ' + ex.lineno,
                                    true
                                ];
                                window['_gaq'].push(ctx);
                            }
                        };

                        GoogleErrorService.prototype.detect = function () {
                            var _this = this;
                            try  {
                                // Load required libraries if not defined
                                this.$log.log('Detecting: Google Analytics...', this.config);
                                if ('_gaq' in window) {
                                    this.init();
                                } else {
                                    var urlGa = 'https://ssl.google-analytics.com/ga.js';
                                    this.$log.log('Loading: ' + urlGa);
                                    this.busy = true;
                                    $.getScript(urlGa, function (data, textStatus, jqxhr) {
                                        _this.$rootScope.$applyAsync(function () {
                                            _this.busy = false;
                                            _this.isEnabled = true;
                                            _this.init();
                                        });
                                    });
                                }
                            } catch (ex) {
                                this.isOnline = false;
                                this.lastError = ex;
                            }

                            return false;
                        };

                        GoogleErrorService.prototype.init = function () {
                            // Check for scripts and auto-load
                            if (!this.isOnline && this.config.publicKey) {
                                this.setupGoogle();
                            }
                        };

                        GoogleErrorService.prototype.connect = function (publicKey) {
                            var _this = this;
                            try  {
                                // Setup google analytics
                                this.$rootScope.$applyAsync(function () {
                                    _this.$log.log('Connecting Google Services....', publicKey);

                                    var _gaq = window['_gaq'] = window['_gaq'] || [];
                                    _gaq.push(['_setAccount', publicKey]);

                                    //ga('create', publicKey, 'auto');
                                    _this.isOnline = true;
                                });
                            } catch (ex) {
                                this.isOnline = false;
                                this.lastError = ex;
                            }
                        };

                        GoogleErrorService.prototype.disconnect = function () {
                            this.isOnline = false;
                        };

                        GoogleErrorService.prototype.setupGoogle = function () {
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

                        GoogleErrorService.prototype.attach = function () {
                            var isOnline = this.detect();
                            this.isEnabled = isOnline;
                        };

                        GoogleErrorService.prototype.dettach = function () {
                            this.isEnabled = false;
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
                    function SampleErrorService($rootScope, $log, appConfig, appState, raven, google) {
                        this.$rootScope = $rootScope;
                        this.$log = $log;
                        this.appConfig = appConfig;
                        this.appState = appState;
                        this.raven = raven;
                        this.google = google;
                        this.busy = false;
                        this.name = 'notify';
                        this.label = 'User Notifications';
                        this.locked = false;
                        this.lastError = null;
                        this.isOnline = false;
                        this.isEnabled = false;
                        // Hook the global handlers
                        errorHandlers.ErrorHandlers.logs = $log;
                        errorHandlers.ErrorHandlers.Register(this);
                        errorHandlers.ErrorHandlers.Register(google);
                        errorHandlers.ErrorHandlers.Register(raven);
                    }
                    Object.defineProperty(SampleErrorService.prototype, "enabled", {
                        //get isEnabled(): boolean { return ErrorHandlers.enabled; }
                        //set isEnabled(state: boolean) { ErrorHandlers.enabled = state; }
                        get: function () {
                            return this.isEnabled;
                        },
                        set: function (state) {
                            this.isEnabled = state;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    Object.defineProperty(SampleErrorService.prototype, "errorHandlers", {
                        get: function () {
                            return errorHandlers.ErrorHandlers.ListAll();
                        },
                        enumerable: true,
                        configurable: true
                    });

                    SampleErrorService.prototype.handleException = function (source, ex, tags) {
                        if (!this.isOnline)
                            return;
                        this.$log.log(' - Notifying User: "' + ex.message + '"...');
                        if ('alertify' in window) {
                            window['alertify'].log(source + ': ' + ex.message, 'error', 3000);
                        }
                    };

                    SampleErrorService.prototype.detect = function () {
                        var _this = this;
                        var scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js';
                        try  {
                            // Load required libraries if not defined
                            if ('alertify' in window) {
                                this.isEnabled = true;
                                this.isOnline = true;
                            } else {
                                this.$log.log('Loading: ' + scriptUrl);
                                this.busy = true;
                                $.getScript(scriptUrl, function (data, textStatus, jqxhr) {
                                    _this.$rootScope.$applyAsync(function () {
                                        _this.busy = false;
                                        _this.isEnabled = true;
                                        _this.isOnline = true;
                                    });
                                });
                            }
                        } catch (ex) {
                            this.isOnline = false;
                            this.lastError = ex;
                        }
                        return this.isOnline;

                        try  {
                            // Load required libraries if not defined
                            var url = 'https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js';
                            $.getScript(url).done(function (script, textStatus) {
                                _this.$rootScope.$applyAsync(function () {
                                    _this.isOnline = true;
                                    _this.isEnabled = true;
                                });
                            }).fail(function (jqxhr, settings, exception) {
                                _this.$rootScope.$applyAsync(function () {
                                    _this.isOnline = false;
                                    _this.isEnabled = false;
                                });
                            });
                            this.isOnline = false;
                            this.isEnabled = false;
                        } catch (ex) {
                            this.isOnline = false;
                        }

                        return false;
                    };

                    SampleErrorService.prototype.checkChanged = function (handler) {
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
                    };

                    SampleErrorService.prototype.throwManagedException = function () {
                        var tags = {
                            startedAt: Date.now()
                        };
                        try  {
                            this.$log.info('About to break something...');
                            window['does not exist'].managedSampleError++;
                        } catch (ex) {
                            errorHandlers.HandleException('Managed Sample', ex, tags);
                            this.$log.warn('Exception caught and swallowed.');
                            // throw ex; // this will be caught by the global exception handler
                        }
                    };

                    SampleErrorService.prototype.throwAjaxException = function () {
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
                                    url: "https://wwwx.i.am/missing.html",
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

                        this.$log.info('Throwing AJAX request...');
                        ajaxCfg.current = ajaxCfg.errHttp;
                        ajaxCfg.callError();
                    };

                    SampleErrorService.prototype.throwAngularException = function () {
                        var _this = this;
                        this.$log.info('About to break Angular...');
                        this.$rootScope.$applyAsync(function () {
                            _this.$rootScope.missing.ngSampleError++;
                        });
                    };

                    SampleErrorService.prototype.throwTimeoutException = function () {
                        var _this = this;
                        this.$log.info('Setting timeout...');
                        setTimeout(function () {
                            _this.$log.info('Entering timeout...');
                            window['does not exist'].timeoutSampleError++;
                            _this.$log.info('Exit timeout...');
                        }, 2 * 1000);
                    };

                    SampleErrorService.prototype.attach = function () {
                        var isOnline = this.detect();
                        this.isEnabled = isOnline;
                    };

                    SampleErrorService.prototype.dettach = function () {
                        this.isEnabled = false;
                    };

                    SampleErrorService.prototype.clear = function () {
                        this.appState.logs = [];
                        this.appConfig['errorHandlers']['counts'] = {};
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
                    function LogInterceptor($delegate, appState) {
                        this.$delegate = $delegate;
                        this.appState = appState;
                        this.init();
                    }
                    LogInterceptor.prototype.init = function () {
                        var _this = this;
                        // Intercept messages
                        var show = this.appState.config;
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
                        this.appState.logs.push(itm);
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
                        try  {
                            proto.ng.samples.errorHandlers.HandleException('Angular', exception, {
                                cause: cause
                            });
                        } catch (ex) {
                            this.$log.error.apply(this.$log, ['Critical fault in angular error reporting...', ex]);
                        }
                        if (this.appNode.active) {
                            // ToDo: Hook in some routing or something...
                        }
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
            (function (errorHandlers) {
                function ConfigureProviders($provide, $httpProvider) {
                    // Register http error handler
                    $httpProvider.interceptors.push('errorHttpInterceptor');

                    // Intercept all log messages
                    $provide.decorator('$log', [
                        '$delegate', 'appState', function ($delegate, appState) {
                            // Define the interceptor
                            var interceptor = new proto.ng.samples.errorHandlers.LogInterceptor($delegate, appState);

                            // Return the original delegate
                            return $delegate;
                        }]);
                }
                errorHandlers.ConfigureProviders = ConfigureProviders;
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
]).config([
    'appConfigProvider', function (appConfigProvider) {
        // Configure module
        appConfigProvider.config('errorHandlers', proto.ng.samples.errorHandlers.ErrorHandlers).config('googleConfig', {
            publicKey: 'UA-61791366-1'
        }).config('ravenConfig', {
            publicKey: 'https://e94eaeaab36f4d14a99e0472e85ba289@app.getsentry.com/36391'
        });
    }]).config([
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
    }]).config(['$provide', '$httpProvider', proto.ng.samples.errorHandlers.ConfigureProviders]).factory('$exceptionHandler', [
    '$log', 'appNode', function ($log, appNode) {
        var instance = new proto.ng.samples.errorHandlers.ExceptionHandlerFactory($log, appNode);
        return function (exception, cause) {
            instance.handleException(exception, cause);
        };
    }]).factory('errorHttpInterceptor', [
    '$log', '$q', function ($log, $q) {
        return new proto.ng.samples.errorHandlers.ErrorHttpInterceptor($log, $q);
    }]).service('ravenService', ['$rootScope', '$log', 'appConfig', proto.ng.samples.errorHandlers.raven.RavenService]).service('googleErrorService', ['$rootScope', '$log', 'appConfig', proto.ng.samples.errorHandlers.google.GoogleErrorService]).service('sampleErrorService', ['$rootScope', '$log', 'appConfig', 'appState', 'ravenService', 'googleErrorService', proto.ng.samples.errorHandlers.SampleErrorService]).controller('errorHandlersController', [
    '$rootScope', '$scope', function ($rootScope, $scope) {
        $scope.$watch('appState.logs.length', function () {
            $rootScope.$applyAsync(function () {
            });
        });
    }]).run([
    '$rootScope', function ($rootScope) {
        // Track basic JavaScript errors
        window.addEventListener('error', function (ex) {
            $rootScope.$applyAsync(function () {
                proto.ng.samples.errorHandlers.HandleException('Javascript Error', ex, {
                    cause: 'Unhandled exception',
                    location: ex.filename + ':  ' + ex.lineno
                });
            });
        });

        // Track AJAX errors (jQuery API)
        $(document).ajaxError(function (e, request, settings) {
            $rootScope.$applyAsync(function () {
                var ex = new Error('Problem loading: ' + settings.url);
                proto.ng.samples.errorHandlers.HandleException('Ajax Error', ex, {
                    cause: 'Response Error',
                    location: settings.url,
                    result: e.result
                });
            });
        });
    }]).run([
    '$rootScope', 'sampleErrorService', function ($rootScope, sampleErrorService) {
        angular.extend($rootScope, {
            sampleErrors: sampleErrorService
        });
    }]);
/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (errorHandlers) {
                var ErrorHandlers = (function () {
                    function ErrorHandlers() {
                    }
                    ErrorHandlers.Register = function (handler) {
                        this.list.push(handler);
                    };

                    ErrorHandlers.ListAll = function () {
                        return this.list;
                    };

                    ErrorHandlers.CountErrorType = function (source) {
                        if (source in ErrorHandlers.counts) {
                            ErrorHandlers.counts[source] += 1;
                        } else {
                            ErrorHandlers.counts[source] = 1;
                        }
                    };
                    ErrorHandlers.enabled = true;
                    ErrorHandlers.logs = null;
                    ErrorHandlers.list = [];
                    ErrorHandlers.counts = {};
                    return ErrorHandlers;
                })();
                errorHandlers.ErrorHandlers = ErrorHandlers;

                function HandleException(source, error, tags) {
                    var enabled = ErrorHandlers.enabled;
                    if (enabled) {
                        try  {
                            ErrorHandlers.CountErrorType(source);

                            // Notify all handlers that are enabled
                            ErrorHandlers.ListAll().forEach(function (service) {
                                if (service.isEnabled && service.handleException) {
                                    service.handleException(source, error, tags || {});
                                }
                            });
                        } catch (ex) {
                            // Something went wrong :(
                            console.error('Critical fault in error reporting services...', ex);
                        }
                    }

                    // Display error in the console...
                    var $log = ErrorHandlers.logs || angular.injector(['ng']).get('$log');
                    if ($log)
                        $log.error.apply($log, [source + ': ' + error.message || error, tags]);

                    return enabled;
                }
                errorHandlers.HandleException = HandleException;
            })(samples.errorHandlers || (samples.errorHandlers = {}));
            var errorHandlers = samples.errorHandlers;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
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
    (function (ng) {
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
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
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
                    controller: 'proto.ng.samples.GeoController',
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
    }]).controller('proto.ng.samples.GeoController', [
    '$rootScope',
    '$scope',
    'geoService',
    proto.ng.samples.location.GeoController
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
///<reference path="../../../imports.d.ts"/>
/// <reference path="../../../../typings/firebase/firebase.d.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (samples) {
            (function (_data) {
                var ChanceDataGenerator = (function () {
                    function ChanceDataGenerator($q) {
                        this.$q = $q;
                        this.name = 'chance';
                        this.instance = new Chance();
                    }
                    ChanceDataGenerator.prototype.populate = function (rows, columns) {
                        var deferred = this.$q.defer();

                        if (columns) {
                            var list = [];
                            for (var r = 0; r < rows; r++) {
                                var item = {};
                                for (var col in columns) {
                                    item[col] = this.format(columns[col]);
                                }
                                list.push(item);
                            }
                            deferred.resolve(list);
                        } else {
                            var error = new Error('No column definition was found.');
                            deferred.reject(error);
                        }

                        return deferred.promise;
                    };

                    ChanceDataGenerator.prototype.format = function (input) {
                        var result = null;
                        try  {
                            var match = /(\{)([^\}]+)(\})/i.exec(input);
                            if (match.length > 2) {
                                var name = match[2];
                                var opts = null;
                                if (name in this.instance) {
                                    result = this.instance[name]();
                                } else {
                                    console.debug('Not Found: chance.' + name + '()');
                                }
                            }
                        } catch (ex) {
                            result = null;
                        }
                        return result;
                    };
                    return ChanceDataGenerator;
                })();
                _data.ChanceDataGenerator = ChanceDataGenerator;

                var FillTextGenerator = (function () {
                    function FillTextGenerator($q, appConfig) {
                        this.$q = $q;
                        this.appConfig = appConfig;
                        this.name = 'fillText';
                    }
                    FillTextGenerator.prototype.populate = function (rows, columns) {
                        var list = [];
                        var data = {
                            rows: rows
                        };

                        angular.extend(data, columns);
                        return this.fetch(data);
                    };

                    FillTextGenerator.prototype.fetch = function (data) {
                        var deferred = this.$q.defer();

                        var url = this.appConfig['sampleData'].fillText;
                        if (url) {
                            $.getJSON(url, data).done(function (data) {
                                deferred.resolve(data);
                            }).fail(function (xhr, desc, err) {
                                var error = new Error('Error [' + xhr.status + ']: ' + xhr.statusText + ' - ' + err);
                                deferred.reject(error);
                            });
                        } else {
                            var error = new Error('Config setting "sampleData.fillText" is undefined.');
                            deferred.reject(error);
                        }

                        return deferred.promise;
                    };
                    return FillTextGenerator;
                })();
                _data.FillTextGenerator = FillTextGenerator;

                var SampleDataController = (function () {
                    function SampleDataController($rootScope, $scope, $state, $stateParams, $q, $firebaseAuth, $firebaseObject, $firebaseArray, appConfig) {
                        this.$rootScope = $rootScope;
                        this.$scope = $scope;
                        this.$state = $state;
                        this.$stateParams = $stateParams;
                        this.$q = $q;
                        this.$firebaseAuth = $firebaseAuth;
                        this.$firebaseObject = $firebaseObject;
                        this.$firebaseArray = $firebaseArray;
                        this.appConfig = appConfig;
                        this.init();
                    }
                    SampleDataController.prototype.init = function () {
                        var _this = this;
                        // Create random data generators
                        this._generators = [
                            new ChanceDataGenerator(this.$q),
                            new FillTextGenerator(this.$q, this.appConfig)
                        ];

                        // Set up firebase
                        var baseUrl = this.appConfig['sampleData'].dataUrl;
                        if (baseUrl) {
                            this.busy = true;
                            this.OnlineConn = new Firebase(baseUrl + '/OnlineSamples');
                            this.OnlineData = this.$firebaseArray(this.OnlineConn);
                            this.OnlineData.$loaded().then(function () {
                                console.log(' - Online Data Loaded: ', _this.OnlineData);
                            }).catch(function (err) {
                                _this.error = err;
                            }).finally(function () {
                                _this.$rootScope.$applyAsync(function () {
                                    _this.busy = false;
                                });
                            });
                        } else {
                            this.error = new Error('Config setting "sampleData.dataUrl" is undefined.');
                        }
                    };

                    SampleDataController.prototype.authenticate = function (type) {
                        var _this = this;
                        if (typeof type === "undefined") { type = null; }
                        this.$firebaseAuth(this.OnlineConn).$authWithOAuthPopup(type).then(function (authData) {
                            console.log("Logged in as:" + authData.uid, authData);
                            if (!_this.OnlineData.length) {
                                _this.createSamples();
                            }
                            _this._new = {
                                name: authData.uid,
                                args: [],
                                rows: 10
                            };
                        }).catch(function (error) {
                            _this.error = error;
                            console.warn("Authentication failed:", error);
                        });
                    };

                    SampleDataController.prototype.createSamples = function () {
                        var _this = this;
                        // Define default profiles
                        if (this.appConfig['sampleData'].defaults) {
                            this.appConfig['sampleData'].defaults.forEach(function (itm) {
                                _this.addProfile(itm);
                            });
                        }
                    };

                    SampleDataController.prototype.test = function () {
                        var _this = this;
                        var deferred = this.$q.defer();
                        try  {
                            // Set busy flag
                            this.busy = true;
                            this.edit = false;

                            var data = [];
                            var rows = this.context.rows;
                            for (var r = 0; r < rows; r++) {
                                data.push({ $id: r });
                            }

                            // Build a map of generators
                            var gens = [];
                            this.context.args.forEach(function (item) {
                                if (!item.val)
                                    return;
                                gens[item.type] = gens[item.type] || {};
                                gens[item.type][item.id] = item.val;
                            });

                            // Fetch the sample data
                            var promises = [];
                            this._generators.forEach(function (gen) {
                                if (gen.name in gens) {
                                    var deferred = gen.populate(rows, gens[gen.name]).then(function (res) {
                                        var i = 0;
                                        if (!res || !res.length)
                                            return;
                                        while (i < res.length && i < data.length) {
                                            angular.extend(data[i], res[i]);
                                            i++;
                                        }
                                    }).catch(function (error) {
                                        console.error(' - Error: ' + gen.name, error);
                                    });

                                    promises.push(deferred);
                                }
                            });

                            // Wait for results, then stitch them together
                            this.$q.all(promises).finally(function () {
                                deferred.resolve(data);
                                _this.$rootScope.$applyAsync(function () {
                                    _this.context.resp = data;
                                    _this.OnlineData.$save(_this.context);
                                    _this.busy = false;
                                });
                            });
                        } catch (ex) {
                            this.error = ex;
                            deferred.reject(ex);
                        }

                        return deferred.promise;
                    };

                    SampleDataController.prototype.addNew = function (item) {
                        var _this = this;
                        if (!item || !item.name)
                            return;
                        return this.addProfile(item).then(function () {
                            _this._new = null;
                        });
                    };

                    SampleDataController.prototype.addProfile = function (profile) {
                        var _this = this;
                        return this.OnlineData.$add(profile).then(function () {
                            _this.edit = true;
                            _this.context = profile;
                        });
                    };

                    SampleDataController.prototype.updateProfile = function (profile, autoUpdate) {
                        var _this = this;
                        if (typeof autoUpdate === "undefined") { autoUpdate = false; }
                        return this.OnlineData.$save(profile).then(function () {
                            if (autoUpdate) {
                                _this.$rootScope.$applyAsync(function () {
                                });
                                return _this.test();
                            }
                        });
                    };

                    SampleDataController.prototype.removeProfile = function (profile) {
                        return this.OnlineData.$remove(profile);
                    };

                    SampleDataController.prototype.clearData = function (profile) {
                        profile.resp = null;
                        return this.OnlineData.$save(profile);
                    };

                    SampleDataController.prototype.addColumn = function (profile, item) {
                        profile.args = profile.args || [];
                        profile.args.push(item);
                        return this.OnlineData.$save(profile);
                    };

                    SampleDataController.prototype.updateColumn = function (profile, item) {
                        profile.args = profile.args || [];
                        profile.args.push(item);
                        return this.OnlineData.$save(profile);
                    };

                    SampleDataController.prototype.removeColumn = function (profile, item) {
                        profile.args = profile.args || [];
                        profile.args.splice(this.context.args.indexOf(item), 1);
                        if (profile.args.length == 0)
                            profile.resp = null;
                        return this.OnlineData.$save(profile);
                    };
                    return SampleDataController;
                })();
                _data.SampleDataController = SampleDataController;
            })(samples.data || (samples.data = {}));
            var data = samples.data;
        })(ng.samples || (ng.samples = {}));
        var samples = ng.samples;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="../../../typings/firebase/firebase.d.ts" />
/// <reference path="controllers/SampleDataController.ts" />
angular.module('prototyped.ng.samples.sampleData', [
    'firebase'
]).config([
    'appConfigProvider', function (appConfigProvider) {
        appConfigProvider.config('sampleData', {
            enabled: appConfigProvider.getPersisted('sampleData.enabled') == '1',
            dataUrl: 'https://dazzling-heat-2165.firebaseio.com',
            fillText: 'http://www.filltext.com/?delay=0&callback=?',
            defaults: [
                {
                    name: 'Person Data',
                    rows: 10,
                    args: [
                        { id: 'id', val: '{number}', type: 'fillText' },
                        { id: 'username', val: '{username}', type: 'fillText' },
                        { id: 'firstname', val: '{firstName}', type: 'fillText' },
                        { id: 'lastname', val: '{lastName}', type: 'fillText' },
                        { id: 'email', val: '{email}', type: 'fillText' },
                        { id: 'mobile', val: '{phone|format}', type: 'fillText' },
                        { id: 'active', val: '{bool|n}', type: 'fillText' }
                    ]
                },
                {
                    name: 'Company Info',
                    rows: 10,
                    args: [
                        { id: 'business', val: '{business}', type: 'fillText' },
                        { id: 'city', val: '{city}', type: 'fillText' },
                        { id: 'contact', val: '{firstName}', type: 'fillText' },
                        { id: 'tel', val: '{phone|format}', type: 'fillText' }
                    ]
                },
                {
                    name: 'Product Info',
                    rows: 10,
                    args: [
                        { id: 'id', val: '{number}', type: 'fillText' },
                        { id: 'name', val: '{lorem|2}', type: 'fillText' },
                        { id: 'desc', val: '{lorem|20}', type: 'fillText' },
                        { id: 'type', val: '{number|10000}', type: 'fillText' },
                        { id: 'category', val: '{ccType|abbr}', type: 'fillText' },
                        { id: 'created', val: '{date|1-1-1990,1-1-2050}', type: 'fillText' },
                        { id: 'active', val: '{bool|n}', type: 'fillText' }
                    ]
                }
            ]
        });
    }]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('samples.sampleData', {
            url: '/sampleData',
            views: {
                'left@': { templateUrl: 'samples/left.tpl.html' },
                'main@': {
                    templateUrl: 'samples/sampleData/main.tpl.html',
                    controller: 'sampleDataController',
                    controllerAs: 'sampleData'
                }
            }
        });
    }]).controller('sampleDataController', [
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$q',
    '$firebaseAuth',
    '$firebaseObject',
    '$firebaseArray',
    'appConfig',
    proto.ng.samples.data.SampleDataController
]);
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
    'prototyped.ng.samples.notifications',
    'prototyped.ng.samples.compression',
    'prototyped.ng.samples.styles3d'
]).config([
    'appStateProvider', function (appStateProvider) {
        // Define module routes
        appStateProvider.config('prototyped.ng.samples', {
            active: true
        }).define('samples', {
            state: {
                url: '/samples',
                abstract: true
            },
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
    '<div id=CompressionView class=container style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a class="btn btn-default" href="" ng-click=compression.clearResult() ng-if=compression.ready>Cancel</a> <a class="btn btn-default" ng-class="{ \'btn-primary\': !compression.ready && compression.text.length }" href="" ng-click=compression.compressText(compression.text) ng-disabled=!compression.text.length>Compress Text</a> <a id=runAsScript ng-disabled=!compression.ready class="btn btn-default" ng-class="{ \'btn-primary\': compression.ready }">Run As Script</a></span><h4>Dynamic Compression <small>Encode strings and urls into more compact forms.</small></h4><hr><div><div class=row><div class=col-md-6><div class="btn-group pull-right"><select ng-model=compression.sampleUrl ng-disabled=compression.busy><option value="">- Custom Text -</option><option value=assets/lib/screen.js>JavaScript #1</option><option value=assets/lib/prototyped.ng.js>JavaScript #2</option><option value=assets/css/app.min.css>CSS Styles #1</option><option value=assets/css/prototyped.min.css>CSS Styles #2</option></select></div><h5>Enter text to compress: <small ng-if=compression.text.length>{{ compression.text.length | toBytes }}, uncompressed</small></h5></div><div class=col-md-6><span class=pull-right>Use Compression:<select ng-model=compression.target ng-disabled=compression.busy><option value="">default</option><option value=lzw>lzw</option><option value=scsu>scsu</option><option value=html>html</option><option value=base64>base64</option></select></span><h5>Compressed Text: <small ng-if=compression.result.length>{{ compression.result.length | toBytes }}</small> <small ng-if="!compression.busy && compression.result.length">, {{ compression.getPercentage() | number:2 }}% reduction</small></h5></div></div><div class=row ng-if=compression.busy><div class=col-md-12><div class="active progress progress-striped"><div ng:init="progA = 1.0" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 class=progress-bar ng-class="\'progress-bar-info\'" ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"><span>Busy...</span></div></div></div></div><div class=row ng-if="!compression.busy && !compression.text.length"><div class=col-md-12><div class=progress><div style="text-align: center"><em>Enter some text to start...</em></div></div></div></div><div class=row ng-if="!compression.busy && compression.text.length && (compression.result.length < compression.text.length)"><div class=col-md-12><div class="progress progress-striped"><div class=progress-bar ng-class="\'progress-bar-primary\'" ng:init="progA = (compression.result.length / compression.text.length)" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"><span ng-if="progA > 0">{{ (100 * progA) | number:2 }}%</span></div></div></div></div><div class=row ng-if="!compression.busy && compression.text.length && compression.result.length > compression.text.length"><div class=col-md-12><div class="progress progress-striped"><div class=progress-bar ng-class="\'progress-bar-warning\'" ng:init="progA = 1.0 * compression.text.length / compression.result.length" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"><span ng-if="progA > 0">{{ (compression.text.length) | toBytes }}, 100%</span></div><div class=progress-bar ng-class="\'progress-bar-danger\'" ng:init="progB = 1.0 - compression.text.length / compression.result.length" role=progressbar aria-valuenow="{{ progB }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progB) + \'%\'}" aria-valuetext="{{ (100.0 * progB) + \' %\' }}%"><span ng-if="progB > 0">{{ (compression.result.length - compression.text.length) | toBytes }}, {{ 100.0 * (compression.result.length - compression.text.length) / (1.0 * compression.text.length) | number:2 }}%</span></div></div></div></div><div class=row><div class=col-md-6><textarea ng-model=compression.text ng-disabled="compression.busy || compression.result" style="width: 100%; min-height: 480px" placeholder="Enter some text here..."></textarea></div><div class=col-md-6><textarea ng-model=compression.result ng-disabled="compression.busy || !compression.result" style="width: 100%; min-height: 480px" readonly></textarea></div></div></div><hr><div ng:if=compression.error class="alert alert-danger"><b>Error:</b> {{ compression.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/decorators/dialogs/interceptor.tpl.html',
    '<div class=modal-body style="min-height: 180px; padding: 6px"><ul class="nav nav-tabs"><li role=presentation ng-class="{ \'active\' : (modalAction == \'req\') }"><a href="" ng-click="modalAction = \'req\'">Request Details</a></li><li role=presentation ng-class="{ \'active\' : (modalAction == \'resp\') }"><a href="" ng-click="modalAction = \'resp\'">Return Result</a></li></ul><div class=thumbnail style="border-top: none; margin-bottom: 0; border-top-left-radius: 0; border-top-right-radius: 0"><form ng-switch=modalAction style="margin-top: 6px"><div ng-if=statusMsg class="alert alert-warning" style="padding: 8px; margin: 0">{{ statusMsg }}</div><div ng-switch-default class=docked><em class=text-muted style="padding: 6px; margin: 50px auto">Select an action to start with...</em></div><div ng-switch-when=req><h5>Request Details <small>More about the source</small></h5><p>...</p></div><div ng-switch-when=resp><h5>Result Returned <small ng-if=!status class="text-danger pull-right"><i class="fa fa-close"></i> Rejected</small> <small ng-if=status class="text-success pull-right"><i class="fa fa-check"></i> Responded</small></h5><div class="input-group input-group-sm"><span class=input-group-addon id=sizing-addon3>Type</span> <input class=form-control ng-value=getType() ng-readonly=true placeholder=undefined aria-describedby=sizing-addon3> <span class=input-group-btn><button type=button ng-disabled=true class="btn btn-default dropdown-toggle" data-toggle=dropdown aria-expanded=false>Edit <span class=caret></span></button><ul class="dropdown-menu dropdown-menu-right" role=menu><li><a href=#>Accepted Reply</a></li><li><a href=#>Rejection Reason</a></li><li class=divider></li><li><a href=#>Reset to Defaults</a></li></ul></span></div><textarea ng-class="{ \'alert alert-danger\':!getStatus(), \'alert alert-success\':getStatus() }" ng-readonly=true ng-bind=getBody() style="width: 100%; min-height: 160px; margin:0"></textarea><div class=input-group><div ng-click=setToggle(!allowEmpty) style="padding-left: 8px"><i class=fa ng-class="{ \'fa-check\':allowEmpty, \'fa-close\':!allowEmpty }"></i> <span>Allow empty value as return value</span></div></div></div></form></div></div><div class=modal-footer><button id=btnCancel ng-disabled="!allowEmpty && !rejectValue" class="btn btn-danger pull-left" ng-click=cancel()>Reject Action</button> <button id=btnUpdate ng-disabled="!allowEmpty && !promisedValue" class="btn btn-success pull-right" ng-click=ok()>Complete Action</button></div>');
  $templateCache.put('samples/decorators/main.tpl.html',
    '<div id=DecoratorView class=container style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css rel="stylesheet"><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input bs:switch type=checkbox ng:model=appConfig.decorators.enabled switch:size=mini switch:label="Patch Promises" switch:inverse="false"> <input bs:switch type=checkbox ng:model=appConfig.decorators.xhttp switch:size=mini switch:label="Intercep HTTP" switch:inverse="false"> <input bs:switch type=checkbox ng:model=appConfig.decorators.debug switch:size=mini switch:label=Debug switch:inverse="false"></span><h4>Service Decorators <small>Monkey patching the normal behaviour of your application.</small></h4><hr><div class=row><div class=col-md-6><p><a href="" class="btn btn-default" ng-class="{ \'btn-success\': (decorators.confirmStatus === true), \'btn-danger\': (decorators.confirmStatus === false), \'btn-primary\': appConfig.decorators.enabled }" ng-click=decorators.runPromiseAction()>Run Promised Action</a> <a class="btn btn-default" ng-click=decorators.fcall() xxx-ng-disabled=!appConfig.decorators.enabled ng-class="{ \'btn-success\': decorators.fcallState == \'Resolved\', \'btn-danger\': decorators.fcallState == \'Rejected\', \'btn-primary\':appConfig.decorators.enabled }" href="">Invoke Timeout</a> <a class="btn btn-default" href="" ng-click=decorators.triggerAjaxRequest() xxx-ng-disabled=!appConfig.decorators.enabled ng-class="{ \'btn-success\': decorators.ajaxStatus === true, \'btn-danger\': decorators.ajaxStatus === false, \'btn-primary\': appConfig.decorators.xhttp }">HTML Ajax Request</a></p><p>By making use of angular\'s <a href=https://docs.angularjs.org/api/auto/service/$provide>$provide decorators</a>, we patch the <a href=https://docs.angularjs.org/api/ng/service/$q>$q service</a> to intercept any promised actions and take over the reply mechanism.</p><p>After the initial investigation, it quickly became clear there are just way too many promises to intercept and keep track of, many of them in the angular framework itself. A mechanism was required to identify (and filter out) the promises we were looking for.</p><p>With no <em>real</em> unique identifiers to work with, stack traces are used for tracking identity. In javascript, stack traces are ugly, and not always helpful, but with a little bit of regular expressions, enough sensible info can be extracted to get a picture of <em>where</em> the actions originate from. And this opens up a whole new world of oppertunities...</p><div ng-if="decorators.lastStatus === undefined || decorators.lastStatus === null"><h5>Inspired by these blogs:</h5><ul class="alert alert-info" style="list-style: none"><li><a target=_blank href=http://www.bennadel.com/blog/2775-monkey-patching-the-q-service-using-provide-decorator-in-angularjs.htm><i class="fa fa-external-link-square"></i> This experiment was inspired by this blog</a></li><li><a target=_blank href=http://www.codeovertones.com/2011/08/how-to-print-stack-trace-anywhere-in.html><i class="fa fa-external-link-square"></i> The idea to use stack traces was inspired from here</a></li></ul></div><div ng-if="decorators.lastStatus === true || decorators.lastStatus === false"><h5>Last event status and result:</h5><div ng:if=decorators.error class="alert alert-danger"><b>Error:</b> {{ decorators.error.message || \'Something went wrong.\' }}</div><div ng:if=!decorators.error><div class="alert alert-success" ng-if="decorators.lastStatus === true"><b>Accepted:</b> {{ decorators.lastResult || \'No additional information specified.\' }}</div><div class="alert alert-danger" ng-if="decorators.lastStatus === false"><b>Rejected:</b> {{ (decorators.lastResult.message || decorators.lastResult) || \'No additional information specified.\' }}</div></div></div></div><div class=col-md-6><pre ng:if=decorators.ajaxResult>{{ decorators.ajaxResult }}</pre><div ng:if=!decorators.ajaxResult class=inactive-fill-text style="border: dotted 1px silver; padding: 100px 0"><div ng-if="decorators.lastStatus === undefined || decorators.lastStatus === null"><em>No result yet</em></div><div class="glow-green text-hudge" ng-if="decorators.lastStatus === true"><i class="fa fa-check"></i> <b>Accepted</b></div><div class="glow-red text-hudge" ng-if="decorators.lastStatus === false"><i class="fa fa-close"></i> <b>Rejected</b></div></div></div></div></div></div></div>');
  $templateCache.put('samples/errorHandlers/main.tpl.html',
    '<div ng:cloak class=container style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link rel=stylesheet resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.core.css"><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.default.min.css"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js></script><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input type=checkbox ng:show="sampleErrors.result !== null" ng:model=appConfig.errorHandlers.enabled bs:switch switch:size=mini switch:inverse=true></span><h4>Exception Handling <small>Error reporting and client-side exception handling</small></h4><hr><div class=row><div class=col-md-3><div><h5>Throw Exceptions</h5><ul class=list-group><li class=list-group-item><a href="" ng-click=sampleErrors.throwManagedException()><span class="badge pull-right" ng-if="appConfig.errorHandlers.counts[\'Managed Sample\']">{{ appConfig.errorHandlers.counts[\'Managed Sample\'] }}</span> <i class="fa fa-exclamation glow-red"></i>&nbsp; Catch Managed Error</a></li><li class=list-group-item><a href="" ng-click=sampleErrors.throwAjaxException()><span class="badge pull-right" ng-if="appConfig.errorHandlers.counts[\'Ajax Error\']">{{ appConfig.errorHandlers.counts[\'Ajax Error\'] }}</span> <i class="fa fa-exclamation glow-red"></i>&nbsp; Create Ajax Error</a></li><li class=list-group-item><a href="" ng-click=sampleErrors.throwAngularException()><span class="badge pull-right" ng-if="appConfig.errorHandlers.counts[\'Angular\']">{{ appConfig.errorHandlers.counts[\'Angular\'] }}</span> <i class="fa fa-exclamation glow-red"></i>&nbsp; AngularJS Error</a></li><li class=list-group-item><a href="" ng-click=sampleErrors.throwTimeoutException()><i class="fa fa-exclamation glow-red"></i>&nbsp; Timeout Error</a></li><li class=list-group-item><a href="" onclick=sampleError.dontExist++><span class="badge pull-right" ng-if="appConfig.errorHandlers.counts[\'Javascript Error\']">{{ appConfig.errorHandlers.counts[\'Javascript Error\'] }}</span> <i class="fa fa-exclamation glow-red"></i>&nbsp; Unhandled Exception</a></li></ul></div></div><div class=ellipsis style="overflow: hidden" ng-class="{ \'col-md-6\':appConfig.errorHandlers.enabled, \'col-md-9\': !appConfig.errorHandlers.enabled }"><div><span class=pull-right style="padding: 3px"><a href="" ng-click="">Refresh</a> | <a href="" ng-click=sampleErrors.clear()>Clear</a></span><h5>Event Logs</h5><table class="table table-hover table-condensed"><thead><tr><th style="width: 80px">Time</th><th style="width: 64px">Type</th><th>Description</th></tr></thead><tbody><tr ng-if=!appState.logs.length><td colspan=3><em>No events have been logged...</em></td></tr><tr ng-repeat="row in appState.logs" ng-class="{ \'text-info inactive-gray\':row.type==\'debug\', \'text-info\':row.type==\'info\', \'text-warning glow-orange\':row.type==\'warn\', \'text-danger glow-red\':row.type==\'error\' }"><td>{{ row.time | date:\'hh:mm:ss\' }}</td><td>{{ row.type }}</td><td class=ellipsis style="width: auto; overflow: hidden">{{ row.desc }}</td></tr></tbody></table></div><div ng-if=!appState.logs.length><h5>Inspired by these blogs:</h5><ul class="alert alert-info" style="list-style: none"><li><a target=_blank href=http://www.davecap.com/post/46522098029/using-sentry-raven-js-with-angularjs-to-catch><i class="fa fa-external-link-square"></i> http://www.davecap.com</a></li><li><a target=_blank href=http://bahmutov.calepin.co/catch-all-errors-in-angular-app.html><i class="fa fa-external-link-square"></i> http://bahmutov.calepin.co</a></li><li><a target=_blank href=http://davidwalsh.name/track-errors-google-analytics><i class="fa fa-external-link-square"></i> http://davidwalsh.name</a></li></ul></div></div><div ng-class="{ \'col-md-3\':appConfig.errorHandlers.enabled, \'hide\': !appConfig.errorHandlers.enabled }"><div><h5>Exception Handlers</h5><form class=thumbnail><div style="padding: 0 8px"><div class=checkbox ng:class="{ \'inactive-gray\': !handler.enabled && handler.locked }" ng:repeat="handler in sampleErrors.errorHandlers"><label><input type=checkbox ng-disabled=handler.locked ng-checked=handler.enabled ng-click=sampleErrors.checkChanged(handler)> <span ng-if=!handler.busy><strong ng:if=handler.enabled>{{ handler.label }}</strong> <span ng:if=!handler.enabled>{{ handler.label }}</span></span> <span ng-if=handler.busy><i class="fa fa-spinner fa-spin"></i> <em>Loading third-party scripts...</em></span></label></div></div></form></div><div ng:if="sampleErrors.google.isEnabled && !sampleErrors.google.handler.busy"><span class=pull-right style="padding: 3px"><b ng:if=sampleErrors.google.isOnline class=glow-green>Online</b> <b ng:if=!sampleErrors.google.isOnline class=glow-red>Offline</b></span><h5>Google Analytics</h5><div style="padding: 0 8px"><div ng-show=sampleErrors.google.isOnline><a href="" class=pull-right ng:click="sampleErrors.google.isOnline = false;"><i class="glyphicon glyphicon-remove"></i></a><div class=ellipsis><b>Public Key:</b> <a class=inactive-text>{{ sampleErrors.google.config.publicKey }}</a></div></div><form class=form-inline role=form ng-show=!sampleErrors.google.isOnline><div class=form-group><label for=sentryKey>Google API key (required)</label><div class=input-group><input class="form-control input-sm" id=googleKey ng:model=sampleErrors.google.config.publicKey placeholder=UA-XXXX-Y><div class=input-group-btn><a class="btn btn-sm btn-default" ng-class="{ \'btn-danger\': sampleErrors.google.lastError, \'btn-primary\': sampleErrors.google.config.publicKey, \'btn-default\': !sampleErrors.google.config.publicKey }" ng-disabled=!sampleErrors.google.config.publicKey ng-click=sampleErrors.google.connect(sampleErrors.google.config.publicKey)>Set</a></div></div></div></form><br><div class="alert alert-danger" ng-if="!sampleErrors.google.isOnline && sampleErrors.google.lastError">{{ sampleErrors.google.lastError.message }}</div></div></div><div ng:if="sampleErrors.raven.isEnabled && !sampleErrors.raven.handler.busy"><span class=pull-right style="padding: 3px"><b ng:if=sampleErrors.raven.isOnline class=glow-green>Online</b> <b ng:if=!sampleErrors.raven.isOnline class=glow-red>Offline</b></span><h5>Sentry and RavenJS</h5><div style="padding: 0 8px"><div ng-show=sampleErrors.raven.isOnline><a href="" class=pull-right ng:click="sampleErrors.raven.isOnline = false;"><i class="glyphicon glyphicon-remove"></i></a><div class=ellipsis><b>Public Key:</b> <a ng-href="{{ sampleErrors.raven.config.publicKey }}" target=_blank class=inactive-text>{{ sampleErrors.raven.config.publicKey }}</a></div></div><form class=form-inline role=form ng-show=!sampleErrors.raven.isOnline><div class=form-group><label for=sentryKey>Sentry public key (required)</label><div class=input-group><input class="form-control input-sm" id=sentryKey ng:model=sampleErrors.raven.config.publicKey placeholder="https://<-key->@app.getsentry.com/12345"><div class=input-group-btn><a class="btn btn-sm btn-default" ng-class="{ \'btn-danger\': sampleErrors.raven.lastError, \'btn-primary\': sampleErrors.raven.config.publicKey, \'btn-default\': !sampleErrors.raven.config.publicKey }" ng-disabled=!sampleErrors.raven.config.publicKey ng-click=sampleErrors.raven.connect(sampleErrors.raven.config.publicKey)>Set</a></div></div></div></form><br><div class="alert alert-danger" ng-if="!sampleErrors.raven.isOnline && sampleErrors.raven.lastError">{{ sampleErrors.raven.lastError.message }}</div><div class="alert alert-info" ng-if="!sampleErrors.raven.isOnline && !sampleErrors.raven.lastError"><a target=_blank href="https://www.getsentry.com/welcome/">Sentry</a> is a third party online service used to track errors. <a target=_blank href="http://raven-js.readthedocs.org/en/latest/">RavenJS</a> is used on the client-side to catch and send events on to Sentry.</div></div></div></div></div></div></div></div>');
  $templateCache.put('samples/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=samples.info><i class=fa ng-class="{ \'fa-refresh glow-blue animate-glow\': samples.busy, \'fa-cubes glow-green\': !samples.busy, \'fa-warning glow-red animate-glow\': samples.error }"></i>&nbsp; Samples Home Page</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.notifications><i class="fa fa-comment"></i> Web Notifications</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.errors><i class="fa fa-life-ring"></i> Exception Handlers</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.compression><i class="fa fa-file-archive-o"></i> Dynamic Encoders</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.sampleData><i class="fa fa-gears"></i> Online Sample Data</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.decorators><i class="fa fa-plug"></i> Service Decorators</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.location><i class="fa fa-crosshairs"></i> Geo Location Tracking</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.styles3d><i class="fa fa-codepen"></i> Exploring Styles 3D</a></li></ul>');
  $templateCache.put('samples/location/views/aside.tpl.html',
    '<ul class="nav nav-list ng-cloak"><li><h5>Current Location</h5><div class=thumbnail><div class="row nav-label"><span class=col-sm-3>Status</span> <b class=col-sm-9 ng-class="{\'text-success\' : position.coords, \'text-inactive\' : client || position.isBusy, \'text-error\':position.failed, \'text-danger\' : !client && !position.coords && !position.failed && !position.isBusy }"><i class=glyphicon ng-class="{\'glyphicon-ok\' : position.coords, \'glyphicon-refresh\' : position.isBusy, \'glyphicon-exclamation-sign\' : !position.coords && !position.isBusy }"></i> {{ geoCtrl.getStatus() }}</b></div><div class="row nav-label" ng-show=position.coords><span class=col-sm-3>Long</span> <b class=col-sm-9>{{ position.coords.longitude | longitude }}</b></div><div class="row nav-label" ng-show=position.coords><span class=col-sm-3>Latt</span> <b class=col-sm-9>{{ position.coords.latitude | latitude }}</b></div><div class="row nav-label" ng-show=position.coords.accuracy><span class=col-sm-3>Accuracy</span> <b class=col-sm-9>{{ position.coords.accuracy | formatted:\'{0} meters\' || \'n.a.\' }}</b></div></div></li><li ng-if=geoCtrl.hasSamples()><h5>Popular Locations</h5><div class=thumbnail><div ng-repeat="loc in geoCtrl.getSamples()"><a href="" ng-click=geoCtrl.setGeoPoint(loc)><i class="glyphicon glyphicon-screenshot"></i> <span class=nav-label>{{ loc.Label }}</span></a></div></div></li><li ng-show="(client || position)"><h5>Additional Info</h5><div class=thumbnail><div class="row nav-label" ng-show=client.country><div class=col-sm-3>Country</div><b class="col-sm-9 ellipse">{{ client.country }}</b></div><div class="row nav-label" ng-show=client.city><div class=col-sm-3>City</div><b class="col-sm-9 ellipse">{{ client.city }}</b></div><div class="row nav-label" ng-show=client.ip><div class=col-sm-3>TCP/IP</div><b class="col-sm-9 ellipse">{{ client.ip }}</b></div><div class="row nav-label" ng-show=position.timestamp><span class=col-sm-3>Updated</span> <b class="col-sm-9 ellipse">{{ position.timestamp | date:\'HH:mm a Z\' || \'n.a.\' }}</b></div><div class="row nav-label" ng-show=position.coords.speed><span class=col-sm-3>Speed</span> <b class="col-sm-9 ellipse">{{ position.coords.speed | formatted:\'{0} m/s\' }}</b></div><div class="row nav-label" ng-show=position.coords.altitude><span class=col-sm-3>Altitude</span> <b class="col-sm-9 ellipse">{{ position.coords.altitude | formatted:\'{0} meters\' }}</b></div><div class="row nav-label" ng-show=position.coords.heading><span class=col-sm-3>Heading</span> <b class="col-sm-9 ellipse">{{ position.coords.heading | formatted:\'{0}°\' }}</b></div></div></li></ul>');
  $templateCache.put('samples/location/views/main.tpl.html',
    '<div class=container style="width: 100%"><div class=row><div class="col-lg-9 col-md-12 info-overview"><h5 class=page-header style="margin: 0">Geo Location <small>Find your current position on the globe.</small></h5><div ng-include="\'samples/location/views/status.tpl.html\'"></div><div id=map-canvas class="panel-contents dock-vert" style="min-height: 520px" ng-hide=isActive><div class=docked style="min-width: 640px; min-height: 480px">...</div></div></div><div class="col-lg-3 hidden-md"><div ng-include="\'samples/location/views/aside.tpl.html\'"></div></div></div></div>');
  $templateCache.put('samples/location/views/status.tpl.html',
    '<div class=alert role=alert style="margin: 0; padding: 3px; border-radius:0" ng-class="{ \'alert-danger\':position.failed, \'alert-info\': position.isBusy, \'alert-success\': position.coords, \'alert-warning\': !position }" ng-show=!geoCtrl.hideStatus><a href="" style="color: #000; text-decoration: none" class=pull-right data-dismiss=alert><i class="glyphicon glyphicon-remove" aria-hidden=true></i></a> <a href="" style="color: #000; text-decoration: none" ng-click=geoCtrl.getPosition()><i class=glyphicon ng-class="{ \'glyphicon-eye-close\':position.failed, \'glyphicon-refresh\': position.isBusy, \'glyphicon-ok\': position.coords, \'glyphicon-eye-open\': !position }"></i> <span ng-if="!position && !client">Locating your current position...</span> <span ng-if="!position.failed && !position.coords && !position.isBusy && client"><b>Please Note:</b> Tracking you (passively) via your IP address. <em>Click here for a more accurate position.</em></span> <span ng-if="!position.failed && !position.coords && position.isBusy"><b>Requesting:</b> Please accept or discard the request for your current location...</span> <span ng-if=position.failed><b>Warning:</b> You declined to share your location info, passively tracking your IP address...</span> <span ng-if=position.coords><b>Success:</b> Current position found via browser. Processing info...</span></a></div>');
  $templateCache.put('samples/main.tpl.html',
    '<div class=container style="width: 100%"><div class=row><div class=col-md-12><h4>Prototyped Sample Code <small>Beware, code monkeys at play... ;)</small></h4><hr><div ui:view=body><div class=list-group><a ui:sref=samples.notifications class=list-group-item><h4 class=list-group-item-heading>Web Notifications</h4><p class=list-group-item-text>Exploring ways to interact with the user, including different ways and states. Notifications on the web and directly into your native OS.</p></a> <a ui:sref=samples.errors class=list-group-item><h4 class=list-group-item-heading>Exception Handlers</h4><p class=list-group-item-text>Because we all know how annoying errors can be. This is a pro-active look at how to catch, manage and report exceptions on remote clients.</p></a> <a ui:sref=samples.compression class=list-group-item><h4 class=list-group-item-heading>Dynamic Encoders</h4><p class=list-group-item-text>Investigating the different ways to encode and/or compress text on the fly. Interactive metrics show compression ratios and performace.</p></a> <a ui:sref=samples.sampleData class=list-group-item><h4 class=list-group-item-heading>Online Sample Data</h4><p class=list-group-item-text>Directly from the cloud! Create mocked sample data on the fly, for free and in whatever way you want it. Supplied by www.filltext.com</p></a> <a ui:sref=samples.decorators class=list-group-item><h4 class=list-group-item-heading>Service Decorators</h4><p class=list-group-item-text>Researching ways to intercept and decorate existing services for built-in and third-party application functionality.</p></a> <a ui:sref=samples.location class=list-group-item><h4 class=list-group-item-heading>Geo Location Tracking</h4><p class=list-group-item-text>So how much geo locational info can your browser give? Lets check, includes passive geo locational tracking by doing a reverse lookup of your IP address.</p></a> <a ui:sref=samples.styles3d class=list-group-item><h4 class=list-group-item-heading>Exploring Styles 3D</h4><p class=list-group-item-text>Modern browsers with CSS3 capabilities come with some pretty impressive new features. Hardware accelerated graphics for smooth animations and rendering.</p></a></div></div><hr></div></div></div>');
  $templateCache.put('samples/notifications/main.tpl.html',
    '<div id=NotificationView class=container style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link rel=stylesheet resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.core.css"><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.default.min.css"><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input type=checkbox ng:show="notify.ready !== null" ng:model=notify.enabled bs:switch switch:size=mini switch:inverse=true></span><h4>{{ notify.isPatched() ? \'Desktop\' : \'Browser\' }} Notifications <small>Various mechanisms of user notification in HTML5.</small></h4><hr><p ng-show="notify.ready === null"><em><i class="fa fa-spinner fa-spin"></i> <b>Requesting Access:</b> Desktop notifications...</em> <span><a href="" ng-click="notify.ready = false">cancel</a></span></p><div ng-show="notify.ready !== null" class=row><div class=col-md-3><div><h5>Notification Types</h5><div class=thumbnail><div style="padding: 0 8px"><div class=radio ng-class="{ \'inactive-gray\': !method.enabled() }" ng-repeat="method in methods"><label><input type=radio name=optionsMethods id=option_method_{{method.name}} value="{{ method.name }}" ng-disabled=!method.enabled() ng-click="notify.current = method" ng-checked="notify.current.name == method.name"> <span ng-if="(notify.current.name != method.name)">{{ method.label }}</span> <strong ng-if="(notify.current.name == method.name)">{{ method.label }}</strong></label></div></div></div></div><div ng-show="notify.current.name == \'notify\'"><h5>Message Styling</h5><form class=thumbnail><div class=form-group><label for=exampleIcon>Icon File</label><input type=file id=exampleIcon><p class=help-block>Image to display with message.</p></div></form></div></div><div ng-class="{ \'col-md-6\':notify.enabled, \'col-md-9\': !notify.enabled }"><h5>Create a new message</h5><form class=thumbnail ng-disabled=notify.ready ng-init="msgOpts = { title: \'Web Notification\', body: \'This is a test message.\'}"><div style="padding: 8px"><div class=form-group><label for=exampleTitle>Message Title</label><input class=form-control id=exampleTitle placeholder="Enter title" ng-model=msgOpts.title></div><div class=form-group><label for=exampleMessage>Message Body Text</label><textarea class=form-control rows=5 class=form-control id=exampleMessage ng-model=msgOpts.body placeholder="Enter body text"></textarea></div><span class=pull-right ng-show="notify.current.name != \'alert\'" style="margin: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.showResult }"><label><input type=checkbox ng-model=notify.showResult> Show Result</label></div></span> <span class=pull-right ng-show="notify.current.name != \'alert\'" style="margin: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.sameDialog }"><label><input type=checkbox ng-model=notify.sameDialog> Recycle Dialog</label></div></span> <button type=submit class="btn btn-default" ng-class="{ \'btn-success\': notify.isPatched(), \'btn-primary\': notify.ready !== null && !notify.isPatched() }" ng-click="notify.current.action(msgOpts.title, msgOpts.body, msgOpts)">Create Message</button></div></form></div><div ng-class="{ \'col-md-3\':notify.enabled, \'hide\': !notify.enabled }"><div><h5>Notification Extenders</h5><form class=thumbnail><div style="padding: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.enabled }"><label><input type=checkbox ng-model=notify.enabled> Desktop Notifications</label></div><div class=checkbox ng-class="{ \'inactive-gray\': !notify.options.alertify.enabled }"><label><input type=checkbox ng-checked=notify.options.alertify.enabled ng-click=notify.hookAlertify()> <span ng-if=!notify.options.alertify.busy>Extend with <a target=_blank href="http://fabien-d.github.io/alertify.js/">AlertifyJS</a></span> <span ng-if=notify.options.alertify.busy><i class="fa fa-spinner fa-spin"></i> <em>Loading third-party scripts...</em></span></label></div></div></form></div><div ng-show=notify.enabled><h5>System Notifications Active</h5><div class="alert alert-success"><b>Note:</b> All notifications get redirected to your OS notification system.</div></div><div><h5>More Inspiration</h5><div class="alert alert-info">Check out <a target=_blank href=http://tympanus.net/Development/NotificationStyles/attached-bouncyflip.html><i class="fa fa-globe"></i> this site</a> for some more great examples.</div></div></div></div><div ng:if=notify.error class="alert alert-danger"><b>Error:</b> {{ notify.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/sampleData/main.tpl.html',
    '<div id=SampleDataView class=container style="width: 100%"><div ng:if=sampleData.error class="alert alert-danger"><a class=pull-right href="" ng-click="sampleData.error = null"><i class="fa fa-remove"></i></a> <b>Error:</b> {{ sampleData.error.message || \'Something went wrong. :(\' }}</div><div ng-if=!sampleData.context class=row><div class=col-md-12><h4>Data Profiles <small>Create and model your data objects.</small></h4><hr><form ng-if=sampleData._new><div class=form-group><label for=inputName>Profile Name</label><input class=form-control id=inputName tabindex=1 ng-required placeholder="Your Profile Name" ng-model=sampleData._new.name></div><div class=form-group><label for=inputRows>Sample Data Size</label><input class=form-control id=inputRows type=number tabindex=2 ng-required placeholder="Enter number of rows" ng-model=sampleData._new.rows></div><hr><a href="" class="btn btn-primary" ng-click=sampleData.addNew(sampleData._new)>Create</a> <a href="" class="btn btn-default" ng-click="sampleData._new = null">Cancel</a></form><ul ng-if=!sampleData._new class=list-group><li class=list-group-item><a href="" class=inactive-gray ng-click="sampleData._new = { name: \'My Data Object\', rows: 10, args: [] }"><i class="fa fa-plus-circle"></i> Create new profile</a></li><li class=list-group-item ng-if="!sampleData.OnlineData.length && sampleData.busy"><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></li><li class=list-group-item ng-if="!sampleData.OnlineData.length && !sampleData.busy"><p><b><i class="fa fa-info-circle"></i> Warning:</b> <em>No Profiles available...</em></p><p>&raquo; Identify Yourself: <a href="" ng-click="sampleData.authenticate(\'google\')">Google</a> | <a href="" ng-click="sampleData.authenticate(\'facebook\')">Facebook</a> | <a href="" ng-click="sampleData.authenticate(\'github\')">GitHub</a> | <a href="" ng-click="sampleData.authenticate(\'twitter\')">Twitter</a> | <a href="" ng-click="sampleData.authenticate(\'password\')">Email</a> | <a href="" ng-click=sampleData.createSamples()>Load Samples</a></p></li><li class=list-group-item ng-repeat="profile in sampleData.OnlineData"><a href="" class=pull-right ng-click=sampleData.removeProfile(profile)><i class="fa fa-trash"></i></a> <a href="" ng-click="sampleData.context = profile"><i class="fa fa-globe"></i> {{ profile.name }}</a></li></ul></div></div><div ng-if=sampleData.context class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled="!sampleData.context.args.length || sampleData.busy" ng-click=sampleData.test() class="btn btn-primary">Fetch Sample Data</a> <a href="" ng-click="sampleData.context = null" class="btn btn-default">Close</a></span><h4>Online Sample Data <small>Create sample data <a href="http://chancejs.com/" target=_blank>on the fly</a>, or get it <a href="http://www.filltext.com/" target=_blank>directly from the cloud</a>!</small></h4><hr><div class=row><div class=col-md-4><h5><div style="width: 60%; display: inline-block" class=ellipsis>{{ sampleData.context.name || \'Define Fields\' }}</div><small class=pull-right><a href="" ng-click="sampleData.edit = !sampleData.edit"><i class=fa ng-class="{ \'fa-plus\':!sampleData.edit, \'fa-minus\':sampleData.edit}"></i></a></small> <small ng-if=sampleData.context.args.length>( {{ sampleData.context.args.length }} defined )</small></h5><div class=thumbnail><div style="display: flex; width: auto; padding: 3px" ng-if=!sampleData.context.args.length><em>List Empty</em></div><div style="display: flex; width: auto; padding: 3px" ng-repeat="arg in sampleData.context.args"><span style="flex-basis: 20px; flex-grow:0; flex-shrink:0"><input checked type=checkbox ng-click="sampleData.removeColumn(sampleData.context, arg)"></span><div style="flex-basis: 64px; flex-grow:0; flex-shrink:0"><div class=dropdown><button type=button data-toggle=dropdown class="btn btn-xs btn-default dropdown-toggle" ng-class="{ \'btn-primary\':arg.type==\'chance\', \'btn-info\':arg.type==\'fillText\' }">{{ arg.type }} <span class=caret></span></button><ul class=dropdown-menu><li><a href="" ng-click="arg.type = \'chance\'">Chance.js (offline)</a></li><li><a href="" ng-click="arg.type = \'fillText\'">Fill Text (online)</a></li></ul></div></div><div style="flex-basis: 100px; flex-grow:0; flex-shrink:0"><input style="width: 100%" ng-model=arg.id ng-blur="sampleData.updateColumn(sampleData.context, arg)"></div><div style="flex-grow:1; flex-shrink:1"><input style="width: 100%" ng-model=arg.val ng-blur="sampleData.updateColumn(sampleData.context, arg)" ng-change="sampleData.updateColumn(sampleData.context, arg)"></div></div></div></div><div ng-if="sampleData.edit || !sampleData.context.resp" class=col-md-8><h5>Define Data Model</h5><style>.sample-container {\n' +
    '                            margin: 0;\n' +
    '                            padding: 0;\n' +
    '                        }\n' +
    '\n' +
    '                        .sample-list {\n' +
    '                            margin: 3px;\n' +
    '                            padding: 3px;\n' +
    '                            overflow: visible;\n' +
    '                        }\n' +
    '\n' +
    '                            .sample-list ul {\n' +
    '                                padding-left: 24px;\n' +
    '                            }\n' +
    '\n' +
    '                                .sample-list ul li {\n' +
    '                                    list-style: square;\n' +
    '                                }</style><div class="row sample-container"><div class=col-md-3><div class="thumbnail sample-list"><h5>Basics</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Boolean\', val: \'{bool}\', type:\'chance\'})">bool</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Character\', val: \'{character}\', type:\'chance\'})">character</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Floating\', val: \'{floating}\', type:\'chance\'})">floating</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Integer\', val: \'{integer}\', type:\'chance\'})">integer</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Natural\', val: \'{natural}\', type:\'chance\'})">natural</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'String\', val: \'{string}\', type:\'chance\'})">string</a></li></ul></div><div class="thumbnail sample-list"><h5>Text</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Paragraph\', val: \'{paragraph}\', type:\'chance\'})">paragraph</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Sentence\', val: \'{sentence}\', type:\'chance\'})">sentence</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Syllable\', val: \'{syllable}\', type:\'chance\'})">syllable</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Word\', val: \'{word}\', type:\'chance\'})">word</a></li></ul></div><div class="thumbnail sample-list"><h5>Finance</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'CreditCardNo\', val: \'{cc}\', type:\'chance\'})">cc</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'CreditCardType\', val: \'{cc_type}\', type:\'chance\'})">cc_type</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Dollars\', val: \'{dollar}\', type:\'chance\'})">dollar</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'ExpiryDate\', val: \'{exp}\', type:\'chance\'})">exp</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'ExpiryMonth\', val: \'{exp_month}\', type:\'chance\'})">exp_month</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'ExpiryYear\', val: \'{exp_year}\', type:\'chance\'})">exp_year</a></li></ul></div></div><div class=col-md-3><div class="thumbnail sample-list"><h5>Person</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Name\', val: \'{name}\', type:\'chance\'})">name</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Last\', val: \'{last}\', type:\'chance\'})">last</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'First\', val: \'{first}\', type:\'chance\'})">first</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Prefix\', val: \'{prefix}\', type:\'chance\'})">prefix</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Suffix\', val: \'{suffix}\', type:\'chance\'})">suffix</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Birthday\', val: \'{birthday}\', type:\'chance\'})">birthday</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Gender\', val: \'{gender}\', type:\'chance\'})">gender</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Age\', val: \'{age}\', type:\'chance\'})">age</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'SSN\', val: \'{ssn}\', type:\'chance\'})">ssn</a></li></ul></div><div class="thumbnail sample-list"><h5>Time</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'AM_PM\', val: \'{ampm}\', type:\'chance\'})">ampm</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Date\', val: \'{date}\', type:\'chance\'})">date</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'HammerTime\', val: \'{hammertime}\', type:\'chance\'})">hammertime</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Hour\', val: \'{hour}\', type:\'chance\'})">hour</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Millisecond\', val: \'{millisecond}\', type:\'chance\'})">millisecond</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Minute\', val: \'{minute}\', type:\'chance\'})">minute</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Month\', val: \'{month}\', type:\'chance\'})">month</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Second\', val: \'{second}\', type:\'chance\'})">second</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Timestamp\', val: \'{timestamp}\', type:\'chance\'})">timestamp</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Year\', val: \'{year}\', type:\'chance\'})">year</a></li></ul></div></div><div class=col-md-3><div class="thumbnail sample-list"><h5>Web</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Color\', val: \'{color}\', type:\'chance\'})">color</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Domain\', val: \'{domain}\', type:\'chance\'})">domain</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Email\', val: \'{email}\', type:\'chance\'})">email</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'FacebookID\', val: \'{fbid}\', type:\'chance\'})">fbid</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'GoogleAnalytics\', val: \'{google_analytics}\', type:\'chance\'})">google_analytics</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Hashtag\', val: \'{hashtag}\', type:\'chance\'})">hashtag</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'IP\', val: \'{ip}\', type:\'chance\'})">ip</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'IPv6\', val: \'{ipv6}\', type:\'chance\'})">ipv6</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'KLOUT\', val: \'{klout}\', type:\'chance\'})">klout</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'TLD\', val: \'{tld}\', type:\'chance\'})">tld</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Twitter\', val: \'{twitter}\', type:\'chance\'})">twitter</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Url\', val: \'{url}\', type:\'chance\'})">url</a></li></ul></div><div class="thumbnail sample-list"><h5>Miscellaneous</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Guid\', val: \'{guid}\', type:\'chance\'})">guid</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Hash\', val: \'{hash}\', type:\'chance\'})">hash</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Normal\', val: \'{normal}\', type:\'chance\'})">normal</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Radio\', val: \'{radio}\', type:\'chance\'})">radio</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'TV\', val: \'{tv}\', type:\'chance\'})">tv</a></li></ul></div></div><div class=col-md-3><div class="thumbnail sample-list"><h5>Mobile</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'AndroidID\', val: \'{android_id}\', type:\'chance\'})">android_id</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'AppleToken\', val: \'{apple_token}\', type:\'chance\'})">apple_token</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'BlackberryPIN\', val: \'{bb_pin}\', type:\'chance\'})">bb_pin</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'WinPhone7\', val: \'{wp7_anid}\', type:\'chance\'})">wp7_anid</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'WinPhone8\', val: \'{wp8_anid2}\', type:\'chance\'})">wp8_anid2</a></li></ul></div><div class="thumbnail sample-list"><h5>Location</h5><ul class=toc_section><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Address\', val: \'{address}\', type:\'chance\'})">address</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Altitude\', val: \'{altitude}\', type:\'chance\'})">altitude</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'AreaCode\', val: \'{areacode}\', type:\'chance\'})">areacode</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'City\', val: \'{city}\', type:\'chance\'})">city</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Coordinates\', val: \'{coordinates}\', type:\'chance\'})">coordinates</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Country\', val: \'{country}\', type:\'chance\'})">country</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Depth\', val: \'{depth}\', type:\'chance\'})">depth</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Geohash\', val: \'{geohash}\', type:\'chance\'})">geohash</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Latitude\', val: \'{latitude}\', type:\'chance\'})">latitude</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Longitude\', val: \'{longitude}\', type:\'chance\'})">longitude</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Phone\', val: \'{phone}\', type:\'chance\'})">phone</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Postal\', val: \'{postal}\', type:\'chance\'})">postal</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Province\', val: \'{province}\', type:\'chance\'})">province</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'State\', val: \'{state}\', type:\'chance\'})">state</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Street\', val: \'{street}\', type:\'chance\'})">street</a></li><li><a href="" ng-click="sampleData.addColumn(sampleData.context, { id: \'Zip\', val: \'{zip}\', type:\'chance\'})">zip</a></li></ul></div></div></div></div><div ng-if="!sampleData.edit && sampleData.context.resp" class=col-md-8><div class=pull-right style="width: 200px"><input id=ex1 type=range min=0 max=100 ng-model=sampleData.context.rows ng-blur="sampleData.updateProfile(sampleData.context, true)"></div><div class=pull-right style="width: 64px">Rows: <b>{{ sampleData.context.rows }}</b></div><h5>Results View <small ng:if=sampleData.context.resp.length>( {{ sampleData.context.resp.length }} total ) | <a href="" ng-click=sampleData.clearData(sampleData.context)><i class="fa fa-trash"></i> Clear</a></small></h5><table class=table><thead><tr><th ng-repeat="arg in sampleData.context.args">{{ arg.id }}</th></tr></thead><tbody><tr ng-if=!sampleData.context.resp><td colspan="{{ sampleData.context.args.length }}"><em>Nothing to show yet. Fetch some data first...</em></td></tr><tr ng-repeat="row in sampleData.context.resp"><td ng-repeat="arg in sampleData.context.args">{{ row[arg.id] }}</td></tr></tbody></table></div></div></div></div></div>');
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

  $templateCache.put('assets/css/animate.min.css',
    "@charset \"UTF-8\";/*!\n" +
    "Animate.css - http://daneden.me/animate\n" +
    "Licensed under the MIT license - http://opensource.org/licenses/MIT\n" +
    "\n" +
    "Copyright (c) 2015 Daniel Eden\n" +
    "*/.animated{-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}.animated.infinite{-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}.animated.hinge{-webkit-animation-duration:2s;animation-duration:2s}.animated.bounceIn,.animated.bounceOut,.animated.flipOutX,.animated.flipOutY{-webkit-animation-duration:.75s;animation-duration:.75s}@-webkit-keyframes bounce{0%,100%,20%,53%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}40%,43%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-30px,0);transform:translate3d(0,-30px,0)}70%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-15px,0);transform:translate3d(0,-15px,0)}90%{-webkit-transform:translate3d(0,-4px,0);transform:translate3d(0,-4px,0)}}@keyframes bounce{0%,100%,20%,53%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}40%,43%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-30px,0);transform:translate3d(0,-30px,0)}70%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-15px,0);transform:translate3d(0,-15px,0)}90%{-webkit-transform:translate3d(0,-4px,0);transform:translate3d(0,-4px,0)}}.bounce{-webkit-animation-name:bounce;animation-name:bounce;-webkit-transform-origin:center bottom;transform-origin:center bottom}@-webkit-keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}.flash{-webkit-animation-name:flash;animation-name:flash}@-webkit-keyframes pulse{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}50%{-webkit-transform:scale3d(1.05,1.05,1.05);transform:scale3d(1.05,1.05,1.05)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes pulse{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}50%{-webkit-transform:scale3d(1.05,1.05,1.05);transform:scale3d(1.05,1.05,1.05)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.pulse{-webkit-animation-name:pulse;animation-name:pulse}@-webkit-keyframes rubberBand{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}30%{-webkit-transform:scale3d(1.25,.75,1);transform:scale3d(1.25,.75,1)}40%{-webkit-transform:scale3d(0.75,1.25,1);transform:scale3d(0.75,1.25,1)}50%{-webkit-transform:scale3d(1.15,.85,1);transform:scale3d(1.15,.85,1)}65%{-webkit-transform:scale3d(.95,1.05,1);transform:scale3d(.95,1.05,1)}75%{-webkit-transform:scale3d(1.05,.95,1);transform:scale3d(1.05,.95,1)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes rubberBand{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}30%{-webkit-transform:scale3d(1.25,.75,1);transform:scale3d(1.25,.75,1)}40%{-webkit-transform:scale3d(0.75,1.25,1);transform:scale3d(0.75,1.25,1)}50%{-webkit-transform:scale3d(1.15,.85,1);transform:scale3d(1.15,.85,1)}65%{-webkit-transform:scale3d(.95,1.05,1);transform:scale3d(.95,1.05,1)}75%{-webkit-transform:scale3d(1.05,.95,1);transform:scale3d(1.05,.95,1)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.rubberBand{-webkit-animation-name:rubberBand;animation-name:rubberBand}@-webkit-keyframes shake{0%,100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}20%,40%,60%,80%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}}@keyframes shake{0%,100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}20%,40%,60%,80%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}}.shake{-webkit-animation-name:shake;animation-name:shake}@-webkit-keyframes swing{20%{-webkit-transform:rotate3d(0,0,1,15deg);transform:rotate3d(0,0,1,15deg)}40%{-webkit-transform:rotate3d(0,0,1,-10deg);transform:rotate3d(0,0,1,-10deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}100%{-webkit-transform:rotate3d(0,0,1,0deg);transform:rotate3d(0,0,1,0deg)}}@keyframes swing{20%{-webkit-transform:rotate3d(0,0,1,15deg);transform:rotate3d(0,0,1,15deg)}40%{-webkit-transform:rotate3d(0,0,1,-10deg);transform:rotate3d(0,0,1,-10deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}100%{-webkit-transform:rotate3d(0,0,1,0deg);transform:rotate3d(0,0,1,0deg)}}.swing{-webkit-transform-origin:top center;transform-origin:top center;-webkit-animation-name:swing;animation-name:swing}@-webkit-keyframes tada{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}10%,20%{-webkit-transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg);transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes tada{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}10%,20%{-webkit-transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg);transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.tada{-webkit-animation-name:tada;animation-name:tada}@-webkit-keyframes wobble{0%{-webkit-transform:none;transform:none}15%{-webkit-transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg);transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{-webkit-transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg);transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{-webkit-transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg);transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{-webkit-transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg);transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{-webkit-transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg);transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}100%{-webkit-transform:none;transform:none}}@keyframes wobble{0%{-webkit-transform:none;transform:none}15%{-webkit-transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg);transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{-webkit-transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg);transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{-webkit-transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg);transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{-webkit-transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg);transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{-webkit-transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg);transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}100%{-webkit-transform:none;transform:none}}.wobble{-webkit-animation-name:wobble;animation-name:wobble}@-webkit-keyframes jello{11.1%{-webkit-transform:none;transform:none}22.2%{-webkit-transform:skewX(-12.5deg) skewY(-12.5deg);transform:skewX(-12.5deg) skewY(-12.5deg)}33.3%{-webkit-transform:skewX(6.25deg) skewY(6.25deg);transform:skewX(6.25deg) skewY(6.25deg)}44.4%{-webkit-transform:skewX(-3.125deg) skewY(-3.125deg);transform:skewX(-3.125deg) skewY(-3.125deg)}55.5%{-webkit-transform:skewX(1.5625deg) skewY(1.5625deg);transform:skewX(1.5625deg) skewY(1.5625deg)}66.6%{-webkit-transform:skewX(-.78125deg) skewY(-.78125deg);transform:skewX(-.78125deg) skewY(-.78125deg)}77.7%{-webkit-transform:skewX(0.390625deg) skewY(0.390625deg);transform:skewX(0.390625deg) skewY(0.390625deg)}88.8%{-webkit-transform:skewX(-.1953125deg) skewY(-.1953125deg);transform:skewX(-.1953125deg) skewY(-.1953125deg)}100%{-webkit-transform:none;transform:none}}@keyframes jello{11.1%{-webkit-transform:none;transform:none}22.2%{-webkit-transform:skewX(-12.5deg) skewY(-12.5deg);transform:skewX(-12.5deg) skewY(-12.5deg)}33.3%{-webkit-transform:skewX(6.25deg) skewY(6.25deg);transform:skewX(6.25deg) skewY(6.25deg)}44.4%{-webkit-transform:skewX(-3.125deg) skewY(-3.125deg);transform:skewX(-3.125deg) skewY(-3.125deg)}55.5%{-webkit-transform:skewX(1.5625deg) skewY(1.5625deg);transform:skewX(1.5625deg) skewY(1.5625deg)}66.6%{-webkit-transform:skewX(-.78125deg) skewY(-.78125deg);transform:skewX(-.78125deg) skewY(-.78125deg)}77.7%{-webkit-transform:skewX(0.390625deg) skewY(0.390625deg);transform:skewX(0.390625deg) skewY(0.390625deg)}88.8%{-webkit-transform:skewX(-.1953125deg) skewY(-.1953125deg);transform:skewX(-.1953125deg) skewY(-.1953125deg)}100%{-webkit-transform:none;transform:none}}.jello{-webkit-animation-name:jello;animation-name:jello;-webkit-transform-origin:center;transform-origin:center}@-webkit-keyframes bounceIn{0%,100%,20%,40%,60%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}20%{-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}40%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}60%{opacity:1;-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}80%{-webkit-transform:scale3d(.97,.97,.97);transform:scale3d(.97,.97,.97)}100%{opacity:1;-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes bounceIn{0%,100%,20%,40%,60%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}20%{-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}40%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}60%{opacity:1;-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}80%{-webkit-transform:scale3d(.97,.97,.97);transform:scale3d(.97,.97,.97)}100%{opacity:1;-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.bounceIn{-webkit-animation-name:bounceIn;animation-name:bounceIn}@-webkit-keyframes bounceInDown{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,-3000px,0);transform:translate3d(0,-3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,25px,0);transform:translate3d(0,25px,0)}75%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}90%{-webkit-transform:translate3d(0,5px,0);transform:translate3d(0,5px,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInDown{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,-3000px,0);transform:translate3d(0,-3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,25px,0);transform:translate3d(0,25px,0)}75%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}90%{-webkit-transform:translate3d(0,5px,0);transform:translate3d(0,5px,0)}100%{-webkit-transform:none;transform:none}}.bounceInDown{-webkit-animation-name:bounceInDown;animation-name:bounceInDown}@-webkit-keyframes bounceInLeft{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(-3000px,0,0);transform:translate3d(-3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(25px,0,0);transform:translate3d(25px,0,0)}75%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}90%{-webkit-transform:translate3d(5px,0,0);transform:translate3d(5px,0,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInLeft{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(-3000px,0,0);transform:translate3d(-3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(25px,0,0);transform:translate3d(25px,0,0)}75%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}90%{-webkit-transform:translate3d(5px,0,0);transform:translate3d(5px,0,0)}100%{-webkit-transform:none;transform:none}}.bounceInLeft{-webkit-animation-name:bounceInLeft;animation-name:bounceInLeft}@-webkit-keyframes bounceInRight{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(3000px,0,0);transform:translate3d(3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(-25px,0,0);transform:translate3d(-25px,0,0)}75%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}90%{-webkit-transform:translate3d(-5px,0,0);transform:translate3d(-5px,0,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInRight{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(3000px,0,0);transform:translate3d(3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(-25px,0,0);transform:translate3d(-25px,0,0)}75%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}90%{-webkit-transform:translate3d(-5px,0,0);transform:translate3d(-5px,0,0)}100%{-webkit-transform:none;transform:none}}.bounceInRight{-webkit-animation-name:bounceInRight;animation-name:bounceInRight}@-webkit-keyframes bounceInUp{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,3000px,0);transform:translate3d(0,3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}75%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}90%{-webkit-transform:translate3d(0,-5px,0);transform:translate3d(0,-5px,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes bounceInUp{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,3000px,0);transform:translate3d(0,3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}75%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}90%{-webkit-transform:translate3d(0,-5px,0);transform:translate3d(0,-5px,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.bounceInUp{-webkit-animation-name:bounceInUp;animation-name:bounceInUp}@-webkit-keyframes bounceOut{20%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}}@keyframes bounceOut{20%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}}.bounceOut{-webkit-animation-name:bounceOut;animation-name:bounceOut}@-webkit-keyframes bounceOutDown{20%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}@keyframes bounceOutDown{20%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}.bounceOutDown{-webkit-animation-name:bounceOutDown;animation-name:bounceOutDown}@-webkit-keyframes bounceOutLeft{20%{opacity:1;-webkit-transform:translate3d(20px,0,0);transform:translate3d(20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}@keyframes bounceOutLeft{20%{opacity:1;-webkit-transform:translate3d(20px,0,0);transform:translate3d(20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}.bounceOutLeft{-webkit-animation-name:bounceOutLeft;animation-name:bounceOutLeft}@-webkit-keyframes bounceOutRight{20%{opacity:1;-webkit-transform:translate3d(-20px,0,0);transform:translate3d(-20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}@keyframes bounceOutRight{20%{opacity:1;-webkit-transform:translate3d(-20px,0,0);transform:translate3d(-20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}.bounceOutRight{-webkit-animation-name:bounceOutRight;animation-name:bounceOutRight}@-webkit-keyframes bounceOutUp{20%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,20px,0);transform:translate3d(0,20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}@keyframes bounceOutUp{20%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,20px,0);transform:translate3d(0,20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}.bounceOutUp{-webkit-animation-name:bounceOutUp;animation-name:bounceOutUp}@-webkit-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}.fadeIn{-webkit-animation-name:fadeIn;animation-name:fadeIn}@-webkit-keyframes fadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDown{-webkit-animation-name:fadeInDown;animation-name:fadeInDown}@-webkit-keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDownBig{-webkit-animation-name:fadeInDownBig;animation-name:fadeInDownBig}@-webkit-keyframes fadeInLeft{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInLeft{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInLeft{-webkit-animation-name:fadeInLeft;animation-name:fadeInLeft}@-webkit-keyframes fadeInLeftBig{0%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInLeftBig{0%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInLeftBig{-webkit-animation-name:fadeInLeftBig;animation-name:fadeInLeftBig}@-webkit-keyframes fadeInRight{0%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInRight{0%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInRight{-webkit-animation-name:fadeInRight;animation-name:fadeInRight}@-webkit-keyframes fadeInRightBig{0%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInRightBig{0%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInRightBig{-webkit-animation-name:fadeInRightBig;animation-name:fadeInRightBig}@-webkit-keyframes fadeInUp{0%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInUp{0%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInUp{-webkit-animation-name:fadeInUp;animation-name:fadeInUp}@-webkit-keyframes fadeInUpBig{0%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInUpBig{0%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInUpBig{-webkit-animation-name:fadeInUpBig;animation-name:fadeInUpBig}@-webkit-keyframes fadeOut{0%{opacity:1}100%{opacity:0}}@keyframes fadeOut{0%{opacity:1}100%{opacity:0}}.fadeOut{-webkit-animation-name:fadeOut;animation-name:fadeOut}@-webkit-keyframes fadeOutDown{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}@keyframes fadeOutDown{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}.fadeOutDown{-webkit-animation-name:fadeOutDown;animation-name:fadeOutDown}@-webkit-keyframes fadeOutDownBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}@keyframes fadeOutDownBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}.fadeOutDownBig{-webkit-animation-name:fadeOutDownBig;animation-name:fadeOutDownBig}@-webkit-keyframes fadeOutLeft{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}@keyframes fadeOutLeft{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}.fadeOutLeft{-webkit-animation-name:fadeOutLeft;animation-name:fadeOutLeft}@-webkit-keyframes fadeOutLeftBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}@keyframes fadeOutLeftBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}.fadeOutLeftBig{-webkit-animation-name:fadeOutLeftBig;animation-name:fadeOutLeftBig}@-webkit-keyframes fadeOutRight{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}@keyframes fadeOutRight{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}.fadeOutRight{-webkit-animation-name:fadeOutRight;animation-name:fadeOutRight}@-webkit-keyframes fadeOutRightBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}@keyframes fadeOutRightBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}.fadeOutRightBig{-webkit-animation-name:fadeOutRightBig;animation-name:fadeOutRightBig}@-webkit-keyframes fadeOutUp{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes fadeOutUp{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.fadeOutUp{-webkit-animation-name:fadeOutUp;animation-name:fadeOutUp}@-webkit-keyframes fadeOutUpBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}@keyframes fadeOutUpBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}.fadeOutUpBig{-webkit-animation-name:fadeOutUpBig;animation-name:fadeOutUpBig}@-webkit-keyframes flip{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-360deg);transform:perspective(400px) rotate3d(0,1,0,-360deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}40%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}50%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}80%{-webkit-transform:perspective(400px) scale3d(.95,.95,.95);transform:perspective(400px) scale3d(.95,.95,.95);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}100%{-webkit-transform:perspective(400px);transform:perspective(400px);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}}@keyframes flip{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-360deg);transform:perspective(400px) rotate3d(0,1,0,-360deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}40%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}50%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}80%{-webkit-transform:perspective(400px) scale3d(.95,.95,.95);transform:perspective(400px) scale3d(.95,.95,.95);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}100%{-webkit-transform:perspective(400px);transform:perspective(400px);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}}.animated.flip{-webkit-backface-visibility:visible;backface-visibility:visible;-webkit-animation-name:flip;animation-name:flip}@-webkit-keyframes flipInX{0%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(1,0,0,10deg);transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-5deg);transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}@keyframes flipInX{0%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(1,0,0,10deg);transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-5deg);transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}.flipInX{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipInX;animation-name:flipInX}@-webkit-keyframes flipInY{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-20deg);transform:perspective(400px) rotate3d(0,1,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(0,1,0,10deg);transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-5deg);transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}@keyframes flipInY{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-20deg);transform:perspective(400px) rotate3d(0,1,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(0,1,0,10deg);transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-5deg);transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}.flipInY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipInY;animation-name:flipInY}@-webkit-keyframes flipOutX{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}@keyframes flipOutX{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}.flipOutX{-webkit-animation-name:flipOutX;animation-name:flipOutX;-webkit-backface-visibility:visible!important;backface-visibility:visible!important}@-webkit-keyframes flipOutY{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-15deg);transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}@keyframes flipOutY{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-15deg);transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}.flipOutY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipOutY;animation-name:flipOutY}@-webkit-keyframes lightSpeedIn{0%{-webkit-transform:translate3d(100%,0,0) skewX(-30deg);transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{-webkit-transform:skewX(20deg);transform:skewX(20deg);opacity:1}80%{-webkit-transform:skewX(-5deg);transform:skewX(-5deg);opacity:1}100%{-webkit-transform:none;transform:none;opacity:1}}@keyframes lightSpeedIn{0%{-webkit-transform:translate3d(100%,0,0) skewX(-30deg);transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{-webkit-transform:skewX(20deg);transform:skewX(20deg);opacity:1}80%{-webkit-transform:skewX(-5deg);transform:skewX(-5deg);opacity:1}100%{-webkit-transform:none;transform:none;opacity:1}}.lightSpeedIn{-webkit-animation-name:lightSpeedIn;animation-name:lightSpeedIn;-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}@-webkit-keyframes lightSpeedOut{0%{opacity:1}100%{-webkit-transform:translate3d(100%,0,0) skewX(30deg);transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}@keyframes lightSpeedOut{0%{opacity:1}100%{-webkit-transform:translate3d(100%,0,0) skewX(30deg);transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}.lightSpeedOut{-webkit-animation-name:lightSpeedOut;animation-name:lightSpeedOut;-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}@-webkit-keyframes rotateIn{0%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,-200deg);transform:rotate3d(0,0,1,-200deg);opacity:0}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateIn{0%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,-200deg);transform:rotate3d(0,0,1,-200deg);opacity:0}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:none;transform:none;opacity:1}}.rotateIn{-webkit-animation-name:rotateIn;animation-name:rotateIn}@-webkit-keyframes rotateInDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInDownLeft{-webkit-animation-name:rotateInDownLeft;animation-name:rotateInDownLeft}@-webkit-keyframes rotateInDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInDownRight{-webkit-animation-name:rotateInDownRight;animation-name:rotateInDownRight}@-webkit-keyframes rotateInUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInUpLeft{-webkit-animation-name:rotateInUpLeft;animation-name:rotateInUpLeft}@-webkit-keyframes rotateInUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-90deg);transform:rotate3d(0,0,1,-90deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-90deg);transform:rotate3d(0,0,1,-90deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInUpRight{-webkit-animation-name:rotateInUpRight;animation-name:rotateInUpRight}@-webkit-keyframes rotateOut{0%{-webkit-transform-origin:center;transform-origin:center;opacity:1}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,200deg);transform:rotate3d(0,0,1,200deg);opacity:0}}@keyframes rotateOut{0%{-webkit-transform-origin:center;transform-origin:center;opacity:1}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,200deg);transform:rotate3d(0,0,1,200deg);opacity:0}}.rotateOut{-webkit-animation-name:rotateOut;animation-name:rotateOut}@-webkit-keyframes rotateOutDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}}@keyframes rotateOutDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}}.rotateOutDownLeft{-webkit-animation-name:rotateOutDownLeft;animation-name:rotateOutDownLeft}@-webkit-keyframes rotateOutDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes rotateOutDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}.rotateOutDownRight{-webkit-animation-name:rotateOutDownRight;animation-name:rotateOutDownRight}@-webkit-keyframes rotateOutUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes rotateOutUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}.rotateOutUpLeft{-webkit-animation-name:rotateOutUpLeft;animation-name:rotateOutUpLeft}@-webkit-keyframes rotateOutUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,90deg);transform:rotate3d(0,0,1,90deg);opacity:0}}@keyframes rotateOutUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,90deg);transform:rotate3d(0,0,1,90deg);opacity:0}}.rotateOutUpRight{-webkit-animation-name:rotateOutUpRight;animation-name:rotateOutUpRight}@-webkit-keyframes hinge{0%{-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}20%,60%{-webkit-transform:rotate3d(0,0,1,80deg);transform:rotate3d(0,0,1,80deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}40%,80%{-webkit-transform:rotate3d(0,0,1,60deg);transform:rotate3d(0,0,1,60deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out;opacity:1}100%{-webkit-transform:translate3d(0,700px,0);transform:translate3d(0,700px,0);opacity:0}}@keyframes hinge{0%{-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}20%,60%{-webkit-transform:rotate3d(0,0,1,80deg);transform:rotate3d(0,0,1,80deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}40%,80%{-webkit-transform:rotate3d(0,0,1,60deg);transform:rotate3d(0,0,1,60deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out;opacity:1}100%{-webkit-transform:translate3d(0,700px,0);transform:translate3d(0,700px,0);opacity:0}}.hinge{-webkit-animation-name:hinge;animation-name:hinge}@-webkit-keyframes rollIn{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg);transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes rollIn{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg);transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;-webkit-transform:none;transform:none}}.rollIn{-webkit-animation-name:rollIn;animation-name:rollIn}@-webkit-keyframes rollOut{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg);transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}@keyframes rollOut{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg);transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}.rollOut{-webkit-animation-name:rollOut;animation-name:rollOut}@-webkit-keyframes zoomIn{0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes zoomIn{0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}50%{opacity:1}}.zoomIn{-webkit-animation-name:zoomIn;animation-name:zoomIn}@-webkit-keyframes zoomInDown{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInDown{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInDown{-webkit-animation-name:zoomInDown;animation-name:zoomInDown}@-webkit-keyframes zoomInLeft{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(10px,0,0);transform:scale3d(.475,.475,.475) translate3d(10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInLeft{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(10px,0,0);transform:scale3d(.475,.475,.475) translate3d(10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInLeft{-webkit-animation-name:zoomInLeft;animation-name:zoomInLeft}@-webkit-keyframes zoomInRight{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInRight{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInRight{-webkit-animation-name:zoomInRight;animation-name:zoomInRight}@-webkit-keyframes zoomInUp{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInUp{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInUp{-webkit-animation-name:zoomInUp;animation-name:zoomInUp}@-webkit-keyframes zoomOut{0%{opacity:1}50%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}100%{opacity:0}}@keyframes zoomOut{0%{opacity:1}50%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}100%{opacity:0}}.zoomOut{-webkit-animation-name:zoomOut;animation-name:zoomOut}@-webkit-keyframes zoomOutDown{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomOutDown{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomOutDown{-webkit-animation-name:zoomOutDown;animation-name:zoomOutDown}@-webkit-keyframes zoomOutLeft{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(42px,0,0);transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(-2000px,0,0);transform:scale(.1) translate3d(-2000px,0,0);-webkit-transform-origin:left center;transform-origin:left center}}@keyframes zoomOutLeft{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(42px,0,0);transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(-2000px,0,0);transform:scale(.1) translate3d(-2000px,0,0);-webkit-transform-origin:left center;transform-origin:left center}}.zoomOutLeft{-webkit-animation-name:zoomOutLeft;animation-name:zoomOutLeft}@-webkit-keyframes zoomOutRight{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-42px,0,0);transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(2000px,0,0);transform:scale(.1) translate3d(2000px,0,0);-webkit-transform-origin:right center;transform-origin:right center}}@keyframes zoomOutRight{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-42px,0,0);transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(2000px,0,0);transform:scale(.1) translate3d(2000px,0,0);-webkit-transform-origin:right center;transform-origin:right center}}.zoomOutRight{-webkit-animation-name:zoomOutRight;animation-name:zoomOutRight}@-webkit-keyframes zoomOutUp{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomOutUp{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomOutUp{-webkit-animation-name:zoomOutUp;animation-name:zoomOutUp}@-webkit-keyframes slideInDown{0%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInDown{0%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInDown{-webkit-animation-name:slideInDown;animation-name:slideInDown}@-webkit-keyframes slideInLeft{0%{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInLeft{0%{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInLeft{-webkit-animation-name:slideInLeft;animation-name:slideInLeft}@-webkit-keyframes slideInRight{0%{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInRight{0%{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInRight{-webkit-animation-name:slideInRight;animation-name:slideInRight}@-webkit-keyframes slideInUp{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInUp{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInUp{-webkit-animation-name:slideInUp;animation-name:slideInUp}@-webkit-keyframes slideOutDown{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}@keyframes slideOutDown{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}.slideOutDown{-webkit-animation-name:slideOutDown;animation-name:slideOutDown}@-webkit-keyframes slideOutLeft{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}@keyframes slideOutLeft{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}.slideOutLeft{-webkit-animation-name:slideOutLeft;animation-name:slideOutLeft}@-webkit-keyframes slideOutRight{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}@keyframes slideOutRight{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}.slideOutRight{-webkit-animation-name:slideOutRight;animation-name:slideOutRight}@-webkit-keyframes slideOutUp{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes slideOutUp{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.slideOutUp{-webkit-animation-name:slideOutUp;animation-name:slideOutUp}"
  );


  $templateCache.put('assets/css/font-awesome-animation.min.css',
    "/*!\n" +
    " * font-awesome-animation - v0.0.7\n" +
    " * https://github.com/l-lin/font-awesome-animation\n" +
    " * License: MIT\n" +
    " */\n" +
    "\n" +
    "@-webkit-keyframes wrench{0%{-webkit-transform:rotate(-12deg);transform:rotate(-12deg)}8%{-webkit-transform:rotate(12deg);transform:rotate(12deg)}10%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}18%,20%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}28%,30%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}38%,40%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}48%,50%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}58%,60%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}68%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}75%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes wrench{0%{-webkit-transform:rotate(-12deg);-ms-transform:rotate(-12deg);transform:rotate(-12deg)}8%{-webkit-transform:rotate(12deg);-ms-transform:rotate(12deg);transform:rotate(12deg)}10%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}18%,20%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}28%,30%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}38%,40%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}48%,50%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}58%,60%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}68%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}75%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}}.faa-parent.animated-hover:hover>.faa-wrench,.faa-wrench.animated,.faa-wrench.animated-hover:hover{-webkit-animation:wrench 2.5s ease infinite;animation:wrench 2.5s ease infinite;transform-origin-x:90%;transform-origin-y:35%;transform-origin-z:initial}.faa-parent.animated-hover:hover>.faa-wrench.faa-fast,.faa-wrench.animated-hover.faa-fast:hover,.faa-wrench.animated.faa-fast{-webkit-animation:wrench 1.2s ease infinite;animation:wrench 1.2s ease infinite}.faa-parent.animated-hover:hover>.faa-wrench.faa-slow,.faa-wrench.animated-hover.faa-slow:hover,.faa-wrench.animated.faa-slow{-webkit-animation:wrench 3.7s ease infinite;animation:wrench 3.7s ease infinite}@-webkit-keyframes ring{0%{-webkit-transform:rotate(-15deg);transform:rotate(-15deg)}2%{-webkit-transform:rotate(15deg);transform:rotate(15deg)}4%{-webkit-transform:rotate(-18deg);transform:rotate(-18deg)}6%{-webkit-transform:rotate(18deg);transform:rotate(18deg)}8%{-webkit-transform:rotate(-22deg);transform:rotate(-22deg)}10%{-webkit-transform:rotate(22deg);transform:rotate(22deg)}12%{-webkit-transform:rotate(-18deg);transform:rotate(-18deg)}14%{-webkit-transform:rotate(18deg);transform:rotate(18deg)}16%{-webkit-transform:rotate(-12deg);transform:rotate(-12deg)}18%{-webkit-transform:rotate(12deg);transform:rotate(12deg)}20%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes ring{0%{-webkit-transform:rotate(-15deg);-ms-transform:rotate(-15deg);transform:rotate(-15deg)}2%{-webkit-transform:rotate(15deg);-ms-transform:rotate(15deg);transform:rotate(15deg)}4%{-webkit-transform:rotate(-18deg);-ms-transform:rotate(-18deg);transform:rotate(-18deg)}6%{-webkit-transform:rotate(18deg);-ms-transform:rotate(18deg);transform:rotate(18deg)}8%{-webkit-transform:rotate(-22deg);-ms-transform:rotate(-22deg);transform:rotate(-22deg)}10%{-webkit-transform:rotate(22deg);-ms-transform:rotate(22deg);transform:rotate(22deg)}12%{-webkit-transform:rotate(-18deg);-ms-transform:rotate(-18deg);transform:rotate(-18deg)}14%{-webkit-transform:rotate(18deg);-ms-transform:rotate(18deg);transform:rotate(18deg)}16%{-webkit-transform:rotate(-12deg);-ms-transform:rotate(-12deg);transform:rotate(-12deg)}18%{-webkit-transform:rotate(12deg);-ms-transform:rotate(12deg);transform:rotate(12deg)}20%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}}.faa-parent.animated-hover:hover>.faa-ring,.faa-ring.animated,.faa-ring.animated-hover:hover{-webkit-animation:ring 2s ease infinite;animation:ring 2s ease infinite;transform-origin-x:50%;transform-origin-y:0;transform-origin-z:initial}.faa-parent.animated-hover:hover>.faa-ring.faa-fast,.faa-ring.animated-hover.faa-fast:hover,.faa-ring.animated.faa-fast{-webkit-animation:ring 1s ease infinite;animation:ring 1s ease infinite}.faa-parent.animated-hover:hover>.faa-ring.faa-slow,.faa-ring.animated-hover.faa-slow:hover,.faa-ring.animated.faa-slow{-webkit-animation:ring 3s ease infinite;animation:ring 3s ease infinite}@-webkit-keyframes vertical{0%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}4%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}8%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}12%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}16%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}20%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}22%{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes vertical{0%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}4%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}8%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}12%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}16%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}20%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}22%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}}.faa-parent.animated-hover:hover>.faa-vertical,.faa-vertical.animated,.faa-vertical.animated-hover:hover{-webkit-animation:vertical 2s ease infinite;animation:vertical 2s ease infinite}.faa-parent.animated-hover:hover>.faa-vertical.faa-fast,.faa-vertical.animated-hover.faa-fast:hover,.faa-vertical.animated.faa-fast{-webkit-animation:vertical 1s ease infinite;animation:vertical 1s ease infinite}.faa-parent.animated-hover:hover>.faa-vertical.faa-slow,.faa-vertical.animated-hover.faa-slow:hover,.faa-vertical.animated.faa-slow{-webkit-animation:vertical 4s ease infinite;animation:vertical 4s ease infinite}@-webkit-keyframes horizontal{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}6%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}12%{-webkit-transform:translate(0,0);transform:translate(0,0)}18%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}24%{-webkit-transform:translate(0,0);transform:translate(0,0)}30%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}36%{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes horizontal{0%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}6%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}12%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}18%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}24%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}30%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}36%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}}.faa-horizontal.animated,.faa-horizontal.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-horizontal{-webkit-animation:horizontal 2s ease infinite;animation:horizontal 2s ease infinite}.faa-horizontal.animated-hover.faa-fast:hover,.faa-horizontal.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-horizontal.faa-fast{-webkit-animation:horizontal 1s ease infinite;animation:horizontal 1s ease infinite}.faa-horizontal.animated-hover.faa-slow:hover,.faa-horizontal.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-horizontal.faa-slow{-webkit-animation:horizontal 3s ease infinite;animation:horizontal 3s ease infinite}@-webkit-keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}.faa-flash.animated,.faa-flash.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-flash{-webkit-animation:flash 2s ease infinite;animation:flash 2s ease infinite}.faa-flash.animated-hover.faa-fast:hover,.faa-flash.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-flash.faa-fast{-webkit-animation:flash 1s ease infinite;animation:flash 1s ease infinite}.faa-flash.animated-hover.faa-slow:hover,.faa-flash.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-flash.faa-slow{-webkit-animation:flash 3s ease infinite;animation:flash 3s ease infinite}@-webkit-keyframes bounce{0%,10%,20%,50%,80%{-webkit-transform:translateY(0);transform:translateY(0)}40%,60%{-webkit-transform:translateY(-15px);transform:translateY(-15px)}}@keyframes bounce{0%,10%,20%,50%,80%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}40%,60%{-webkit-transform:translateY(-15px);-ms-transform:translateY(-15px);transform:translateY(-15px)}}.faa-bounce.animated,.faa-bounce.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-bounce{-webkit-animation:bounce 2s ease infinite;animation:bounce 2s ease infinite}.faa-bounce.animated-hover.faa-fast:hover,.faa-bounce.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-bounce.faa-fast{-webkit-animation:bounce 1s ease infinite;animation:bounce 1s ease infinite}.faa-bounce.animated-hover.faa-slow:hover,.faa-bounce.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-bounce.faa-slow{-webkit-animation:bounce 3s ease infinite;animation:bounce 3s ease infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);-ms-transform:rotate(359deg);transform:rotate(359deg)}}.faa-parent.animated-hover:hover>.faa-spin,.faa-spin.animated,.faa-spin.animated-hover:hover{-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}.faa-parent.animated-hover:hover>.faa-spin.faa-fast,.faa-spin.animated-hover.faa-fast:hover,.faa-spin.animated.faa-fast{-webkit-animation:spin .7s linear infinite;animation:spin .7s linear infinite}.faa-parent.animated-hover:hover>.faa-spin.faa-slow,.faa-spin.animated-hover.faa-slow:hover,.faa-spin.animated.faa-slow{-webkit-animation:spin 2.2s linear infinite;animation:spin 2.2s linear infinite}@-webkit-keyframes float{0%{-webkit-transform:translateY(0);transform:translateY(0)}50%{-webkit-transform:translateY(-6px);transform:translateY(-6px)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes float{0%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}50%{-webkit-transform:translateY(-6px);-ms-transform:translateY(-6px);transform:translateY(-6px)}100%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}}.faa-float.animated,.faa-float.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-float{-webkit-animation:float 2s linear infinite;animation:float 2s linear infinite}.faa-float.animated-hover.faa-fast:hover,.faa-float.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-float.faa-fast{-webkit-animation:float 1s linear infinite;animation:float 1s linear infinite}.faa-float.animated-hover.faa-slow:hover,.faa-float.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-float.faa-slow{-webkit-animation:float 3s linear infinite;animation:float 3s linear infinite}@-webkit-keyframes pulse{0%{-webkit-transform:scale(1.1);transform:scale(1.1)}50%{-webkit-transform:scale(0.8);transform:scale(0.8)}100%{-webkit-transform:scale(1.1);transform:scale(1.1)}}@keyframes pulse{0%{-webkit-transform:scale(1.1);-ms-transform:scale(1.1);transform:scale(1.1)}50%{-webkit-transform:scale(0.8);-ms-transform:scale(0.8);transform:scale(0.8)}100%{-webkit-transform:scale(1.1);-ms-transform:scale(1.1);transform:scale(1.1)}}.faa-parent.animated-hover:hover>.faa-pulse,.faa-pulse.animated,.faa-pulse.animated-hover:hover{-webkit-animation:pulse 2s linear infinite;animation:pulse 2s linear infinite}.faa-parent.animated-hover:hover>.faa-pulse.faa-fast,.faa-pulse.animated-hover.faa-fast:hover,.faa-pulse.animated.faa-fast{-webkit-animation:pulse 1s linear infinite;animation:pulse 1s linear infinite}.faa-parent.animated-hover:hover>.faa-pulse.faa-slow,.faa-pulse.animated-hover.faa-slow:hover,.faa-pulse.animated.faa-slow{-webkit-animation:pulse 3s linear infinite;animation:pulse 3s linear infinite}.faa-parent.animated-hover:hover>.faa-shake,.faa-shake.animated,.faa-shake.animated-hover:hover{-webkit-animation:wrench 2.5s ease infinite;animation:wrench 2.5s ease infinite}.faa-parent.animated-hover:hover>.faa-shake.faa-fast,.faa-shake.animated-hover.faa-fast:hover,.faa-shake.animated.faa-fast{-webkit-animation:wrench 1.2s ease infinite;animation:wrench 1.2s ease infinite}.faa-parent.animated-hover:hover>.faa-shake.faa-slow,.faa-shake.animated-hover.faa-slow:hover,.faa-shake.animated.faa-slow{-webkit-animation:wrench 3.7s ease infinite;animation:wrench 3.7s ease infinite}@-webkit-keyframes tada{0%{-webkit-transform:scale(1);transform:scale(1)}10%,20%{-webkit-transform:scale(.9) rotate(-8deg);transform:scale(.9) rotate(-8deg)}30%,50%,70%{-webkit-transform:scale(1.3) rotate(8deg);transform:scale(1.3) rotate(8deg)}40%,60%{-webkit-transform:scale(1.3) rotate(-8deg);transform:scale(1.3) rotate(-8deg)}80%{-webkit-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}}@keyframes tada{0%{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}10%,20%{-webkit-transform:scale(.9) rotate(-8deg);-ms-transform:scale(.9) rotate(-8deg);transform:scale(.9) rotate(-8deg)}30%,50%,70%{-webkit-transform:scale(1.3) rotate(8deg);-ms-transform:scale(1.3) rotate(8deg);transform:scale(1.3) rotate(8deg)}40%,60%{-webkit-transform:scale(1.3) rotate(-8deg);-ms-transform:scale(1.3) rotate(-8deg);transform:scale(1.3) rotate(-8deg)}80%{-webkit-transform:scale(1) rotate(0);-ms-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}}.faa-parent.animated-hover:hover>.faa-tada,.faa-tada.animated,.faa-tada.animated-hover:hover{-webkit-animation:tada 2s linear infinite;animation:tada 2s linear infinite}.faa-parent.animated-hover:hover>.faa-tada.faa-fast,.faa-tada.animated-hover.faa-fast:hover,.faa-tada.animated.faa-fast{-webkit-animation:tada 1s linear infinite;animation:tada 1s linear infinite}.faa-parent.animated-hover:hover>.faa-tada.faa-slow,.faa-tada.animated-hover.faa-slow:hover,.faa-tada.animated.faa-slow{-webkit-animation:tada 3s linear infinite;animation:tada 3s linear infinite}@-webkit-keyframes passing{0%{-webkit-transform:translateX(-50%);transform:translateX(-50%);opacity:0}50%{-webkit-transform:translateX(0%);transform:translateX(0%);opacity:1}100%{-webkit-transform:translateX(50%);transform:translateX(50%);opacity:0}}@keyframes passing{0%{-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%);opacity:0}50%{-webkit-transform:translateX(0%);-ms-transform:translateX(0%);transform:translateX(0%);opacity:1}100%{-webkit-transform:translateX(50%);-ms-transform:translateX(50%);transform:translateX(50%);opacity:0}}.faa-parent.animated-hover:hover>.faa-passing,.faa-passing.animated,.faa-passing.animated-hover:hover{-webkit-animation:passing 2s linear infinite;animation:passing 2s linear infinite}.faa-parent.animated-hover:hover>.faa-passing.faa-fast,.faa-passing.animated-hover.faa-fast:hover,.faa-passing.animated.faa-fast{-webkit-animation:passing 1s linear infinite;animation:passing 1s linear infinite}.faa-parent.animated-hover:hover>.faa-passing.faa-slow,.faa-passing.animated-hover.faa-slow:hover,.faa-passing.animated.faa-slow{-webkit-animation:passing 3s linear infinite;animation:passing 3s linear infinite}@-webkit-keyframes burst{0%{opacity:.6}50%{-webkit-transform:scale(1.8);transform:scale(1.8);opacity:0}100%{opacity:0}}@keyframes burst{0%{opacity:.6}50%{-webkit-transform:scale(1.8);-ms-transform:scale(1.8);transform:scale(1.8);opacity:0}100%{opacity:0}}.faa-burst.animated,.faa-burst.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-burst{-webkit-animation:burst 2s infinite linear;animation:burst 2s infinite linear}.faa-burst.animated-hover.faa-fast:hover,.faa-burst.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-burst.faa-fast{-webkit-animation:burst 1s infinite linear;animation:burst 1s infinite linear}.faa-burst.animated-hover.faa-slow:hover,.faa-burst.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-burst.faa-slow{-webkit-animation:burst 3s infinite linear;animation:burst 3s infinite linear}"
  );


  $templateCache.put('assets/css/samples.min.css',
    "body .sample-info{padding:8px}body #CompressionView .progress{height:16px;margin-bottom:6px}body #CompressionView .progress .progress-bar{font-size:11px;line-height:12px;padding:2px 0}body .content-border-glow{outline:1px solid #ff6a00;box-shadow:0 0 5px #ff6a00 inset;position:relative}body .content-border-glow.-before:before{content:'Intercepted HTML';padding:3px;color:#fff;font-size:9px;top:0;left:0;position:absolute;background-color:rgba(0,0,0,.5)}"
  );

}]);