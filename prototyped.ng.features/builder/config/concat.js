module.exports = {
    options: {
        separator: ';'
    },
    module_js: {
        files: [{
            src: [
                '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.base.js',
                '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.views.js',
                '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.styles.js',
                '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.scripts.js'
            ],
            dest: '<%= cfg.dest %><%= cfg.lib %>/<%= cfg.mod %>.js'
        }]
    }
};