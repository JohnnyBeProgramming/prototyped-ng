/// <reference path="../imports.d.ts" />

// Constant object with default values
angular.module('prototyped.ng.config', [])
    .constant('appDefaultConfig', new proto.ng.modules.common.AppConfig())
    .constant('appConfigLoader', new proto.ng.modules.common.providers.AppConfigLoader())
    .provider('appConfig', ['appDefaultConfig', proto.ng.modules.common.providers.AppConfigProvider])