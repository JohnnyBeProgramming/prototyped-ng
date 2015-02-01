'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  'ui.router',
  'ui.utils',
  'ui.bootstrap',
  //'angular-loading-bar',
  'angularMoment',
  'myApp.views',
  'myApp.default',
  'myApp.about',
])

    .constant('appInfo', {
        version: '0.0.0.1',
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
                shown: false,
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

    .config(['$locationProvider', '$routeProvider', '$stateProvider', '$urlRouterProvider', 'appInfo', 'appNode', function ($locationProvider, $routeProvider, $stateProvider, $urlRouterProvider, appInfo, appNode) {
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


    .run(['$rootScope', '$state', '$filter', 'appInfo', 'appNode', 'appStatus', 'appMenu', function ($rootScope, $state, $filter, appInfo, appNode, appStatus, appMenu) {

        // Extend root scope with (global) vars
        angular.extend($rootScope, {
            state: $state,
            appInfo: appInfo,
            appNode: appNode,
            appMenu: appMenu,
            status: appStatus,
            startAt: Date.now(),
        });

        // Hook extended function(s)
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
