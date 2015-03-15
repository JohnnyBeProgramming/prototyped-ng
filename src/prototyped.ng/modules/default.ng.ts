/// <reference path="../imports.d.ts" />

angular.module('prototyped.default', [
    //'views/default.tpl.html', // Requires template
    'ui.router',
])

    .value('appPages', {
        pages: [
            {
                url: '/proto',
                style: 'img-explore',
                title: 'Explore Features & Options',
                desc: 'You can explore locally installed features and find your way around the site by clicking on this card...'
            },
            {
                url: '/samples',
                style: 'img-sandbox',
                title: 'Prototyped Sample Code',
                desc: 'A selection of samples to test, play and learn about web technologies.'
            },
            {
                url: '/sync',
                style: 'img-editor',
                title: 'Import & Export Data',
                desc: 'Load from external sources, modify and/or export to an external resource.'
            },
            {
                url: '/about',
                style: 'img-about',
                title: 'About this software',
                desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
            },
        ]
    })

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


    .controller('CardViewCtrl', ['$scope', 'appPages', function ($scope, appPages) {
        // Make sure 'mySiteMap' exists
        $scope.pages = appPages.pages || [];

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

