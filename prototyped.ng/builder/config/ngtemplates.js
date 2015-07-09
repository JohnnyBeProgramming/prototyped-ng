module.exports = {
    options: {
        singleModule: true,
        htmlmin: {
            collapseWhitespace: true,
            collapseBooleanAttributes: false
        },
        url: function (url) {
            // Remove the prefix (if exists)
            var prefix = require('grunt').config('cfg').base;
            if (prefix) {
                if (url && (url.indexOf(prefix) == 0)) {
                    url = url.substring(prefix.length);
                    console.log(' + ' + url);
                }
            }
            return url;
        },
        source: function (src) {
            var cfg = require('grunt').config('cfg');
            if (cfg.zip) {
                var sp = require('../../../builder/tasks/sp.js');
                var zip = src['']().compress().val;
                return zip;
            }
            return src;
        },
        bootstrap: function (module, script) {
            var cnt = script;
            var cfg = require('grunt').config('cfg');
            if (cfg.zip) {
                var templates = require('../../../builder/tasks/templates.js');
                cnt = templates.postCompile(cnt);
            }
            return "angular.module('" + module + "', []).run(['$templateCache', function($templateCache) { \r\n" +
                        cnt +
                    "}]);";
        },
        process: function (content, filepath) {
            var cfg = require('grunt').config('cfg');
            /*
            if (cfg.zip) {
                var sp = require('../../../builder/tasks/sp.js');
                var zip = content['']().compress().val;
                return '<script>' + JSON.stringify(zip) + "[''](eval)</script>";
            }
            */
            return content;
        },
    },
    prototyped_ng_styles: {
        options: {
            base: '<%= cfg.base %>',
            module: '<%= cfg.mod %>.styles',
            htmlmin: {
                collapseWhitespace: false,
                collapseBooleanAttributes: false,
            },
        },
        src: [
            '<%= cfg.base %>**/**.min.css',
            '!<%= cfg.base %>**/**.offline.min.css',
            '!<%= cfg.base %>**/builder/**',
            '!<%= cfg.base %>**/node_modules/**',
        ],
        dest: '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.styles.js',
        module: '<%= cfg.mod %>.styles',
    },
    prototyped_ng_offline: {
        options: {
            base: '<%= cfg.base %>',
            module: '<%= cfg.mod %>.offline',
            htmlmin: {
                collapseWhitespace: false,
                collapseBooleanAttributes: false,
            },
        },
        src: [
            '<%= cfg.base %>**/**.offline.min.css',
            '!<%= cfg.base %>**/builder/**',
            '!<%= cfg.base %>**/node_modules/**',
        ],
        dest: '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.offline.js',
        module: '<%= cfg.mod %>.offline',
    },
};