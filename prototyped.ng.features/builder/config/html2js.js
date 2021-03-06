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
    module_views: {
        options: {
            base: '<%= cfg.base %>',
            module: '<%= cfg.mod %>.views'
        },
        src: [
            '<%= cfg.base %>**/*.jade',
            '<%= cfg.base %>**/*.tpl.html',
            '!<%= cfg.base %>**/builder/**',
            '!<%= cfg.base %>**/node_modules/**',
        ],
        dest: '<%= cfg.base %>/<%= cfg.lib %>/<%= cfg.mod %>.views.js'
    }
};