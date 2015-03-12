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
                        controller: 'explorerViewController'
                    },
                }
            })

    }])

    .controller('proto.explorer.ExplorerController', [
        '$scope',
        '$route',
        '$timeout',
        '$q',
        proto.explorer.ExplorerController
    ])

    .controller('explorerViewController', ['$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {

    }])

