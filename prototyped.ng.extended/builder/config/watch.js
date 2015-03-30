module.exports = {
  css: {
    files: ['<%= cfg.base %>**/*.less', '<%= cfg.base %>**/*.css'],
    tasks: ['less', 'cssmin']
  },
  js: {
    files: ['<%= cfg.base %>**/*.js'],
    tasks: ['uglify', 'concat']
  },
  tpl: {
    files: ['<%= cfg.base %>**/*.jade', '<%= cfg.base %>**/*.tpl.html'],
    tasks: ['html2js']
  }
};