/// <reference path="../../imports.d.ts" />

angular.module('prototyped.sandbox', [
    'prototyped.ng.runtime',
])

    .directive('dockedContainer', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: false,
            templateUrl: 'views/common/docked/container.tpl.html'
        };
    })
    .directive('dockedIcon', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: true,
            templateUrl: 'views/common/docked/icon.tpl.html'
        };
    })
    .directive('dockedTop', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: true,
            templateUrl: 'views/common/docked/top.tpl.html'
        };
    })
    .directive('dockedTopLeft', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: true,
            templateUrl: 'views/common/docked/topLeft.tpl.html'
        };
    })
    .directive('dockedTopRight', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: true,
            templateUrl: 'views/common/docked/topRight.tpl.html'
        };
    })
    .directive('dockedLeftNav', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: true,
            templateUrl: 'views/common/docked/left.tpl.html'
        };
    })
    .directive('dockedMain', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: false,
            templateUrl: 'views/common/docked/main.tpl.html'
        };
    })
    .directive('dockedFooter', function () {
        return {
            restrict: 'AEM',
            replace: true,
            transclude: true,
            templateUrl: 'views/common/docked/footer.tpl.html'
        };
    })