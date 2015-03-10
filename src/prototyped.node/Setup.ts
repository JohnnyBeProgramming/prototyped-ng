/// <reference path="imports.d.ts" />

/* -------------------------------------------------------------------------------
    Setup and Pre-installation
------------------------------------------------------------------------------- */
try {
    var fs = require('fs');
    var cwd = process.cwd();
    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var child_process = require('child_process');

    // Iterate all globals and call npm to install them
    var hasError = false;
    if (pkg && pkg.globals) {
        console.log(" - Setting up globals...");

        function npmInstallGlobal(key, ver) {
            var cmd = 'call npm update -g ' + key;
            if (ver) cmd += '@' + ver;
            /* ToDo: Create process on a safe thread... 
            child_process.execFile('@npm', ['-v'], function (err, result) {
                console.log(result)
            });
            */
            child_process.exec(cmd, function (error, stdout, stderr) {
                // output is in stdout
                if (error) {
                    hasError = true;
                    console.error(error);
                } else {
                    console.log('   + ' + key + '@' + ver + '');
                }
            });
        }

        // Iterate through all the globally defined vars
        for (var key in pkg.globals) {
            if (!hasError && pkg.globals.hasOwnProperty(key)) {
                var ver = pkg.globals[key];
                npmInstallGlobal(key, ver);
            }
        }
    }
} catch (ex) {
    console.error(ex);
    throw ex;
}
// -------------------------------------------------------------------------------------------------------