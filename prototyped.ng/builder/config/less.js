module.exports = {
  options: {
    cleancss: true,
    banner: '<%= banner %>'
    },
    module_less: {
    files: {
      '<%= cfg.base %>assets/css/app.css': '<%= cfg.base %>assets/less/app.less',
      '<%= cfg.base %>assets/css/images.css': '<%= cfg.base %>assets/less/images.less',
      '<%= cfg.base %>assets/css/prototyped.css': '<%= cfg.base %>assets/less/prototyped.less'
    }
  }
};