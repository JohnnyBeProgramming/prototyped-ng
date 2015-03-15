/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/EditorController.ts"/>

angular.module('prototyped.editor', [
    'ui.router'
])

    .config(['$stateProvider', function ($stateProvider) {

        // Define the UI states
        $stateProvider
            .state('proto.editor', {
                url: '/editor',
                views: {
                    'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/editor/views/main.tpl.html',
                        controller: 'proto.ng.editor.EditorController',
                    },
                }
            })

    }])

    .controller('proto.ng.editor.EditorController', [
        '$scope',
        '$timeout',
        proto.ng.editor.EditorController
    ])
