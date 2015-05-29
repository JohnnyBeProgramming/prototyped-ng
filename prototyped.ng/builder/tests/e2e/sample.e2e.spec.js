// Define the selenium web driver
describe('Sample Test', function () {

    it('should load home page', function () {
        browser.driver.get('http://localhost:8009/');
        browser.driver.getTitle().then(function (title) {
            expect(title).toBe('Module Sandbox');
        });
    });

});

