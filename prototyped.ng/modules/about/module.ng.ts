/// <reference path="../../imports.d.ts" />

angular.module('prototyped.about', [
    'prototyped.ng.runtime',
    'prototyped.ng.views',
    'prototyped.ng.styles',
])

    .config(['appStateProvider', (appStateProvider: proto.ng.modules.common.providers.AppStateProvider) => {
        // Define application state
        appStateProvider
            .when('/about', '/about/info')
            .define('about', {
                url: '/about',
                priority: 1000,
                state: {
                    url: '/about',
                    abstract: true,
                },
                menuitem: {
                    label: 'About',
                    state: 'about.info',
                    icon: 'fa fa-info-circle',
                },
                cardview: {
                    style: 'img-about',
                    title: 'About this software',
                    desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
                },
                visible: () => {
                    return appStateProvider.appConfig.options.showAboutPage;
                },
            })
            /*
            .state('about', {
                url: '/about',
                abstract: true,
            })
            */
            .state('about.info', {
                url: '/info',
                views: {
                    'left@': { templateUrl: 'views/about/left.tpl.html' },
                    'main@': {
                        templateUrl: 'views/about/info.tpl.html',
                        controller: 'AboutInfoController',
                    },
                }
            })
            .state('about.online', {
                url: '^/contact',
                views: {
                    'left@': { templateUrl: 'views/about/left.tpl.html' },
                    'main@': { templateUrl: 'views/about/contact.tpl.html' },
                }
            })
            .state('about.conection', {
                url: '/conection',
                views: {
                    'left@': { templateUrl: 'views/about/left.tpl.html' },
                    'main@': {
                        templateUrl: 'views/about/connections.tpl.html',
                        controller: 'AboutConnectionController',
                    },
                }
            })
    }])

    .controller('AboutInfoController', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {

        function css(a) {
            var sheets: any = document.styleSheets, o = [];
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
            //var ret = css($(selector));
            //return ret;
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
                about: null,
                versions: {
                    ie: null,
                    html: null,
                    jqry: null,
                    css: null,
                    js: null,
                    ng: null,
                    nw: null,
                    njs: null,
                    v8: null,
                    openssl: null,
                    chromium: null,
                },
                detects: {
                    jqry: false,
                    less: false,
                    bootstrap: false,
                    ngAnimate: false,
                    ngUiRouter: false,
                    ngUiUtils: false,
                    ngUiBootstrap: false,
                },
                css: {
                    boostrap2: null,
                    boostrap3: null,
                },
                codeName: navigator.appCodeName,
                userAgent: navigator.userAgent,
            };

            try {
                // Get IE version (if defined)
                if (!!window['ActiveXObject']) {
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

                    if (!window.isNaN(ua)) {
                        if (parseInt(ua) > 0) {
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
                        info.detects.less = info.detects.less || /(.*)(less.*js)(.*)/i.test(src);
                        info.detects.bootstrap = info.detects.bootstrap || /(.*)(bootstrap)(.*)/i.test(src);
                        info.detects.ngAnimate = info.detects.ngAnimate || /(.*)(angular\-animate)(.*)/i.test(src);
                        info.detects.ngUiRouter = info.detects.ngUiRouter || /(.*)(angular\-ui\-router)(.*)/i.test(src);
                        info.detects.ngUiUtils = info.detects.ngUiUtils || /(.*)(angular\-ui\-utils)(.*)/i.test(src);
                        info.detects.ngUiBootstrap = info.detects.ngUiBootstrap || /(.*)(angular\-ui\-bootstrap)(.*)/i.test(src);
                    }
                });

                // Get the client browser details (build a url string)
                var detectUrl = (function () {
                    var p = [], w = <any>window, d = document, e = 0, f = 0; p.push('ua=' + encodeURIComponent(navigator.userAgent)); e |= w.ActiveXObject ? 1 : 0; e |= w.opera ? 2 : 0; e |= w.chrome ? 4 : 0;
                    e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0; e |= ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
                    e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0; p.push('e=' + e); f |= 'sandbox' in d.createElement('iframe') ? 1 : 0; f |= 'WebSocket' in w ? 2 : 0;
                    f |= w.Worker ? 4 : 0; f |= w.applicationCache ? 8 : 0; f |= w.history && history.pushState ? 16 : 0; f |= (<any>d.documentElement).webkitRequestFullScreen ? 32 : 0; f |= 'FileReader' in w ? 64 : 0;
                    p.push('f=' + f); p.push('r=' + Math.random().toString(36).substring(7)); p.push('w=' + screen.width); p.push('h=' + screen.height); var s = d.createElement('script');
                    return 'http://api.whichbrowser.net/rel/detect.js?' + p.join('&');
                })();

                // Send a loaded package to a server to detect more features
                $.getScript(detectUrl)
                    .done(function (script, textStatus) {
                        $rootScope.$applyAsync(function () {
                            // Browser info and details loaded
                            var browserInfo = new window.WhichBrowser();
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
                var webDB = info.about.webdb = <any>{
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
                            if (tx) {
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
    }])

    .controller('AboutConnectionController', ['$scope', '$location', '$timeout', function ($scope, $location, $timeout) {
        $scope.result = null;
        $scope.status = null;
        $scope.state = {
            editMode: false,
            location: $location.$$absUrl,
            protocol: $location.$$protocol,
            requireHttps: ($location.$$protocol == 'https'),
        };
        $scope.detect = function () {
            var target = $scope.state.location;
            var started = Date.now();
            $scope.result = null;
            $scope.latency = null;
            $scope.status = { code: 0, desc: '', style: 'label-default' };
            $.ajax({
                url: target,
                crossDomain: true,
                /*
                username: 'user',
                password: 'pass',
                xhrFields: {
                    withCredentials: true
                }
                 */
                beforeSend: function (xhr) {
                    $timeout(function () {
                        //$scope.status.code = xhr.status;
                        $scope.status.desc = 'sending';
                        $scope.status.style = 'label-info';
                    });
                },
                success: function (data, textStatus, xhr) {
                    $timeout(function () {
                        $scope.status.code = xhr.status;
                        $scope.status.desc = textStatus;
                        $scope.status.style = 'label-success';
                        $scope.result = {
                            valid: true,
                            info: data,
                            sent: started,
                            received: Date.now()
                        };
                    });
                },
                error: (xhr: any, textStatus: string, error: any) => {
                    xhr.ex = error;
                    $timeout(function () {
                        $scope.status.code = xhr.status;
                        $scope.status.desc = textStatus;
                        $scope.status.style = 'label-danger';
                        $scope.result = {
                            valid: false,
                            info: xhr,
                            sent: started,
                            error: xhr.statusText,
                            received: Date.now()
                        };
                    });
                },
                complete: function (xhr, textStatus) {
                    console.debug(' - Status Code: ' + xhr.status);
                    $timeout(function () {
                        $scope.status.code = xhr.status;
                        $scope.status.desc = textStatus;
                    });
                }
            }).always(function (xhr) {
                    $timeout(function () {
                        $scope.latency = $scope.getLatencyInfo();
                    });
                });
        }
        $scope.setProtocol = function (protocol) {
            var val = $scope.state.location;
            var pos = val.indexOf('://');
            if (pos > 0) {
                val = protocol + val.substring(pos);
            }
            $scope.state.protocol = protocol;
            $scope.state.location = val;
            $scope.detect();
        }
        $scope.getProtocolStyle = function (protocol, activeStyle) {
            var cssRes = '';
            var isValid = $scope.state.location.indexOf(protocol + '://') == 0;
            if (isValid) {
                if (!$scope.result) {
                    cssRes += 'btn-primary';
                } else if ($scope.result.valid && activeStyle) {
                    cssRes += activeStyle;
                } else if ($scope.result) {
                    cssRes += $scope.result.valid ? 'btn-success' : 'btn-danger';
                }
            }
            return cssRes;
        }
        $scope.getStatusIcon = function (activeStyle) {
            var cssRes = '';
            if (!$scope.result) {
                cssRes += 'glyphicon-refresh';
            } else if (activeStyle && $scope.result.valid) {
                cssRes += activeStyle;
            } else {
                cssRes += $scope.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
            }
            return cssRes;
        }
        $scope.submitForm = function () {
            $scope.state.editMode = false;
            if ($scope.state.requireHttps) {
                $scope.setProtocol('https');
            } else {
                $scope.detect();
            }
        }
        $scope.getStatusColor = function () {
            var cssRes = $scope.getStatusIcon() + ' ';
            if (!$scope.result) {
                cssRes += 'busy';
            } else if ($scope.result.valid) {
                cssRes += 'success';
            } else {
                cssRes += 'error';
            }
            return cssRes;
        }
        $scope.getLatencyInfo = function () {
            var cssNone = 'text-muted';
            var cssHigh = 'text-success';
            var cssMedium = 'text-warning';
            var cssLow = 'text-danger';
            var info = {
                desc: '',
                style: cssNone,
            };

            if (!$scope.result) {
                return info;
            }

            if (!$scope.result.valid) {
                info.style = 'text-muted';
                info.desc = 'Connection Failed';
                return info;
            }

            var totalMs = $scope.result.received - $scope.result.sent;
            if (totalMs > 2 * 60 * 1000) {
                info.style = cssNone;
                info.desc = 'Timed out';
            } else if (totalMs > 1 * 60 * 1000) {
                info.style = cssLow;
                info.desc = 'Impossibly slow';
            } else if (totalMs > 30 * 1000) {
                info.style = cssLow;
                info.desc = 'Very slow';
            } else if (totalMs > 1 * 1000) {
                info.style = cssMedium;
                info.desc = 'Relatively slow';
            } else if (totalMs > 500) {
                info.style = cssMedium;
                info.desc = 'Moderately slow';
            } else if (totalMs > 250) {
                info.style = cssMedium;
                info.desc = 'Barely Responsive';
            } else if (totalMs > 150) {
                info.style = cssHigh;
                info.desc = 'Average Response Time';
            } else if (totalMs > 50) {
                info.style = cssHigh;
                info.desc = 'Responsive Enough';
            } else if (totalMs > 15) {
                info.style = cssHigh;
                info.desc = 'Very Responsive';
            } else {
                info.style = cssHigh;
                info.desc = 'Optimal';
            }
            return info;
        }
    }])
