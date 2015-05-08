// Karma configuration
// Generated on Wed May 06 2015 17:34:55 GMT+0200 (South Africa Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'/*, 'requirejs'*/],

        // list of files / patterns to load in the browser
        files: [
            '../web/assets/lib/vend/jquery/jquery-2.1.3.min.js',
            '../web/assets/lib/vend/jquery/jquery-ui.min.js',
            '../web/assets/lib/vend/angular/angular.js',
            '../web/assets/lib/vend/angular/angular-mocks.js',
            '../web/assets/lib/vend/angular/angular-route.js',
            '../web/assets/lib/vend/angular/angular-ui-utils.min.js',
            '../web/assets/lib/vend/angular/angular-ui-router.min.js',
            'assets/lib/prototyped.ng.base.js',
            'assets/lib/prototyped.ng.views.js',
            'assets/lib/prototyped.ng.styles.js',
            'builder/tests/unit/*.spec.js',
        ],

        // list of files to exclude
        exclude: [
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'assets/lib/*.js': 'coverage'
        },

        coverageReporter: {
            type : 'html',
            dir : 'builder/coverage/'
        },
        
        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'PhantomJS',
            //'Chrome',
        ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
