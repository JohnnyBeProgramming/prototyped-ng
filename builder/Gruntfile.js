/// <reference path="typings/imports.d.ts" />
/*!
* Prototyped Grunt file for a task based javascript builder
* Copyright 2013-2014 Prototyped
*/
module.exports = function (grunt) {
    'use strict';
    var cfg = {
        base: '../',
        web: 'web',
        dest: 'app',
        css: 'assets/css',
        lib: 'assets/lib',        
    };

    // Load grunt modules defined in the package.json file
    require('load-grunt-tasks')(grunt);

    // Load custom grunt tasks from './tasks/' 
    grunt.loadTasks('tasks');

    // Define the default task(s)
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
                    cwd: '<%= cfg.base %><%= cfg.web %>/',
                    dest: '<%= cfg.base %><%= cfg.dest %>/',
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