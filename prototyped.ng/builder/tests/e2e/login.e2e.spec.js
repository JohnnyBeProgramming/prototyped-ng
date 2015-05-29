/*
require("protractor/jasminewd");
require('jasmine-given');
var LoginPage = require("./pages/login_page");

describe("app", function () {
    var page = new LoginPage();
    describe("visiting the login page", function () {
        Given(function () {
            page.visitPage();
        });
        describe("when a user logs in", function () {
            Given(function () {
                page.fillEmail("testy@example.com");
            });
            Given(function () {
                page.fillPassword();
            });
            When(function () {
                page.login();
            });
            Then(function () {
                page.getCurrentUser().then(function (text) {
                    expect(text).toEqual("Randy Savage");
                });
            });
        });
    });
});
*/