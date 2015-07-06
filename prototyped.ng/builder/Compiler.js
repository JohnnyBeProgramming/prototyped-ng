/// <reference path="typings/imports.d.ts" />

/* -------------------------------------------------------------------------------
Example of a custom HTTP Server
------------------------------------------------------------------------------- */
var templHtml = 'templates/Compiler.template.html';
var templPathJS = 'templates/Compiler.template.js';
var protoStrPath = './node_modules/proto-js-string/StringPrototyped.js';

var q = require('q');
var fs = require('fs');
var path = require('path');
var compiler = require('proto-html-compiler');
var basePath = compiler.opts.base = '../';
var outPath = compiler.opts.dest = 'compiled/';

var success = true;
try {
    if (outPath && !fs.existsSync(outPath)) {
        fs.mkdirSync(outPath);
    }

    var targets = {};
    var promises = [];
    var targetPath = path.join(process.cwd(), basePath);
    console.log('-------------------------------------------------------------------------------');
    console.log(' - Searching: ', targetPath);
    console.log('-------------------------------------------------------------------------------');

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
                var promise = compiler.html(file, contents)
                    .then(function (fileContents) {
                        try {
                            // -------------------------------------------------------------------------------
                            // Parse the pre-defined scripting template...
                            if (fileContents && templPathJS) {
                                var contents = fs.readFileSync(templPathJS, 'utf-8').replace(/^\uFEFF/, '');
                                var protoStr = fs.readFileSync(protoStrPath, 'utf-8').replace(/^\uFEFF/, '');
                                var payload = fileContents;
                                var encodePayload = true;
                                if (encodePayload) {
                                    var jsonEnc = compiler.spx.encoders.base64.encode(fileContents);
                                    payload = '\'' + jsonEnc + '\'';
                                }

                                fileContents = !contents ? contents : contents
                                    .replace(/___ctx___/g, compiler.opts.prefix)
                                    .replace('/*{0}*/', payload)
                                    .replace('/*{1}*/', protoStr)
                                    .replace('/*{2}*/', '')
                            }
                            // -------------------------------------------------------------------------------
                        } catch (ex) {
                            console.log('Error: ' + ex.message);
                        }
                        return fileContents;
                    })
                    .then(function (fileContents) {
                        try {
                            // -------------------------------------------------------------------------------
                            // Try to minify the script to reduce package size
                            if (fileContents && compiler.opts.minifyScripts) {
                                fileContents = compiler.genMinified(fileContents);
                            }
                            // -------------------------------------------------------------------------------
                        } catch (ex) {
                            console.log('Error: ' + ex.message);
                        }
                        return fileContents;
                    })
                    .then(function (fileContents) {
                        try {
                            // -------------------------------------------------------------------------------
                            // Write the contents to file
                            if (fileContents) {
                                var targetPath = path.join((outPath || process.cwd()), 'script/');
                                var targetScript = path.join(targetPath, file + '.js');
                                fs.writeFile(targetScript, fileContents, function (err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                });
                            }
                            // -------------------------------------------------------------------------------
                        } catch (ex) {
                            console.log('Error: ' + ex.message);
                        }
                        return fileContents;
                    })
                    .then(function (output) {
                        if (output) {
                            output = output.replace(/( *\r\n *)/g, '');
                            targets[file] = output;
                        }
                    })

                promises.push(promise);
            });
    }

    var wait = q.all(promises)
        .then(function () {
            console.log('-------------------------------------------------------------------------------');
            console.log(' - Generating Index...');

            var builderFile = outPath + 'index.html';
            var builderOut = fs.readFileSync(templHtml, 'utf-8');
            var links = '';
            var list = [];
            for (var filename in targets) {
                list.push(filename);
            }
            list.sort().forEach(function (filename) {
                var jscript = targets[filename];
                var style = 'width: 200px; margin-right: 8px;';
                var css = 'btn btn-lg btn-default pull-left';
                if (jscript) {
                    jscript
                        .replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(\<![\-\-\s\w\>\/]*\>)/g, '')
                        .replace(/( *\r\n *)/g, '')

                    links += '<li><a class="' + css + '" style="' + style + '" href=\'javascript:' + jscript + '\'>'
                           + filename.replace(/(\.html)$/i, '')
                           + '</a></li>';
                }
            });

            var placeholder = '<li><a href="javascript:void()">Placeholder</a></li>';
            var result = builderOut
                            .replace(placeholder, links)
                            .replace(/( *\r\n *)/g, '');

            fs.writeFileSync(builderFile, result);

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