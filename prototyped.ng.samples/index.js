
// Declare app level module which depends on views, and components
angular.module('testApp', [
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

])

    

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

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Set up default routes
        $urlRouterProvider
            .when('', '/')
            .when('/', '/samples')

    }])
    .config(['$locationProvider', function ($locationProvider) {
        // Configure the pretty urls for HTML5 mode
        $locationProvider.html5Mode(true);
    }])
    /*
    .config(['cfpLoadingBarProvider', function (loader) {
        loader.includeSpinner = false;
        loader.includeBar = true;
    }])
    */
    .run(['$rootScope', '$state', '$window', '$filter', function ($rootScope, $state, $window, $filter) {
        // Extend root scope with (global) vars
        angular.extend($rootScope, {
            state: $state,
            startAt: Date.now(),
        });
    }])