/// <reference path="./imports.d.ts" />
/// <reference path="./modules/Server.ts" />

console.log('-------------------------------------------------------------------------------');
console.log(' NodeJS application launcher...');
console.log('-------------------------------------------------------------------------------');
var child_process = require('child_process');

// Run the setup and intialise any dependencies
var setup = require('./modules/Setup.js');
if (setup) {
    if (!setup.init()) {
        return false;
    }
}

console.log('-------------------------------------------------------------------------------');

// Start the building process..
var builder = require('./modules/Builder.js');
if (builder.init()) {
    if (!builder.build()) {
        console.log(' - Build FAILED!');
        return false;
    }
}

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

// Start a Node Webkit window and point it to our starting url...
var www = '../web/';
var cmd = '"../node_modules/.bin/nw" "' + www + '/"';
var proc = require("child_process");
if (proc) {
    console.info(' - Starting node webkit window...');
    console.warn(' - Path: ' + www);
    console.log('-------------------------------------------------------------------------------');

    proc.exec(cmd, function (error, stdout, stderr) {
        console.log('-------------------------------------------------------------------------------');
        console.info(' - Node webkit window closed.');
        console.info(' - Note: Web server is still active!');
        console.info(' - Press [CTRL] + [C] to shutdown...');
        if (error) {
            console.error(error);
        }
    });
}