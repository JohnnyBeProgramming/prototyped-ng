var LoginPage = (function () {
    function LoginPage() {
        this.emailField = element(By.input("user.email"));
        this.passwordField = element(By.input("user.password"));
        this.loginButton = element(By.id("log-in"));
        this.currentUser = element(By.binding("{{currentUser.name}}"));
    }

    LoginPage.prototype.visitPage = function () {
        browser.get("/");
    };

    LoginPage.prototype.fillEmail = function (email) {
        this.emailField.sendKeys(email);
    };

    LoginPage.prototype.fillPassword = function (password) {
        if (password == null) {
            password = "password";
        }
        this.passwordField.sendKeys(password);
    };

    LoginPage.prototype.login = function () {
        this.loginButton.click();
    };

    LoginPage.prototype.getCurrentUser = function () {
        return this.currentUser.getText();
    };

    return LoginPage;

})();

module.exports = LoginPage;