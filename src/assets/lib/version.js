'use strict';

angular.module('myApp.version', [])

    .value('version', '1.0.0.0')

    .filter('interpolate', ['version', function (version) {
        return function (text) {
            console.info(version);
            return String(text).replace(/\%VERSION\%/mg, version);
        };
    }])

    .directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]);
