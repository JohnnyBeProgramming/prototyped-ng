module.exports = {
    options: {
        concurrent: 1,
        allowSelf: false,
    },
    projects: {
        src: [
            '../prototyped.ng/builder/Gruntfile.js',
            '../**/builder/Gruntfile.js',
        ],
        tasks: ['default'],
    },
};