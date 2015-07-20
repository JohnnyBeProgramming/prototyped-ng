/// <reference path="../../imports.d.ts" />
/// <reference path="../common/services/NavigationService.ts"/>
/// <reference path="controllers/ExplorerLeftController.ts" />
/// <reference path="controllers/ExplorerViewController.ts" />

angular.module('prototyped.explorer', [
    'prototyped.ng.runtime',
    'ui.router',
])

    .config(['appStateProvider', (appStateProvider: proto.ng.modules.common.providers.AppStateProvider) => {
        // Define application state
        appStateProvider
            .define('proto.explore', {
                url: '/explore',
                priority: 0,
                state: {
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
                },
                menuitem: {
                    label: 'Explore',
                    state: 'proto.explore',
                    icon: 'fa fa-sitemap',
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
            .state('proto.browser', {
                url: '^/browser',
                views: {
                    'left@': {
                        templateUrl: 'modules/explore/views/left.tpl.html',
                        controller: 'ExplorerLeftController',
                        controllerAs: 'exploreLeftCtrl',
                    },
                    'main@': {
                        templateUrl: 'modules/explore/views/browser.tpl.html',
                        controller: 'BrowserViewController',
                        controllerAs: 'ctrlExplorer'
                    },
                }
            })
            .state('proto.links', {
                url: '^/externals',
                views: {
                    'left@': {
                        templateUrl: 'modules/explore/views/left.tpl.html',
                        controller: 'ExplorerLeftController',
                        controllerAs: 'exploreLeftCtrl',
                    },
                    'main@': {
                        templateUrl: 'modules/explore/views/externals.tpl.html',
                        controller: 'ExternalLinksViewController',
                        controllerAs: 'linksCtrl',
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
    .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
        ]);

        $sceDelegateProvider.resourceUrlWhitelist(['**']);
    }])

    .service('navigationService', ['$state', 'appState', proto.ng.modules.common.services.NavigationService])
    .service('pageLayoutService', ['$q', 'navigationService', proto.ng.modules.common.services.PageLayoutService])

    .directive('protoAddressBar', ['$q', proto.ng.modules.explorer.AddressBarDirective])
    .directive('pageLayoutViewer', ['$q', proto.ng.modules.explorer.LayoutViewerDirective])

    .controller('AddressBarController', ['$rootScope', '$scope', '$q', proto.ng.modules.explorer.AddressBarController])
    .controller('LayoutViewerController', ['$rootScope', '$scope', 'pageLayoutService', proto.ng.modules.explorer.LayoutViewerController])
    .controller('ExplorerLeftController', ['$rootScope', '$scope', 'navigationService', proto.ng.modules.explorer.ExplorerLeftController])
    .controller('ExplorerViewController', ['$rootScope', '$scope', '$q', 'pageLayoutService', proto.ng.modules.explorer.ExplorerViewController])
    .controller('BrowserViewController', ['$rootScope', '$scope', '$q', 'navigationService', proto.ng.modules.explorer.FileBrowserViewController])
    .controller('ExternalLinksViewController', ['$rootScope', '$sce', '$q', 'navigationService', proto.ng.modules.explorer.ExternalLinksViewController])
