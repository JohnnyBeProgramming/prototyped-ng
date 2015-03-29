module.exports = {
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
        }
    },
    prototyped_ng: {
        options: {
            base: '<%= cfg.base %>',
            module: '<%= cfg.mod %>.views'
        },
        src: [
            '<%= cfg.base %>**/*.jade',
            '<%= cfg.base %>**/*.tpl.html',
            '!<%= cfg.base %>**/node_modules/**',
            '!<%= cfg.base %>builder/**',
        ],
        dest: '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.views.js'
    }
};