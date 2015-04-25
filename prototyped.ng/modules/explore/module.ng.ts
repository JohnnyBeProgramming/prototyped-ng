/// <reference path="../../imports.d.ts" />
/// <reference path="services/NavigationService.ts" />
/// <reference path="controllers/ExplorerLeftController.ts" />
/// <reference path="controllers/ExplorerViewController.ts" />

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
                        templateUrl: 'modules/explore/views/left.tpl.html',
                        controller: 'ExplorerLeftController',
                        controllerAs: 'exploreLeftCtrl',
                    },
                    'main@': {
                        templateUrl: 'modules/explore/views/main.tpl.html',
                        controller: 'ExplorerViewController',
                        controllerAs: 'exploreCtrl',
                    },
                }
            })
            .state('proto.browser', {
                url: '^/browser',
                views: {
                    'left@': { templateUrl: 'modules/explore/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/explore/views/browser.tpl.html',
                        controller: 'BrowserViewController',
                        controllerAs: 'ctrlExplorer'
                    },
                }
            })
            .state('proto.routing', {
                url: '^/routing',
                views: {
                    'left@': {
                        templateUrl: 'modules/explore/views/left.tpl.html',
                        controller: 'ExplorerLeftController',
                        controllerAs: 'exploreLeftCtrl',
                    },
                    'main@': {
                        templateUrl: 'modules/explore/views/main.tpl.html',
                        controller: 'ExplorerViewController',
                        controllerAs: 'exploreCtrl',
                    },
                }
            })

    }])

    .service('navigationService', ['$state', '$q', proto.ng.modules.explorer.NavigationService])

    .directive('protoAddressBar', ['$q', proto.ng.modules.explorer.AddressBarDirective])

    .controller('AddressBarController', ['$rootScope', '$scope', '$q', proto.ng.modules.explorer.AddressBarController])
    .controller('BrowserViewController', ['$rootScope', '$scope', '$q', proto.ng.modules.explorer.ExplorerController])
    .controller('ExplorerLeftController', ['$rootScope', '$scope', 'navigationService', proto.ng.modules.explorer.ExplorerLeftController])
    .controller('ExplorerViewController', ['$rootScope', '$scope', '$q', 'navigationService', proto.ng.modules.explorer.ExplorerViewController])
