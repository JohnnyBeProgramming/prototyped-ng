module.exports = {
    options: {
        cleancss: true,
        banner: '<%= banner %>',
        paths: ["assets/css"],
    },
    prototyped_ng: {
        files: {
            '<%= cfg.base %>assets/css/features.css': '<%= cfg.base %>assets/less/features.less'
        }
    }
};