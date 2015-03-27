﻿/// <reference path="../../imports.d.ts" />
angular.module('prototyped.about', [
    'prototyped.ng.views',
    'prototyped.ng.styles',
    'ui.router'
]).config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Define redirects
        $urlRouterProvider.when('/about', '/about/info');

        // Define the UI states
        $stateProvider.state('about', {
            url: '/about',
            abstract: true
        }).state('about.info', {
            url: '/info',
            views: {
                'left@': { templateUrl: 'views/about/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/about/info.tpl.html',
                    controller: 'AboutInfoController'
                }
            }
        }).state('about.online', {
            url: '^/contact',
            views: {
                'left@': { templateUrl: 'views/about/left.tpl.html' },
                'main@': { templateUrl: 'views/about/contact.tpl.html' }
            }
        }).state('about.conection', {
            url: '/conection',
            views: {
                'left@': { templateUrl: 'views/about/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/about/connections.tpl.html',
                    controller: 'AboutConnectionController'
                }
            }
        });
    }]).controller('AboutInfoController', [
    '$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {
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
            return false;
            //var ret = css($(selector));
            //return ret;
        }

        function getVersionInfo(ident) {
            try  {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) {
            }
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
                    chromium: null
                },
                detects: {
                    jqry: false,
                    less: false,
                    bootstrap: false,
                    ngAnimate: false,
                    ngUiRouter: false,
                    ngUiUtils: false,
                    ngUiBootstrap: false
                },
                css: {
                    boostrap2: null,
                    boostrap3: null
                },
                codeName: navigator.appCodeName,
                userAgent: navigator.userAgent
            };

            try  {
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
                    browser: {},
                    server: {
                        active: undefined,
                        url: $location.$$absUrl
                    },
                    os: {},
                    hdd: { type: null }
                };

                // Detect the operating system
                var osName = 'Unknown OS';
                var appVer = navigator.appVersion;
                if (appVer) {
                    if (appVer.indexOf("Win") != -1)
                        osName = 'Windows';
                    if (appVer.indexOf("Mac") != -1)
                        osName = 'MacOS';
                    if (appVer.indexOf("X11") != -1)
                        osName = 'UNIX';
                    if (appVer.indexOf("Linux") != -1)
                        osName = 'Linux';
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
                    var p = [], w = window, d = document, e = 0, f = 0;
                    p.push('ua=' + encodeURIComponent(navigator.userAgent));
                    e |= w.ActiveXObject ? 1 : 0;
                    e |= w.opera ? 2 : 0;
                    e |= w.chrome ? 4 : 0;
                    e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0;
                    e |= ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
                    e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
                    p.push('e=' + e);
                    f |= 'sandbox' in d.createElement('iframe') ? 1 : 0;
                    f |= 'WebSocket' in w ? 2 : 0;
                    f |= w.Worker ? 4 : 0;
                    f |= w.applicationCache ? 8 : 0;
                    f |= w.history && history.pushState ? 16 : 0;
                    f |= d.documentElement.webkitRequestFullScreen ? 32 : 0;
                    f |= 'FileReader' in w ? 64 : 0;
                    p.push('f=' + f);
                    p.push('r=' + Math.random().toString(36).substring(7));
                    p.push('w=' + screen.width);
                    p.push('h=' + screen.height);
                    var s = d.createElement('script');
                    return 'http://api.whichbrowser.net/rel/detect.js?' + p.join('&');
                })();

                // Send a loaded package to a server to detect more features
                $.getScript(detectUrl).done(function (script, textStatus) {
                    $rootScope.$applyAsync(function () {
                        // Browser info and details loaded
                        var browserInfo = new window.WhichBrowser();
                        angular.extend(info.about, browserInfo);
                    });
                }).fail(function (jqxhr, settings, exception) {
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
                    size: 5 * 1024 * 1024,
                    test: function (name, desc, dbVer, dbSize) {
                        try  {
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
                    }
                };
                info.about.webdb.test();
            } catch (ex) {
                console.error(ex);
            }

            // Return the preliminary info
            return info;
        };

        // Define the state
        $scope.info = $scope.detectBrowserInfo();
    }]).controller('AboutConnectionController', [
    '$scope', '$location', '$timeout', function ($scope, $location, $timeout) {
        $scope.result = null;
        $scope.status = null;
        $scope.state = {
            editMode: false,
            location: $location.$$absUrl,
            protocol: $location.$$protocol,
            requireHttps: ($location.$$protocol == 'https')
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
                error: function (xhr, textStatus, error) {
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
        };
        $scope.setProtocol = function (protocol) {
            var val = $scope.state.location;
            var pos = val.indexOf('://');
            if (pos > 0) {
                val = protocol + val.substring(pos);
            }
            $scope.state.protocol = protocol;
            $scope.state.location = val;
            $scope.detect();
        };
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
        };
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
        };
        $scope.submitForm = function () {
            $scope.state.editMode = false;
            if ($scope.state.requireHttps) {
                $scope.setProtocol('https');
            } else {
                $scope.detect();
            }
        };
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
        };
        $scope.getLatencyInfo = function () {
            var cssNone = 'text-muted';
            var cssHigh = 'text-success';
            var cssMedium = 'text-warning';
            var cssLow = 'text-danger';
            var info = {
                desc: '',
                style: cssNone
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
        };
    }]);
/// <reference path="../imports.d.ts" />
// Constant object with default values
angular.module('prototyped.ng.config', []).constant('appDefaultConfig', {
    version: '1.0.0.0',
    routers: []
}).provider('appConfig', [
    'appDefaultConfig', function (appDefaultConfig) {
        var config = appDefaultConfig;
        return {
            set: function (options) {
                angular.extend(config, options);
            },
            clear: function () {
                config = appDefaultConfig;
            },
            $get: function () {
                return config;
            }
        };
    }]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (commands) {
            var ConsoleController = (function () {
                function ConsoleController($scope) {
                    this.$scope = $scope;
                    this._proxyList = [];
                    try  {
                        // Set the scope vars
                        $scope.myConsole = this;
                        $scope.lines = [];

                        // Create the list proxies
                        this._currentProxy = new BrowserConsole();
                        this._proxyList.push(this._currentProxy);

                        // Get the required libraries
                        if (typeof require !== 'undefined') {
                            var proc = require('child_process');
                            if (!$.isEmptyObject(proc)) {
                                this._currentProxy = new ProcessConsole(proc);
                                this._proxyList.push(this._currentProxy);
                            }
                        }
                    } catch (ex) {
                        // Could not load required libraries
                        console.error(' - Warning: Console app failed to load required libraries.');
                    } finally {
                        // Initialise the controller
                        this.init();
                    }
                }
                ConsoleController.prototype.init = function () {
                    try  {
                        // Check the command line status and give user some feedback
                        if (this._currentProxy) {
                            this.success('Command line ready and active.');
                        } else {
                            this.warning('Cannot access the command line from the browser.');
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                };

                ConsoleController.prototype.clear = function () {
                    // Clear cache
                    this.$scope.lines = [];

                    // Clear via proxy
                    if (this._currentProxy) {
                        this._currentProxy.clear();
                    }
                };

                ConsoleController.prototype.getProxyName = function () {
                    return (this._currentProxy) ? this._currentProxy.ProxyName : '';
                };
                ConsoleController.prototype.getProxies = function () {
                    return this._proxyList;
                };
                ConsoleController.prototype.setProxy = function (name) {
                    console.info(' - Switching Proxy: ' + name);
                    for (var i = 0; i < this._proxyList.length; i++) {
                        var itm = this._proxyList[i];
                        if (itm.ProxyName == name) {
                            this._currentProxy = itm;
                            break;
                        }
                    }

                    // Refresh UI if needed
                    if (!this.$scope.$$phase)
                        this.$scope.$apply();

                    return this._currentProxy;
                };

                ConsoleController.prototype.command = function (text) {
                    var _this = this;
                    // Try and run the command
                    this.info('' + text);
                    this.$scope.txtInput = '';

                    // Check if proxy exists
                    if (this._currentProxy) {
                        // Check for 'clear screen' command
                        if (text == 'cls')
                            return this.clear();

                        // Run the command via proxy
                        this._currentProxy.command(text, function (msg, tp) {
                            switch (tp) {
                                case 'debug':
                                    _this.debug(msg);
                                    break;
                                case 'info':
                                    _this.info(msg);
                                    break;
                                case 'warn':
                                    _this.warning(msg);
                                    break;
                                case 'succcess':
                                    _this.success(msg);
                                    break;
                                case 'error':
                                    _this.error(msg);
                                    break;
                                default:
                                    _this.debug(msg);
                                    break;
                            }

                            // Refresh UI if needed
                            if (!_this.$scope.$$phase)
                                _this.$scope.$apply();
                        });
                    } else {
                        this.error('Command line is not available...');
                    }
                };

                ConsoleController.prototype.debug = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'debug'
                    });
                };

                ConsoleController.prototype.info = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'info'
                    });
                };

                ConsoleController.prototype.warning = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'warning'
                    });
                };

                ConsoleController.prototype.success = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'success'
                    });
                };

                ConsoleController.prototype.error = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'error'
                    });
                };
                return ConsoleController;
            })();
            commands.ConsoleController = ConsoleController;

            var BrowserConsole = (function () {
                function BrowserConsole() {
                    this.ProxyName = 'Browser';
                }
                BrowserConsole.prototype.command = function (text, callback) {
                    try  {
                        var result = eval(text);
                        if (callback && result) {
                            callback(result, 'info');
                        }
                        console.info(result);
                    } catch (ex) {
                        callback(ex, 'error');
                        console.error(ex);
                    }
                };

                BrowserConsole.prototype.clear = function () {
                    console.clear();
                };
                BrowserConsole.prototype.debug = function (msg) {
                    console.debug(msg);
                };
                BrowserConsole.prototype.info = function (msg) {
                    console.info(msg);
                };
                BrowserConsole.prototype.warning = function (msg) {
                    console.warn(msg);
                };
                BrowserConsole.prototype.success = function (msg) {
                    console.info(msg);
                };
                BrowserConsole.prototype.error = function (msg) {
                    console.error(msg);
                };
                return BrowserConsole;
            })();
            commands.BrowserConsole = BrowserConsole;

            var ProcessConsole = (function () {
                function ProcessConsole(_proc) {
                    this._proc = _proc;
                    this.ProxyName = 'System';
                }
                ProcessConsole.prototype.clear = function () {
                };

                ProcessConsole.prototype.command = function (text, callback) {
                    // Call the command line from a child process
                    var proc = eval('process');
                    var ls = this._proc.exec(text, function (error, stdout, stderr) {
                        if (error) {
                            console.groupCollapsed('Command Error: ' + text);
                            console.error(error.stack);
                            console.info(' - Signal received: ' + error.signal);
                            console.info(' - Error code: ' + error.code);
                            console.groupEnd();
                        }
                        if (stdout) {
                            callback('' + stdout, 'info');
                        }
                        if (stderr) {
                            callback('' + stderr, 'error');
                        }
                    }).on('exit', function (code) {
                        //callback(' - Process returned: ' + code, 'debug');
                    });
                };
                return ProcessConsole;
            })();
            commands.ProcessConsole = ProcessConsole;
        })(ng.commands || (ng.commands = {}));
        var commands = ng.commands;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/ConsoleController.ts"/>
angular.module('prototyped.console', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Define the UI states
        $stateProvider.state('proto.console', {
            url: '/console',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/console/views/main.tpl.html',
                    controller: 'proto.ng.commands.ConsoleController'
                }
            }
        });
    }]).controller('proto.ng.commands.ConsoleController', [
    '$scope',
    proto.ng.commands.ConsoleController
]);
/// <reference path="../imports.d.ts" />
angular.module('prototyped.default', [
    'ui.router'
]).value('appPages', {
    pages: [
        {
            url: '/proto',
            style: 'img-explore',
            title: 'Explore Features & Options',
            desc: 'You can explore locally installed features and find your way around the site by clicking on this card...'
        },
        {
            url: '/samples',
            style: 'img-sandbox',
            title: 'Prototyped Sample Code',
            desc: 'A selection of samples to test, play and learn about web technologies.'
        },
        {
            url: '/sync',
            style: 'img-editor',
            title: 'Import & Export Data',
            desc: 'Load from external sources, modify and/or export to an external resource.'
        },
        {
            url: '/about',
            style: 'img-about',
            title: 'About this software',
            desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
        }
    ]
}).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('default', {
            url: '/',
            views: {
                'main@': {
                    templateUrl: 'views/default.tpl.html',
                    controller: 'CardViewCtrl',
                    controllerAs: 'sliderCtrl'
                }
            }
        });
    }]).controller('CardViewCtrl', [
    '$scope', 'appPages', function ($scope, appPages) {
        // Make sure 'mySiteMap' exists
        $scope.pages = appPages.pages || [];

        // initial image index
        $scope._Index = 0;

        $scope.count = function () {
            return $scope.pages.length;
        };

        // if a current image is the same as requested image
        $scope.isActive = function (index) {
            return $scope._Index === index;
        };

        // show prev image
        $scope.showPrev = function () {
            $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.count() - 1;
        };

        // show next image
        $scope.showNext = function () {
            $scope._Index = ($scope._Index < $scope.count() - 1) ? ++$scope._Index : 0;
        };

        // show a certain image
        $scope.showPhoto = function (index) {
            $scope._Index = index;
        };
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.edge', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('proto.edge', {
            url: '^/edge',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/edge/views/index.tpl.html',
                    controller: 'edgeViewController'
                }
            }
        });
    }]).controller('edgeViewController', [
    '$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {
        var appEdge = {
            stubs: null,
            active: false,
            start: function () {
                if (typeof require === 'undefined')
                    return;
                var edge = require("edge");
                try  {
                    console.log('-------------------------------------------------------------------------------');
                    console.log(' - Connnecting NodeJS with an EdgeJS to the outside world....');
                    console.log('-------------------------------------------------------------------------------');

                    var stubs = appEdge.stubs = {
                        ping: edge.func(function () {
                        })
                    };
                } catch (ex) {
                    appEdge.error = ex;
                    return false;
                }
                return true;
            },
            run: function () {
                // Send a pin out to C# world
                var me = 'JavaScript';
                console.log(' - [ JS ] Sending out a probe named \'' + me + '\'... ');
                appEdge.stubs.ping(me, function (error, result) {
                    if (error)
                        throw error;
                    console.log(result);
                    console.log(' - [ JS ] Seems like the probe made it back!');
                });
            }
        };

        // Define the Edge controller logic
        $scope.edge = {
            active: false,
            detect: function () {
                // Make sure we are in node space
                if (typeof require !== 'undefined') {
                    try  {
                        // Load the AppEdge library
                        var edge = appEdge;
                        if (edge) {
                            // Start loading all the stubs
                            $scope.edge.active = edge.start();

                            // Extend the scope with full functionality
                            angular.extend($scope.edge, edge);
                        }
                    } catch (ex) {
                        // Something went wrong
                        $scope.edge.error = ex;
                        return false;
                    }
                    return true;
                } else {
                    // Method 'require' is undefined, probably inside a browser window
                    $scope.edge.error = new Error('Required libraries not found or unavailable.');
                    return false;
                }
            }
        };

        // Auto-detect if node is available
        if (typeof require !== 'undefined') {
            $timeout(function () {
                $scope.edge.detect();
            });
        }
    }]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (editor) {
            var EditorController = (function () {
                function EditorController($scope, $timeout) {
                    this.$scope = $scope;
                    this.$timeout = $timeout;
                    this.isActive = false;
                    this.FileLocation = '';
                    this.LastChanged = null;
                    this.LastOnSaved = null;
                    this.$scope.myWriter = this;
                    try  {
                        // Load file system
                        this._path = require('path');
                        this._fs = require('fs');

                        // Try  and load the node webkit
                        var nwGui = 'nw.gui';
                        this._gui = require(nwGui);
                    } catch (ex) {
                        console.warn(' - [ Editor ] Warning: Could not load all required modules');
                    }
                }
                Object.defineProperty(EditorController.prototype, "FileContents", {
                    get: function () {
                        return this._buffer;
                    },
                    set: function (buffer) {
                        this._buffer = buffer;
                        this.LastChanged = Date.now();
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(EditorController.prototype, "HasChanges", {
                    get: function () {
                        return this.LastChanged != null && this.LastChanged > this.LastOnSaved;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EditorController.prototype, "HasFileSys", {
                    get: function () {
                        return !$.isEmptyObject(this._gui);
                    },
                    enumerable: true,
                    configurable: true
                });

                EditorController.prototype.init = function () {
                    this.isActive = true;
                };

                EditorController.prototype.openFile = function () {
                    var _this = this;
                    if (this.checkUnsaved())
                        return;

                    if (!$.isEmptyObject(this._gui) && !$.isEmptyObject(this._fs)) {
                        var chooser = $('#fileDialog');
                        chooser.change(function (evt) {
                            var filePath = chooser.val();
                            if (filePath) {
                                // Try and read the file
                                _this._fs.readFile(filePath, 'UTF-8', function (err, data) {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        _this.setText(data);
                                        _this.FileLocation = filePath;
                                        _this.LastChanged = null;
                                        _this.LastOnSaved = null;
                                    }
                                    _this.$scope.$apply();
                                });
                            }
                        });
                        chooser.trigger('click');
                    } else {
                        console.warn(' - [ Editor ] Warning: Shell not available.');
                    }
                };

                EditorController.prototype.openFileLocation = function () {
                    if (this._gui) {
                        this._gui.Shell.openItem(this.FileLocation);
                    } else {
                        console.warn(' - [ Editor ] Warning: Shell not available.');
                    }
                };

                EditorController.prototype.newFile = function () {
                    if (this.checkUnsaved())
                        return;

                    // Clear prev. states
                    this.FileLocation = null;
                    this.LastChanged = null;
                    this.LastOnSaved = null;

                    // Set some intial text
                    this.setText('Enter some text');
                    this.LastChanged = Date.now();

                    // Do post-new operations
                    this.$timeout(function () {
                        // Select file contents
                        var elem = $('#FileContents');
                        if (elem) {
                            elem.select();
                        }
                    });
                };

                EditorController.prototype.saveFile = function (filePath) {
                    var _this = this;
                    if (!filePath)
                        filePath = this.FileLocation;
                    if (!filePath)
                        return this.saveFileAs();
                    if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                        var output = this._buffer;
                        this._fs.writeFile(filePath, output, 'UTF-8', function (err) {
                            if (err) {
                                throw new Error(err);
                            } else {
                                // File has been saved
                                _this.FileLocation = filePath;
                                _this.LastOnSaved = Date.now();
                            }
                            _this.$scope.$apply();
                        });
                    } else {
                        console.warn(' - [ Editor ] Warning: File system not available.');
                    }
                };

                EditorController.prototype.saveFileAs = function () {
                    var _this = this;
                    if (!$.isEmptyObject(this._gui)) {
                        // Get the file name
                        var filePath = this.FileLocation || 'Untitled.txt';
                        var chooser = $('#saveDialog');
                        chooser.change(function (evt) {
                            var filePath = chooser.val();
                            if (filePath) {
                                // Save file in specified location
                                _this.saveFile(filePath);
                            }
                        });
                        chooser.trigger('click');
                    } else {
                        console.warn(' - [ Editor ] Warning: Shell not available.');
                    }
                };

                EditorController.prototype.setText = function (value) {
                    this.FileContents = value;

                    if (!this._textArea) {
                        var myTextArea = $('#FileContents');
                        if (myTextArea.length > 0) {
                            this._textArea = CodeMirror.fromTextArea(myTextArea[0], {
                                //mode: "javascript",
                                autoClearEmptyLines: true,
                                lineNumbers: true,
                                indentUnit: 4
                            });
                        }
                        this._textArea.setValue(value);
                    } else {
                        this._textArea.setValue(value);
                    }
                    /*
                    var totalLines = this._textArea.lineCount();
                    if (totalLines) {
                    this._textArea.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
                    }
                    */
                };

                EditorController.prototype.test = function () {
                    throw new Error('Lala');
                    try  {
                        var dir = './';
                        var log = "Test.log";
                        if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                            var target = this._path.resolve(dir, log);
                            this._fs.writeFile(log, "Hey there!", function (err) {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    var nwGui = 'nw.gui';
                                    var myGui = require(nwGui);
                                    if (!$.isEmptyObject(myGui)) {
                                        myGui.Shell.openItem(target);
                                    } else {
                                        throw new Error('Cannot open the item: ' + target);
                                    }
                                }
                            });
                        } else {
                            console.warn(' - Warning: File system not available...');
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                };

                EditorController.prototype.checkUnsaved = function (msg) {
                    var msgCheck = msg || 'There are unsaved changes.\r\nAre you sure you want to continue?';
                    var hasCheck = this.FileContents != null && this.HasChanges;
                    return (hasCheck && confirm(msgCheck) == false);
                };
                return EditorController;
            })();
            editor.EditorController = EditorController;
        })(ng.editor || (ng.editor = {}));
        var editor = ng.editor;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/EditorController.ts"/>
angular.module('prototyped.editor', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Define the UI states
        $stateProvider.state('proto.editor', {
            url: '/editor',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/editor/views/main.tpl.html',
                    controller: 'proto.ng.editor.EditorController'
                }
            }
        });
    }]).controller('proto.ng.editor.EditorController', [
    '$scope',
    '$timeout',
    proto.ng.editor.EditorController
]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (explorer) {
        var AddressBarController = (function () {
            function AddressBarController($rootScope, $scope, $q) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$scope = $scope;
                this.$q = $q;
                this.history = [];
                $scope.busy = true;
                try  {
                    // Initialise the address bar
                    var elem = $('#addressbar');
                    if (elem) {
                        this.init(elem);

                        this.$rootScope.$on('event:folder-path:changed', function (event, folder) {
                            if (folder != _this.$scope.dir_path) {
                                console.warn(' - Addressbar Navigate: ', folder);
                                _this.$scope.dir_path = folder;
                                _this.navigate(folder);
                            }
                        });
                    } else {
                        throw new Error('Element with id "addressbar" not found...');
                    }
                } catch (ex) {
                    // Initialisation failed
                    console.error(ex);
                }
                $scope.busy = false;
            }
            AddressBarController.prototype.init = function (element) {
                // Set the target HTML element
                this.element = element;

                // Generate the current folder parts
                this.generateOutput('./');
            };

            AddressBarController.prototype.openFolder = function (path) {
                try  {
                    var nwGui = 'nw.gui';
                    var gui = require(nwGui);
                    if (!$.isEmptyObject(gui)) {
                        console.debug(' - Opening Folder: ' + path);
                        gui.Shell.openItem(path + '/');
                    }
                } catch (ex) {
                    console.error(ex);
                }
                this.generateOutput(path);
            };

            AddressBarController.prototype.navigate = function (path) {
                this.generateOutput(path);
            };

            AddressBarController.prototype.select = function (file) {
                console.info(' - select: ', file);
                try  {
                    var req = 'nw.gui';
                    var gui = require(req);
                    gui.Shell.openItem(file);
                } catch (ex) {
                    console.error(ex);
                }
            };

            AddressBarController.prototype.back = function () {
                var len = this.history ? this.history.length : -1;
                if (len > 1) {
                    var last = this.history[len - 2];
                    this.history = this.history.splice(0, len - 2);
                    this.generateOutput(last);
                }
            };

            AddressBarController.prototype.hasHistory = function () {
                var len = this.history ? this.history.length : -1;
                return (len > 1);
            };

            AddressBarController.prototype.generateOutput = function (dir_path) {
                // Set the current dir path
                this.$scope.dir_path = dir_path;
                this.$scope.dir_parts = this.generatePaths(dir_path);
                this.history.push(dir_path);

                // Breadcast event that path has changed
                this.$rootScope.$broadcast('event:folder-path:changed', this.$scope.dir_path);
            };

            AddressBarController.prototype.generatePaths = function (dir_path) {
                try  {
                    // Get dependecies
                    var path = require('path');

                    // Update current path
                    this.$scope.dir_path = dir_path = path.resolve(dir_path);

                    // Try and normalize the folder path
                    var curr = path.normalize(dir_path);
                    if (curr) {
                        // Split path into separate elements
                        var sequence = curr.split(path.sep);
                        var result = [];

                        var i = 0;
                        for (; i < sequence.length; ++i) {
                            result.push({
                                name: sequence[i],
                                path: sequence.slice(0, 1 + i).join(path.sep)
                            });
                        }

                        // Add root for unix
                        if (sequence[0] == '' && process.platform != 'win32') {
                            result[0] = {
                                name: 'root',
                                path: '/'
                            };
                        }

                        // Return thepath sequences
                        return { sequence: result };
                    }
                } catch (ex) {
                    console.error(ex);
                }
            };
            return AddressBarController;
        })();
        explorer.AddressBarController = AddressBarController;
    })(proto.explorer || (proto.explorer = {}));
    var explorer = proto.explorer;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (explorer) {
        var ExplorerController = (function () {
            function ExplorerController($rootScope, $scope, $q) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$scope = $scope;
                this.$q = $q;
                var dir = './';
                try  {
                    // Hook up to the current scope
                    this.$scope.isBusy = true;

                    // Initialize the cotroller
                    this.init(dir);

                    // Hook event for when folder path changes
                    this.$rootScope.$on('event:folder-path:changed', function (event, folder) {
                        if (folder != _this.$scope.dir_path) {
                            console.warn(' - Explorer Navigate: ', folder);
                            _this.$scope.dir_path = folder;
                            _this.navigate(folder);
                        }
                    });
                } catch (ex) {
                    console.error(ex);
                }
            }
            ExplorerController.prototype.init = function (dir) {
                // Resolve the initial folder path
                this.navigate(dir);
            };

            ExplorerController.prototype.navigate = function (dir_path) {
                var _this = this;
                var deferred = this.$q.defer();
                try  {
                    // Set busy flag
                    this.$scope.isBusy = true;
                    this.$scope.error = null;

                    // Resolve the full path
                    var path = require('path');
                    dir_path = path.resolve(dir_path);

                    // Read the folder contents (async)
                    var fs = require('fs');
                    fs.readdir(dir_path, function (error, files) {
                        if (error) {
                            deferred.reject(error);
                            return;
                        }

                        // Split and sort results
                        var folders = [];
                        var lsFiles = [];
                        for (var i = 0; i < files.sort().length; ++i) {
                            var targ = path.join(dir_path, files[i]);
                            var stat = _this.mimeType(targ);
                            if (stat.type == 'folder') {
                                folders.push(stat);
                            } else {
                                lsFiles.push(stat);
                            }
                        }

                        // Generate the contents
                        var result = {
                            path: dir_path,
                            folders: folders,
                            files: lsFiles
                        };

                        // Mark promise as resolved
                        deferred.resolve(result);
                    });
                } catch (ex) {
                    // Mark promise and rejected
                    deferred.reject(ex);
                }

                // Handle the result and error conditions
                deferred.promise.then(function (result) {
                    // Clear busy flag
                    _this.$scope.isBusy = false;
                    _this.$scope.dir_path = result.path;
                    _this.$scope.files = result.files;
                    _this.$scope.folders = result.folders;

                    // Breadcast event that path has changed
                    _this.$rootScope.$broadcast('event:folder-path:changed', _this.$scope.dir_path);
                }, function (error) {
                    // Clear busy flag
                    _this.$scope.isBusy = false;
                    _this.$scope.error = error;
                });

                return deferred.promise;
            };

            ExplorerController.prototype.select = function (filePath) {
                this.$scope.selected = filePath;
            };

            ExplorerController.prototype.open = function (filePath) {
                var req = 'nw.gui';
                var gui = require(req);
                if (gui)
                    gui.Shell.openItem(filePath);
            };

            ExplorerController.prototype.mimeType = function (filepath) {
                var map = {
                    'compressed': ['zip', 'rar', 'gz', '7z'],
                    'text': ['txt', 'md', ''],
                    'image': ['jpg', 'jpge', 'png', 'gif', 'bmp'],
                    'pdf': ['pdf'],
                    'css': ['css'],
                    'excel': ['csv', 'xls', 'xlsx'],
                    'html': ['html'],
                    'word': ['doc', 'docx'],
                    'powerpoint': ['ppt', 'pptx'],
                    'movie': ['mkv', 'avi', 'rmvb']
                };
                var cached = {};

                var fs = require('fs');
                var path = require('path');
                var result = {
                    name: path.basename(filepath),
                    path: filepath,
                    type: null
                };

                try  {
                    var stat = fs.statSync(filepath);
                    if (stat.isDirectory()) {
                        result.type = 'folder';
                    } else {
                        var ext = path.extname(filepath).substr(1);
                        result.type = cached[ext];
                        if (!result.type) {
                            for (var key in map) {
                                var arr = map[key];
                                if (arr.length > 0 && arr.indexOf(ext) >= 0) {
                                    cached[ext] = result.type = key;
                                    break;
                                }
                            }

                            if (!result.type)
                                result.type = 'blank';
                        }
                    }
                } catch (e) {
                    console.error(e);
                }

                return result;
            };
            return ExplorerController;
        })();
        explorer.ExplorerController = ExplorerController;
    })(proto.explorer || (proto.explorer = {}));
    var explorer = proto.explorer;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.explorer', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        $stateProvider.state('proto.explore', {
            url: '^/explore',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/explore/views/index.tpl.html',
                    controller: 'proto.explorer.ExplorerController',
                    controllerAs: 'ctrlExplorer'
                }
            }
        });
    }]).directive('protoAddressBar', [
    '$q', function ($q) {
        return {
            restrict: 'EA',
            scope: {
                target: '=protoAddressBar'
            },
            transclude: false,
            templateUrl: 'modules/explore/views/addressbar.tpl.html',
            controller: 'proto.explorer.AddressBarController',
            controllerAs: 'addrBar'
        };
    }]).controller('proto.explorer.AddressBarController', [
    '$rootScope',
    '$scope',
    '$q',
    proto.explorer.AddressBarController
]).controller('proto.explorer.ExplorerController', [
    '$rootScope',
    '$scope',
    '$q',
    proto.explorer.ExplorerController
]);
/// <reference path="../../../imports.d.ts" />
angular.module('prototyped.certs', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('certs', {
            url: '/certs',
            abstract: true
        }).state('certs.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/features/appcmd.exe/certs.tpl.html',
                    controller: 'appCmdViewController'
                }
            }
        });
    }]).controller('appCmdViewController', [
    '$scope', '$location', '$timeout', '$route', function ($scope, $location, $timeout, $route) {
        $scope.result = null;
        $scope.status = null;
        $scope.state = {
            storeName: 'MY'
        };
        $scope.detect = function () {
            try  {
                // Check and make sure the require func is defined
                var storeName = $scope.state.storeName || 'MY';
                var hasNodeJS = typeof require !== 'undefined';
                if (hasNodeJS) {
                    // Attempt co call NodeJS to extract certificates
                    $scope.result = $scope.extractCertificates(storeName);
                } else {
                    // Required libs not found...
                    $scope.result = {
                        valid: false,
                        isDone: true,
                        error: 'Service Unavailable - Required libraries missing.'
                    };
                    console.warn(' - Warning: You are running this app from a browser. You need an elevated runtime like NodeJS.');
                }
            } catch (ex) {
                // Set the error result
                $scope.result = {
                    valid: false,
                    isDone: true,
                    error: ex
                };
                console.error(' - Error: ' + ex);
            }
            $scope.result.lastUpdated = Date.now();
        };
        $scope.extractCertificates = function (storeName) {
            // Try and call the command line
            var cmd = 'call certutil.exe -store "' + storeName + '"';
            var result = {
                items: [],
                isDone: false
            };
            try  {
                console.info(' - Extracting Certificates: ' + storeName);
                result.cmd = cmd;
                require("child_process").exec(cmd, function (error, stdout, stderr) {
                    $timeout(function () {
                        result.proc = {
                            error: error,
                            stdout: stdout,
                            stderr: stderr
                        };
                        if (!$.isEmptyObject(error)) {
                            // Something wen wrong...
                            result.error = error;
                        } else {
                            // Parse the output into certificate objects
                            result.certs = $scope.parseCertUtilBuffer(stdout);
                            result.items = result.certs.list;
                            result.valid = true;
                        }
                        result.isDone = true;
                    });
                });
            } catch (ex) {
                result.valid = false;
                result.isDone = true;
                result.error = ex.message || 'Error: Feature not available.';
                console.error(ex);
            }
            return result;
        };
        $scope.parseCertUtilBuffer = function (input) {
            console.info(' - Parsing Certificates...');
            var list = [];
            var certs = {};

            // Parse the output and get the certificates
            var item;
            var index = 0;
            var lines = input.split('\r\n');
            while (index < lines.length) {
                var match;
                var line = lines[index];
                if (index == 0) {
                    if ((match = /(\w+)( ")(\w+)(")/.exec(line)) != null) {
                        certs.store = match[1];
                        certs.desc = match[3];
                    }
                } else {
                    // Try matching parts of a certificate dump
                    if ((match = /(============+)( .* )(============+)/.exec(line)) != null) {
                        // New certificate begins...
                        item = {
                            name: 'Unknown',
                            ident: match[2]
                        };
                        list.push(item);
                    }

                    if ((match = /(Subject: )(.*)/.exec(line)) != null && item) {
                        item.subject = match[2];
                        if ((match = /(CN=)([^,]+)/.exec(item.subject)) != null) {
                            item.name = match[2];
                        }
                    }
                    if ((match = /(Root Certificate: )(\w+)/.exec(line)) != null && item) {
                        item.root = match[2];
                    }
                    if ((match = /(Serial Number: )(\w+)/.exec(line)) != null && item) {
                        item.serial = match[2];
                    }
                    if ((match = /(Issuer: )(.*)/.exec(line)) != null && item) {
                        item.issuer = match[2];
                    }
                    if ((match = /(Cert Hash)(\((\w+)\): )(.*)/.exec(line)) != null && item) {
                        item.hash = match[4].replace(' ', '');
                        item.hashType = match[3];
                    }
                    if ((match = /( NotBefore: )(.*)/.exec(line)) != null && item) {
                        item.startDate = match[2];
                    }
                    if ((match = /( NotAfter: )(.*)/.exec(line)) != null && item) {
                        item.endDate = match[2];
                    }
                    if ((match = /(  Provider = )(.*)/.exec(line)) != null && item) {
                        item.provider = match[2];
                    }
                    if ((match = /Private key is NOT exportable/.exec(line)) != null && item) {
                        item.canExport = true;
                    }
                    if ((match = /Missing stored keyset/.exec(line)) != null && item) {
                        item.missingKeySet = true;
                    }
                    if ((match = /Encryption test passed/.exec(line)) != null && item) {
                        item.verified = true;
                    }
                    if ((match = /Encryption test failed/.exec(line)) != null && item) {
                        item.verified = false;
                    }
                    if ((match = /Signature matches Public Key/.exec(line)) != null && item) {
                        item.publicKeyMatch = true;
                    }

                    if (match = /CertUtil: -store command completed successfully./.exec(line) != null) {
                        // Command executed successfully
                        certs.status = true;
                    }
                    if (line.length == 0) {
                        // Clear llast item
                        item = null;
                    }
                }

                index++;
            }

            // Attach list of certificates
            certs.list = list;

            return certs;
        };
        $scope.exportCert = function (item) {
            if (typeof require !== 'undefined') {
                var pfx = prompt('File name:', process.cwd() + '\\' + item.name + '.pfx');
                var cmd = 'call certutil.exe -privatekey -exportpfx "' + item.name + '" "' + pfx + '"';
                console.info(' - Exporting: ' + pfx);
                require("child_process").exec(cmd, function (error, stdout, stderr) {
                    console.info(' - Done: ' + pfx);
                    if (stdout) {
                        console.info(stdout);
                    }
                    if (stderr) {
                        console.warn(stderr);
                    }
                    if (error) {
                        console.error(error);
                    } else {
                        //require('nw.gui').Shell.showItemInFolder(pfx);
                    }
                });
            }
        };
        $scope.selectCertificate = function (name) {
            $scope.state.current = name;
        };
        $scope.getStatusIcon = function (activeStyle) {
            var cssRes = '';
            if (!$scope.result || !$scope.result.isDone) {
                cssRes += 'glyphicon-refresh';
            } else if (activeStyle && $scope.result.valid) {
                cssRes += activeStyle;
            } else {
                cssRes += $scope.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
            }
            return cssRes;
        };
        $scope.getStatusColor = function () {
            var cssRes = $scope.getStatusIcon() + ' ';
            if (!$scope.result || !$scope.result.isDone) {
                cssRes += 'busy';
            } else if ($scope.result.valid) {
                cssRes += 'success';
            } else {
                cssRes += 'error';
            }
            return cssRes;
        };
    }]);
/// <reference path="../../../imports.d.ts" />
angular.module('prototyped.sqlcmd', [
    'prototyped.ng.sql',
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('sqlcmd', {
            url: '/sqlcmd',
            abstract: true
        }).state('sqlcmd.connect', {
            url: '/connect/:path/:file',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/features/sqlcmd.exe/views/connect.tpl.html',
                    controller: 'sqlCmdViewController'
                }
            }
        }).state('sqlcmd.connect.db', {
            url: '/:dbname',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/features/sqlcmd.exe/views/database.tpl.html',
                    controller: 'sqlCmdViewController'
                }
            }
        });
    }]).controller('sqlCmdViewController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$q', '$modal', '$filter', '$templateCache', function ($rootScope, $scope, $state, $stateParams, $q, $modal, $filter, $templateCache) {
        var baseUrl = '.';

        function extendModalScope(_scope, $modalInstance) {
            _scope.db = {
                user: 'proto',
                login: 'BUILTIN\\Users',
                roles: [
                    'db_owner',
                    'db_datareader',
                    'db_datawriter'
                ],
                links: {
                    'db_owner': true
                },
                commit: function () {
                    var deferred = $q.defer();
                    try  {
                        var db = _scope.db;
                        if (db) {
                            // Update the UI
                            deferred.notify(db);

                            var cmd = 'EXEC sp_grantdbaccess \'' + db.login + '\', \'' + db.user + '\'';
                            var ident = $stateParams.dbname;
                            $scope.sqlCmd.utils.exec(cmd, {
                                database: ident
                            }, function (result) {
                                // Update the UI
                                deferred.notify(db);

                                // Resolve the deferred promise
                                var links = [];
                                for (var name in db.links) {
                                    if (db.links.hasOwnProperty(name) && db.links[name]) {
                                        links.push(name);
                                    }
                                }
                                var pending = links.length;
                                links.forEach(function (linkName) {
                                    db.linkUser(db.user, linkName).then(function () {
                                        pending--;
                                        if (pending <= 0) {
                                            // Done adding roles
                                            deferred.resolve(result);
                                        } else {
                                            // Update the UI
                                            deferred.notify(db);
                                        }
                                    }, function (reason) {
                                        deferred.reject(reason);
                                    });
                                });
                            }, function (err) {
                                deferred.reject(err);
                            });
                        } else {
                            throw new Error('No form input defined...');
                        }
                    } catch (ex) {
                        console.warn(ex);
                        deferred.reject(ex);
                    }

                    return deferred.promise;
                },
                linkUser: function (user, roleName) {
                    var deferred = $q.defer();
                    try  {
                        // Try and execute a command to link the user to a specified role
                        var cmd = 'EXEC sp_addrolemember \'' + roleName + '\', \'' + user + '\'';
                        var ident = $stateParams.dbname;
                        $scope.sqlCmd.utils.exec(cmd, {
                            database: ident
                        }, function (result) {
                            // Resolve the deferred promise
                            if (result) {
                                deferred.resolve(result);
                            } else {
                                deferred.reject(new Error('Could not link user "' + user + '" in database: ' + ident));
                            }
                        }, function (err) {
                            deferred.reject(err);
                        });
                    } catch (ex) {
                        deferred.reject(ex);
                    }

                    return deferred.promise;
                }
            };
            _scope.modalAction = 'Create User';
            _scope.selectedRole = null;
            _scope.ok = function () {
                _scope.db.busy = true;
                _scope.lastSuccess = false;
                _scope.lastFailed = false;
                _scope.db.commit().then(function onSuccess(result) {
                    $rootScope.$applyAsync(function () {
                        _scope.db.busy = false;
                        _scope.lastSuccess = true;
                    });
                    $modalInstance.close(_scope.modalAction);
                }, function onFailure(reason) {
                    $rootScope.$applyAsync(function () {
                        _scope.db.busy = false;
                        _scope.lastFailed = true;
                        _scope.error = reason.message || reason;
                    });
                }, function onUpdate(update) {
                    $rootScope.$applyAsync(function () {
                        _scope.lastUpdate = Date.now();
                    });
                });
            };
            _scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        // Define the sqlCmd model
        $scope.sqlCmd = {
            busy: true,
            exec: $stateParams.file,
            path: $stateParams.path,
            dbname: $stateParams.dbname,
            utils: {
                icon: function (path, file) {
                    var css = '';
                    if (file) {
                        css = 'glyphicon-file';
                        if (/(.*)?.sql$/i.test(file))
                            css = 'glyphicon-cog';
                    } else {
                        var target = $scope.cmd.target;
                        if (target && (path == target.path)) {
                            css += 'glyphicon-folder-open glow-blue';
                        } else {
                            css += 'glyphicon-folder-open glow-orange';
                        }
                    }

                    return css;
                },
                call: function (path, file) {
                    if (/(.*?\.sql)/i.test(file)) {
                        //$state.go('sqlCmd.edit', {});
                    }
                },
                find: function (elem, callback, errorHandler) {
                    $('.inpSqlCmd').change(function (evt) {
                        var input = $(this).val();
                        try  {
                            var fs = require('fs');
                            var path = require('path');
                            fs.exists(path.join(input, 'SQLCMD.exe'), function (exists) {
                                if (exists) {
                                    $state.go($state.current, {
                                        file: 'SQLCMD.exe',
                                        path: input
                                    }, {
                                        reload: true
                                    });
                                } else {
                                    // Not found
                                    $rootScope.$applyAsync(function () {
                                        angular.extend($scope.sqlCmd, {
                                            error: new Error('SQLCMD.exe not found in: ' + input)
                                        });
                                    });
                                }
                            });
                        } catch (ex) {
                            console.error(ex.message);
                        }
                    });
                },
                select: function (db) {
                    if (!db)
                        return;
                    $state.transitionTo('sqlcmd.connect.db', {
                        file: $stateParams.file,
                        path: $stateParams.path,
                        dbname: db.DATABASE_NAME
                    }, {
                        reload: false
                    });
                },
                exec: function (sql, opts, callback, errorHandler) {
                    var fs = require('fs');
                    var dir = baseUrl + '/tmp';
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    var tmp = dir + '/dynamic.' + Date.now() + '-' + (Math.floor(Math.random() * 128 * 1024)) + '.sql';
                    var onDispose = function () {
                        fs.unlink(tmp, function (err) {
                            if (err) {
                                console.error(' ! Cannot Delete: ' + tmp);
                                return;
                            } else {
                                //console.debug(' + Deleted: ' + tmp);
                            }
                        });
                    };
                    var onSuccess = function (result) {
                        if (callback)
                            callback(result);
                        onDispose();
                    };
                    var onFailure = function (err) {
                        if (errorHandler)
                            errorHandler(err);
                        onDispose();
                    };

                    //console.debug(' + Writing: ' + tmp);
                    fs.writeFile(tmp, sql, function (err) {
                        if (err) {
                            if (errorHandler) {
                                errorHandler(err);
                            } else {
                                console.error(err);
                            }
                        } else {
                            $scope.sqlCmd.utils.runFile(tmp, opts, onSuccess, onFailure);
                        }
                    });
                },
                resolveFilename: function (filePath) {
                    var fs = require('fs');
                    var path = require('path');

                    try  {
                        var file = path.join(baseUrl, filePath);
                        var stats = fs.statSync(filePath);
                        if (stats.isFile()) {
                            return file;
                        }
                    } catch (ex) {
                    }

                    try  {
                        var tmp = path.join(baseUrl, 'tmp', filePath);
                        var tst = fs.statSync(tmp);
                        if (tst.isFile()) {
                            return tmp;
                        }
                    } catch (ex) {
                    }

                    try  {
                        function sync(p, opts, made) {
                            if (!opts || typeof opts !== 'object') {
                                opts = { mode: opts };
                            }

                            var mode = opts.mode;
                            var xfs = opts.fs || fs;

                            if (mode === undefined) {
                                mode = 777 & (~process.umask());
                            }
                            if (!made)
                                made = null;

                            p = path.resolve(p);

                            try  {
                                xfs.mkdirSync(p, mode);
                                made = made || p;
                            } catch (err0) {
                                switch (err0.code) {
                                    case 'ENOENT':
                                        made = sync(path.dirname(p), opts, made);
                                        sync(p, opts, made);
                                        break;

                                    default:
                                        var stat;
                                        try  {
                                            stat = xfs.statSync(p);
                                        } catch (err1) {
                                            throw err0;
                                        }
                                        if (!stat.isDirectory())
                                            throw err0;
                                        break;
                                }
                            }

                            return made;
                        }
                        ;

                        // Try and retrieve the file from the cache
                        var cache = $templateCache.get(filePath);
                        if (cache) {
                            var tmpDir = path.dirname(tmp);
                            sync(tmpDir, null, null);
                            if (fs) {
                                fs.writeFileSync(tmp, cache);
                            }
                            return tmp;
                        }
                    } catch (ex) {
                        console.warn(ex.message);
                    }

                    // Could not resolve file name, return original
                    return filePath;
                },
                runFile: function (filePath, opts, callback, errorHandler) {
                    var src = filePath;
                    var inp = '"' + path.join(process.cwd(), src) + '"';
                    if (opts.nocount !== false) {
                        var noc = $scope.sqlCmd.utils.resolveFilename('modules/features/sqlcmd.exe/scripts/utils/NoCounts.sql');
                        inp = '"' + path.join(process.cwd(), noc) + '",' + inp;
                    }
                    var arg = ' -S lpc:localhost -E';
                    var ext = ' -s"," -W -w 999 -i ' + inp;
                    if (opts.database) {
                        arg += ' -d ' + opts.database;
                    }
                    angular.extend(opts, {
                        arg: arg,
                        ext: ext,
                        cwd: $scope.sqlCmd.path
                    });

                    // Parse the system paths
                    var cmd = $scope.sqlCmd.exec + arg + ext;
                    var proc = require("child_process");
                    if (proc) {
                        proc.exec(cmd, opts, function (error, stdout, stderr) {
                            try  {
                                if (error) {
                                    var err = {
                                        message: 'Command Failed: ' + error.cmd,
                                        context: error
                                    };
                                    if (errorHandler) {
                                        errorHandler(err);
                                    }
                                } else {
                                    // Parse the result
                                    var result = [];
                                    var headers = null;
                                    var errors = null;
                                    var lines = stdout.split('\r\n');
                                    if (lines && lines.length > 0) {
                                        lines.forEach(function (line, i) {
                                            if (line) {
                                                var matchError = /Msg (\d+), Level (\d+), State (\d+), Server (\w+), Line (\d+)/i.exec(line);
                                                if (matchError) {
                                                    var msgTxt = (lines.length > (i + 1)) ? lines[i + 1] : 'No additional error message found.';
                                                    var errObj = new Error(msgTxt);
                                                    throw angular.extend(errObj, { raw: stdout });
                                                } else {
                                                    var obj = {};
                                                    var cols = line.split(',');
                                                    var colSkip = cols.length > 0 && /(-)+/.test(cols[0].trim());
                                                    if (!headers) {
                                                        headers = cols;
                                                    } else if (!colSkip && (headers.length == cols.length)) {
                                                        headers.forEach(function (id, i) {
                                                            obj[id] = cols[i];
                                                        });
                                                        result.push(obj);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    if (callback) {
                                        callback(result);
                                    }
                                }
                            } catch (ex) {
                                if (errorHandler) {
                                    errorHandler(ex);
                                } else {
                                    throw ex;
                                }
                            }
                        });
                    }
                },
                getSizeTotal: function (db) {
                    if (!db.size)
                        return 0.0;
                    var totl = (db.size.files) ? (db.size.files.total || 0) : 0;
                    return totl;
                },
                getSizeLogs: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.sLogs || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                getSizeData: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.sData || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                getSizeIndex: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.index || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                getSizeTables: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.table || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                openModalWindow: function (templateUrl) {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: function ($scope, $modalInstance) {
                            extendModalScope($scope, $modalInstance);
                        },
                        //size: size,
                        resolve: {
                            sqlCmd: function () {
                                return $scope.sqlCmd;
                            }
                        }
                    });
                    modalInstance.result.then(function (result) {
                        $scope.result = result;
                    }, function (reason) {
                        // Modal dismissed
                    });
                }
            }
        };

        function parseDatabaseInfo(db) {
            // Set the busy flag
            db.busy = true;

            // Check for selected database
            if (db.DATABASE_NAME == $stateParams.dbname) {
                $scope.sqlCmd.target = db;
            }

            // Get the file size and basic info for the database
            var tplFileSizes = $scope.sqlCmd.utils.resolveFilename('modules/features/sqlcmd.exe/scripts/utils/FileSizes.sql');
            $scope.sqlCmd.utils.runFile(tplFileSizes, { database: db.DATABASE_NAME }, function (result) {
                $rootScope.$applyAsync(function () {
                    var files = [];
                    var grand = 0;
                    var sLogs = 0;
                    var sData = 0;
                    if (result && result.length) {
                        result.forEach(function (obj) {
                            var info = {
                                name: obj['Logical_Name'],
                                path: obj['Physical_Name'],
                                size: parseFloat(obj['SizeKB']) * 1024
                            };
                            grand += info.size;

                            if (/(.*)(.mdf)/i.test(info.path))
                                sData += info.size;
                            if (/(.*)(.ldf)/i.test(info.path))
                                sLogs += info.size;

                            files.push(info);
                        });
                    }
                    db.size = db.size || {};
                    angular.extend(db.size, {
                        sLogs: sLogs,
                        sData: sData,
                        files: {
                            total: grand,
                            items: files
                        }
                    });
                });

                var tplTableSize = $scope.sqlCmd.utils.resolveFilename('modules/features/sqlcmd.exe/scripts/utils/TableSizes.sql');
                $scope.sqlCmd.utils.runFile(tplTableSize, { database: db.DATABASE_NAME }, function (result) {
                    $rootScope.$applyAsync(function () {
                        var tables = [];
                        var sizeUsed = 0;
                        var sizeIndex = 0;
                        var sizeTables = 0;
                        if (result && result.length) {
                            result.forEach(function (obj) {
                                var info = {
                                    name: obj['Table Name'],
                                    rows: parseInt(obj['Number of Rows']) || 0,
                                    data: parseFloat($filter('parseBytes')(obj['Data Space'])) || 0.0,
                                    index: parseFloat($filter('parseBytes')(obj['Index Size'])) || 0.0,
                                    total: parseFloat($filter('parseBytes')(obj['Reserved Space'])) || 0.0
                                };

                                sizeUsed += info.data;
                                sizeIndex += info.index;
                                sizeTables += info.total;

                                tables.push(info);
                            });
                        }
                        db.tables = tables;
                        db.size = db.size || {};
                        angular.extend(db.size, {
                            used: sizeUsed,
                            index: sizeIndex,
                            table: sizeTables
                        });
                        db.busy = !db.tables || !db.views;
                    });
                });

                var tplViewSize = $scope.sqlCmd.utils.resolveFilename('modules/features/sqlcmd.exe/scripts/utils/ListViews.sql');
                $scope.sqlCmd.utils.runFile(tplViewSize, { database: db.DATABASE_NAME }, function (result) {
                    $rootScope.$applyAsync(function () {
                        var views = [];
                        if (result && result.length) {
                            result.forEach(function (obj) {
                                var info = {
                                    key: parseInt(obj['ObjectId']) || 0,
                                    name: obj['ViewName']
                                };

                                views.push(info);
                            });
                        }
                        db.views = views;
                        db.busy = !db.tables || !db.views;
                    });
                });
            });
        }

        function parseDatabaseList(result) {
            if (result) {
                result.forEach(function (db) {
                    parseDatabaseInfo(db);
                });
            }
        }

        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                var path = require('path');

                // Set the result
                updates = {
                    busy: false,
                    active: false,
                    result: {}
                };

                // Check if database specified
                if ($stateParams.dbname) {
                    // Select current database
                    parseDatabaseInfo({
                        DATABASE_NAME: $stateParams.dbname
                    });
                } else {
                    // Get the list of database currently available
                    $scope.sqlCmd.utils.exec('EXEC sp_databases', { nocount: false }, function (result) {
                        $rootScope.$applyAsync(function () {
                            angular.extend($scope.sqlCmd, {
                                result: {
                                    list: result
                                }
                            });
                        });

                        // Parse the DB list and get additional info
                        parseDatabaseList(result);
                    });
                }
            } else {
                // Not available
                updates.active = false;
                updates.busy = false;
            }
        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        }
        angular.extend($scope.sqlCmd, updates);
    }]);
/// <reference path="../../imports.d.ts" />
/// <reference path="appcmd.exe/certs.ng.ts" />
/// <reference path="sqlcmd.exe/module.ng.ts" />
angular.module('prototyped.features', [
    'ui.router',
    'prototyped.sqlcmd',
    'prototyped.certs'
]).config([
    '$stateProvider', function ($stateProvider) {
        $stateProvider.state('proto.cmd', {
            url: '/explore',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/features/views/index.tpl.html',
                    controller: 'systemCmdViewController'
                }
            }
        }).state('proto.clear', {
            url: '/clear',
            views: {
                'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/features/views/index.tpl.html',
                    controller: 'systemCmdViewController'
                }
            }
        });
    }]).controller('systemCmdViewController', [
    '$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {
        // Define the model
        var context = $scope.cmd = {
            busy: true,
            utils: {
                icon: function (path, file) {
                    var css = '';
                    if (file) {
                        css = 'glyphicon-file';
                        if (/(.*)?.exe$/i.test(file))
                            css = 'glyphicon-open';
                        if (/(.*)?.cmd$/i.test(file))
                            css = 'glyphicon-cog';
                        if (/(.*)?.cer$/i.test(file))
                            css = 'glyphicon-certificate';
                        if (/(.*)?.pem$/i.test(file))
                            css = 'glyphicon-certificate';
                        if (/(.*)?.htm.*$/i.test(file))
                            css = 'glyphicon-globe';
                    } else {
                        var target = $scope.cmd.target;
                        if (target && (path == target.path)) {
                            css += 'glyphicon-folder-open glow-blue';
                        } else {
                            css += 'glyphicon-folder-open glow-orange';
                        }
                    }

                    return css;
                },
                call: function (path, file) {
                    if (/(sqlcmd\.exe)/i.test(file)) {
                        var params = { path: path, file: file };
                        $state.transitionTo('sqlcmd.connect', params);
                    }
                },
                list: function (path, callback) {
                    try  {
                        var list = [];
                        var regex = /(\d{2}\/\d{2}\/\d{4})  (\d{2}:\d{2} \w{2})([ ]+\d+,\d+ )(\w+.\w+)/;
                        var proc = require("child_process");
                        if (proc) {
                            var commands = [];

                            //commands.push('dir "' + path + '\\"');
                            var extensions = ['.exe', '.cmd', '.cer', '.pem', '.htm*'];
                            extensions.forEach(function (ext) {
                                commands.push('dir "' + path + '\\*' + ext + '"');
                            });

                            commands.forEach(function (cmd) {
                                proc.exec(cmd, function (error, stdout, stderr) {
                                    stdout.split('\n').forEach(function (line) {
                                        var result = regex.exec(line);
                                        if (result && result.length > 4) {
                                            list.push(result[4]);
                                        }
                                    });
                                    $rootScope.$applyAsync(function () {
                                        if (callback) {
                                            callback(list);
                                        } else {
                                            angular.extend($scope.cmd, {
                                                target: {
                                                    path: path,
                                                    list: list
                                                }
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    } catch (ex) {
                        console.error(ex.message);
                        $scope.cmd.error = ex;
                    }
                },
                getAllPaths: function () {
                    if (!context.result || !context.result.paths)
                        return list;
                    var list = context.result.paths;
                    var u = {}, a = [];
                    for (var i = 0, l = list.length; i < l; ++i) {
                        if (u.hasOwnProperty(list[i])) {
                            continue;
                        }
                        a.push(list[i]);
                        u[list[i]] = 1;
                    }
                    return a;
                }
            }
        };

        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // Set the result
                updates = {
                    busy: false,
                    active: false,
                    result: {}
                };

                // Parse the system paths
                var cmd = 'echo %PATH%';
                var proc = require("child_process");
                if (proc) {
                    proc.exec(cmd, function (error, stdout, stderr) {
                        $rootScope.$applyAsync(function () {
                            updates.active = true;
                            updates.busy = false;
                            if (error) {
                                console.error(error);
                                updates.error = error;
                            } else {
                                // Parse the path strings and search for folder
                                var paths = [];
                                if (stdout) {
                                    stdout.split(';').forEach(function (path) {
                                        if (path) {
                                            paths.push(path.trim());
                                        }
                                    });
                                }
                                updates.result.paths = paths;
                                updates.result.stdout = stdout;
                                updates.result.stderr = stderr;
                            }
                            angular.extend($scope.cmd, updates);
                        });
                    });
                }

                // Get the current working folder
                var cwd = (typeof process !== 'undefined') ? process.cwd() : null;
                if (cwd) {
                    // List current folder contents
                    $scope.cmd.utils.list(cwd, function (list) {
                        $rootScope.$applyAsync(function () {
                            // Update the current working dir
                            $scope.cmd.cwd = {
                                path: cwd,
                                list: list
                            };
                        });
                    });
                }
            } else {
                // Not available
                updates.active = false;
                updates.busy = false;
            }
        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        }
        angular.extend($scope.cmd, updates);
    }]);
/// <reference path="../imports.d.ts" />
/// <reference path="../modules/config.ng.ts" />
/// <reference path="../modules/default.ng.ts" />
/// <reference path="../modules/about/module.ng.ts" />
// Define main module with all dependencies
angular.module('prototyped.ng', [
    'prototyped.ng.config',
    'prototyped.ng.views',
    'prototyped.ng.styles',
    'prototyped.ng.sql',
    'prototyped.default',
    'prototyped.about',
    'prototyped.edge',
    'prototyped.editor',
    'prototyped.explorer',
    'prototyped.console',
    'prototyped.features'
]).config([
    'appConfigProvider', function (appConfigProvider) {
        appConfigProvider.set({
            'prototyped.ng': {
                active: true
            }
        });
    }]).config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Define redirects
        $urlRouterProvider.when('/proto', '/proto/explore').when('/sandbox', '/samples').when('/sync', '/edge');

        // Set up the routing...
        $stateProvider.state('proto', {
            url: '/proto',
            abstract: true
        });
    }]).constant('appNode', {
    html5: true,
    active: typeof require !== 'undefined',
    ui: function () {
        if (typeof require !== 'undefined') {
            return require('nw.gui');
        }
        return undefined;
    },
    win: function () {
        if (typeof require !== 'undefined') {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win) {
                return win;
            }
        }
        return undefined;
    },
    reload: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.reloadIgnoringCache();
        }
    },
    close: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.close();
        }
    },
    debug: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win.isDevToolsOpen()) {
            win.closeDevTools();
        } else {
            win.showDevTools();
        }
    },
    toggleFullscreen: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.toggleFullscreen();
        }
    },
    kiosMode: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.toggleKioskMode();
        }
    }
}).constant('appStatus', {
    logs: [],
    show: {
        all: true,
        log: false,
        info: true,
        warn: true,
        error: true,
        debug: false
    }
}).directive('appClean', [
    '$rootScope', '$window', '$route', '$state', 'appNode', 'appStatus', function ($rootScope, $window, $route, $state, appNode, appStatus) {
        return function (scope, elem, attrs) {
            var keyCtrl = false;
            var keyShift = false;
            var keyEvent = $(document).on('keyup keydown', function (e) {
                // Update key states
                var hasChanges = false;
                if (keyCtrl != e.ctrlKey) {
                    hasChanges = true;
                    keyCtrl = e.ctrlKey;
                }
                if (keyShift != e.shiftKey) {
                    hasChanges = true;
                    keyShift = e.shiftKey;
                }
                if (hasChanges) {
                    $(elem).find('i').toggleClass('glow-blue', !keyShift && keyCtrl);
                    $(elem).find('i').toggleClass('glow-orange', keyShift);
                }
            });
            $(elem).attr('tooltip', 'Refresh');
            $(elem).attr('tooltip-placement', 'bottom');
            $(elem).click(function (e) {
                if (keyShift) {
                    // Full page reload
                    if (appNode.active) {
                        console.debug(' - Reload Node Webkit...');
                        appNode.reload();
                    } else {
                        console.debug(' - Reload page...');
                        $window.location.reload(true);
                    }
                } else if (keyCtrl) {
                    // Fast route reload
                    console.debug(' - Reload route...');
                    $route.reload();
                } else {
                    // Fast state reload
                    console.debug(' - Refresh state...');
                    $state.reload();
                }

                // Clear all previous status messages
                appStatus.logs = [];
                console.clear();
            });
            scope.$on('$destroy', function () {
                $(elem).off('click');
                keyEvent.off('keyup keydown');
            });
        };
    }]).directive('appClose', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.close();
            });
        };
    }]).directive('appDebug', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.debug();
            });
        };
    }]).directive('appKiosk', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.kiosMode();
            });
        };
    }]).directive('appFullscreen', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.toggleFullscreen();
            });
        };
    }]).directive('appVersion', [
    'appConfig', 'appNode', function (appConfig, appNode) {
        function getVersionInfo(ident) {
            try  {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) {
            }
            return null;
        }

        return function (scope, elm, attrs) {
            var targ = attrs['appVersion'];
            var val = null;
            if (!targ) {
                val = appConfig.version;
            } else
                switch (targ) {
                    case 'angular':
                        val = angular.version.full;
                        break;
                    case 'nodeweb-kit':
                        val = getVersionInfo('node-webkit');
                        break;
                    case 'node':
                        val = getVersionInfo('node');
                        break;
                    default:
                        val = getVersionInfo(targ) || val;

                        break;
                }
            if (!val && attrs['defaultText']) {
                val = attrs['defaultText'];
            }
            if (val) {
                $(elm).text(val);
            }
        };
    }]).filter('interpolate', [
    'appNode', function (appNode) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appNode.version);
        };
    }]).filter('fromNow', [
    '$filter', function ($filter) {
        return function (dateString, format) {
            try  {
                if (typeof moment !== 'undefined') {
                    return moment(dateString).fromNow(format);
                } else {
                    return ' at ' + $filter('date')(dateString, 'HH:mm:ss');
                }
            } catch (ex) {
                console.error(ex);
                return 'error';
            }
        };
    }]).filter('isArray', function () {
    return function (input) {
        return angular.isArray(input);
    };
}).filter('isNotArray', function () {
    return function (input) {
        return !angular.isArray(input);
    };
}).filter('typeCount', [function () {
        return function (input, type) {
            var count = 0;
            if (input.length > 0) {
                input.forEach(function (itm) {
                    if (!itm)
                        return;
                    if (!itm.type)
                        return;
                    if (itm.type == type)
                        count++;
                });
            }
            return count;
        };
    }]).filter('listReverse', function () {
    return function (input) {
        var result = [];
        var length = input.length;
        if (length) {
            for (var i = length - 1; i !== 0; i--) {
                result.push(input[i]);
            }
        }
        return result;
    };
}).filter('toBytes', function () {
    return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes))
            return '-';
        if (typeof precision === 'undefined')
            precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
}).filter('parseBytes', function () {
    return function (bytesDesc, precision) {
        var match = /(\d+) (\w+)/i.exec(bytesDesc);
        if (match && (match.length > 2)) {
            var bytes = match[1];
            var floatVal = parseFloat(bytes);
            if (isNaN(floatVal) || !isFinite(floatVal))
                return '[?]';
            if (typeof precision === 'undefined')
                precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
            var number = Math.floor(Math.log(floatVal) / Math.log(1024));
            var pow = -1;
            units.forEach(function (itm, i) {
                if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0)
                    pow = i;
            });
            if (pow > 0) {
                var ret = (floatVal * Math.pow(1024, pow)).toFixed(precision);
                return ret;
            }
        }
        return bytesDesc;
    };
}).directive('eatClickIf', [
    '$parse', '$rootScope', function ($parse, $rootScope) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var fn = $parse(attr.eatClickIf);
                return {
                    pre: function link(scope, element) {
                        var eventName = 'click';
                        element.on(eventName, function (event) {
                            var callback = function () {
                                if (fn(scope, { $event: event })) {
                                    // prevents ng-click to be executed
                                    event.stopImmediatePropagation();

                                    // prevents href
                                    event.preventDefault();
                                    return false;
                                }
                            };
                            if ($rootScope.$$phase) {
                                scope.$evalAsync(callback);
                            } else {
                                scope.$apply(callback);
                            }
                        });
                    },
                    post: function () {
                    }
                };
            }
        };
    }]).directive('toHtml', [
    '$sce', '$filter', function ($sce, $filter) {
        function getHtml(obj) {
            try  {
                return 'toHtml:\'pre\' - ' + $filter('toXml')(obj, 'pre');
            } catch (ex) {
                return 'toHtml:error - ' + ex.message;
            }
        }
        return {
            restrict: 'EA',
            scope: {
                toHtml: '&'
            },
            transclude: false,
            controller: function ($scope, $sce) {
                var val = $scope.toHtml();
                var html = getHtml(val);
                $scope.myHtml = $sce.trustAsHtml(html);
            },
            template: '<div ng-bind-html="myHtml"></div>'
        };
    }]).filter('toXml', [function () {
        function toXmlString(name, input, expanded, childExpanded) {
            var val = '';
            var sep = '';
            var attr = '';
            if ($.isArray(input)) {
                if (expanded) {
                    for (var i = 0; i < input.length; i++) {
                        val += toXmlString(null, input[i], childExpanded);
                    }
                } else {
                    name = 'Array';
                    attr += sep + ' length="' + input.length + '"';
                    val = 'Array[' + input.length + ']';
                }
            } else if ($.isPlainObject(input)) {
                if (expanded) {
                    for (var id in input) {
                        if (input.hasOwnProperty(id)) {
                            var child = input[id];
                            if ($.isArray(child) || $.isPlainObject(child)) {
                                val = toXmlString(id, child, childExpanded);
                            } else {
                                sep = ' ';
                                attr += sep + id + '="' + toXmlString(null, child, childExpanded) + '"';
                            }
                        }
                    }
                } else {
                    name = 'Object';
                    for (var id in input) {
                        if (input.hasOwnProperty(id)) {
                            var child = input[id];
                            if ($.isArray(child) || $.isPlainObject(child)) {
                                val += toXmlString(id, child, childExpanded);
                            } else {
                                sep = ' ';
                                attr += sep + id + '="' + toXmlString(null, child, childExpanded) + '"';
                            }
                        }
                    }
                    //val = 'Object[ ' + JSON.stringify(input) + ' ]';
                }
            }
            if (name) {
                val = '<' + name + '' + attr + '>' + val + '</' + name + '>';
            }
            return val;
        }
        return function (input, rootName) {
            return toXmlString(rootName || 'xml', input, true);
        };
    }]).directive('resxInclude', [
    '$templateCache', function ($templateCache) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxInclude;
                var cache = $templateCache.get(ident);
                if (cache) {
                    $element.text(cache);
                }
                return {
                    pre: function (scope, element) {
                    },
                    post: function (scope, element) {
                    }
                };
            }
        };
    }]).directive('resxImport', [
    '$templateCache', '$document', function ($templateCache, $document) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxImport;
                var cache = $templateCache.get(ident);
                if ($('[resx-src="' + ident + '"]').length <= 0) {
                    if (/(.*)(\.css)/i.test(ident)) {
                        $('head').append('<style resx-src="' + ident + '">' + cache + '</style>');
                    } else if (/(.*)(\.js)/i.test(ident)) {
                        $('head').append('<script resx-src="' + ident + '">' + cache + '</script>');
                    }
                }

                //$element.remove();
                return {
                    pre: function (scope, element) {
                    },
                    post: function (scope, element) {
                    }
                };
            }
        };
    }]).run([
    '$rootScope', '$state', 'appConfig', 'appNode', 'appStatus', function ($rootScope, $state, appConfig, appNode, appStatus) {
        // Extend root scope with (global) vars
        angular.extend($rootScope, {
            appConfig: appConfig,
            appNode: appNode,
            status: appStatus,
            startAt: Date.now(),
            state: $state
        });
    }]).run([
    'appConfig', function (appConfig) {
        console.log(' - Current Config: ', appConfig);
    }]);
//# sourceMappingURL=prototyped.ng.base.js.map
