module.exports = {
    options: {
        cleancss: true,
    },
    module_less: {
        files: {
            '<%= cfg.base %>assets/css/app.css': '<%= cfg.base %>assets/less/app.less',
            '<%= cfg.base %>assets/css/images.css': '<%= cfg.base %>assets/less/images.less',
            '<%= cfg.base %>assets/css/images.offline.css': '<%= cfg.base %>assets/less/images.offline.less',
            '<%= cfg.base %>assets/css/prototyped.css': '<%= cfg.base %>assets/less/prototyped.less',
            '<%= cfg.base %>assets/css/sandbox.css': '<%= cfg.base %>assets/less/sandbox.less',
            '<%= cfg.base %>modules/editor/styles/css/editor.css': '<%= cfg.base %>modules/editor/styles/less/editor.less'
        }
    }
};