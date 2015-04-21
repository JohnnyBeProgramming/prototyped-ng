/// <reference path="../../imports.d.ts" />

angular.module('prototyped.explorer', [
    'prototyped.ng.runtime',
    'ui.router',
])

    .config(['appStateProvider', (appStateProvider: proto.ng.modules.common.providers.AppStateProvider) => {
        // Define application state
        appStateProvider
            .define('/explore', {
                priority: 0,
                state: {},
                menuitem: {
                    label: 'Explore',
                    state: 'proto.explore',
                    icon: 'fa fa-cubes',
                },
                cardview: {
                    style: 'img-explore',
                    title: 'Explore Features & Options',
                    desc: 'You can explore locally installed features and find your way around the site by clicking on this card...'
                },
                visible: () => {
                    return appStateProvider.appConfig.options.showDefaultItems;
                },
                /*
                children: [
                    { label: 'Discovery', icon: 'fa fa-refresh', state: 'modules.discover', },
                    { label: 'Connnect', icon: 'fa fa-gears', state: 'modules.connect', },
                    { divider: true },
                    { label: 'Clean & Exit', icon: 'fa fa-recycle', state: 'modules.clear', },
                ],
                */
            })
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
                        controller: 'proto.ng.modules.explorer.ExplorerController',
                        controllerAs: 'ctrlExplorer'
                    },
                }
            })

    }])

    .service('navigationService', ['$state', '$q', proto.ng.modules.explorer.NavigationService])

    .directive('protoAddressBar', ['$q', ($q) => {
        return {
            restrict: 'EA',
            scope: {
                target: '=protoAddressBar'
            },
            transclude: false,
            templateUrl: 'modules/explore/views/addressbar.tpl.html',
            controller: 'proto.ng.modules.explorer.AddressBarController',
            controllerAs: 'addrBar'
        };
    }])
    .controller('proto.ng.modules.explorer.AddressBarController', [
        '$rootScope',
        '$scope',
        '$q',
        proto.ng.modules.explorer.AddressBarController
    ])

    .controller('proto.ng.modules.explorer.ExplorerController', [
        '$rootScope',
        '$scope',
        '$q',
        proto.ng.modules.explorer.ExplorerController
    ])

    .controller('ExplorerViewController', [
        '$rootScope',
        '$scope',
        '$q',
        'navigationService',
        proto.ng.modules.explorer.ExplorerViewController
    ])

