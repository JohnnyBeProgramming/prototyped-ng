/// <reference path="../imports.d.ts" />

// Constant object with default values
angular.module('prototyped.ng.config', [])
    .constant('appDefaultConfig', new proto.ng.common.AppConfig())
    .provider('appConfig', ['appDefaultConfig', function (appDefaultConfig) {
        var config = appDefaultConfig;
        return {
            $get: function () {
                return config;
            },
            set: function (options) {
                angular.extend(config, options);
            },
            clear: function () {
                config = appDefaultConfig;
            },
            getPersisted: function (cname) {
                var name = cname + '=';
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1);
                    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
                }
                return '';
            },
            setPersisted: function (cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + ((exdays || 7) * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = cname + "=" + cvalue + "; " + expires;
            },
        };
    }])
    .constant('appConfigLoader', {
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
 