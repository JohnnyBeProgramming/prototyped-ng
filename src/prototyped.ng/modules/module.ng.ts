/// <reference path="../imports.d.ts" />
/// <reference path="../modules/default.ng.ts" />
/// <reference path="../modules/about.ng.ts" />
 
angular.module('prototyped.ng', [
    'prototyped.ng.default',
    'prototyped.ng.about',

    // Define sub modules
    'prototyped',
])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    }])
