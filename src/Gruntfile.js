/// <reference path="typings/imports.d.ts" />
/*!
* Prototyped Grunt file for a task based javascript builder
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
            banner: '/*!\n' + ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' + ' * Copyright 2014-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' + ' */\n',
            jsCheck: 'if (typeof jQuery === \'undefined\') { throw new Error(\'Bootstrap\\\'s JavaScript requires jQuery\') }\n\n'
        }
    };

    // DEFINE PROTOTYPED BUILD
    var cfg = {
        web: 'web',
        dest: 'app',
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
                        'build-styles',
                        'build-scripts',
                        'copy',
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
                    val: []
                },
                // Extend tasks for dist env
                { key: 'build-dist', val: ['build-prod'] },
                { key: 'tests-dist', val: ['test-units'] }
            ],
            customs: [
                {
                    key: 'app-run',
                    val: function () {
                        // Start the web server prior to opening the window
                        var httpHost = require('./Server.js');
                        var url = httpHost.baseUrl;

                        // Start a Node Webkit window and point it to our starting url...
                        var www = cfg.web;
                        var cmd = '"node_modules/.bin/nw" "' + www + '/"';
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
                    }
                }
            ]
        }
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
                    "<%= cfg.web %>/<%= cfg.css %>/app.css": "<%= cfg.web %>/assets/less/app.less"
                }
            }
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
            }
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
                    { src: '<%= cfg.web %>/assets/app.templates.js', dest: '<%= cfg.dest %>/assets/app.templates.min.js' }
                ]
            },
            dynamics: {
                // Grunt will search for "**/*.js" under "lib/" when the "uglify" task
                // runs and build the appropriate src-dest file mappings then, so you
                // don't need to update the Gruntfile when files are added or removed.
                files: [
                    {
                        expand: true,
                        src: [
                            '**/*.ng.js',
                            '!**/*.min.js',
                            '!**/*.backup.js'
                        ],
                        cwd: '<%= cfg.web %>/modules/',
                        dest: '<%= cfg.dest %>/modules',
                        ext: '.min.js',
                        extDot: 'last'
                    }
                ]
            }
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
            }
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
                base: '<%= cfg.web %>',
                module: 'myApp.views',
                singleModule: false,
                quoteChar: '\'',
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
                    '<%= cfg.web %>/views/**/*.tpl.html'
                ],
                dest: '<%= cfg.web %>/assets/app.templates.js'
            }
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
                            'assets/lib/*.min.js'
                        ],
                        cwd: '<%= cfg.web %>/',
                        dest: '<%= cfg.dest %>/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        // WATCH FILES FOR CHANGES
        watch: {
            css: {
                files: [
                    '<%= cfg.web %>/**/*.less',
                    '<%= cfg.web %>/**/*.css'
                ],
                tasks: ['less', 'cssmin']
            },
            js: {
                files: [
                    '<%= cfg.web %>/**/*.js'
                ],
                tasks: ['uglify', 'concat']
            },
            tpl: {
                files: [
                    '<%= cfg.web %>/**/*.jade',
                    '<%= cfg.web %>/**/*.tpl.html'
                ],
                tasks: ['html2js']
            }
        }
    });
};
