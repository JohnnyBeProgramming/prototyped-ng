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
        '$urlRouterProvider',
        'appConfigProvider',
        'appNodeProvider',
        proto.ng.modules.common.providers.AppStateProvider
    ])
