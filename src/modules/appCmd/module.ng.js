'use strict';

angular.module('myApp.appCmd', [
    //'modules/appCmd/views/index.tpl.html', // Requires template
    'ngRoute',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
          .state('appCmd', {
              url: '/appCmd',
              abstract: true,
          })
        .state('appCmd.discover', {
            url: '/discovery',
            views: {
                'menu@': { templateUrl: 'modules/appCmd/views/menu.html' },
                'left@': { templateUrl: 'modules/appCmd/views/left.html' },
                'main@': {
                    templateUrl: 'modules/appCmd/views/index.tpl.html',
                    controller: 'appCmdViewController'
                },
            }
        })
        .state('appCmd.connect', {
            url: '/connect',
            views: {
                'menu@': { templateUrl: 'modules/appCmd/views/menu.html' },
                'left@': { templateUrl: 'modules/appCmd/views/left.html' },
                'main@': {
                    templateUrl: 'modules/appCmd/views/index.tpl.html',
                    controller: 'appCmdViewController'
                },
            }
        })
        .state('appCmd.clear', {
            url: '/clear',
            views: {
                'menu@': { templateUrl: 'modules/appCmd/views/menu.html' },
                'left@': { templateUrl: 'modules/appCmd/views/left.html' },
                'main@': {
                    templateUrl: 'modules/appCmd/views/index.tpl.html',
                    controller: 'appCmdViewController'
                },
            }
        })
    }])

    .controller('appCmdViewController', ['$scope', '$rootScope', '$window', '$location', '$timeout', function ($scope, $rootScope, $window, $location, $timeout) {
        // Define the appCmd model
        $scope.appCmd = {
            busy: true,
            utils: {
                icon: function (path, file) {
                    var css = '';
                    if (file) {
                        css = 'glyphicon-file';
                        if (/(.*)?.exe$/i.test(file)) css = 'glyphicon-open'
                        if (/(.*)?.cmd$/i.test(file)) css = 'glyphicon-cog'
                        if (/(.*)?.cer$/i.test(file)) css = 'glyphicon-certificate'
                        if (/(.*)?.pem$/i.test(file)) css = 'glyphicon-certificate'
                        if (/(.*)?.htm.*$/i.test(file)) css = 'glyphicon-globe'
                    } else {
                        var target = $scope.appCmd.target;
                        if (target && (path == target.path)) {
                            css += 'glyphicon-folder-open glow-blue';
                        } else {
                            css += 'glyphicon-folder-open glow-orange';
                        }
                    }

                    return css;
                },
                list: function (path, callback) {
                    try {
                        console.info(' - [ appCmd ] List path: ' + path);

                        var list = [];
                        var regex = /(\d{2}\/\d{2}\/\d{4})  (\d{2}:\d{2} \w{2})([ ]+\d+,\d+ )(\w+.\w+)/;
                        var proc = require("child_process");
                        if (proc) {
                            var commands = [];

                            //commands.push('dir "' + path + '\\"');
                            var extensions = ['.exe', '.cmd', '.cer', '.pem', '.htm*'];
                            extensions.forEach(function (ext) {
                                commands.push('dir "' + path + '\\*' + ext + '"');
                            });

                            commands.forEach(function (cmd) {
                                proc.exec(cmd, function (error, stdout, stderr) {
                                    stdout.split('\n').forEach(function (line) {
                                        var result = regex.exec(line);
                                        if (result && result.length > 4) {
                                            list.push(result[4]);
                                        }
                                    });
                                    $rootScope.$applyAsync(function () {
                                        if (callback) {
                                            callback(list);
                                        } else {
                                            angular.extend($scope.appCmd, {
                                                target: {
                                                    path: path,
                                                    list: list,
                                                },
                                            });
                                        }
                                    });
                                    $timeout(function () {
                                        
                                    });
                                });
                            });
                        }

                    } catch (ex) {
                        console.error(ex.message);
                        $scope.appCmd.error = ex;
                    }
                }
            },
        };

        var updates = {};
        try {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // Set the result
                updates = {
                    busy: false,
                    active: false,
                    result: {
                        path: 'C:\\Working\\',
                    }
                };

                // Parse the system paths
                var cmd = 'echo %PATH%';
                var proc = require("child_process");
                if (proc) {
                    console.info(' - [ appCmd ] Discovering...');
                    proc.exec(cmd, function (error, stdout, stderr) {
                        $rootScope.$applyAsync(function () {

                            updates.active = true;
                            updates.busy = false;
                            if (error) {
                                console.error(error);
                                updates.error = error;
                            } else {
                                // Parse the path strings and search for appCmd folder
                                var paths = [];
                                if (stdout) {
                                    stdout.split(';').forEach(function (path) {
                                        if (path) {
                                            paths.push(path.trim());
                                        }
                                    });
                                }
                                updates.result.paths = paths;
                                updates.result.stdout = stdout;
                                updates.result.stderr = stderr;


                            }
                            angular.extend($scope.appCmd, updates);

                        });
                    });
                }

                // Get the current working folder
                var cwd = (typeof process !== 'undefined') ? process.cwd() : null;
                if (cwd) {
                    // List current folder contents
                    $scope.appCmd.utils.list(cwd, function (list) {
                        $rootScope.$applyAsync(function () {
                            // Update the current working dir
                            $scope.appCmd.cwd = {
                                path: cwd,
                                list: list,
                            };
                        });
                    });
                }
            } else {
                // Not available
                updates.active = false;
                updates.busy = false;
            }
        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        }
        angular.extend($scope.appCmd, updates);

    }]);