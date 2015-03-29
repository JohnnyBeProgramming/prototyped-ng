module.exports = {
  options: {
    separator: ';'
  },
  prototyped_ng: {
    files: [{
      src: ['<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.base.js',
        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.views.js',
        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.styles.js',
        '<%= cfg.base %><%= cfg.lib %>/<%= cfg.mod %>.sqlx.js'
      ],
      dest: '<%= cfg.dest %><%= cfg.lib %>/<%= cfg.mod %>.js'
    }]
  }
};