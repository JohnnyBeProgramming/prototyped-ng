/// <reference path="../../imports.d.ts" />
/// <reference path="../common/providers/AppInfoProvider.ts" />

angular.module('prototyped.about', [
    'prototyped.ng.runtime',
    'prototyped.ng.views',
    'prototyped.ng.styles',
])

    .config(['appStateProvider', (appStateProvider: proto.ng.modules.common.providers.AppStateProvider) => {
        // Define application state
        appStateProvider
            .when('/about', '/about/info')
            .define('about', {
                url: '/about',
                priority: 1000,
                state: {
                    url: '/about',
                    abstract: true,
                },
                menuitem: {
                    label: 'About',
                    state: 'about.info',
                    icon: 'fa fa-info-circle',
                },
                cardview: {
                    style: 'img-about',
                    title: 'About this software',
                    desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
                },
                visible: () => { return appStateProvider.appConfig.options.showAboutPage; },
                children: [
                    /*
                    {
                        name: '',
                        state: {
                        },
                    },
                    */
                ],
            })
            .state('about.info', {
                url: '/info',
                views: {
                    'left@': { templateUrl: 'modules/about/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/about/views/info.tpl.html',
                        controller: 'AboutInfoController',
                    },
                }
            })
            .state('about.online', {
                url: '^/contact',
                views: {
                    'left@': { templateUrl: 'modules/about/views/left.tpl.html' },
                    'main@': { templateUrl: 'modules/about/views/contact.tpl.html' },
                }
            })
            .state('about.conection', {
                url: '/conection',
                views: {
                    'left@': { templateUrl: 'modules/about/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/about/views/connections.tpl.html',
                        controller: 'AboutConnectionController',
                        controllerAs: 'connCtrl',
                    },
                }
            })
    }])
    
    .controller('AboutInfoController', ['$scope', 'appInfo', proto.ng.modules.about.controllers.AboutInfoController])
    .controller('AboutConnectionController', ['$scope', '$location', 'appState', 'appInfo', proto.ng.modules.about.controllers.AboutConnectionController])
