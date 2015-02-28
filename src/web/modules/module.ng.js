'use strict';

angular.module('myApp.modules', [
    'myApp.default',
    'myApp.about',

    // Define sub modules
    'prototyped',
])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    }])
