/// <reference path="../imports.d.ts" />
/// <reference path="config.ng.ts" />

// Define common runtime modules (shared)
angular.module('prototyped.ng.runtime', [
    'prototyped.ng.config',
    'ui.router'
])
    .provider('appNode', [
        proto.ng.modules.common.providers.AppNodeProvider
    ])
    .provider('appState', [
        '$stateProvider',
        '$locationProvider',
        '$urlRouterProvider',
        'appConfigProvider',
        'appNodeProvider',
        proto.ng.modules.common.providers.AppStateProvider
    ])
    .provider('appInfo', [
        'appStateProvider',
        proto.ng.modules.common.providers.AppInfoProvider
    ])
    .run(['$rootScope', 'appState', ($rootScope, appState: proto.ng.modules.common.AppState) => {
        appState.setUpdateAction((action) => {
            $rootScope.$applyAsync(action);
        });
    }])

