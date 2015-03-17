// Extend string with more functionality
(function (window, document) {

    // Define the encoders
    var encoders = {};

    // Define the LZW ecnoder (default encoder)
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
    encoders.lzw = lzwCompressor;

    // Regoster the SCSU Compression module (if found)
    if (typeof SCSU !== 'undefined') {
        var scsuWorker = new SCSU();
        var scsuCompressor = {
            encode: function (input) {
                return scsuWorker.compress(input);
            },
            decode: function (input) {
                return scsuWorker.decompress(input);
            }
        };
        encoders.scsu = scsuCompressor;
    }

    // Define the main class
    var StringPrototyped = function (input) {
        var ctx = this;

        // Store current value(s)
        ctx.val = input;
        ctx.encoders = encoders;

        // Define the extender functions
        ctx.then = function (callback) {
            // Run the callback (if defined)
            if (typeof callback === 'function') {
                callback(ctx.val);
            }
            return ctx;
        },
        ctx.eval = function (callback) {
            ctx.val = eval(input);
            if (typeof callback === 'function') {
                callback(ctx.val);
            }
            return ctx;
        },
        ctx.compress = function (callback, encoder) {
            if (!encoder) encoder = 'lzw';
            if (ctx.encoders.hasOwnProperty(encoder)) {
                var worker = ctx.encoders[encoder];
                var output = ctx.val = worker.encode(input);
                if (typeof callback === 'function') {
                    callback(output);
                }
                return new StringPrototyped(output);
            } else throw new Error('Compression Failed. Encoder: ' + encoder);
        },
        ctx.decompress = function (callback, encoder) {
            if (!encoder) encoder = 'lzw';
            if (ctx.encoders.hasOwnProperty(encoder)) {
                var worker = ctx.encoders[encoder];
                var output = ctx.val = worker.decode(input);
                if (typeof callback === 'function') {
                    callback(output);
                }
                return new StringPrototyped(output);
            } else throw new Error('Decompression Failed. Encoder: ' + encoder);
        }
        ctx.insert = function (type, callback) {
            var node = document.createElement(type);
            node.onload = function (evt) {
                if (callback) callback(ctx.val);
            }
            node.innerText = ctx.val
            document.body.appendChild(node);
        }
        ctx.inject = function (callback, async) {
            var url = ctx.val;
            if (/\.js/.test(url)) {
                var srcipt = document.createElement('script');
                document.body.appendChild(srcipt);
                srcipt.onload = function (evt) {
                    if (callback) callback(url, evt);
                }
                if (typeof async !== 'undefined') {
                    srcipt.async = async;
                }
                srcipt.src = url;
            } else if (/\.css/.test(url)) {
                var link = document.createElement('link');
                link.onload = function (evt) {
                    if (callback) callback(url, evt);
                }
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = url;
                document.head.appendChild(link);
            }

            return ctx;
        }
        ctx.isReady = true;

        return ctx;
    };

    // expose to the global object
    window.StringPrototyped = StringPrototyped;

    // expose as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(StringPrototyped);
    }

    // Return the defined type
    return StringPrototyped;
})(window || {}, document || {});

// Extend the string class with override
String.prototype[''] = function (callback) {
    var input = this;
    var ctx = new StringPrototyped(input);
    if (typeof callback === 'function') {
        callback(input);
    }
    return ctx;
};
