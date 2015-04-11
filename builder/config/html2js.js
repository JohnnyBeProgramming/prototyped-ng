module.exports = {
  options: {
    singleModule: true,
    quoteChar: '\'',
    htmlmin: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    }
  },
  web_views: {
      options: {
          base: '<%= cfg.base %><%= cfg.web %>',
          module: 'myApp.views',
      },
      src: [
          '<%= cfg.base %><%= cfg.web %>/views/**/*.jade',
          '<%= cfg.base %><%= cfg.web %>/views/**/*.tpl.html'
      ],
      dest: '<%= cfg.base %><%= cfg.web %>/<%= cfg.lib %>/app/app.templates.js'
  },
};