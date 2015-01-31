'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ui.router',
  'ui.utils',
  'angularMoment',
  'myApp.version',
  'myApp.views',
  'myApp.default',
  'myApp.about',
])

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

    .value('appMenu', {
        options: {
            showRoot: true,
        },
        items: [
                {
                    label: 'Home',
                    icon: 'fa fa-home',
                    value: 'home',
                },
                {
                    shown: true,
                    label: 'Explore',
                    icon: 'fa fa-share-alt',
                    value: [
                        { label: 'Sample A', icon: 'fa fa-phone', value: 'home', },
                        { label: 'Sample B', icon: 'fa fa-backward', value: 'about.info', },
                        { divider: true },
                        { label: 'Exit', icon: 'fa fa-shutdown', value: 'about', },
                    ],
                },
                {
                    label: 'About',
                    icon: 'fa fa-info',
                    value: 'about.info',
                },
        ],
    })

    .config(['$locationProvider', '$routeProvider', '$stateProvider', '$urlRouterProvider', 'appNode', function ($locationProvider, $routeProvider, $stateProvider, $urlRouterProvider, appNode) {
        // Disable hastags
        $locationProvider.html5Mode(appNode.html5);

        // Set up default routes
        $routeProvider
            .otherwise({
                //templateUrl: 'error/404',
                templateUrl: '/',
            });

        $urlRouterProvider
            .when('', '/')

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

    .directive('appClean', ['$rootScope', '$window', '$route', '$state', 'appNode', function ($rootScope, $window, $route, $state, appNode) {
        return function (scope, elem, attrs) {
            var keyCtrl = false;
            var keyShift = false;
            var keyEvent = $(document).on('keyup keydown', function (e) {
                // Capture key states
                keyCtrl = e.ctrlKey;
                keyShift = e.shiftKey;

                // Show UI hints
                $(elem).find('i').toggleClass('glow-orange', keyShift);
                $(elem).find('i').toggleClass('glow-blue', !keyShift && keyCtrl);
            });
            $(elem).click(function (e) {

                // Clear all previous status messages
                angular.extend($rootScope.status, {
                    info: [],
                    warn: [],
                    error: [],
                });

                if (keyShift) {
                    // Full page reload
                    if (appNode.active) {
                        console.debug(' - Refresh Node Webkit...');
                        appNode.reload();
                    } else {
                        console.debug(' - Reloading page...');
                        $window.location.reload(true);
                    }
                } else if (keyCtrl) {
                    // Fast route reload
                    console.debug(' - Reloading route...');
                    $route.reload();
                } else {
                    // Fast state reload
                    console.debug(' - Reloading state...');
                    $state.reload();
                }
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
                    $('.' + className).removeClass(className);
                    linkCheckActive(scope, elm, attrs);
                });
            });
            linkCheckActive(scope, elm, attrs);
        };
    }])

    .directive('appMenu', ['$timeout', function ($location, $timeout) {
        return {
            restrict: 'A',

            scope: {
                list: '=appMenu'
            },
            transclude: false,
            templateUrl: 'views/partials/appMenu.html'
        };
    }])

    .directive('appVersion', ['appNode', function (appNode) {
        return function (scope, elm, attrs) {
            elm.text(appNode.version);
        };
    }])

    .filter('interpolate', ['appNode', function (appNode) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appNode.version);
        };
    }])
    .filter('fromNow', function () {
        return function (dateString, format) {
            return moment(dateString).fromNow(format);
        };
    })
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

    .run(['$rootScope', '$state', 'appNode', 'appMenu', function ($rootScope, $state, appNode, appMenu) {
        // Set root scope (global) vars
        angular.extend($rootScope, {
            $state: $state,
            appNode: appNode,
            appMenu: appMenu,
            status: {
                info: [],
                warn: [],
                error: [],
                getColor: function () {
                    var css = '';
                    var status = $rootScope.status;
                    if (status.info.length > 0) {
                        css = 'glow-blue';
                    }
                    if (appNode.active) {
                        css = 'glow-green';
                    }
                    if (status.warn.length > 0) {
                        css = 'glow-orange';
                    }
                    if (status.error.length > 0) {
                        css = 'glow-red';
                    }
                    return css;
                },
            },
            startAt: Date.now(),
        });
    }]);
