// Wrap this script in a closure 
(function (window, document, baseUrl) {
    var libs = [
        baseUrl + 'assets/lib/ping.js',
    ];
    var css = [
        baseUrl + 'assets/css/test.css',
    ];
    try {

        function init() {
            // Load all the relevant style sheets (async)
            css.forEach(function (styleSheet) {
                styleSheet['']().inject(function (src) {
                    console.debug(' - Style sheet added: ' + src);
                });
            });

            // Load scripts async according to some feature detections...
            if (typeof $script === 'undefined' && libs.length > 0) {
                // Go and fetch the script loader js
                (baseUrl + 'assets/app.loader.js')['']().inject(function (src, evt) {
                    console.debug(' - Loaded: ' + src);
                    load();
                })
            } else if (libs.length > 0) {
                // Script loader already defined
                load();
            } else {
                // Nothing to load, so bootstrap
                bootstrap();
            }
        }

        function load() {
            // Make sure jQuery is defined
            if (typeof jQuery === 'undefined') {
                // Load jQuery
                libs.push('https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js');
            }

            // Load all of the dependencies asynchronously.
            var isAvailable = typeof $script !== 'undefined';
            if (isAvailable) {
                console.debug(' - Loading dynamic scripts...', libs);
                $script(libs, function () {
                    // Bootstrap the system when all scripts are loaded
                    bootstrap();
                });
            } else {
                // The current browser is not supported
                throw new Error('$script failed to load!');
            }
        }

        function bootstrap() {
            console.debug(' - Bootstrapping...');
        }

        // Initialise and bootstrap
        init();
    }
    catch (ex) {
        // Something went wrong...
        console.error('Failed to load dynamic scripts...', ex);
    }
})(window, document, '');