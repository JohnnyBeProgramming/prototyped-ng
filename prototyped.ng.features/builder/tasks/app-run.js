module.exports = function (grunt) {

    grunt.registerTask('app-run', function () {

        // Start the web server prior to opening the window

        // Start the web server prior to opening the window
        var httpHost = require('../../../prototyped.node/modules/Server.js');
        if (httpHost) {
            httpHost.port = 8008;
            httpHost.path = '../../../web';
            //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS

            // Try and start the dev server
            if (!httpHost.start()) {
                console.warn(' - Warning: Http server was not started...');
            } else {
                var www = httpHost.path;
                var cmd = '"../../builder/node_modules/.bin/nw"'; //+ ' "' + www + '"';
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
            }
        }
    });

};