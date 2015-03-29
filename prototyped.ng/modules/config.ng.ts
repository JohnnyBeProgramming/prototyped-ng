/// <reference path="../imports.d.ts" />

// Constant object with default values
angular.module('prototyped.ng.config', [])
    .constant('appDefaultConfig', {
        version: '0.0.1',
        routers: [],
        options: {
            showAboutPage: true,
            showDefaultItems: true,
        },
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
    .constant('appLoader', {
        init: function (opts) {
            var configUrl = opts.path;
            var ngTargetApp = opts.name;
            var elem = opts.elem || document.body;
            var cfgModule = angular.module('prototyped.ng.config');
            var oldConfig = angular.injector(['prototyped.ng.config']).get('appConfig');
            if (opts.opts) {
                angular.extend(oldConfig.options, opts.opts);
            }
            if (configUrl) {
                var $http = angular.injector(['ng']).get('$http');
                $http({
                    method: 'GET',
                    url: configUrl,
                })
                    .success((data, status, headers, config) => {
                        console.debug('Configuring ' + ngTargetApp + '...')
                        angular.extend(oldConfig, {
                            version: data.version || oldConfig.version,
                        })
                        cfgModule.constant('appConfig', oldConfig);
                        angular.bootstrap(elem, [ngTargetApp]);
                    })
                    .error((ex) => {
                        console.debug('Starting ' + ngTargetApp + ' with default config.');
                        angular.bootstrap(elem, [ngTargetApp]);
                    });
            } else {
                console.debug('Starting app ' + ngTargetApp + '...');
                angular.bootstrap(elem, [ngTargetApp]);
            }

        }
    })
 