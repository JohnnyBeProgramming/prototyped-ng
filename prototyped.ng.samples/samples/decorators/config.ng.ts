module proto.ng.samples.decorators.config {

    export function ConfigureHttpRequestInterceptor($httpProvider, appConfigProvider) {
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
                    if (cfg.debug) console.log(' - [ Ajax ] ( ' + (async ? 'Async' : 'Sync') + ' ) => ', url, ctx);
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
                    me._protoStack = me._protoStack || []
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
                    if (ctx === null) return;

                    var readyCommand = me.onreadystatechange;
                    me.onreadystatechange = function (evt) {
                        var me = this;
                        var arg = arguments;
                        if (cfg.xhttp) {
                            if (ctx === null) return;
                            if (me.readyState == 4 && me.status == 200 && me.responseText) {
                                if (cfg.debug) console.log(' - [ Ajax ] ( Recieved ) => ', ctx);
                                if (cfg.promptme) {
                                    // Intercept the method 
                                    cfg.promptme(true, me.responseText)
                                        .then(function (revised) {
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
                    }

                    if (cfg.debug) console.log(' - [ Ajax ] ( Send ) => ', ctx);
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

    export function ConfigureQServiceInterceptor($provide, appConfigProvider) {
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

    }

} 