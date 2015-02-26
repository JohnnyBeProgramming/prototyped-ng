/// <reference path="typings/imports.d.ts" />
/* -------------------------------------------------------------------------------
    Setup and Pre-installation
------------------------------------------------------------------------------- */
try {
    var fs = require('fs');
    var cwd = process.cwd();
    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var child_process = require('child_process');

    // Iterate all globals dependencies and install them
    var hasError = false;
    if (pkg && pkg.globals) {
        console.log(' - Setting up globals...');
        // Iterate through all the globally defined dependencies
        for (var key in pkg.globals) {
            if (!hasError && pkg.globals.hasOwnProperty(key)) {
                var ver = pkg.globals[key];
                var cmd = 'call npm update -g ' + key;
                if (ver) cmd += '@' + ver;
                console.log('   + ' + key + '@' + ver + '');
                child_process.exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        hasError = true;
                        console.error(error);
                    } else {
                    }
                });
            }
        }
    }

    /*
    // Do a local install of the package manager (if not exist)
    var cmd = 'call npm update npm -express --loglevel error';
    child_process.exec(cmd, (error, stdout, stderr) => {
        if (error) throw new Error(error);
        
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
    }).stderr.pipe(process.stderr);
    */
} catch (ex) {
    console.error(ex);
    throw ex;
}
// -------------------------------------------------------------------------------------------------------