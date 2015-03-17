/// <reference path="../imports.d.ts" />
var fs = require('fs');
var cwd = process.cwd();
var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var child_process = require('child_process');

/* -------------------------------------------------------------------------------
    Setup and Pre-installation helper class
------------------------------------------------------------------------------- */
var SetupManager = {
    init: () : boolean => {

        // Iterate all globals dependencies and install them
        var hasError = false;
        if (pkg && pkg.globals) {
            console.log(' - Setting up globals...');
            for (var key in pkg.globals) {
                if (!hasError && pkg.globals.hasOwnProperty(key)) {
                    var ver = pkg.globals[key];
                    hasError = !SetupManager.installGlobal(key, ver);
                }
            }
        }

        // Iterate through all the locally defined dependencies
        if (pkg && pkg.dependencies) {
            console.log(' - Installing dependencies...');
            for (var key in pkg.dependencies) {
                if (!hasError && pkg.dependencies.hasOwnProperty(key)) {
                    var ver = pkg.dependencies[key];
                    hasError = !SetupManager.installLocal(key, ver);
                }
            }
        }

        return !hasError;
    },
    installGlobal: (key: string, ver?: string) => {
        var passed: boolean = true;
        var cmd: string = 'call npm update -g ' + key;
        if (ver) cmd += '@' + ver;
        console.log('   + ' + key + '@' + ver + '');
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                // Something went wrong
                console.error(error);
                passed = false;
            } else {
                // Success
                passed = true;
            }
        });
        return passed;
    },
    installLocal: (key: string, ver?: string) => {
        // Do a local install of the package manager (if not exist)
        var passed: boolean = true;
        var isWin = /^win/.test(process.platform);
        var pre = isWin ? 'call' : 'sudo';        
        var cmd = pre + ' npm update ' + key;
        if (ver) cmd += '@' + ver;
        if (cmd) cmd += ' -express --loglevel error';
        console.log('   + ' + key + '@' + ver + '');
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                passed = false;
            } else {
                passed = true;
            }
            /*
            // Load packages programatically...
            var npm = require("npm");
            npm.load((err) => {
                // Make sure npm is loaded correctly
                if (err) throw new Error(err);

                // Hook the console logs
                npm.on('log', (message) => {
                    // Log the progress of the installation
                    //console.log(message);
                });

                //npm.commands.install([pckg])
            });
            */
        }).stderr.pipe(process.stderr);
        return passed;
    },
};
// -------------------------------------------------------------------------------------------------------

module.exports = SetupManager;