
// Define configuration
var appConfig = {
    vend: [],
    libs: [],
    init: function (vendorLibs) {
        try {
            // Clear flags...
            appConfig.pass = null;
            appConfig.wait = true;

            // Add additional vendor libraries (before verdor libs start loading)...
            if (vendorLibs && vendorLibs.length > 0) {
                appConfig.vend = (appConfig.vend || []).concat(vendorLibs);
            }

            // Set a timer to check for timeouts (or failures)
            appConfig.progress.timerIntvl = setInterval(function () {
                appConfig.check();
            }, appConfig.progress.timerDelay);
        } catch (ex) {
            return false; // Loader failed to initialise
        }
        return true; // Initialised loader...
    },
    preLoad: function (moduleLibs) {

        // Add additional application libs (before app files start downloading)...
        if (moduleLibs && moduleLibs.length > 0) {
            // Concat before the main module loads (ensures availability)
            appConfig.libs = moduleLibs.concat(appConfig.libs);
        }

        // Clear waiting flag
        appConfig.wait = false;
    },
    success: function () {
        // When all is done, bootstrap our angular app
        console.debug(' - Start AngularJS...');
        angular.bootstrap($('#myApp'), ['myApp']);

        // Set done flag
        appConfig.done = true;
    },
    check: function () {
        var prog = appConfig.progress;
        var max = appConfig.progress.countTotal();

        // Check for timeout
        if (prog.timerSteps >= prog.timerCount) {
            appConfig.failed();
        }

        // Check if done
        if (appConfig.done) {
            appConfig.pass = true;
            //console.debug(' - Closing...');
            clearInterval(appConfig.progress.timerIntvl);
        } else {
            if (max > 0) {
                prog.timerSteps++;
                prog.progTime = prog.percentage(prog.timerSteps, max);
                prog.progVend = prog.percentage(prog.countVend(), max);
                prog.progLibs = prog.percentage(prog, max);
            }
        }
    },
    failed: function () {
        var msg = 'Resources missing or unavailable';
        $('.app-loading').addClass('app-error');
        $('.app-loading label').html(msg);
        if (typeof require !== 'undefined') {
            $('#btnCloseWindow').removeClass('ng-cloak');
            $('#btnCloseWindow').click(function (evt) {
                var gui = require('nw.gui');
                var win = gui.Window.get();
                if (win) {
                    win.close();
                }
                evt.stopPropagation();
                return false;
            });
        }
        console.warn(' - Warning: ' + msg);

        // Clear waiting/done flags
        appConfig.wait = false;
        appConfig.done = true;
        appConfig.pass = false;
    },
    wait: true,
    done: false,
    pass: null,
    progress: {
        timerSteps: 0,
        timerCount: 120, // 2m = 2 * 60s = 120s
        timerPercn: 0.2,
        timerIntvl: null,
        timerDelay: 500,
        percentage: function (fraction, total) { return (100.0 * fraction) / total },
        countTotal: function () { return appConfig.vend.length + appConfig.libs.length + appConfig.progress.timerCount },
        countVend: function () { return appConfig.wait ? 0 : appConfig.vend.length },
        countLibs: function () { return !appConfig.done ? 0 : appConfig.libs.length },
    },
};