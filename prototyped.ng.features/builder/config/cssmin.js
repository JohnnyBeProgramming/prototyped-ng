module.exports = {
  module_cssmin: {
    expand: true,
    cwd: '<%= cfg.base %><%= cfg.css %>/',
    src: ['**/*.css', '!**/*.min.css'],
    dest: '<%= cfg.base %><%= cfg.css %>/',
    extDot: 'last',
    ext: '.min.css'
  }
};