/// <reference path="typings/imports.d.ts" />

/* -------------------------------------------------------------------------------
Example of a custom HTTP Server
------------------------------------------------------------------------------- */

// Start the web server prior to opening the window
var httpHost = require('./prototyped.node/modules/Server.js');
if (httpHost) {
    httpHost.port = 8008;
    httpHost.path = 'web';
    //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS
    if (httpHost.start()) {
        console.info(' - Static Http server now active...');
    } else {
        console.warn(' - Warning: Http server was not started...');
    }
}

module.exports = httpHost;