'use strict';

angular.module('myApp.about', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: 'views/about.tpl.html',
            controller: 'AboutViewCtrl'
        });
    }])

    .controller('AboutViewCtrl', [function () {

    }]);