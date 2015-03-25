
// Declare test app level module which depends on views, and components
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
])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Set up default routes
        $urlRouterProvider
            .when('', '/')
            .when('/', '/default')

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