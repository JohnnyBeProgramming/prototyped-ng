/// <reference path="../../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../../typings/karma-jasmine/karma-jasmine.d.ts" />
/// <reference path="../../../../typings/angular/angular.d.ts" />
/// <reference path="../../../../typings/angular/angular-mocks.d.ts" />

describe('Configuration', function () {

    var appDefaultConfig;
    var appConfigLoader;
    var appConfigProvider;
    beforeEach(module('prototyped.ng.config'));

    beforeEach(inject(['appDefaultConfig', 'appConfigLoader', 'appConfig', function (_appDefaultConfig, _appConfigLoader, _appConfigProvider) {
        appDefaultConfig = _appDefaultConfig;
        appConfigLoader = _appConfigLoader;
        appConfigProvider = _appConfigProvider;
    }]));

    it('appDefaultConfig', function () {
        expect(appDefaultConfig).toBeDefined();
    });

    it('appConfigLoader', function () {
        expect(appConfigLoader).toBeDefined();
    });

    it('appConfigProvider', function () {
        expect(appConfigProvider).toBeDefined();
    });

});
