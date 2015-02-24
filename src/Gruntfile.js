/*!
 * Prototyped Grunt file for HTML / AJAX / AngularJS / ASP.net MVC or Winforms
 * Copyright 2013-2014 Prototyped
 */

module.exports = function (grunt) {
    'use strict';

    // Load package info
    var pkg = grunt.file.readJSON('package.json');

    // Define some proto stubs
    var proto = {
        constants: {
            hr: '-------------------------------------------------------------------------------',
            banner: '/*!\n' +
                    ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                    ' * Copyright 2014-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    ' */\n',
            jsCheck: 'if (typeof jQuery === \'undefined\') { throw new Error(\'Bootstrap\\\'s JavaScript requires jQuery\') }\n\n',
        },
    };

    // DEFINE PROTOTYPED BUILD 
    var cfg = {
        web: '../web',
        dest: '../app',
        css: 'assets/css',
        lib: 'assets/lib',
        tasks: {
            modules: [
                'grunt-contrib-less',
                'grunt-contrib-jshint',
                'grunt-contrib-concat',
                'grunt-contrib-uglify',
                'grunt-contrib-cssmin',
                'grunt-contrib-watch',
                'grunt-contrib-copy',
                'grunt-usemin',
                'grunt-html2js',
                'grunt-devtools'
            ],
            defines: [
                {
                    // Define default build process                      
                    key: 'default',
                    val: ['build', 'app-run', 'watch']
                },
                {
                    // Define main build process
                    key: 'build',
                    val: [
                        //'useminPrepare',
                        'build-styles',
                        'build-scripts',
                        'copy',
                        //'usemin',
                        'test-units'
                    ]
                },
                {
                    key: 'build-styles',
                    val: ['less', 'cssmin']
                },
                {
                    key: 'build-scripts',
                    val: ['html2js', 'uglify', 'concat']
                },

                {
                    // Add unit tests
                    key: 'test-units',
                    val: [
                    //'jshint'
                    ]
                },

                // Extend tasks for dist env
                { key: 'build-dist', val: ['build-prod'] },
                { key: 'tests-dist', val: ['test-units'] },
            ],
            customs: [
                {
                    key: 'app-run',
                    val: function () {

                        // Start the web server prior to opening the window
                        var httpDone = false;
                        var httpHost = require('./Server.js');
                        if (httpHost) {
                            httpHost.port = 8008;
                            httpHost.path = cfg.web;
                            //httpHost.pfxPath = './sample.pfx'; // Enable to allow HTTPS
                            httpDone = httpHost.start();
                        }
                        if (!httpDone) return false;

                        // Start a Node Webkit window and point it to our starting url...
                        var url = httpHost.baseUrl;
                        var www = cfg.web;
                        var cmd = 'nodewebkit "' + www + '"';
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
                    }
                },
            ],
        },
    };

    // Load the NPM tasks (modules) to be used
    cfg.tasks.modules.forEach(function (entry) {
        console.log(' - Loading: ' + entry);
        grunt.loadNpmTasks(entry);
    });
    console.log(proto.constants.hr);


    // Load the definitions of your prototyped grunt tasks
    cfg.tasks.defines.forEach(function (entry, value) {
        if (entry.key) {
            console.log(' - Definig: ' + entry.key);
            grunt.registerTask(entry.key, entry.val);
        } else {
            console.warn(' - Warning: Invalid task encountered.');
        }
    });

    // Register the custom actions
    cfg.tasks.customs.forEach(function (entry, value) {
        if (entry.key) {
            console.log(' - Register: ' + entry.key);
            grunt.registerTask(entry.key, entry.val);
        } else {
            console.warn(' - Warning: Invalid task encountered.');
        }
    });
    console.log(proto.constants.hr);

    // Define the main task configuration
    grunt.initConfig({
        cfg: cfg,
        pkg: pkg,
        banner: proto.constants.banner,
        jqueryCheck: proto.constants.jsCheck,

        // LESS FILE COMPILATION
        less: {
            options: {
                cleancss: true,
                /*
                modifyVars: {
                    imgPath: '"http://mycdn.com/path/to/images"',
                    bgColor: 'red'
                },
                */
                banner: '<%= banner %>',
                paths: ["<%= cfg.web %>"]
            },
            src: {
                files: {
                    "<%= cfg.web %>/<%= cfg.css %>/app.css": "<%= cfg.web %>/assets/less/app.less",
                }
            },
        },

        // MINIFY CSS
        cssmin: {
            src: {
                expand: true,
                cwd: '<%= cfg.web %>/<%= cfg.css %>/',
                src: [
                    '**/*.css',
                    '!**/*.min.css'
                ],
                dest: '<%= cfg.web %>/<%= cfg.css %>/',
                extDot: 'last',
                ext: '.min.css'
            },
        },

        // MINIFY JS FILE
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            statics: {
                // Because these src-dest file mappings are manually specified, every
                // time a new file is added or removed, the Gruntfile has to be updated.
                files: [
                    { src: '<%= cfg.web %>/assets/app.js', dest: '<%= cfg.dest %>/assets/app.min.js' },
                    { src: '<%= cfg.web %>/assets/app.loader.js', dest: '<%= cfg.dest %>/assets/app.loader.min.js' },
                    { src: '<%= cfg.web %>/assets/app.templates.js', dest: '<%= cfg.dest %>/assets/app.templates.min.js' },
                ],
            },
            dynamics: {
                // Grunt will search for "**/*.js" under "lib/" when the "uglify" task
                // runs and build the appropriate src-dest file mappings then, so you
                // don't need to update the Gruntfile when files are added or removed.
                files: [
                  {
                      expand: true, // Enable dynamic expansion.
                      src: [
                        '**/*.ng.js',
                        '!**/*.min.js',
                        '!**/*.backup.js'
                      ],
                      cwd: '<%= cfg.web %>/modules/',   // Src matches are relative to this path.
                      dest: '<%= cfg.dest %>/modules',  // Destination path prefix.
                      ext: '.min.js',                   // Dest filepaths will have this extension.
                      extDot: 'last'                    // Extensions in filenames begin after the first dot
                  },
                ],
            },
        },

        // COMBINE JS FILES 
        concat: {
            options: {
                separator: ';'
            },
            
            modules: {
                files: [{
                    src: ['<%= cfg.dest %>/modules/**/*.js'],
                    dest: '<%= cfg.dest %>/assets/app.modules.min.js'
                }]
            },
            /*
            loader: {
                files: [
                  {
                      dest: '<%= cfg.dest %>/assets/app.loader.dll.js',
                      src: [
                        'assets/app.loader.js',
                        'assets/lib/mousetrap.js',
                      ]
                  }
                ]
            },
            */
        },

        useminPrepare: {
            html: '<%= cfg.dest %>/index.html',
            options: {
                flow: {
                    steps: {
                        loader: ['concat']
                    },
                    post: {}
                }
            }
        },
        usemin: {
            html: '<%= cfg.dest %>/index.html',
            options: {
                flow: {
                    steps: {
                        loader: ['concat']
                    },
                    post: {}
                }
            }
        },

        // JS TESTING    
        jshint: {
            files: [
              'Gruntfile.js',
              '<%= cfg.dest %>/**/*.js'
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
                    '<%= cfg.web %>/views/**/*.jade',
                    '<%= cfg.web %>/views/**/*.tpl.html',
                ],
                dest: '<%= cfg.web %>/assets/app.templates.js'
            },
        },

        copy: {
            dest: {
                files: [
                  // includes files within path
                  {
                      expand: true,
                      src: [
                          'index.html',
                          '**/package.json',
                          'assets/**/*.ico',
                          'assets/**/*.png',
                          'assets/**/*.jpg',
                          'assets/**/*.bmp',
                          'assets/**/*.svg',
                          'assets/**/*.woff',
                          'assets/**/*.json',
                          'assets/**/*.min.css',
                          'assets/lib/*.min.js',
                      ],
                      cwd: '<%= cfg.web %>/',
                      dest: '<%= cfg.dest %>/',
                      filter: 'isFile'
                  },
                ],
            },
        },

        // WATCH FILES FOR CHANGES
        watch: {
            css: {
                files: [
                  '<%= cfg.web %>/**/*.less',
                  '<%= cfg.web %>/**/*.css',
                ],
                tasks: ['less', 'cssmin']
            },
            js: {
                files: [
                  '<%= cfg.web %>/**/*.js',
                ],
                tasks: ['uglify', 'concat']
            },
            tpl: {
                files: [
                  '<%= cfg.web %>/**/*.jade',
                  '<%= cfg.web %>/**/*.tpl.html',
                ],
                tasks: ['html2js']
            }
        }
    });
};