/// <reference path="typings/imports.d.ts" />

/* -------------------------------------------------------------------------------
Example of a custom HTTP Server
------------------------------------------------------------------------------- */
var success = true;
try {
    var q = require('q');
    var fs = require('fs');
    var path = require('path');
    var compiler = require('proto-html-compiler');

    var targets = {};
    var promises = [];
    var options = {
        debug: false,
        base: '../',
        dest: 'compiled/',
        clearHtml: false,
        mergeGroups: true,
        queueActions: true,
        minifyScripts: true,
        scriptElements: true,
        ignoreComments: true,
        trimWhiteSpace: true,
        /*
        templHtml: './templates/Compiled.html',
        templPathJS: './templates/Injector.js',
        */
    };

    // Initialise compiler options
    compiler.init(options, fs);

    var targetPath = path.join(process.cwd(), options.base);
    if (options.dest && !fs.existsSync(options.dest)) {
        fs.mkdirSync(options.dest);
    }

    console.log('-------------------------------------------------------------------------------');
    console.log(' - Searching: ', targetPath);
    console.log('-------------------------------------------------------------------------------');

    var protoStrPath = './node_modules/proto-js-string/StringPrototyped.js';
    var protoStr = fs.readFileSync(protoStrPath, 'utf-8').replace(/^\uFEFF/, '');

    var files = fs.readdirSync(targetPath);
    if (files) {
        files.sort();
        files
            .filter(function (file) {
                return file.substr(-5) === '.html';
            })
            .forEach(function (file) {
                console.log('   + ' + file);
                var srcPath = path.join(process.cwd(), '../') + file;
                var contents = fs.readFileSync(srcPath, 'utf-8');
                var promise = compiler.gen(file, contents)
                    .then(function (output) {
                        var opts = compiler.ctx(options);
                        try {
                            // -------------------------------------------------------------------------------
                            // Generate JSON Output
                            if (output) {
                                var contents = JSON.stringify(output, null, 4);
                                var targetPath = path.join((opts.dest || process.cwd()), 'data/');
                                if (!fs.existsSync(targetPath)) {
                                    fs.mkdirSync(targetPath);
                                }

                                var targetJSON = path.join(targetPath, file + '.json');
                                if (!fs.existsSync(targetPath)) {
                                    fs.mkdirSync(targetPath);
                                }
                                fs.writeFileSync(targetJSON, contents);
                            }
                            // -------------------------------------------------------------------------------
                        } catch (ex) {
                            console.log('Error: ' + ex.message);
                        }

                        return output;
                    })
                    .then(function (output) {
                        // Convert JSON to Javascript output
                        return compiler.genScript(file, output, options);
                    })
                    .then(function (fileContents) {
                        // Generate from template (if exists)
                        return compiler.genTemplate(fileContents, protoStr);
                    })
                    .then(function (fileContents) {
                        // Try to minify the script to reduce package size
                        if (fileContents && compiler.opts.minifyScripts) {
                            fileContents = compiler.genMinified(fileContents);
                        }
                        return fileContents;
                    })
                    .then(function (fileContents) {
                        if (fileContents) {
                            try {
                                // -------------------------------------------------------------------------------
                                // Generate Javascript Output
                                var opts = compiler.ctx(options);
                                var targetPath = path.join((opts.dest || process.cwd()), 'script/');
                                if (!fs.existsSync(targetPath)) {
                                    fs.mkdirSync(targetPath);
                                }

                                var targetScript = path.join(targetPath, file + '.js');
                                fs.writeFile(targetScript, fileContents, function (err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                });
                                // -------------------------------------------------------------------------------
                            } catch (ex) {
                                console.log('Error: ' + ex.message);
                            }
                        }
                        return fileContents;
                    })
                    .then(function (output) {
                        // -------------------------------------------------------------------------------
                        // Add output to compiler index
                        if (output) {

                            // Minify for output href link (removes illigal chars)
                            var opts = compiler.ctx(options);
                            if (!opts.minifyScripts) {
                                output = compiler.genMinified(output);
                            }

                            // Ensure no new lines or white spaces
                            output = output
                                .replace(/( +)/g, ' ')
                                .replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(\<![\-\-\s\w\>\/]*\>)/g, '')
                                .replace(/( *\r\n *)/g, '')

                            targets[file] = output;
                        }
                        // -------------------------------------------------------------------------------
                    })

                // Add to promise queue
                promises.push(promise);
            });
    }

    var wait = q.all(promises)
        .then(function () {
            console.log('-------------------------------------------------------------------------------');
            console.log(' - Generating Index...');

            var opts = compiler.ctx(options);
            compiler.genIndex(opts.dest + 'index.html', targets);

            console.log(' - Done.');
            console.log('-------------------------------------------------------------------------------');
        });

} catch (ex) {
    success = false;
    throw ex;
}

module.exports = {
    success: success
};