/// <reference path="../imports.d.ts" />
/// <reference path="../modules/config.ng.ts" />
/// <reference path="../modules/about/module.ng.ts" />

// Define main module with all dependencies
angular.module('prototyped.ng', [
    'prototyped.ng.runtime',
    'prototyped.ng.config',
    'prototyped.ng.views',
    'prototyped.ng.styles',

    'ngRoute',
    'ui.router',

// Define sub modules
    'prototyped.explorer',
    'prototyped.console',
    'prototyped.editor',
    'prototyped.about',
])
    .config(['appStateProvider', (appStateProvider: proto.ng.modules.common.providers.AppStateProvider) => {
        // Configure module state
        appStateProvider
            .config('prototyped.ng', {
                active: true,
            })
            .when('/proto', '/proto/explore')
            .when('/sandbox', '/samples')
            .when('/imports', '/edge')
            .state('proto', {
                url: '/proto',
                abstract: true,
            })
            .state('default', {
                url: '/',
                views: {
                    'main@': {
                        templateUrl: 'views/default.tpl.html',
                        controller: 'CardViewController',
                        controllerAs: 'cardView',
                    },
                }
            })

    }])

    .controller('CardViewController', ['appState', proto.ng.modules.common.controllers.CardViewController])

    .directive('appClean', ['$window', '$route', '$state', 'appState', proto.ng.modules.common.directives.AppCleanDirective])
    .directive('appClose', ['appNode', proto.ng.modules.common.directives.AppCloseDirective])
    .directive('appDebug', ['appNode', proto.ng.modules.common.directives.AppDebugDirective])
    .directive('appKiosk', ['appNode', proto.ng.modules.common.directives.AppKioskDirective])
    .directive('appFullscreen', ['appNode', proto.ng.modules.common.directives.AppFullScreenDirective])
    .directive('appVersion', ['appState', proto.ng.modules.common.directives.AppVersionDirective])
    .directive('eatClickIf', ['$parse', '$rootScope', proto.ng.modules.common.directives.EatClickIfDirective])
    .directive('toHtml', ['$sce', '$filter', proto.ng.modules.common.directives.ToHtmlDirective])
    .directive('domReplace', [proto.ng.modules.common.directives.DomReplaceDirective])
    .directive('resxInclude', ['$templateCache', proto.ng.modules.common.directives.ResxIncludeDirective])
    .directive('resxImport', ['$templateCache', '$document', proto.ng.modules.common.directives.ResxImportDirective])
    .directive('abnTree', ['$timeout', proto.ng.modules.common.directives.TreeViewDirective])

    .filter('toXml', [proto.ng.modules.common.filters.ToXmlFilter])
    .filter('interpolate', ['appState', proto.ng.modules.common.filters.InterpolateFilter])
    .filter('fromNow', ['$filter', proto.ng.modules.common.filters.FromNowFilter])
    .filter('isArray', [proto.ng.modules.common.filters.IsArrayFilter])
    .filter('isNotArray', [proto.ng.modules.common.filters.IsNotArrayFilter])
    .filter('typeCount', [proto.ng.modules.common.filters.TypeCountFilter])
    .filter('listReverse', [proto.ng.modules.common.filters.ListReverseFilter])
    .filter('toBytes', [proto.ng.modules.common.filters.ToByteFilter])
    .filter('parseBytes', [proto.ng.modules.common.filters.ParseBytesFilter])
    .filter('trustedUrl', ['$sce', proto.ng.modules.common.filters.TrustedUrlFilter])


    .run(['$rootScope', '$state', '$templateCache', 'appConfig', 'appState', function ($rootScope, $state, $templateCache, appConfig, appState: proto.ng.modules.common.AppState) {
        // Extend root scope with (global) contexts
        angular.extend($rootScope, {
            appConfig: appConfig,
            appState: appState,
            appNode: appState.node,
            startAt: Date.now(),
            state: $state,
        });

        // Link the current state instance
        appState.state = $state;

        // Watch for navigation changes
        $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            if (toState) {
                appState.current.state = toState;
            }
        })

        console.debug(' - Current Config: ', appConfig);

        if (appConfig.options.includeDefaultStyles) {
            appState.importStyle($templateCache, 'assets/css/app.min.css');
            appState.importStyle($templateCache, 'assets/css/prototyped.min.css');
        }
        if (appConfig.options.includeSandboxStyles) {
            appState.importStyle($templateCache, 'assets/css/sandbox.min.css');
        }
    }])

