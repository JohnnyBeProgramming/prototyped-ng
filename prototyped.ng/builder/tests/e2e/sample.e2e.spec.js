// Define the selenium web driver
var webdriver = require('selenium-webdriver');
var driver = new webdriver
    .Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

jasmine.getEnv().defaultTimeoutInterval = 10000; // in microseconds.

describe('Sample Test', function () {

    it('should open correct page', function () {

        driver.get('http://www.wingify.com');
        driver.getTitle().then(function (title) {
            expect(title).toBe('Wingify');
        });

    });

});