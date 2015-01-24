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
        lib: 'assets/js',
        bin: 'bin',
    };

    // Load the NPM tasks to be used
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
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
              '<%= globalConfig.dist %>/**/*.js'
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
            }
        }
    });
};