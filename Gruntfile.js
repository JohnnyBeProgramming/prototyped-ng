/*!
 * Prototyped Grunt file for HTML / AJAX / AngularJS / ASP.net MVC or Winforms
 * Copyright 2013-2014 Prototyped
 */

module.exports = function (grunt) {
    'use strict';

    // DEFINE PROTOTYPED BUILD 
    var globalConfig = {
        src: 'src',
        dest: 'app',
        css: 'assets/css',
        lib: 'assets/lib',
        bin: 'app/bin',
    };

    // Load the NPM tasks to be used
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-devtools');
    grunt.loadNpmTasks('grunt-node-webkit-builder');


    // DEFINE YOUR PROTOTYPED GRUNT TASKS HERE
    grunt.registerTask('default', [
      // Define default build process
      'build',
      'app-run',
      'watch'
    ]);
    grunt.registerTask('build', [
      // Define main build process
      'build-styles',
      'build-scripts',
      'tests-run',
    ]);
    grunt.registerTask('build-styles', [
      'less',
      'cssmin'
    ]);
    grunt.registerTask('build-scripts', [
      'html2js',
      'uglify',
      'concat'
    ]);
    grunt.registerTask('tests-run', [
      //'jshint'
    ]);

    // EXTEND TASKS FOR DISTRIBUTION ENVIRONMENT
    grunt.registerTask('dist-less', ['build-styles']);
    grunt.registerTask('dist-js', ['build-scripts']);
    grunt.registerTask('dist-test', ['tests-run']);
    grunt.registerTask('dist-watch', ['watch']);

    // DEFINE THE APPLICATION RUNTIME
    grunt.registerTask('app-run', function () {

        // Start the web server prior to opening the window
        var httpDone = false;
        var httpHost = require('./Server.js');
        if (httpHost) {
            httpHost.port = 8008;
            httpHost.path = globalConfig.src;
            //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS
            httpDone = httpHost.start();
        }
        if (!httpDone) return false;

        // Start a Node Webkit window and point it to our starting url...
        var url = httpHost.baseUrl;
        var www = globalConfig.src;
        var cmd = 'call "node_modules\\nodewebkit\\nodewebkit\\nw.exe" "' + www + '"';
        var proc = require("child_process");
        if (proc) {
            console.info(' - Starting node webkit window...');
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
    });

    // DEFINE YOUR VERSION NAME 	  
    grunt.initConfig({
        globalConfig: globalConfig,
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
                ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' */\n',
        jqueryCheck: 'if (typeof jQuery === \'undefined\') { throw new Error(\'Bootstrap\\\'s JavaScript requires jQuery\') }\n\n',

        // LESS FILE COMPILATION
        less: {
            development: {
                options: {
                    banner: '<%= banner %>',
                    paths: [
                      "<%= globalConfig.bin %>"
                    ]
                },
                files: {
                    "<%= globalConfig.bin %>/<%= globalConfig.css %>/app.css": "<%= globalConfig.src %>/**/*.less"
                }
            },
            /*
            production: {
              options: {
                banner: '<%= banner %>',
                paths: ["assets/css"],
                cleancss: true,
                modifyVars: {
                  imgPath: '"http://mycdn.com/path/to/images"',
                  bgColor: 'red'
                }
              },
              files: {
                "path/to/result.css": "path/to/source.less"
              }
            }
            */
        },

        // MINIFY CSS
        cssmin: {
            minify: {
                expand: true,
                src: ['**/*.css', '!**/*.min.css'],
                cwd: '<%= globalConfig.bin %>//<%= globalConfig.css %>/',
                dest: '<%= globalConfig.dest %>/<%= globalConfig.css %>/',
                extDot: 'last',
                ext: '.min.css'
            }
        },

        // MINIFY JS FILE
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            static_mappings: {
                // Because these src-dest file mappings are manually specified, every
                // time a new file is added or removed, the Gruntfile has to be updated.
                files: [
                  { src: '<%= globalConfig.src %>/app.js', dest: '<%= globalConfig.bin %>/<%= globalConfig.lib %>/app.min.js' },
                ],
            },
            dynamic_mappings: {
                // Grunt will search for "**/*.js" under "lib/" when the "uglify" task
                // runs and build the appropriate src-dest file mappings then, so you
                // don't need to update the Gruntfile when files are added or removed.
                files: [
                  {
                      expand: true, // Enable dynamic expansion.
                      src: [
                        '**/*.js',
                        '!**/*.min.js',
                        '!**/*.backup.js'
                      ],
                      cwd: '<%= globalConfig.src %>/',      // Src matches are relative to this path.
                      dest: '<%= globalConfig.bin %>/<%= globalConfig.lib %>/',  // Destination path prefix.
                      ext: '.min.js',                       // Dest filepaths will have this extension.
                      extDot: 'first'                       // Extensions in filenames begin after the first dot
                  },
                ],
            },
        },

        // COMBINE JS FILES 
        concat: {
            options: {
                separator: ';'
            },
            js: {
                files: [{
                    src: ['<%= globalConfig.bin %>/**/*.js'],
                    dest: '<%= globalConfig.dest %>/<%= globalConfig.lib %>/app.min.js'
                }]
            }
        },

        // JS TESTING    
        jshint: {
            files: [
              'Gruntfile.js',
              '<%= globalConfig.bin %>/**/*.js',
              '<%= globalConfig.dest %>/**/*.js'
            ],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },

        html2js: {
            options: {
                module: 'myApp.views',
                singleModule: false,
                quoteChar: '\'',
                /* ToDo: Figure out a way to intercept the templates angular side
                process: function (content, filepath) {
                    // LZW-compress a string
                    function lzw_encode(s) {
                        var dict = {};
                        var data = (s + "").split("");
                        var out = [];
                        var currChar;
                        var phrase = data[0];
                        var code = 256;
                        for (var i = 1; i < data.length; i++) {
                            currChar = data[i];
                            if (dict[phrase + currChar] != null) {
                                phrase += currChar;
                            }
                            else {
                                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                                dict[phrase + currChar] = code;
                                code++;
                                phrase = currChar;
                            }
                        }
                        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                        for (var i = 0; i < out.length; i++) {
                            out[i] = String.fromCharCode(out[i]);
                        }
                        return out.join("");
                    }

                    // Decompress an LZW-encoded string
                    function lzw_decode(s) {
                        var dict = {};
                        var data = (s + "").split("");
                        var currChar = data[0];
                        var oldPhrase = currChar;
                        var out = [currChar];
                        var code = 256;
                        var phrase;
                        for (var i = 1; i < data.length; i++) {
                            var currCode = data[i].charCodeAt(0);
                            if (currCode < 256) {
                                phrase = data[i];
                            }
                            else {
                                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                            }
                            out.push(phrase);
                            currChar = phrase.charAt(0);
                            dict[code] = oldPhrase + currChar;
                            code++;
                            oldPhrase = phrase;
                        }
                        return out.join("");
                    }

                    var input = content;
                    var output = lzw_encode(input);

                    return '<script type="text/gzipped" onload="alert(\'Loaded: ' + filepath + '\')">' + output + '</script>';
                },
                */
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            views: {
                src: [
                    '<%= globalConfig.src %>/views/**/*.jade',
                    '<%= globalConfig.src %>/views/**/*.tpl.html',
                ],
                dest: '<%= globalConfig.src %>/<%= globalConfig.lib %>/templates.js'
            },
        },

        // WATCH FILES FOR CHANGES
        watch: {
            css: {
                files: [
                  '<%= globalConfig.src %>/**/*.less',
                  '<%= globalConfig.src %>/**/*.css',
                ],
                tasks: ['less', 'cssmin']
            },
            js: {
                files: [
                  '<%= globalConfig.src %>/**/*.js',
                ],
                tasks: ['uglify', 'concat']
            },
            tpl: {
                files: [
                  '<%= globalConfig.src %>/**/*.jade',
                  '<%= globalConfig.src %>/**/*.tpl.html',
                ],
                tasks: ['html2js']
            }
        }
    });
};