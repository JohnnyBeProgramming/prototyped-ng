'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  // Angular extenders
  'ngRoute',
  'ngAnimate',

  // Vendor modules...
  'ui.router',
  'ui.utils',
  'ui.bootstrap',
  'angular-loading-bar',
  'angularMoment',

  // Prototyped modules
  'prototyped',
  'prototyped.ng',

  // My modules...
  'myApp.views',
  'myApp.modules',
  'myApp.samples',
])

    .constant('appInfo', {
        version: '1.0.0.0',
    })

    .constant('appNode', {
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
                win.showDevTools()
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
        },
    })

    .constant('appStatus', {
        logs: [],
        show: {
            all: true,
            log: false,
            info: true,
            warn: true,
            error: true,
            debug: false,
        },
    })

    .value('appMenu', {
        options: {
            showRoot: true,
        },
        items: [
            {
                label: 'Samples',
                icon: 'fa fa-cubes',
                value: 'samples.info',
            },
            {
                shown: true,
                label: 'Discover Features',
                icon: 'fa fa-share-alt',
                value: 'prototyped.cmd',
                /*
                value: [
                    { label: 'Discovery', icon: 'fa fa-refresh', value: 'modules.discover', },
                    { label: 'Connnect', icon: 'fa fa-gears', value: 'modules.connect', },
                    { divider: true },
                    { label: 'Clean & Exit', icon: 'fa fa-recycle', value: 'modules.clear', },
                ],
                */
            },
            {
                label: 'About this app',
                icon: 'fa fa-info-circle',
                value: 'about.info',
            },
        ],
    })

    .config(['$locationProvider', 'appNode', function ($locationProvider, appNode) {
        // Try and figure out router mode from the initial url
        var pageLocation = typeof window !== 'undefined' ? window.location.href : '';
        if (pageLocation.indexOf('#') >= 0) {
            var routePrefix = '';
            var routeProxies = [
                '/!test!',
                '/!debug!',
            ];

            // Check for specific routing prefixes
            routeProxies.forEach(function (name) {
                if (pageLocation.indexOf('#' + name) >= 0) {
                    routePrefix = name;
                    return;
                }
            });

            // Override the default behaviour (only if required)
            if (routePrefix) {
                $locationProvider.hashPrefix(routePrefix);
            }
            appNode.proxy = routePrefix;
            appNode.html5 = !routePrefix;

            // Show a hint message to the  user
            var proxyName = appNode.proxy;
            if (proxyName) {
                var checkName = /\/!(\w+)!/.exec(proxyName);
                if (checkName) proxyName = checkName[1];

                console.debug(' - Proxy Active: ' + proxyName);

                var text = '<b>Warning:</b> Proxy router is active: <b>' + proxyName + '</b>.';
                var icon = '<i class="glyphicon glyphicon-warning-sign"></i> ';
                var link = '<a href="./" class="pull-right glyphicon glyphicon-remove" style="text-decoration: none; padding: 3px;"></a>';
                var span = '<span class="tab alert alert-warning">' + link + icon + text + '</span>';
                var div = $(document.body).append('<div class="top-hint">' + span + '</div>');
            }
        }

        // Configure the pretty urls for HTML5 mode
        $locationProvider.html5Mode(appNode.html5);

    }])

    .config(['cfpLoadingBarProvider', function (loader) {
        loader.includeSpinner = false;
        loader.includeBar = true;
    }])

    // Define Jade interceptors...
    .factory('jadeRequestInterceptor', ['$q', function ($q) {
        var requestInterceptor = {
            request: function (config) {
                var deferred = $q.defer();
                /*
                someAsyncService.doAsyncOperation().then(function() {
                    // Asynchronous operation succeeded, modify config accordingly
                    ...
                    deferred.resolve(config);
                }, function() {
                    // Asynchronous operation failed, modify config accordingly
                    ...
                    deferred.resolve(config);
                });
                */
                // Temp, just allow
                console.info(config);
                deferred.resolve(config);

                return deferred.promise;
            }
        };
        return requestInterceptor;
    }])
    .factory('jadeResponseInterceptor', ['$q', function ($q) {
        var responseInterceptor = {
            response: function (response) {
                var deferred = $q.defer();
                /*
                someAsyncService.doAsyncOperation().then(function() {
                    // Asynchronous operation succeeded, modify response accordingly
                    ...
                    deferred.resolve(response);
                }, function() {
                    // Asynchronous operation failed, modify response accordingly
                    ...
                    deferred.resolve(response);
                });
                */
                console.debug(config);
                deferred.resolve(config);

                return deferred.promise;
            }
        };

        return responseInterceptor;
    }])
    .config(['$httpProvider', function ($httpProvider) {
        //$httpProvider.interceptors.push('jadeRequestInterceptor');
        //$httpProvider.interceptors.push('jadeResponseInterceptor');
    }])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Set up default routes
        $urlRouterProvider
            .when('', '/')
            .otherwise('error/404')

        // Now set up the states
        $stateProvider
            .state('error', {
                url: '/error',
                resolve: {
                    errorObj: [function () {
                        return this.self.error;
                    }]
                },
                views: {
                    'main@': { templateUrl: 'views/status/default.jade' },
                },
            })
            .state('error.404', {
                url: '/404',
                views: {
                    'main@': { templateUrl: 'views/status/404.jade' },
                }
            })

    }])

    .directive('appClean', ['$rootScope', '$window', '$route', '$state', 'appNode', 'appStatus', function ($rootScope, $window, $route, $state, appNode, appStatus) {
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
    }])
    .directive('appClose', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.close();
            });
        };
    }])
    .directive('appDebug', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.debug();
            });
        };
    }])
    .directive('appKiosk', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.kiosMode();
            });
        };
    }])
    .directive('appFullscreen', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.toggleFullscreen();
            });
        };
    }])

    .directive('appMenu', ['$timeout', function ($location, $timeout) {
        return {
            restrict: 'A',
            scope: {
                list: '=appMenu'
            },
            transclude: false,
            templateUrl: 'views/partials/appMenu.tpl.html'
        };
    }])
    .directive('appNavLink', ['$location', '$timeout', function ($location, $timeout) {
        var className = 'active';

        function linkCheckActive(scope, elm, attrs) {
            var loc = $(elm).attr('href');
            if (loc && loc.indexOf('#') == 0) {
                loc = loc.substring(1);
            }

            var url = $location.$$url;
            if (loc == '/') {
                var pass = url == '/';
                if (pass) $(elm).addClass(className);
                return pass;
            } else if (url.indexOf(loc) == 0) {
                $(elm).addClass(className);
                return true;
            }

            return false;
        }

        return function (scope, elm, attrs) {
            var href = $(elm).attr('href');
            if (href && !$location.$$html5 && href.indexOf('#/') != 0) {
                href = (href.indexOf('/') == 0 ? '#' : '#/') + href;
            }
            if (href && $location.$$html5 && href.indexOf('#/') == 0) {
                href = href.substring(1);
            }

            $(elm).attr('href', href);
            $(elm).click(function () {
                $timeout(function () {
                    linkCheckActive(scope, elm, attrs);
                });
            });
            linkCheckActive(scope, elm, attrs);
        };
    }])
    .directive('appVersion', ['appInfo', 'appNode', function (appInfo, appNode) {

        function getVersionInfo(ident) {
            try {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) { }
            return null;
        }

        return function (scope, elm, attrs) {
            var targ = attrs['appVersion'];
            var val = null;
            if (!targ) {
                val = appInfo.version;
            } else switch (targ) {
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
                    // Not found....
                    break;
            }
            if (!val && attrs['defaultText']) {
                val = attrs['defaultText'];
            }
            if (val) {
                $(elm).text(val);
            }
        };
    }])

    .filter('interpolate', ['appNode', function (appNode) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appNode.version);
        };
    }])
    .filter('fromNow', ['$filter', function ($filter) {
        return function (dateString, format) {
            try {
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
    }])
    .filter('isArray', function () {
        return function (input) {
            return angular.isArray(input);
        };
    })
    .filter('isNotArray', function () {
        return function (input) {
            return !angular.isArray(input);
        };
    })
    .filter('typeCount', ['appStatus', function (appStatus) {
        return function (input, type) {
            var count = 0;
            if (input.length > 0) {
                input.forEach(function (itm) {
                    if (!itm) return;
                    if (!itm.type) return;
                    if (itm.type == type) count++;
                });
            }
            return count;
        };
    }])
    .filter('listReverse', function () {
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
    })
    .filter('toBytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    })
    .filter('parseBytes', function () {
        return function (bytesDesc, precision) {
            var match = /(\d+) (\w+)/i.exec(bytesDesc);
            if (match && (match.length > 2)) {
                var bytes = match[1];
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '[?]';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
                var number = Math.floor(Math.log(bytes) / Math.log(1024));
                var pow = -1;
                units.forEach(function (itm, i) {
                    if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0) pow = i;
                });
                if (pow > 0) {
                    var ret = (bytes * Math.pow(1024, pow)).toFixed(precision);
                    return ret;
                }
            }
            return bytesDesc;
        }
    })

    .directive('toHtml', ['$sce', '$filter', function ($sce, $filter) {
        function getHtml(obj) {
            try {
                return 'toHtml:\'pre\' - ' + $filter('toXml')(obj, 'pre');
            } catch (ex) {
                return 'toHtml:error - ' + ex.message;
            }
        }
        return {
            restrict: 'EA',
            scope: {
                toHtml: '&',
            },
            transclude: false,
            controller: function ($scope, $sce) {
                var val = $scope.toHtml();
                var html = getHtml(val);
                $scope.myHtml = $sce.trustAsHtml(html);
            },
            template: '<div ng-bind-html="myHtml"></div>'
        }
    }])
    .filter('toXml', [function () { // My custom filter
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
        }
    }])

    .directive('eatClickIf', ['$parse', '$rootScope', function ($parse, $rootScope) {
        return {
            priority: 100, // this ensure eatClickIf be compiled before ngClick
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
                    post: function () { }
                }
            }
        }
    }])

    .run(['$rootScope', '$state', '$window', '$filter', 'appInfo', 'appNode', 'appStatus', 'appMenu', function ($rootScope, $state, $window, $filter, appInfo, appNode, appStatus, appMenu) {

        // Extend root scope with (global) vars
        angular.extend($rootScope, {
            state: $state,
            appInfo: appInfo,
            appNode: appNode,
            appMenu: appMenu,
            status: appStatus,
            startAt: Date.now(),
        });

        // Hook some keyboard shortcuts (if available)
        if (typeof Mousetrap !== 'undefined') {
            Mousetrap.bind('CTRL + SHIFT + C', function () {
                console.log(' - Debug!');
            }, 'keyup');
            Mousetrap.bind('p r o t o t e s t', function () {
                console.log(' - Entering test mode!');
                $window.location.href = ($window.location.href.indexOf('?') > 0 ? '&' : '?') + 'test!';
            });
            Mousetrap.bind('p r o t o d e b u g', function () {
                console.log(' - Entering debug mode!');
                $window.location.href = ($window.location.href.indexOf('?') > 0 ? '&' : '?') + 'debug!';
            });
        }

        // Hook extended function(s)
        appStatus.getIcon = function () {
            var match = /\/!(\w+)!/i.exec(appNode.proxy || '');
            if (match && match.length > 1) {
                switch (match[1]) {
                    case 'test': return 'fa fa-puzzle-piece glow-blue animate-glow';
                    case 'debug': return 'fa fa-bug glow-orange animate-glow';
                }
            }
            return (appNode.active) ? 'fa-desktop' : 'fa-cube';
        }
        appStatus.getColor = function () {
            var logs = appStatus.logs;
            if ($filter('typeCount')(logs, 'error')) {
                return 'glow-red';
            }
            if ($filter('typeCount')(logs, 'warn')) {
                return 'glow-orange';
            }
            if ($filter('typeCount')(logs, 'info')) {
                return 'glow-blue';
            }
            if (appNode.active > 0) {
                return 'glow-green';
            }
            return '';
        }


    }]);
