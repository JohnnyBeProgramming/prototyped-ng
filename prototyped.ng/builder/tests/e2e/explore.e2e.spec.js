// Define the selenium web driver
describe('Explorer Page', function () {
    browser.driver.get('http://localhost:8009/explore');

    it('with updated title', function () {
        expect(browser.driver.getTitle()).toBe('Module Sandbox');
    });

    it('should load external links', function () {
        //element(by.css('[href="/externals"]')).click();
        expect(browser.driver.getTitle()).toBe('Module Sandbox');
    });

});

