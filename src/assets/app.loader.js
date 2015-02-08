/*!
 * $script.js v1.3
 * https://github.com/ded/script.js
 * Copyright: @ded & @fat - Dustin Diaz, Jacob Thornton 2011
 * Follow our software http://twitter.com/dedfat
 * License: MIT
 */
!function (a, b, c) { function t(a, c) { var e = b.createElement("script"), f = j; e.onload = e.onerror = e[o] = function () { e[m] && !/^c|loade/.test(e[m]) || f || (e.onload = e[o] = null, f = 1, c()) }, e.async = 1, e.src = a, d.insertBefore(e, d.firstChild) } function q(a, b) { p(a, function (a) { return !b(a) }) } var d = b.getElementsByTagName("head")[0], e = {}, f = {}, g = {}, h = {}, i = "string", j = !1, k = "push", l = "DOMContentLoaded", m = "readyState", n = "addEventListener", o = "onreadystatechange", p = function (a, b) { for (var c = 0, d = a.length; c < d; ++c) if (!b(a[c])) return j; return 1 }; !b[m] && b[n] && (b[n](l, function r() { b.removeEventListener(l, r, j), b[m] = "complete" }, j), b[m] = "loading"); var s = function (a, b, d) { function o() { if (!--m) { e[l] = 1, j && j(); for (var a in g) p(a.split("|"), n) && !q(g[a], n) && (g[a] = []) } } function n(a) { return a.call ? a() : e[a] } a = a[k] ? a : [a]; var i = b && b.call, j = i ? b : d, l = i ? a.join("") : b, m = a.length; c(function () { q(a, function (a) { h[a] ? (l && (f[l] = 1), o()) : (h[a] = 1, l && (f[l] = 1), t(s.path ? s.path + a + ".js" : a, o)) }) }, 0); return s }; s.get = t, s.ready = function (a, b, c) { a = a[k] ? a : [a]; var d = []; !q(a, function (a) { e[a] || d[k](a) }) && p(a, function (a) { return e[a] }) ? b() : !function (a) { g[a] = g[a] || [], g[a][k](b), c && c(d) }(a.join("|")); return s }; var u = a.$script; s.noConflict = function () { a.$script = u; return this }, typeof module != "undefined" && module.exports ? module.exports = s : a.$script = s }(this, document, setTimeout)

// Define configuration
var appConfig = {
    vend: [
        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap-tpls.min.js',
    ],
    libs: [
        // Define the required libraries
        'assets/app.templates.js',
        'assets/app.js',
    ],
    init: function (vendorLibs) {
        try {
            // Clear flags...
            appConfig.pass = null;
            appConfig.wait = true;

            // Add additional vendor libraries (before verdor libs start loading)...
            if (vendorLibs && vendorLibs.length > 0) {
                appConfig.vend = (appConfig.vend || []).concat(vendorLibs);
            }

            // Bootstrap the angular loading app (for pre-loading progress feedback)
            var elemLoader = $('#myLoader');
            if (elemLoader) {
                appConfig.bootstrap(elemLoader);
            }

        } catch (ex) {
            return false; // Loader failed to initialise
        }
        return true; // Initialised loader...
    },
    bootstrap: function (elemLoader) {
        // Define the loader module
        angular.module('myLoader', ['angular-loading-bar', 'ngAnimate'])

            // Define the loader runtime.
            .run(['$rootScope', function ($rootScope) {
                // Add the loader config to the root scope
                $rootScope.cfg = appConfig;
                console.debug(' - Application Loader started.');

                // Set a timer to check for updates (or failures)
                appConfig.progress.timerIntvl = setInterval(function () {
                    $rootScope.$apply(function () {
                        appConfig.check();
                    });
                }, appConfig.progress.timerDelay);
            }]);

        angular.bootstrap(elemLoader, ['myLoader']);
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