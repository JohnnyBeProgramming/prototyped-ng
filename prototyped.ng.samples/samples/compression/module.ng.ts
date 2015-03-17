/// <reference path="../../imports.d.ts" />

declare var SCSU: new() => any;

angular.module('myApp.samples.compression', [])
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

    .controller('compressionController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', 'lzwCompressor', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, lzwCompressor) {
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
        var context = $scope.compression = <any>{
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
                // Compress text...
                try {
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
            },
        };

        $scope.$watch('compression.target', function () {
            if (context.result && context.resType != context.target) {
                // Update compressed result with new compression type
                context.compressText(context.text);
            }
        });

        // Apply updates (including async)
        var updates = <any>{};
        try {
            // Get some sample text
            context.getSampleText('assets/lib/test.js');

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
;