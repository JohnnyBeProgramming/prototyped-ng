/// <reference path="typings/imports.d.ts" />
/*!
* Prototyped Grunt file for a task based javascript builder
*/
module.exports = function (grunt) {
    'use strict';
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        env: process.env,
        cfg: {
            base: '../',
            dest: '../../web/',
            mod: 'prototyped.ng.extended',
            css: 'assets/css',
            lib: 'assets/lib',
            zip: false,
        }
    };

    // Load grunt tasks dynamically & from the package.json file
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    // Load custom grunt tasks from './tasks/' 
    grunt.loadTasks('tasks');

    // Define the default task(s)
    grunt.registerTask('default', [
        'build',
    ]);
    grunt.registerTask('build', [
        'copy:dependencies',
        'build-styles',
        'build-scripts',
        'copy:destination',
    ]);
    grunt.registerTask('build-styles', [
        'less',
        'cssmin'
    ]);
    grunt.registerTask('build-scripts', [
        'html2js',
        'ngtemplates',
        //'uglify',
        'concat'
    ]);
    grunt.registerTask('app-start', [
        'app-run'
    ]);

    // Define and extent with dynamic configuration(s)
    var configs = require('load-grunt-configs')(grunt);
    grunt.util._.extend(configs, config);
    grunt.initConfig(configs);
};