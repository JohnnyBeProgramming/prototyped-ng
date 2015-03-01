/// <reference path="./imports.d.ts" />
/// <reference path="./modules/Server.ts" />
console.log('-------------------------------------------------------------------------------');
console.log(' NodeJS application launcher...');
console.log('-------------------------------------------------------------------------------');

// Run the setup and intialise any dependencies
var setup = require('./modules/Setup.js');
if (setup) {
    setup.init();
}

var child_process = require('child_process');

//var history = child_process.execSync('git log', { encoding: 'utf8' });
//process.stdout.write(history);
//require('Builder.js');
console.log('-------------------------------------------------------------------------------');

// Start the web server prior to opening the window
var httpDone = false;
var httpHost = require('./modules/Server.js');
if (httpHost) {
    httpHost.port = 8008;
    httpHost.path = '../web';

    //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS
    if (httpHost.start()) {
        console.info(' - Static Http server now active...');
    } else {
        console.warn(' - Warning: Http server was not started...');
    }
}

console.log('-------------------------------------------------------------------------------');
