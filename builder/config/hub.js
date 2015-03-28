module.exports = {
    options: {
        concurrent: 1,
        allowSelf: false,
    },
    projects: {
        src: [
            '../prototyped.ng/builder/Gruntfile.js',
            '../prototyped.ng.samples/builder/Gruntfile.js',
        ],
        tasks: ['default'],
    },
};