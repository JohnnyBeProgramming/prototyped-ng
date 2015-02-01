'use strict';

angular.module('myApp.about', [
    'ngRoute'
])

    .config(['$stateProvider', function ($stateProvider) {

        // Define the UI states
        $stateProvider
          .state('about', {
              url: '/about',
              abstract: true,
          })
          .state('about.info', {
              url: '/info',
              views: {
                  'menu@': { templateUrl: 'views/about/menu.html' },
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': {
                      templateUrl: 'views/about/info.html',
                      controller: 'AboutInfoController',
                  },
              }
          })
          .state('about.contact', {
              url: '^/contact',
              views: {
                  'menu@': { templateUrl: 'views/about/menu.html' },
                  'left@': { templateUrl: 'views/about/left.html' },
                  'main@': { templateUrl: 'views/about/contact.html' },
              }
          })

    }])

    .controller('AboutInfoController', ['$scope', function ($scope) {

        function css(a) {
            var sheets = document.styleSheets, o = [];
            for (var i in sheets) {
                var rules = sheets[i].rules || sheets[i].cssRules;
                for (var r in rules) {
                    if (a.is(rules[r].selectorText)) {
                        o.push(rules[r].selectorText);
                    }
                }
            }
            return o;
        }

        function selectorExists(selector) {
            return false; //Just does not seem to work...
            var ret = css($(selector));
            return ret;
        }

        function getVersionInfo(ident) {
            try {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) { }
            return null;
        }

        try {
            // Define a function to detect the capabilities
            $scope.detectBrowserInfo = function () {
                var info = {
                    versions: {
                        html: 0.0,
                        css: 0.0,
                        jqry: null,
                    },
                    detects: {},
                    cssExist: {},
                    codeName: navigator.appCodeName,
                    userAgent: navigator.userAgent,
                };

                // Sanitize codeName and userAgentt
                var cn = info.codeName;
                var ua = info.userAgent;
                if (ua) {
                    // Remove start of string in UAgent upto CName or end of string if not found.
                    ua = ua.substring((ua + cn).toLowerCase().indexOf(cn.toLowerCase()));
                    // Remove CName from start of string. (Eg. '/5.0 (Windows; U...)
                    ua = ua.substring(cn.length);
                    // Remove any spaves or '/' from start of string.
                    while (ua.substring(0, 1) == " " || ua.substring(0, 1) == "/") {
                        ua = ua.substring(1);
                    }
                    // Remove the end of the string from first characrer that is not a number or point etc.
                    var pointer = 0;
                    while ("0123456789.+-".indexOf((ua + "?").substring(pointer, pointer + 1)) >= 0) {
                        pointer = pointer + 1;
                    }
                    ua = ua.substring(0, pointer);

                    if (!isNaN(ua)) {
                        if (ua > 0) {
                            info.versions.html = ua;
                        }
                        if (parseFloat(ua) >= 5) {
                            info.versions.css = '3.x';
                            info.versions.js = '5.x';
                        }
                    }
                }
                info.versions.jqry = typeof jQuery !== 'undefined' ? jQuery.fn.jquery : null;
                info.versions.ng = typeof angular !== 'undefined' ? angular.version.full : null;
                info.versions.nw = getVersionInfo('node-webkit');
                info.versions.njs = getVersionInfo('node');
                info.versions.v8 = getVersionInfo('v8');
                info.versions.openssl = getVersionInfo('openssl');
                info.versions.chromium = getVersionInfo('chromium');

                // Get IE version (if defined)
                if (!!window.ActiveXObject) {
                    info.versions.ie = {                        
                        active: true,
                    };
                }

                info.cssExist.boostrap2 = selectorExists('hero-unit');
                info.cssExist.boostrap3 = selectorExists('jumbotron');

                // Check for general header and body scripts
                var scripts = [];
                $("script").each(function () {
                    var src = $(this).attr("src");
                    if (src) {
                        scripts.push(src);
                    }
                });

                // Check for known types
                scripts.forEach(function (src) {
                    if (/(.*)(less.*js)(.*)/.test(src)) {
                        info.detects.less = true;
                    }
                    if (/(.*)(bootstrap)(.*)/.test(src)) {
                        info.detects.bootstrap = true;
                    }
                    if (/(.*)(angular\-animate)(.*)/.test(src)) {
                        info.detects.ngAnimate = true;
                    }
                    if (/(.*)(angular\-ui\-router)(.*)/.test(src)) {
                        info.detects.ngUiRouter = true;
                    }
                    if (/(.*)(angular\-ui\-utils)(.*)/.test(src)) {
                        info.detects.ngUiUtils = true;
                    }
                    if (/(.*)(angular\-ui\-bootstrap)(.*)/.test(src)) {
                        info.detects.ngUiBootstrap = true;
                    }
                });


                // Check for jQuery
                info.detects.jqry = typeof jQuery !== 'undefined';

                return info;
            }

            // Define the state
            $scope.info = $scope.detectBrowserInfo();
        } catch (ex) {
            console.error(ex);
        }
    }]);