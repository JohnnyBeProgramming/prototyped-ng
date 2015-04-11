/// <reference path="../../imports.d.ts" />

declare var SCSU: new () => any;

angular.module('prototyped.ng.samples.compression', [])
    .config(['$stateProvider', function ($stateProvider) {

        // Now set up the states
        $stateProvider
            .state('samples.compression', {
                url: '/compression',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/compression/main.tpl.html',
                        controller: 'compressionController'
                    },
                }
            })

    }])

    .service('lzwCompressor', function () {
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
                    }
                    else {
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
                    }
                    else {
                        phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                    }
                    out.push(phrase);
                    currChar = phrase.charAt(0);
                    dict[code] = oldPhrase + currChar;
                    code++;
                    oldPhrase = phrase;
                }
                return out.join("");
            },
        });
    })

    .controller('compressionController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', '$templateCache', 'lzwCompressor', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, $templateCache, lzwCompressor) {
        // Define the compressor
        var compressor = {
            lzw: lzwCompressor,
            scsu: {
                encode: function (input) {
                    try {
                        var scsu = new SCSU();
                        if (scsu._isCompressible()) {
                            return scsu.compress(input);
                        } else throw new Error('Input string cannot be compressed by SCSU!');
                    } catch (ex) {
                        alert(ex.message);
                    }
                },
                decode: function (input) {
                    try {
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
            },
        };

        // Define the model
        var context = $scope.compression = <any>{
            busy: true,
            target: 'lzw',
            compressText: function (text) {
                context.busy = true;
                context.result = 'Compressing text...';
                try {
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
                try {
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
                    $rootScope.$applyAsync(() => {
                        context.text = contents;
                        context.busy = false;
                    });
                } else {
                    context.text = 'Fetcing: ' + url;
                    var request = $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'text',
                        success: (data) => {

                            // Save in the local template cache
                            $templateCache.put(url, data)

                            // Update text box with text
                            $rootScope.$applyAsync(() => {
                                context.text = data;
                                context.busy = false;
                            });
                        },
                        error: (error: any) => {
                            // Update text box with text
                            $rootScope.$applyAsync(() => {
                                context.text = error.message || 'Something went wrong.';
                                context.busy = false;
                            });
                        }
                    });
                }
            },
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
                $rootScope.$applyAsync(() => {
                    context.result = '';
                });
            }
        });
        $scope.$watch('compression.sampleUrl', function () {
            if (context.sampleUrl) {
                // Update compressed result with new compression type
                context.getSampleText(context.sampleUrl);
            } else {
                $rootScope.$applyAsync(() => {
                    context.text = '';
                });
            }
        });

        // Apply updates (including async)
        var updates = <any>{};
        try {
            // Get some sample text
            //context.getSampleText('assets/lib/test.js');

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

    .run(['$state', '$templateCache', function ($state, $templateCache) {

    }])
