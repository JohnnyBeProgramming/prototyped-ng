module.exports = {
    module_cssmin: {
        expand: true,
        cwd: '<%= cfg.base %>',
        src: [
            '**/*.css',
            '!**/*.min.css',
            '!**/builder/**',
            '!**/node_modules/**',
        ],
        dest: '<%= cfg.base %>',
        extDot: 'last',
        ext: '.min.css'
    }
};