module.exports = {
  options: {
    cleancss: true,
    banner: '<%= banner %>'
    },
    module_less: {
        files: {
            '<%= cfg.base %>assets/css/features.css': '<%= cfg.base %>assets/less/features.less'
        }
    }
};