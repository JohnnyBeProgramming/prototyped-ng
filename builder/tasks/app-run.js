module.exports = function (grunt) {

    grunt.registerTask('app-run', function () {

        // Start the web server prior to opening the window
        var httpHost = require('../Server.js');
        var url = httpHost.baseUrl;
        if (!httpHost.start()) return;

        // Start a Node Webkit window and point it to our starting url...
        console.log('-------------------------------------------------------------------------------');
        var www = '../web';
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
        console.log('-------------------------------------------------------------------------------');
    });

};