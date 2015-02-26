try  {
    var fs = require('fs');
    var npm = require("npm");
    var cwd = process.cwd();
    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var child_process = require('child_process');

    // Iterate all globals dependencies and install them
    var hasError = false;
    if (pkg && pkg.globals) {
        console.log(' - Setting up globals...');
        npm.load(function (err) {
            // Make sure npm is loaded
            if (err)
                throw new Error(err);

            // Hook the console logs
            npm.on('log', function (message) {
                // Log the progress of the installation
                console.log(message);
            });

            for (var key in pkg.globals) {
                if (!hasError && pkg.globals.hasOwnProperty(key)) {
                    var ver = pkg.globals[key];
                    npm.commands.install([key], function (er, data) {
                        // log the error or data
                        if (err) {
                            console.log('   ! ' + key + '@' + ver + ' - ERROR!');
                        } else {
                            console.log('   + ' + key + '@' + ver + '');
                        }
                    });
                }
            }
        });

        function npmInstallGlobal(key, ver) {
            var cmd = 'call npm update -g ' + key;
            if (ver)
                cmd += '@' + ver;
            /* ToDo: Create process on a safe thread...
            child_process.execFile('@npm', ['-v'], function (err, result) {
            console.log(result)
            });
            */
            /*
            child_process.exec(cmd, function (error, stdout, stderr) {
            // output is in stdout
            if (error) {
            hasError = true;
            console.error(error);
            } else {
            console.log('   + ' + key + '@' + ver + '');
            }
            });
            */
        }
    }

    // Now go and install the local modules as well...
    if (pkg && pkg.dependencies) {
        console.log(' - Adding up dependencies...');
        npm.load(function (err) {
            // Make sure npm is loaded
            if (err)
                throw new Error(err);

            // Hook the console logs
            npm.on('log', function (message) {
                // Log the progress of the installation
                console.log(message);
            });

            for (var key in pkg.dependencies) {
                if (!hasError && pkg.dependencies.hasOwnProperty(key)) {
                    var ver = pkg.globals[key];
                    npm.commands.install([key], function (er, data) {
                        if (err) {
                            console.log('   ! ' + key + '@' + ver + ' - ERROR!');
                        } else {
                            console.log('   + ' + key + '@' + ver + '');
                        }
                    });
                }
            }
        });
    }
} catch (ex) {
    console.error(ex);
    throw ex;
}
// -------------------------------------------------------------------------------------------------------
