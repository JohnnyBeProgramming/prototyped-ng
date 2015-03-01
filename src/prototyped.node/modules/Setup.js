/// <reference path="../imports.d.ts" />
var fs = require('fs');
var cwd = process.cwd();
var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var child_process = require('child_process');

/* -------------------------------------------------------------------------------
Setup and Pre-installation helper class
------------------------------------------------------------------------------- */
var SetupManager = {
    init: function () {
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
    },
    installGlobal: function (key, ver) {
        var passed = true;
        var cmd = 'call npm update -g ' + key;
        if (ver)
            cmd += '@' + ver;
        console.log('   + ' + key + '@' + ver + '');
        child_process.exec(cmd, function (error, stdout, stderr) {
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
    installLocal: function (key, ver) {
        // Do a local install of the package manager (if not exist)
        var passed = true;
        var cmd = 'call npm update ' + key;
        if (ver)
            cmd += '@' + ver;
        if (cmd)
            cmd += ' -express --loglevel error';
        console.log('   + ' + key + '@' + ver + '');
        child_process.exec(cmd, function (error, stdout, stderr) {
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
    }
};

// -------------------------------------------------------------------------------------------------------
module.exports = SetupManager;
