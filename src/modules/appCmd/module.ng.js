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
        .state('appCmd.connect.db', {
            url: '/:dbname',
            views: {
                'menu@': { templateUrl: 'modules/appCmd/views/menu.html' },
                'left@': { templateUrl: 'modules/appCmd/views/left.html' },
                'main@': {
                    templateUrl: 'modules/appCmd/views/database.tpl.html',
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

    .controller('sqlCmdViewController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', '$modal', '$filter', function ($rootScope, $scope, $state, $stateParams, $q, $modal, $filter) {

        function extendModalScope(_scope, $modalInstance) {
            _scope.db = {
                user: 'proto',
                login: 'BUILTIN\\Users',
                roles: [
                    'db_owner',
                    'db_datareader',
                    'db_datawriter',
                ],
                links: {
                    'db_owner': true,
                },
                commit: function () {
                    var deferred = $q.defer();
                    try {
                        var db = _scope.db;
                        if (db) {
                            // Update the UI
                            deferred.notify(db);

                            var cmd = 'EXEC sp_grantdbaccess \'' + db.login + '\', \'' + db.user + '\'';
                            var ident = $stateParams.dbname;
                            $scope.sqlCmd.utils.exec(cmd, {
                                database: ident,
                                //nocount: false,
                            }, function (result) {
                                // Update the UI
                                deferred.notify(db);

                                // Resolve the deferred promise
                                var links = [];
                                for (var name in db.links) {
                                    if (db.links.hasOwnProperty(name) && db.links[name]) {
                                        links.push(name);
                                    }
                                }
                                var pending = links.length;
                                links.forEach(function (linkName) {
                                    db.linkUser(db.user, linkName)
                                        .then(function () {
                                            pending--;
                                            if (pending <= 0) {
                                                // Done adding roles
                                                deferred.resolve(result);
                                            } else {
                                                // Update the UI
                                                deferred.notify(db);
                                            }
                                        }, function (reason) {
                                            deferred.reject(err);
                                        })
                                });
                            }, function (err) {
                                deferred.reject(err);
                            });
                        } else {
                            throw new Error('No form input defined...');
                        }
                    } catch (ex) {
                        console.warn(ex);
                        deferred.reject(ex);
                    }

                    return deferred.promise;
                },
                linkUser: function (user, roleName) {
                    var deferred = $q.defer();
                    try {
                        // Try and execute a command to link the user to a specified role
                        var cmd = 'EXEC sp_addrolemember \'' + roleName + '\', \'' + user + '\'';
                        var ident = $stateParams.dbname;
                        $scope.sqlCmd.utils.exec(cmd, {
                            database: ident,
                            //nocount: false,
                        }, function (result) {
                            // Resolve the deferred promise
                            if (result) {
                                deferred.resolve(result);
                            } else {
                                deferred.reject(new Error('Could not link user "' + user + '" in database: ' + ident));
                            }
                        }, function (err) {
                            deferred.reject(err);
                        });
                    } catch (ex) {
                        deferred.reject(ex);
                    }

                    return deferred.promise;
                },
            };
            _scope.modalAction = 'Create User';
            _scope.selectedRole = null;
            _scope.ok = function () {

                _scope.db.busy = true;
                _scope.lastSuccess = false;
                _scope.lastFailed = false;
                _scope.db.commit()
                    .then(function onSuccess(result) {
                        $rootScope.$applyAsync(function () {
                            _scope.db.busy = false;
                            _scope.lastSuccess = true;
                        });
                        $modalInstance.close(_scope.modalAction);
                    }, function onFailure(reason) {
                        $rootScope.$applyAsync(function () {
                            _scope.db.busy = false;
                            _scope.lastFailed = true;
                            _scope.error = reason.message || reason;
                        });
                    }, function onUpdate(update) {
                        $rootScope.$applyAsync(function () {
                            _scope.lastUpdate = Date.now();
                        });
                    });
            };
            _scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        // Define the sqlCmd model
        $scope.sqlCmd = {
            busy: true,
            exec: $stateParams.file,
            path: $stateParams.path,
            dbname: $stateParams.dbname,
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
                find: function (elem, callback, errorHandler) {
                    $('.inpSqlCmd').change(function (evt) {
                        var input = $(this).val();
                        try {
                            var fs = require('fs');
                            var path = require('path');
                            fs.exists(path.join(input, 'SQLCMD.exe'), function (exists) {
                                if (exists) {
                                    $state.go($state.current, {
                                        file: 'SQLCMD.exe',
                                        path: input,
                                    }, {
                                        reload: true
                                    });
                                } else {
                                    // Not found
                                    $rootScope.$applyAsync(function () {
                                        angular.extend($scope.sqlCmd, {
                                            error: new Error('SQLCMD.exe not found in: ' + input),
                                        });
                                    });
                                }
                            });
                        } catch (ex) {
                            console.error(ex.message);
                        }
                    });
                },
                select: function (db) {
                    if (!db) return;
                    $state.transitionTo('appCmd.connect.db', {
                        file: $stateParams.file,
                        path: $stateParams.path,
                        dbname: db.DATABASE_NAME,
                    }, {
                        reload: false
                    });
                },
                exec: function (sql, opts, callback, errorHandler) {
                    var fs = require('fs');
                    var dir = './sql/tmp';
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    var tmp = dir + '/dynamic.' + Date.now() + '-' + (Math.floor(Math.random() * 128 * 1024)) + '.sql';
                    var onDispose = function () {
                        fs.unlink(tmp, function (err) {
                            if (err) {
                                console.error(' ! Cannot Delete: ' + tmp);
                                return;
                            } else {
                                //console.debug(' + Deleted: ' + tmp);
                            }
                        });
                    };
                    var onSuccess = function (result) {
                        if (callback) callback(result);
                        onDispose();
                    };
                    var onFailure = function (err) {
                        if (errorHandler) errorHandler(err);
                        onDispose();
                    };

                    //console.debug(' + Writing: ' + tmp);
                    fs.writeFile(tmp, sql, function (err) {
                        if (err) {
                            if (errorHandler) {
                                errorHandler(err);
                            } else {
                                console.error(err);
                            }
                        } else {
                            $scope.sqlCmd.utils.runFile(tmp, opts, onSuccess, onFailure);
                        }
                    });
                },
                runFile: function (filePath, opts, callback, errorHandler) {
                    var inp = '"' + path.join(process.cwd(), filePath) + '"';
                    if (opts.nocount !== false) {
                        inp = '"' + path.join(process.cwd(), './sql/utils/NoCounts.sql') + '",' + inp;
                    }
                    var arg = ' -S lpc:localhost -E';
                    var ext = ' -s"," -W -w 999 -i ' + inp;
                    if (opts.database) {
                        arg += ' -d ' + opts.database;
                    }
                    angular.extend(opts, {
                        arg: arg,
                        ext: ext,
                        cwd: $scope.sqlCmd.path,
                    });

                    // Parse the system paths
                    var cmd = $scope.sqlCmd.exec + arg + ext;
                    var proc = require("child_process");
                    if (proc) {
                        proc.exec(cmd, opts, function (error, stdout, stderr) {
                            try {
                                if (error) {
                                    var err = {
                                        message: 'Command Failed: ' + error.cmd,
                                        context: error,
                                    };
                                    if (errorHandler) {
                                        errorHandler(err);
                                    }
                                } else {
                                    // Parse the result
                                    var result = [];
                                    var headers = null;
                                    var errors = null;
                                    var lines = stdout.split('\r\n');
                                    if (lines && lines.length > 0) {
                                        lines.forEach(function (line, i) {
                                            if (line) {
                                                var matchError = /Msg (\d+), Level (\d+), State (\d+), Server (\w+), Line (\d+)/i.exec(line);
                                                if (matchError) {
                                                    var msgTxt = (lines.length > (i + 1)) ? lines[i + 1] : 'No additional error message found.';
                                                    var errObj = new Error(msgTxt);
                                                    throw angular.extend(errObj, { raw: stdout });
                                                } else {
                                                    var obj = {};
                                                    var cols = line.split(',');
                                                    var colSkip = cols.length > 0 && /(-)+/.test(cols[0].trim());
                                                    if (!headers) {
                                                        headers = cols;
                                                    } else if (!colSkip && (headers.length == cols.length)) {
                                                        headers.forEach(function (id, i) {
                                                            obj[id] = cols[i];
                                                        });
                                                        result.push(obj);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    if (callback) {
                                        callback(result);
                                    }
                                }
                            } catch (ex) {
                                if (errorHandler) {
                                    errorHandler(ex);
                                } else {
                                    throw ex;
                                }
                            }
                        });
                    }
                },
                getSizeTotal: function (db) {
                    if (!db.size) return 0.0;
                    var totl = (db.size.files) ? (db.size.files.total || 0) : 0;
                    return totl;
                },
                getSizeLogs: function (db) {
                    if (!db.size) return 0.0;
                    var curr = db.size.sLogs || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc,
                    };
                },
                getSizeData: function (db) {
                    if (!db.size) return 0.0;
                    var curr = db.size.sData || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc,
                    };
                },
                getSizeIndex: function (db) {
                    if (!db.size) return 0.0;
                    var curr = db.size.index || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc,
                    };
                },
                getSizeTables: function (db) {
                    if (!db.size) return 0.0;
                    var curr = db.size.table || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc,
                    };
                },
                openModalWindow: function (templateUrl) {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: function ($scope, $modalInstance) {
                            extendModalScope($scope, $modalInstance);
                        },
                        //size: size,
                        resolve: {
                            sqlCmd: function () {
                                return $scope.sqlCmd;
                            }
                        }
                    });
                    modalInstance.result.then(function (result) {
                        $scope.result = result;
                    }, function (reason) {
                        // Modal dismissed                         
                    });
                },
            },
        };


        function parseDatabaseInfo(db) {
            // Set the busy flag
            db.busy = true;

            // Check for selected database
            if (db.DATABASE_NAME == $stateParams.dbname) {
                $scope.sqlCmd.target = db;
            }

            var sqlFileSizes = './sql/utils/FileSizes.sql';
            $scope.sqlCmd.utils.runFile(sqlFileSizes, { database: db.DATABASE_NAME }, function (result) {
                $rootScope.$applyAsync(function () {
                    var files = [];
                    var grand = 0;
                    var sLogs = 0;
                    var sData = 0;
                    if (result && result.length) {
                        result.forEach(function (obj) {
                            var info = {
                                name: obj['Logical_Name'],
                                path: obj['Physical_Name'],
                                size: parseFloat(obj['SizeKB']) * 1024,
                            };
                            grand += info.size;

                            if (/(.*)(.mdf)/i.test(info.path)) sData += info.size;
                            if (/(.*)(.ldf)/i.test(info.path)) sLogs += info.size;

                            files.push(info);
                        });
                    }
                    db.size = db.size || {};
                    angular.extend(db.size, {
                        sLogs: sLogs,
                        sData: sData,
                        files: {
                            total: grand,
                            items: files,
                        }
                    });
                });

                var sqlTableSize = './sql/utils/TableSizes.sql';
                $scope.sqlCmd.utils.runFile(sqlTableSize, { database: db.DATABASE_NAME }, function (result) {
                    $rootScope.$applyAsync(function () {
                        var tables = [];
                        var sizeUsed = 0;
                        var sizeIndex = 0;
                        var sizeTables = 0;
                        if (result && result.length) {
                            result.forEach(function (obj) {
                                var info = {
                                    name: obj['Table Name'],
                                    rows: parseInt(obj['Number of Rows']) || 0,
                                    data: parseFloat($filter('parseBytes')(obj['Data Space'])) || 0.0,
                                    index: parseFloat($filter('parseBytes')(obj['Index Size'])) || 0.0,
                                    total: parseFloat($filter('parseBytes')(obj['Reserved Space'])) || 0.0,
                                };

                                sizeUsed += info.data;
                                sizeIndex += info.index;
                                sizeTables += info.total;

                                tables.push(info);
                            });
                        }
                        db.tables = tables;
                        db.size = db.size || {};
                        angular.extend(db.size, {
                            used: sizeUsed,
                            index: sizeIndex,
                            table: sizeTables,
                        });
                        db.busy = !db.tables || !db.views;
                    });
                });

                var sqlViewSize = './sql/utils/ListViews.sql';
                $scope.sqlCmd.utils.runFile(sqlViewSize, { database: db.DATABASE_NAME }, function (result) {
                    $rootScope.$applyAsync(function () {
                        var views = [];
                        if (result && result.length) {
                            result.forEach(function (obj) {
                                var info = {
                                    key: parseInt(obj['ObjectId']) || 0,
                                    name: obj['ViewName'],
                                };

                                views.push(info);
                            });
                        }
                        db.views = views;
                        db.busy = !db.tables || !db.views;
                    });
                });
            });
        }

        function parseDatabaseList(result) {
            if (result) {
                result.forEach(function (db) {
                    parseDatabaseInfo(db);
                });
            }
        }

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

                // Check if database specified
                if ($stateParams.dbname) {
                    // Set the busy flag

                    parseDatabaseInfo({
                        DATABASE_NAME: $stateParams.dbname,
                    });
                } else {
                    // Get the list of database currently available
                    $scope.sqlCmd.utils.exec('EXEC sp_databases', { nocount: false }, function (result) {
                        $rootScope.$applyAsync(function () {
                            angular.extend($scope.sqlCmd, {
                                result: {
                                    list: result,
                                }
                            });
                        });

                        // Parse the DB list and get additional info
                        parseDatabaseList(result);
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
        angular.extend($scope.sqlCmd, updates);

    }]);