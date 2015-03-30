module.exports = {
  options: {
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
  },
  dynamics: {
    files: [{
      expand: true,
      src: ['**/*.js',
        '!index.js',
        '!**/*.min.js',
        '!**/Gruntfile.js',
        '!node_modules/**'
      ],
      cwd: '<%= cfg.base %>',
      dest: '<%= cfg.dest %>',
      ext: '.min.js',
      extDot: 'last'
    }]
  }
};