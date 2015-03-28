/// <reference path="typings/imports.d.ts" />
/*!
* Prototyped Grunt file for a task based javascript builder
* Copyright 2013-2014 Prototyped
*/
module.exports = function (grunt) {
    'use strict';

    var cfg = {
        base: '.',
        web: 'web',
        dest: 'app',
        css: 'assets/css',
        lib: 'assets/lib',        
    };

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-devtools');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('default', [
        'build',
        'app-run',
        'watch'
    ]);
    grunt.registerTask('build', [
        //'copy:dependencies',
        'build-styles',
        'build-scripts',
        //'copy:destination',
    ]);
    grunt.registerTask('build-styles', [
        //'less',
        //'cssmin'
    ]);
    grunt.registerTask('build-scripts', [
        //'html2js',
        //'ngtemplates',
        //'uglify',
        //'concat'
    ]);

    grunt.registerTask('app-run', function () {
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
    });

    // Define the main task configuration
    grunt.initConfig({
        cfg: cfg,
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            destination: {
                files: [{
                    expand: true,
                    src: [
                        'index.html',
                        '**/*.json',
                        '**/*.ico',
                        '**/*.png',
                        '**/*.jpg',
                        '**/*.bmp',
                        '**/*.svg',
                        '**/*.woff',
                        'assets/**/*.min.css',
                        'assets/lib/*.min.js'
                    ],
                    cwd: '<%= cfg.web %>/',
                    dest: '<%= cfg.dest %>/',
                    filter: 'isFile'
                }]
            }
        },
        // WATCH FILES FOR CHANGES
        watch: {
            css: {
                files: [
                    '<%= cfg.web %>/**/*.less',
                    '<%= cfg.web %>/**/*.css'
                ],
                tasks: ['build-styles']
            },
            js: {
                files: [
                    '<%= cfg.web %>/**/*.js'
                ],
                tasks: ['build-scripts']
            },
        }
    });
};