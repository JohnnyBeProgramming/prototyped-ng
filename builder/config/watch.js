module.exports = {
    css: {
        files: [
            '<%= cfg.web %>/**/*.less',
            '<%= cfg.web %>/**/*.css'
        ],
        tasks: ['build-styles']
    },
    js: {
        files: [
            '<%= cfg.web %>/**/*.js'
        ],
        tasks: ['build-scripts']
    },
};