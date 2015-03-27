/// <reference path="typings/imports.d.ts" />
/*!
* Prototyped Grunt file for a task based javascript builder
* Copyright 2013-2014 Prototyped
*/
module.exports = function (grunt) {
    'use strict';
    var cfg = {
        base: './',
        dest: '../app/',
        mod: 'prototyped.ng',
        css: 'assets/css',
        lib: 'assets/lib'
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
        //'watch'
    ]);
    grunt.registerTask('build', [
        'build-styles',
        'build-scripts',
        'copy',
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

    // Define the main task configuration
    grunt.initConfig({
        cfg: cfg,
        pkg: grunt.file.readJSON('package.json'),
        jqueryCheck: 'if (typeof jQuery === \'undefined\') { throw new Error(\'Bootstrap\\\'s JavaScript requires jQuery\') }\n\n',
        banner: '/*!\n' +
                ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                ' * Copyright 2014-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' */\n',
        // LESS FILE COMPILATION
        less: {
            options: {
                cleancss: true,
                banner: '<%= banner %>',
            },
            prototyped_ng: {
                files: {
                    "<%= cfg.base %>assets/css/app.css": "<%= cfg.base %>assets/less/app.less",
                    "<%= cfg.base %>assets/css/images.css": "<%= cfg.base %>assets/less/images.less",
                    "<%= cfg.base %>assets/css/prototyped.css": "<%= cfg.base %>assets/less/prototyped.less",
                },
            },
        },
        // MINIFY CSS
        cssmin: {
            prototyped_ng: {
                expand: true,
                cwd: '<%= cfg.base %><%= cfg.css %>/',
                src: [
                    '**/*.css',
                    '!**/*.min.css'
                ],
                dest: '<%= cfg.base %><%= cfg.css %>/',
                extDot: 'last',
                ext: '.min.css'
            },
        },
        // MINIFY JS FILE
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            dynamics: {
                files: [
                    {
                        expand: true,
                        src: [
                            '**/*.js',
                            '!index.js',
                            '!**/*.min.js',
                            '!**/Gruntfile.js',
                            '!node_modules/**',
                        ],
                        cwd: '<%= cfg.base %>',
                        dest: '<%= cfg.dest %>',
                        ext: '.min.js',
                        extDot: 'last'
                    }
                ]
            },
        },
        // COMBINE JS FILES
        concat: {
            options: {
                separator: ';'
            },
            prototyped_ng: {
                files: [{
                    src: [
                        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.base.js',
                        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.views.js',
                        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.styles.js',
                        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.sqlx.js',
                    ],
                    dest: '<%= cfg.dest %><%= cfg.lib %>/<%= cfg.mod %>.js'
                }]
            },
        },
        // JS TESTING
        jshint: {
            files: [
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
        ngtemplates: {
            options: {
                singleModule: true,
                htmlmin: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: false
                },
                url: function (url) {
                    // Remove the prefix (if exists)
                    var path = require('path');
                    var prefix = cfg.base;
                    if (url && (url.indexOf(prefix) == 0)) {
                        url = url.substring(prefix.length);
                    }
                    return url;
                },
                source: function (src) {
                    //return src['']().compress();
                    return src;
                },
                bootstrap: function (module, script) {
                    var cnt = script;
                    /*
                    var regx = /(\$templateCache\.put\('[^']+',)([^"]+")([^"]+")([^\)]*)/gim;
                    var match = regx.exec(cnt)
                    while (match != null) {
                        var repl = match[1] + '"' + match[3];// + ');';
                        cnt = cnt.substring(0, match.index) + repl + cnt.substring(match.index + match[0].length);
                        match = regx.exec(cnt, match.index + repl.length);
                    }
                    */
                    return "angular.module('" + module + "', []).run(['$templateCache', function($templateCache) { \r\n" +
                                cnt + //cnt.replace(/(\s*\r?\n)/gim, '\r\n\t') +
                            "\r\n}]);";
                },
                process: function (content, filepath) {
                    // grunt.template.process                                        
                    // Define the LZW ecnoder (default encoder)
                    /*
                    var lzwCompressor = {
                        encode: function (s) {
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
                        },
                        decode: function (s) {
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
                        },
                    }
                    var payload = lzwCompressor.encode(content);
                    //console.log(payload);
                    return '<script>' + JSON.stringify(payload) + '</script>';
                    */
                    return content;
                },
            },
            prototyped_ng_styles: {
                options: {
                    module: '<%= cfg.mod %>.styles',
                    base: '<%= cfg.base %>',
                    htmlmin: {
                        collapseWhitespace: false,
                        collapseBooleanAttributes: false,
                    },
                },
                src: [
                    '<%= cfg.base %>**/**.min.css',
                    '!<%= cfg.base %>node_modules/**',
                ],
                dest: '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.styles.js',
                module: '<%= cfg.mod %>.styles',
            },
            prototyped_ng_scripts: {
                options: {
                    module: '<%= cfg.mod %>.sql',
                    base: '<%= cfg.base %>',
                    htmlmin: {
                        collapseWhitespace: false,
                        collapseBooleanAttributes: false,
                    },
                },
                src: [
                    '<%= cfg.base %>**/*.sql',
                    '!<%= cfg.base %>node_modules/**',
                ],
                dest: '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.sqlx.js',
                module: '<%= cfg.mod %>.sql',
            },            
        },
        html2js: {
            options: {
                singleModule: true,
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
                },
            },
            prototyped_ng: {
                options: {
                    base: '<%= cfg.base %>',
                    module: '<%= cfg.mod %>.views',
                },
                src: [
                    '<%= cfg.base %>**/*.jade',
                    '<%= cfg.base %>**/*.tpl.html',
                    '!<%= cfg.base %>node_modules/**',
                ],
                dest: '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.views.js'
            },
        },
        copy: {
            dest: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        src: [
                            '**/package.json',
                            'assets/lib/*.min.js'
                        ],
                        cwd: '<%= cfg.mod %>/',
                        dest: '<%= cfg.dest %>',
                        filter: 'isFile'
                    }
                ]
            }
        },
        // WATCH FILES FOR CHANGES
        watch: {
            css: {
                files: [
                    '<%= cfg.base %>**/*.less',
                    '<%= cfg.base %>**/*.css'
                ],
                tasks: ['less', 'cssmin']
            },
            js: {
                files: [
                    '<%= cfg.base %>**/*.js'
                ],
                tasks: ['uglify', 'concat']
            },
            tpl: {
                files: [
                    '<%= cfg.base %>**/*.jade',
                    '<%= cfg.base %>**/*.tpl.html'
                ],
                tasks: ['html2js']
            }
        }
    });
};