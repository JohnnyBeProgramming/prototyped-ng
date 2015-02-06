'use strict';

angular.module('myApp.appCmd', [
    //'modules/appCmd/views/index.tpl.html', // Requires template
    'ngRoute',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
          .state('appCmd', {
              url: '/cmd',
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
            url: '/connect/:path/:file',
            views: {
                'menu@': { templateUrl: 'modules/appCmd/views/menu.html' },
                'left@': { templateUrl: 'modules/appCmd/views/left.html' },
                'main@': {
                    templateUrl: 'modules/appCmd/views/connect.tpl.html',
                    controller: 'sqlCmdViewController'
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
                    controller: 'sqlCmdViewController'
                },
            }
        })
    }])

    .controller('appCmdViewController', ['$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {
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
                call: function (path, file) {
                    if (/(sqlcmd\.exe)/i.test(file)) {
                        var params = { path: path, file: file };
                        $state.transitionTo('appCmd.connect', params);
                    }
                },
                list: function (path, callback) {
                    try {
                        console.info(' - [ appCmd ] List: ' + path);

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

    }])
    .controller('sqlCmdViewController', ['$rootScope', '$scope', '$state', '$stateParams', function ($rootScope, $scope, $state, $stateParams) {

        // Define the appCmd model
        $scope.sqlCmd = {
            busy: true,
            exec: $stateParams.file,
            path: $stateParams.path,
            utils: {
                icon: function (path, file) {
                    var css = '';
                    if (file) {
                        css = 'glyphicon-file';
                        if (/(.*)?.sql$/i.test(file)) css = 'glyphicon-cog'
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
                call: function (path, file) {
                    if (/(.*?\.sql)/i.test(file)) {
                        //$state.go('sqlCmd.edit', {});
                    }
                },
                list: function (host, callback, errorHandler) {
                    try {
                        console.info(' - [ sqlCmd ] Connect: ' + host);

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
                                });
                            });
                        }
                    } catch (ex) {
                        console.error(ex.message);
                        $scope.appCmd.error = ex;
                    }
                },
                exec: function (sql, callback, errorHandler) {

                    function runSql(tmp) {
                        var ext = ' -i "' + path.join(process.cwd(), tmp) + '"';
                        var arg = ' -S lpc:localhost -E';
                        var cmd = $scope.sqlCmd.exec + arg + ext;
                        var opts = {
                            cwd: $scope.sqlCmd.path,
                        };
                        updates.opts = opts;

                        // Parse the system paths
                        var proc = require("child_process");
                        if (proc) {
                            console.info(' - [ sqlCmd ] Calling: ' + cmd);
                            proc.exec(cmd, opts, function (error, stdout, stderr) {
                                $rootScope.$applyAsync(function () {
                                    updates.active = !error;
                                    updates.busy = false;
                                    if (error) {
                                        updates.error = {
                                            message: 'Command Failed: ' + error.cmd,
                                            context: error,
                                        };
                                        if (errorHandler) {
                                            errorHandler(updates.error);
                                        }
                                    } else {
                                        // Parse the result
                                        var result = stdout;
                                        if (callback) {
                                            callback(result);
                                        }
                                    }
                                    angular.extend($scope.sqlCmd, {
                                        result: {
                                            stdout: stdout,
                                            stderr: stderr,
                                        },
                                    });
                                });
                            });
                        }
                    }

                    var fs = require('fs');
                    var tmp = './tmp/sql/dynamic.' + Date.now() + '.sql';
                    fs.exists(tmp, function (exists) {
                        if (!exists) {
                            console.debug(' - Writing file: ' + tmp);
                            fs.writeFile(tmp, sql, function (err) {
                                if (err) {
                                    if (errorHandler) {
                                        errorHandler(err);
                                    } else {
                                        console.error(err);
                                    }
                                } else {
                                    console.log(" - The file was saved!");
                                    runSql(tmp);
                                }
                            });
                        } else {
                            console.debug(' - File exists: ' + tmp);
                            runSql(tmp);
                        }
                    });
                },
            },
        };

        var updates = {};
        try {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                var path = require('path');

                // Set the result
                updates = {
                    busy: false,
                    active: false,
                    result: {}
                };


                // Get the list of database currently available
                $scope.sqlCmd.utils.exec('EXEC sp_databases', function (result) {
                    console.debug(result);
                });

                // Get the current working folder
                var cwd = (typeof process !== 'undefined') ? process.cwd() : null;
                if (cwd) {
                    // List current folder contents
                    /*
                    $scope.sqlCmd.utils.list(cwd, function (list) {
                        $rootScope.$applyAsync(function () {
                            // Update the current working dir
                            $scope.appCmd.cwd = {
                                path: cwd,
                                list: list,
                            };
                        });
                    });
                    */
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
        angular.extend($scope.sqlCmd, updates);

    }]);