'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.home',
  'myApp.about',
  'myApp.version',
])

    .value('appNode', {
        html5: false,
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

    .config(['$locationProvider', '$routeProvider', 'appNodeProvider', function ($locationProvider, $routeProvider, appNode) {
        // Disable hastags
        $locationProvider.html5Mode(appNode.html5);

        // Set up default route
        $routeProvider.otherwise({
            templateUrl: 'views/status/404.html',
        });
    }])

    .directive('appRefresh', ['$window', '$route', 'appNode', function ($window, $route, appNode) {
        return function (scope, elem, attrs) {
            $(elem).click(function () {
                if (appNode.active) {
                    appNode.reload();
                } else {
                    //$route.reload(true);
                    $window.location.reload();
                }
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

    .directive('appNavLink', ['$location', '$timeout', function ($location, $timeout) {
        var className = 'ctrl-active';

        function linkCheckActive(scope, elm, attrs) {
            var loc = $(elm).attr('href');
            if (loc.indexOf('#') == 0) {
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
                    $('.' + className).removeClass(className);
                    linkCheckActive(scope, elm, attrs);
                });
            });
            linkCheckActive(scope, elm, attrs);
        };
    }])


    .filter('interpolate', ['appNode', function (appNode) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appNode.version);
        };
    }])

    .directive('appVersion', ['appNode', function (appNode) {
        return function (scope, elm, attrs) {
            elm.text(appNode.version);
        };
    }])
    
;
