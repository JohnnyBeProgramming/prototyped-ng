/// <reference path="../../imports.d.ts" />

angular.module('prototyped.explorer', [
    'ui.router',
])

    .config(['$stateProvider', ($stateProvider) => {

        $stateProvider
            .state('proto.explore', {
                url: '^/explore',
                views: {
                    'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/explore/views/index.tpl.html',
                        controller: 'proto.explorer.ExplorerController'
                    },
                }
            })

    }])

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
        '$scope',
        '$q',
        proto.explorer.AddressBarController
    ])

    .controller('proto.explorer.ExplorerController', [
        '$scope',
        '$route',
        '$timeout',
        '$q',
        proto.explorer.ExplorerController
    ])

