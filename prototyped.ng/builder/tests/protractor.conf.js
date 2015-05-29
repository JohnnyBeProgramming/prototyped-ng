exports.config = {
    seleniumAddress: "http://127.0.0.1:4444/wd/hub",
    seleniumPort: null,
    seleniumArgs: [],
    //specs: ['../../builder/tests/e2e/**/*spec.{js,coffee}'],
    suites: {
        login: '../../builder/tests/e2e/login.e2e.spec.js',
        sample: '../../builder/tests/e2e/sample.e2e.spec.js',
        explore: '../../builder/tests/e2e/explore.e2e.spec.js',
        about: '../../builder/tests/e2e/about.e2e.spec.js',
    },
    capabilities: {
        'browserName': 'chrome'
    },
    baseUrl: 'http://localhost:8009/',
    jasmineNodeOpts: {
        isVerbose: false,
        showColors: true,
        onComplete: null,
        includeStackTrace: false,
        print: function () { }, // Remove default dots reporter...
    },
    onPrepare: function () {
        // Maximise the browser while testing
        browser.driver.manage().window().maximize();

        // Add jasmine spec reporter
        var SpecReporter = require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new SpecReporter({ displayStacktrace: true }));

        /*
        // track mouse movements
        var trackMouse = function () {

            angular.module('trackMouse', []).run(function ($document) {

                function addDot(ev) {

                    var color = 'black',
                      size = 6;

                    switch (ev.type) {
                        case 'click':
                            color = 'red';
                            break;
                        case 'dblclick':
                            color = 'blue';
                            break;
                        case 'mousemove':
                            color = 'green';
                            break;
                    }

                    var dotEl = $('<div></div>')
                      .css({
                          position: 'fixed',
                          height: size + 'px',
                          width: size + 'px',
                          'background-color': color,
                          top: ev.clientY,
                          left: ev.clientX,

                          'z-index': 9999,

                          // make sure this dot won't interfere with the mouse events of other elements
                          'pointer-events': 'none'
                      })
                      .appendTo('body');

                    setTimeout(function () {
                        dotEl.remove();
                    }, 1000)

                }

                $document.on({
                    click: addDot,
                    dblclick: addDot,
                    mousemove: addDot
                });

            });

        };
        browser.addMockModule('trackMouse', trackMouse);
        */
    },
    defaultTimeoutInterval: 10000, // in microseconds
};