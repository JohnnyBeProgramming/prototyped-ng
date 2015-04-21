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
                    'left@': { templateUrl: 'views/common/components/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/editor/views/main.tpl.html',
                        controller: 'proto.ng.modules.editor.EditorController',
                    },
                }
            })

    }])

    .controller('proto.ng.modules.editor.EditorController', [
        '$scope',
        '$timeout',
        proto.ng.modules.editor.EditorController
    ])
