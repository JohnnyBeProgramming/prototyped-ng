var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();


// Start the web server prior to opening the window
var httpHost = require('../../prototyped.node/modules/Server.js');
if (httpHost) {
    httpHost.port = 8009;
    httpHost.path = '../';
    //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS

    // Try and start the dev server
    if (httpHost.start()) {
        driver.get('http://localhost:' + httpHost.port + '/');
    }
}