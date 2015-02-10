'use strict';

angular.module('prototyped.cmd', ['ui.router',
    'prototyped.sqlcmd',
])

    .config(['$stateProvider', function ($stateProvider) {

        // Now set up the states
        $stateProvider
            .state('prototyped.cmd', {
                url: '/cmd',
                views: {
                    'menu@': { templateUrl: 'modules/prototyped/cmd/views/menu.tpl.html' },
                    'left@': { templateUrl: 'modules/prototyped/cmd/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/prototyped/cmd/views/index.tpl.html',
                        controller: 'systemCmdViewController'
                    },
                }
            })
            .state('prototyped.clear', {
                url: '/clear',
                views: {
                    'menu@': { templateUrl: 'modules/prototyped/cmd/views/menu.tpl.html' },
                    'left@': { templateUrl: 'modules/prototyped/cmd/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/prototyped/cmd/views/index.tpl.html',
                        controller: 'systemCmdViewController'
                    },
                }
            })


    }])

    .controller('systemCmdViewController', ['$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {

        // Define the model
        var context = $scope.cmd = {
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
                        var target = $scope.cmd.target;
                        if (target && (path == target.path)) {
                            css += 'glyphicon-folder-open glow-blue';
                        } else {
                            css += 'glyphicon-folder-open glow-orange';
                        }
                    }

                    return css;
                },
                call: function (path, file) {
                    if (/(sqlcmd\.exe)/i.test(file)) {
                        var params = { path: path, file: file };
                        $state.transitionTo('sqlcmd.connect', params);
                    }
                },
                list: function (path, callback) {
                    try {
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
                                            angular.extend($scope.cmd, {
                                                target: {
                                                    path: path,
                                                    list: list,
                                                },
                                            });
                                        }
                                    });
                                });
                            });
                        }

                    } catch (ex) {
                        console.error(ex.message);
                        $scope.cmd.error = ex;
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
                    proc.exec(cmd, function (error, stdout, stderr) {
                        $rootScope.$applyAsync(function () {

                            updates.active = true;
                            updates.busy = false;
                            if (error) {
                                console.error(error);
                                updates.error = error;
                            } else {
                                // Parse the path strings and search for folder
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
                            angular.extend($scope.cmd, updates);

                        });
                    });
                }

                // Get the current working folder
                var cwd = (typeof process !== 'undefined') ? process.cwd() : null;
                if (cwd) {
                    // List current folder contents
                    $scope.cmd.utils.list(cwd, function (list) {
                        $rootScope.$applyAsync(function () {
                            // Update the current working dir
                            $scope.cmd.cwd = {
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
        angular.extend($scope.cmd, updates);

    }])

