module.exports = {
    options: {
        singleModule: true,
        htmlmin: {
            collapseWhitespace: true,
            collapseBooleanAttributes: false
        },
        url: function (url) {
            // Remove the prefix (if exists)
            var path = require('path');
            var prefix = require('grunt').config('cfg').base;
            if (url && (url.indexOf(prefix) == 0)) {
                url = url.substring(prefix.length);
            }
            return url;
        },
        source: function (src) {
            //return src['']().compress();
            return src;
        },
        bootstrap: function (module, script) {
            var cnt = script;
            /*
            var regx = /(\$templateCache\.put\('[^']+',)([^"]+")([^"]+")([^\)]*)/gim;
            var match = regx.exec(cnt)
            while (match != null) {
                var repl = match[1] + '"' + match[3];// + ');';
                cnt = cnt.substring(0, match.index) + repl + cnt.substring(match.index + match[0].length);
                match = regx.exec(cnt, match.index + repl.length);
            }
            */
            return "angular.module('" + module + "', []).run(['$templateCache', function($templateCache) { \r\n" +
                        cnt + //cnt.replace(/(\s*\r?\n)/gim, '\r\n\t') +
                    "\r\n}]);";
        },
        process: function (content, filepath) {
            // grunt.template.process                                        
            // Define the LZW ecnoder (default encoder)
            /*
            var lzwCompressor = {
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
            }
            var payload = lzwCompressor.encode(content);
            //console.log(payload);
            return '<script>' + JSON.stringify(payload) + '</script>';
            */
            return content;
        },
    },    
    web_styles: {
        options: {
            module: 'myApp.styles',
            base: '<%= cfg.base %><%= cfg.web %>',
            htmlmin: {
                collapseWhitespace: false,
                collapseBooleanAttributes: false,
            },
            url: function (url) {
                // Remove the prefix (if exists)
                var path = require('path');
                var prefix = './prototyped.ng/';
                if (url && (url.indexOf(prefix) == 0)) {
                    url = url.substring(prefix.length);
                }
                return url;
            }
        },
        src: [
            '<%= cfg.base %><%= cfg.web %>/assets/css/!app*.css',
            '<%= cfg.base %><%= cfg.web %>/**/**.min.css'
        ],
        dest: '<%= cfg.base %><%= cfg.web %>/<%= cfg.lib %>/app.styles.js',
    },
};