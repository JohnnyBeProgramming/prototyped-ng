module.exports = {
  options: {
    cleancss: true,
    banner: '<%= banner %>'
  },
  prototyped_ng: {
    files: {
      '<%= cfg.base %>assets/css/samples.css': '<%= cfg.base %>assets/less/samples.less'
    }
  }
};