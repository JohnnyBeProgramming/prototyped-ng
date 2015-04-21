module.exports = {
  module_cssmin: {
    expand: true,
    cwd: '<%= cfg.web %><%= cfg.css %>/',
    src: ['**/*.css', '!**/*.min.css'],
    dest: '<%= cfg.web %><%= cfg.css %>/',
    extDot: 'last',
    ext: '.min.css'
  }
};