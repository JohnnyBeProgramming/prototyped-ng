'use strict';

angular.module('myApp.about', [
    'views/about.tpl.html', // Requires template
    'ngRoute'
])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: 'views/about.tpl.html',
            controller: 'AboutViewCtrl'
        });
    }])

    .controller('AboutViewCtrl', [function () {

    }]);