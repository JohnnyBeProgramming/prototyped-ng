// Define the selenium web driver
describe('About Page', function () {
    browser.driver.get('http://localhost:8009/about');

    it('should load the page', function () {
        expect(browser.driver.getTitle()).toBe('Module Sandbox');
    });

});

