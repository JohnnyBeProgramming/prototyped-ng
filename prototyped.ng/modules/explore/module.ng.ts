/// <reference path="../../imports.d.ts" />

angular.module('prototyped.explorer', [
    'ui.router',
])

    .config(['$stateProvider', ($stateProvider) => {

        $stateProvider
            .state('proto.explore', {
                url: '^/explore',
                views: {
                    'left@': {
                        templateUrl: 'views/explore/left.tpl.html',
                        controller: ['$scope', 'navigationService', function ($scope, navigationService) {
                            $scope.navigation = navigationService;
                        }],
                    },
                    'main@': {
                        templateUrl: 'views/explore/main.tpl.html',
                        controller: 'ExplorerViewController',
                        controllerAs: 'exploreCtrl',
                    },
                }
            })
            .state('proto.browser', {
                url: '^/browser',
                views: {
                    'left@': { templateUrl: 'views/explore/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/explore/views/index.tpl.html',
                        controller: 'proto.explorer.ExplorerController',
                        controllerAs: 'ctrlExplorer'
                    },
                }
            })

    }])

    .service('navigationService', ['$q', proto.ng.explorer.NavigationService])


    .directive('protoAddressBar', ['$q', ($q) => {
        return {
            restrict: 'EA',
            scope: {
                target: '=protoAddressBar'
            },
            transclude: false,
            templateUrl: 'modules/explore/views/addressbar.tpl.html',
            controller: 'proto.explorer.AddressBarController',
            controllerAs: 'addrBar'
        };
    }])
    .controller('proto.explorer.AddressBarController', [
        '$rootScope',
        '$scope',
        '$q',
        proto.explorer.AddressBarController
    ])

    .controller('proto.explorer.ExplorerController', [
        '$rootScope',
        '$scope',
        '$q',
        proto.ng.explorer.ExplorerController
    ])

    .controller('ExplorerViewController', [
        '$rootScope',
        '$scope',
        '$q',
        proto.ng.explorer.ExplorerViewController
    ])

