'use strict';

angular.module('myApp.about', [
    'ui.router'
])

    .config(['$stateProvider', function ($stateProvider) {

        // Define the UI states
        $stateProvider
          .state('about', {
              url: '/about',
              abstract: true,
          })
          .state('about.info', {
              url: '/info',
              views: {
                  'menu@': { templateUrl: 'views/about/menu.html' },
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': {
                      templateUrl: 'views/about/info.html',
                      controller: 'AboutInfoController',
                  },
              }
          })
          .state('about.online', {
              url: '^/contact',
              views: {
                  'menu@': { templateUrl: 'views/about/menu.html' },
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/contact.html' },
              }
          })

    }])

    .controller('AboutInfoController', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {

        function css(a) {
            var sheets = document.styleSheets, o = [];
            for (var i in sheets) {
                var rules = sheets[i].rules || sheets[i].cssRules;
                for (var r in rules) {
                    if (a.is(rules[r].selectorText)) {
                        o.push(rules[r].selectorText);
                    }
                }
            }
            return o;
        }

        function selectorExists(selector) {
            return false; //Just does not seem to work...
            var ret = css($(selector));
            return ret;
        }

        function getVersionInfo(ident) {
            try {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) { }
            return null;
        }

        // Define a function to detect the capabilities
        $scope.detectBrowserInfo = function () {
            var info = {
                versions: {},
                detects: {},
                css: {},
                codeName: navigator.appCodeName,
                userAgent: navigator.userAgent,
            };

            try {
                // Get IE version (if defined)
                if (!!window.ActiveXObject) {
                    info.versions.ie = 10;
                }

                // Sanitize codeName and userAgentt
                var cn = info.codeName;
                var ua = info.userAgent;
                if (ua) {
                    // Remove start of string in UAgent upto CName or end of string if not found.
                    ua = ua.substring((ua + cn).toLowerCase().indexOf(cn.toLowerCase()));
                    // Remove CName from start of string. (Eg. '/5.0 (Windows; U...)
                    ua = ua.substring(cn.length);
                    // Remove any spaves or '/' from start of string.
                    while (ua.substring(0, 1) == " " || ua.substring(0, 1) == "/") {
                        ua = ua.substring(1);
                    }
                    // Remove the end of the string from first characrer that is not a number or point etc.
                    var pointer = 0;
                    while ("0123456789.+-".indexOf((ua + "?").substring(pointer, pointer + 1)) >= 0) {
                        pointer = pointer + 1;
                    }
                    ua = ua.substring(0, pointer);

                    if (!isNaN(ua)) {
                        if (ua > 0) {
                            info.versions.html = ua;
                        }
                        if (parseFloat(ua) >= 5) {
                            info.versions.css = '3.x';
                            info.versions.js = '5.x';
                        }
                    }
                }
                info.versions.jqry = typeof jQuery !== 'undefined' ? jQuery.fn.jquery : null;
                info.versions.ng = typeof angular !== 'undefined' ? angular.version.full : null;
                info.versions.nw = getVersionInfo('node-webkit');
                info.versions.njs = getVersionInfo('node');
                info.versions.v8 = getVersionInfo('v8');
                info.versions.openssl = getVersionInfo('openssl');
                info.versions.chromium = getVersionInfo('chromium');

                // Check for CSS extensions
                info.css.boostrap2 = selectorExists('hero-unit');
                info.css.boostrap3 = selectorExists('jumbotron');

                // Detect selected features and availability
                info.about = {
                    protocol: $location.$$protocol,
                    browser: {
                    },
                    server: {
                        active: undefined,
                        url: $location.$$absUrl,
                    },
                    os: {},
                    hdd: { type: null },
                };

                // Detect the operating system
                var osName = 'Unknown OS';
                var appVer = navigator.appVersion;
                if (appVer) {
                    if (appVer.indexOf("Win") != -1) osName = 'Windows';
                    if (appVer.indexOf("Mac") != -1) osName = 'MacOS';
                    if (appVer.indexOf("X11") != -1) osName = 'UNIX';
                    if (appVer.indexOf("Linux") != -1) osName = 'Linux';
                    //if (appVer.indexOf("Apple") != -1) osName = 'Apple';
                }
                info.about.os.name = osName;

                // Check for jQuery
                info.detects.jqry = typeof jQuery !== 'undefined';

                // Check for general header and body scripts
                $("script").each(function () {
                    var src = $(this).attr("src");
                    if (src) {
                        // Fast check on known script names
                        info.detects.less |= /(.*)(less.*js)(.*)/.test(src);
                        info.detects.bootstrap |= /(.*)(bootstrap)(.*)/.test(src);
                        info.detects.ngAnimate |= /(.*)(angular\-animate)(.*)/.test(src);
                        info.detects.ngUiRouter |= /(.*)(angular\-ui\-router)(.*)/.test(src);
                        info.detects.ngUiUtils |= /(.*)(angular\-ui\-utils)(.*)/.test(src);
                        info.detects.ngUiBootstrap |= /(.*)(angular\-ui\-bootstrap)(.*)/.test(src);
                    }
                });

                // Get the client browser details (build a url string)
                var detectUrl = (function () {
                    var p = [], w = window, d = document, e = 0, f = 0; p.push('ua=' + encodeURIComponent(navigator.userAgent)); e |= w.ActiveXObject ? 1 : 0; e |= w.opera ? 2 : 0; e |= w.chrome ? 4 : 0;
                    e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0; e |= ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
                    e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0; p.push('e=' + e); f |= 'sandbox' in d.createElement('iframe') ? 1 : 0; f |= 'WebSocket' in w ? 2 : 0;
                    f |= w.Worker ? 4 : 0; f |= w.applicationCache ? 8 : 0; f |= w.history && history.pushState ? 16 : 0; f |= d.documentElement.webkitRequestFullScreen ? 32 : 0; f |= 'FileReader' in w ? 64 : 0;
                    p.push('f=' + f); p.push('r=' + Math.random().toString(36).substring(7)); p.push('w=' + screen.width); p.push('h=' + screen.height); var s = d.createElement('script');
                    return 'http://api.whichbrowser.net/rel/detect.js?' + p.join('&');
                })();

                // Send a loaded package to a server to detect more features
                $.getScript(detectUrl)
                    .done(function (script, textStatus) {
                        $rootScope.$applyAsync(function () {
                            // Browser info and details loaded
                            var browserInfo = new WhichBrowser();
                            angular.extend(info.about, browserInfo);
                        });
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.error(exception);
                    });

                // Set browser name to IE (if defined)
                if (navigator.appName == 'Microsoft Internet Explorer') {
                    info.about.browser.name = 'Internet Explorer';
                }

                // Check if the browser supports web db's
                var webDB = info.about.webdb = {
                    db: null,
                    version: '1',
                    active: null,
                    size: 5 * 1024 * 1024, // 5MB max
                    test: function (name, desc, dbVer, dbSize) {
                        try {
                            // Try and open a web db
                            webDB.db = openDatabase(name, webDB.version, desc, webDB.size);
                            webDB.onSuccess(null, null);
                        } catch (ex) {
                            // Nope, something went wrong
                            webDB.onError(null, null);
                        }
                    },
                    onSuccess: function (tx, r) {
                        if (tx) {
                            if (r) {
                                console.info(' - [ WebDB ] Result: ' + JSON.stringify(r));
                            }
                            if (tx)
                            {
                                console.info(' - [ WebDB ] Trans: ' + JSON.stringify(tx));
                            }
                        }
                        $rootScope.$applyAsync(function () {
                            webDB.active = true;
                            webDB.used = JSON.stringify(webDB.db).length;
                        });
                    },
                    onError: function (tx, e) {
                        console.warn(' - [ WebDB ] Warning, not available: ' + e.message);
                        $rootScope.$applyAsync(function () {
                            webDB.active = false;
                        });
                    },
                };
                info.about.webdb.test();

            } catch (ex) {
                console.error(ex);
            }

            // Return the preliminary info
            return info;
        }

        // Define the state
        $scope.info = $scope.detectBrowserInfo();
    }]);