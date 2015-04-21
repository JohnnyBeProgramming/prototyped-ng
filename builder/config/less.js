module.exports = {
    options: {
        cleancss: true,
    },
    module_less: {
        files: {
            '<%= cfg.base %>assets/css/app.css': '<%= cfg.base %>assets/less/app.less',
            '<%= cfg.base %>assets/css/animations.css': '<%= cfg.base %>assets/less/animations.less',
            '<%= cfg.base %>assets/css/test.css': '<%= cfg.base %>assets/less/test.less'
        }
    }
};