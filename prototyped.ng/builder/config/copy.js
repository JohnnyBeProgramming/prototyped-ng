module.exports = {
  dependencies: {
    files: [{
      expand: true,
      src: [
          //'prototyped.ng.js'
      ],
      cwd: '<%= cfg.dest %><%= cfg.lib %>/',
      dest: '<%= cfg.base %><%= cfg.lib %>/',
      filter: 'isFile'
    }]
  },
  destination: {
    files: [{
      expand: true,
      src: [
          '<%= cfg.base %><%= cfg.lib %>/prototyped.ng.js'
      ],
      cwd: '<%= cfg.mod %>/',
      dest: '<%= cfg.dest %>',
      filter: 'isFile'
    }]
  }
};