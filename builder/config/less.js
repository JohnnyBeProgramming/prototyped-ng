module.exports = {
    options: {
        cleancss: true,
    },
    module_less: {
        files: {
            '<%= cfg.base %>/<%= cfg.web %>/assets/css/app.css': '<%= cfg.base %>/<%= cfg.web %>/assets/less/app.less',
            '<%= cfg.base %>/<%= cfg.web %>/assets/css/test.css': '<%= cfg.base %>/<%= cfg.web %>/assets/less/test.less',
            '<%= cfg.base %>/<%= cfg.web %>/assets/css/styles.css': '<%= cfg.base %>/<%= cfg.web %>/assets/less/styles.less',
            '<%= cfg.base %>/<%= cfg.web %>/assets/css/animate.css': '<%= cfg.base %>/<%= cfg.web %>/assets/less/animate.less',
            '<%= cfg.base %>/<%= cfg.web %>/assets/css/scrollbar.css': '<%= cfg.base %>/<%= cfg.web %>/assets/less/scrollbar.less',
        }
    }
};