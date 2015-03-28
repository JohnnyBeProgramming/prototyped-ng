module.exports = {
    destination: {
        files: [{
            expand: true,
            src: [
                'index.html',
                '**/*.json',
                '**/*.ico',
                '**/*.png',
                '**/*.jpg',
                '**/*.bmp',
                '**/*.svg',
                '**/*.woff',
                'assets/**/*.min.css',
                'assets/lib/*.min.js'
            ],
            cwd: '<%= cfg.base %><%= cfg.web %>/',
            dest: '<%= cfg.base %><%= cfg.dest %>/',
            filter: 'isFile'
        }]
    }
};