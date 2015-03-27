/// <reference path="../imports.d.ts" />

// Constant object with default values
angular.module('prototyped.ng.config', [])
    .constant('appDefaultConfig', {
        version: '1.0.0.0',
        routers: [],
    })
    .provider('appConfig', ['appDefaultConfig', function (appDefaultConfig) {
        var config = appDefaultConfig;
        return {
            set: function (options) {
                angular.extend(config, options);
            },
            clear: function () {
                config = appDefaultConfig;
            },
            $get: function () {
                return config;
            }
        };
    }])
 