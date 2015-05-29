
// Start the web server prior to opening the window
var httpHost = require('../../prototyped.node/modules/Server.js');
if (httpHost) {
    httpHost.port = 8009;
    httpHost.path = '../';
    httpHost.verbose = false;
    //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS

    // Try and start the dev server
    if (httpHost.start()) {
        // Server Started...
    }
}