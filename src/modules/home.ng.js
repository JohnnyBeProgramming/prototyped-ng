'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.tpl.html',
                controller: 'HomeViewCtrl'
            });
    }])

    .controller('HomeViewCtrl', ['$scope', '$window', '$location', '$timeout', function ($scope, $window, $location, $timeout) {
        // ToDo: Add code for home controller 

    }]);