'use strict';

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

        function stripComments(stringIN) {
            var SLASH = '/';
            var BACK_SLASH = '\\';
            var STAR = '*';
            var DOUBLE_QUOTE = '"';
            var SINGLE_QUOTE = "'";
            var NEW_LINE = '\n';
            var CARRIAGE_RETURN = '\r';

            var string = stringIN;
            var length = string.length;
            var position = 0;
            var output = [];

            function getCurrentCharacter() {
                return string.charAt(position);
            }

            function getPreviousCharacter() {
                return string.charAt(position - 1);
            }

            function getNextCharacter() {
                return string.charAt(position + 1);
            }

            function add() {
                output.push(getCurrentCharacter());
            }

            function next() {
                position++;
            }

            function atEnd() {
                return position >= length;
            }

            function isEscaping() {
                if (getPreviousCharacter() == BACK_SLASH) {
                    var caret = position - 1;
                    var escaped = true;
                    while (caret-- > 0) {
                        if (string.charAt(caret) != BACK_SLASH) {
                            return escaped;
                        }
                        escaped = !escaped;
                    }
                    return escaped;
                }
                return false;
            }

            function processSingleQuotedString() {
                if (getCurrentCharacter() == SINGLE_QUOTE) {
                    add();
                    next();
                    while (!atEnd()) {
                        if (getCurrentCharacter() == SINGLE_QUOTE && !isEscaping()) {
                            return;
                        }
                        add();
                        next();
                    }
                }
            }

            function processDoubleQuotedString() {
                if (getCurrentCharacter() == DOUBLE_QUOTE) {
                    add();
                    next();
                    while (!atEnd()) {
                        if (getCurrentCharacter() == DOUBLE_QUOTE && !isEscaping()) {
                            return;
                        }
                        add();
                        next();
                    }
                }
            }

            function processSingleLineComment() {
                if (getCurrentCharacter() == SLASH) {
                    if (getNextCharacter() == SLASH) {
                        next();
                        while (!atEnd()) {
                            next();
                            if (getCurrentCharacter() == NEW_LINE || getCurrentCharacter() == CARRIAGE_RETURN) {
                                return;
                            }
                        }
                    }
                }
            }

            function processMultiLineComment() {
                if (getCurrentCharacter() == SLASH) {
                    if (getNextCharacter() == STAR) {
                        next();
                        next();
                        while (!atEnd()) {
                            next();
                            if (getCurrentCharacter() == STAR) {
                                if (getNextCharacter() == SLASH) {
                                    next();
                                    next();
                                    return;
                                }
                            }
                        }
                    }
                }
            }

            function processRegularExpression() {
                if (getCurrentCharacter() == SLASH) {
                    add();
                    next();
                    while (!atEnd()) {
                        if (getCurrentCharacter() == SLASH && !isEscaping()) {
                            return;
                        }
                        add();
                        next();
                    }
                }
            }

            while (!atEnd()) {
                processDoubleQuotedString();
                processSingleQuotedString();
                processSingleLineComment();
                processMultiLineComment();
                processRegularExpression();
                if (!atEnd()) {
                    add();
                    next();
                }
            }
            return output.join('');

        };

        // Extend string with some functionality
        String.prototype[''] = function (callback) {
            var input = this;
            var extender = this[''];
            //if (typeof extender.isReady === 'undefined') {
            extender.val = input;
            extender.encoders = compressor;
            extender.eval = function (callback) {
                var val = eval(input);
                if (typeof callback === 'function') {
                    callback(val);
                }
                return val;
            },
            extender.compress = function (encoder) {
                if (!encoder) encoder = 'lzw';
                if (extender.encoders.hasOwnProperty(encoder)) {
                    var worker = extender.encoders[encoder];
                    return worker.encode(input);
                } else throw new Error('Compression Failed. Encoder: ' + encoder);
            },
            extender.decompress = function (encoder) {
                if (!encoder) encoder = 'lzw';
                if (extender.encoders.hasOwnProperty(encoder)) {
                    var worker = extender.encoders[encoder];
                    return worker.decode(input);
                } else throw new Error('Decompression Failed. Encoder: ' + encoder);
            }
            extender.isReady = true;
            //}

            // Run callback with self (if needed)
            if (typeof callback === 'function') {
                callback(input);
            }

            return extender;
        };

        // Define the model
        var context = $scope.compression = {
            busy: true,
            target: 'lzw',
            compressText: function (text) {
                $rootScope.$applyAsync(function () {
                    console.groupCollapsed(' - Compressing text: ' + text.length + ' bytes...');

                    // Strip all comments, whitespaces, newlines...
                    var payload = context.text;
                    /*
                    if (payload && payload.length) {
                        payload = stripComments(payload);
                        payload = payload.replace(/\r?\n|\r/g, ' '); // Remove Line Breaks
                        payload = payload.replace(/\s+/g, ' '); // Reduce Whitespace
                        payload = payload.trim();
                    }
                    */

                    // Run the compression (if required)
                    var ident = context.target || 'lzw';
                    var worker = compressor[ident];
                    if (worker && worker.encode) {
                        // Compress payload
                        payload = worker.encode(payload);
                    }

                    payload = JSON.stringify(payload);
                    payload = '' + payload + "['']().decompress('" + ident + "')['']().eval()";

                    // Compress text...
                    context.resType = context.target;
                    context.result = payload;
                    context.ready = true;

                    // Build a url of the script
                    var url = 'javascript:' + payload;
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
        };

        $scope.$watch('compression.target', function () {
            if (context.result && context.resType != context.target) {
                // Update compressed result with new compression type
                context.compressText(context.text);
            }
        });


        // Apply updates (including async)
        var updates = {};
        try {

            updates.text = "\
/* -----------------------------------------------      \r\n\
 * Prototyped sample script                             \r\n\
 * ----------------------------------------------- */   \r\n\
var ctx = \"www.prototyped.info\"['']();                \r\n\
if (ctx.isReady) {                                      \r\n\
    ctx.compress()[''](function (result)                \r\n\
    {                                                   \r\n\
        // Callback reply when compressed...            \r\n\
        console.log(' - Compressed: ', result.length);  \r\n\
    })                                                  \r\n\
    .decompress()[''](function (result)                 \r\n\
    {                                                   \r\n\
        // Callback reply when decompressed...          \r\n\
        console.log(' - Decompressed: ', result.length);\r\n\
    }).val;	                                            \r\n\
}";

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