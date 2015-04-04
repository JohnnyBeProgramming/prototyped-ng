module.exports = {
  options: {
    cleancss: true,
    banner: '<%= banner %>'
    },
    module_less: {
    files: {
      '<%= cfg.base %>assets/css/samples.css': '<%= cfg.base %>assets/less/samples.less'
    }
  }
};