module.exports = {
  prototyped_ng: {
    expand: true,
    cwd: '<%= cfg.base %><%= cfg.css %>/',
    src: ['**/*.css', '!**/*.min.css'],
    dest: '<%= cfg.base %><%= cfg.css %>/',
    extDot: 'last',
    ext: '.min.css'
  }
};