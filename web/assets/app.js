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
  'prototyped.ng',
  'prototyped.ng.samples',
  'prototyped.ng.features',
  //'prototyped.ng.extended',

  // My modules
  'myApp.views',
  'myApp.modules',
])
    .config(['$stateProvider', 'appConfigProvider', function ($stateProvider, appConfigProvider) {

        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            appConfig.routers.push({
                url: '/extend-init',
                priority: 99999999,
                cardview: {
                    ready: false,
                    style: 'img-extended',
                    title: 'Extend the Current App',
                    desc: 'Dynamically load and extended features. Inject new modules into the current runtime.',
                    visible: function () {
                        return true; //appConfig.
                    },
                },
            });

            $stateProvider
                .state('extend_init', {
                    url: '/extend-init',
                    views: {
                        'main@': {
                            controller: function ($http, $state, $injector) {
                                var modExtend = 'prototyped.ng.extended';
                                var urlExtend = '/assets/lib/' + modExtend + '.js';
                                if (!$('head > script[src="' + urlExtend + '"]').length) {
                                    var mod = angular.module('myApp');
                                    var cfg = $injector.get('appConfig');
                                    console.log(' - Module: ', mod);
                                    console.log(' - Config: ', cfg);
                                    console.log(' - Angular: ', angular);

                                    mod.directive('protoExtended', [
                                        '$templateCache',
                                        '$document',
                                        function ($templateCache, $document) {
                                            console.debug(' - Directive Extensions...');
                                            return {
                                                priority: 100,
                                                restrict: 'EAC',
                                                compile: function ($element, attr) {
                                                    console.debug(' - Extensions Compiled!');
                                                    return {
                                                        pre: function (scope, element) {},
                                                        post: function (scope, element) {}
                                                    };
                                                }
                                            };
                                        }])

                                    // Here's the cool part!!!
                                    var oldMod = angular.module;
                                    angular.module = function () { return mod; };
                                    console.debug(' - Loading: ' + urlExtend + '...');
                                    $.getScript(urlExtend, function (data, textStatus, jqxhr) {
                                        console.debug(' - Loaded: ' + urlExtend + '...');
                                        angular.module = oldMod;

                                        //var ext = mod.register(modExtend);
                                        //if (ext) {
                                        //ext.config(ext._configBlocks);
                                        //ext.run(ext._runBlocks);
                                        //}

                                        /*
                                        $injector.loadNewModules = function (mods) {
                                            forEach(loadModules(mods), function (fn) { instanceInjector.invoke(fn || noop); });
                                        }
                                        $injector.loadNewModules([modExtend]);
                                        */
                                        $state.go('default');
                                    });
                                }
                                /*
                                console.log(' - Loading extended module: ' + urlExtend);
                                $.getScript(urlExtend, function (data, textStatus, jqxhr) {
                                    console.debug(' - Loaded: ' + urlExtend + '...');

                                    $state.go('default');
                                });
                                */
                            },
                        },
                    },
                })

        }
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

    .run(['$rootScope', '$state', '$window', '$filter', 'appStatus', 'appNode', function ($rootScope, $state, $window, $filter, appStatus, appNode) {

        angular.extend($rootScope, {
            state: $state,
            startAt: Date.now(),
        });

        // Hook some keyboard shortcuts (if available)
        if (typeof Mousetrap !== 'undefined') {
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

// -------------------------------------------------- //
// Credit: http://www.bennadel.com/blog/2553-loading-angularjs-components-after-your-application-has-been-bootstrapped.htm
// -------------------------------------------------- //
// After the AngularJS has been bootstrapped, you can no longer
// use the normal module methods (ex, app.controller) to add
// components to the dependency-injection container. Instead,
// you have to use the relevant providers. Since those are only
// available during the config() method at initialization time,
// we have to keep a reference to them.
// --
// NOTE: This general idea is based on excellent article by
// Ifeanyi Isitor: http://ify.io/lazy-loading-in-angularjs/
var app = angular.module('myApp');
//angular.element(document).injector().get('Lazy');
app.config(['$controllerProvider', '$provide', '$compileProvider', function ($controllerProvider, $provide, $compileProvider) {

    // Since the "shorthand" methods for component
    // definitions are no longer valid, we can just
    // override them to use the providers for post-
    // bootstrap loading.
    console.debug(" - Updating runtime for async calls");

    // Let's keep the older references.
    app._controller = app.controller;
    app._service = app.service;
    app._factory = app.factory;
    app._value = app.value;
    app._directive = app.directive;

    // Provider-based controller.
    app.controller = function (name, constructor) {
        $controllerProvider.register(name, constructor);
        return (this);
    };

    // Provider-based service.
    app.service = function (name, constructor) {
        $provide.service(name, constructor);
        return (this);
    };

    // Provider-based factory.
    app.factory = function (name, factory) {
        $provide.factory(name, factory);
        return (this);
    };

    // Provider-based value.
    app.value = function (name, value) {
        $provide.value(name, value);
        return (this);
    };

    // Provider-based directive.
    app.directive = function (name, factory) {
        console.debug(' - Register Directive: ', name);
        $compileProvider.directive(name, factory);
        return (this);
    };

    // NOTE: You can do the same thing with the "filter"
    // and the "$filterProvider"; but, I don't really use
    // custom filters.
}]);