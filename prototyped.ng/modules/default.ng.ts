/// <reference path="../imports.d.ts" />

angular.module('prototyped.default', [
    //'views/default.tpl.html', // Requires template
    'ui.router',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
          .state('default', {
              url: '/',
              views: {
                  'main@': {
                      templateUrl: 'views/default.tpl.html',
                      controller: 'CardViewCtrl',
                      controllerAs: 'sliderCtrl',
                  },
              }
          })
    }])

    .controller('CardViewCtrl', ['$scope', 'appConfig', function ($scope, appConfig) {
        // Make sure 'mySiteMap' exists
        $scope.pages = appConfig.routers || [];

        // initial image index
        $scope._Index = 0;

        $scope.count = function () {
            return $scope.pages.length;
        };

        // if a current image is the same as requested image
        $scope.isActive = function (index) {
            return $scope._Index === index;
        };

        // show prev image
        $scope.showPrev = function () {
            $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.count() - 1;
        };

        // show next image
        $scope.showNext = function () {
            $scope._Index = ($scope._Index < $scope.count() - 1) ? ++$scope._Index : 0;
        };

        // show a certain image
        $scope.showPhoto = function (index) {
            $scope._Index = index;
        };
    }])

