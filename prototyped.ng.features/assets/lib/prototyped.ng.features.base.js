/// <reference path="../../../../imports.d.ts" />
angular.module('prototyped.certs', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('certs', {
            url: '/certs',
            abstract: true
        }).state('certs.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/cli/win/appcmd.exe/certs.tpl.html',
                    controller: 'appCmdViewController'
                }
            }
        });
    }]).controller('appCmdViewController', [
    '$scope', '$location', '$timeout', '$route', function ($scope, $location, $timeout, $route) {
        $scope.result = null;
        $scope.status = null;
        $scope.state = {
            storeName: 'MY'
        };
        $scope.detect = function () {
            try  {
                // Check and make sure the require func is defined
                var storeName = $scope.state.storeName || 'MY';
                var hasNodeJS = typeof require !== 'undefined';
                if (hasNodeJS) {
                    // Attempt co call NodeJS to extract certificates
                    $scope.result = $scope.extractCertificates(storeName);
                } else {
                    // Required libs not found...
                    $scope.result = {
                        valid: false,
                        isDone: true,
                        error: 'Service Unavailable - Required libraries missing.'
                    };
                    console.warn(' - Warning: You are running this app from a browser. You need an elevated runtime like NodeJS.');
                }
            } catch (ex) {
                // Set the error result
                $scope.result = {
                    valid: false,
                    isDone: true,
                    error: ex
                };
                console.error(' - Error: ' + ex);
            }
            $scope.result.lastUpdated = Date.now();
        };
        $scope.extractCertificates = function (storeName) {
            // Try and call the command line
            var cmd = 'call certutil.exe -store "' + storeName + '"';
            var result = {
                items: [],
                isDone: false
            };
            try  {
                console.info(' - Extracting Certificates: ' + storeName);
                result.cmd = cmd;
                require("child_process").exec(cmd, function (error, stdout, stderr) {
                    $timeout(function () {
                        result.proc = {
                            error: error,
                            stdout: stdout,
                            stderr: stderr
                        };
                        if (!$.isEmptyObject(error)) {
                            // Something wen wrong...
                            result.error = error;
                        } else {
                            // Parse the output into certificate objects
                            result.certs = $scope.parseCertUtilBuffer(stdout);
                            result.items = result.certs.list;
                            result.valid = true;
                        }
                        result.isDone = true;
                    });
                });
            } catch (ex) {
                result.valid = false;
                result.isDone = true;
                result.error = ex.message || 'Error: Feature not available.';
                console.error(ex);
            }
            return result;
        };
        $scope.parseCertUtilBuffer = function (input) {
            console.info(' - Parsing Certificates...');
            var list = [];
            var certs = {};

            // Parse the output and get the certificates
            var item;
            var index = 0;
            var lines = input.split('\r\n');
            while (index < lines.length) {
                var match;
                var line = lines[index];
                if (index == 0) {
                    if ((match = /(\w+)( ")(\w+)(")/.exec(line)) != null) {
                        certs.store = match[1];
                        certs.desc = match[3];
                    }
                } else {
                    // Try matching parts of a certificate dump
                    if ((match = /(============+)( .* )(============+)/.exec(line)) != null) {
                        // New certificate begins...
                        item = {
                            name: 'Unknown',
                            ident: match[2]
                        };
                        list.push(item);
                    }

                    if ((match = /(Subject: )(.*)/.exec(line)) != null && item) {
                        item.subject = match[2];
                        if ((match = /(CN=)([^,]+)/.exec(item.subject)) != null) {
                            item.name = match[2];
                        }
                    }
                    if ((match = /(Root Certificate: )(\w+)/.exec(line)) != null && item) {
                        item.root = match[2];
                    }
                    if ((match = /(Serial Number: )(\w+)/.exec(line)) != null && item) {
                        item.serial = match[2];
                    }
                    if ((match = /(Issuer: )(.*)/.exec(line)) != null && item) {
                        item.issuer = match[2];
                    }
                    if ((match = /(Cert Hash)(\((\w+)\): )(.*)/.exec(line)) != null && item) {
                        item.hash = match[4].replace(' ', '');
                        item.hashType = match[3];
                    }
                    if ((match = /( NotBefore: )(.*)/.exec(line)) != null && item) {
                        item.startDate = match[2];
                    }
                    if ((match = /( NotAfter: )(.*)/.exec(line)) != null && item) {
                        item.endDate = match[2];
                    }
                    if ((match = /(  Provider = )(.*)/.exec(line)) != null && item) {
                        item.provider = match[2];
                    }
                    if ((match = /Private key is NOT exportable/.exec(line)) != null && item) {
                        item.canExport = true;
                    }
                    if ((match = /Missing stored keyset/.exec(line)) != null && item) {
                        item.missingKeySet = true;
                    }
                    if ((match = /Encryption test passed/.exec(line)) != null && item) {
                        item.verified = true;
                    }
                    if ((match = /Encryption test failed/.exec(line)) != null && item) {
                        item.verified = false;
                    }
                    if ((match = /Signature matches Public Key/.exec(line)) != null && item) {
                        item.publicKeyMatch = true;
                    }

                    if (match = /CertUtil: -store command completed successfully./.exec(line) != null) {
                        // Command executed successfully
                        certs.status = true;
                    }
                    if (line.length == 0) {
                        // Clear llast item
                        item = null;
                    }
                }

                index++;
            }

            // Attach list of certificates
            certs.list = list;

            return certs;
        };
        $scope.exportCert = function (item) {
            if (typeof require !== 'undefined') {
                var pfx = prompt('File name:', process.cwd() + '\\' + item.name + '.pfx');
                var cmd = 'call certutil.exe -privatekey -exportpfx "' + item.name + '" "' + pfx + '"';
                console.info(' - Exporting: ' + pfx);
                require("child_process").exec(cmd, function (error, stdout, stderr) {
                    console.info(' - Done: ' + pfx);
                    if (stdout) {
                        console.info(stdout);
                    }
                    if (stderr) {
                        console.warn(stderr);
                    }
                    if (error) {
                        console.error(error);
                    } else {
                        //require('nw.gui').Shell.showItemInFolder(pfx);
                    }
                });
            }
        };
        $scope.selectCertificate = function (name) {
            $scope.state.current = name;
        };
        $scope.getStatusIcon = function (activeStyle) {
            var cssRes = '';
            if (!$scope.result || !$scope.result.isDone) {
                cssRes += 'glyphicon-refresh';
            } else if (activeStyle && $scope.result.valid) {
                cssRes += activeStyle;
            } else {
                cssRes += $scope.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
            }
            return cssRes;
        };
        $scope.getStatusColor = function () {
            var cssRes = $scope.getStatusIcon() + ' ';
            if (!$scope.result || !$scope.result.isDone) {
                cssRes += 'busy';
            } else if ($scope.result.valid) {
                cssRes += 'success';
            } else {
                cssRes += 'error';
            }
            return cssRes;
        };
    }]);
/// <reference path="../../../../imports.d.ts" />
angular.module('prototyped.sqlcmd', [
    'prototyped.ng.features.scripts',
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('sqlcmd', {
            url: '/sqlcmd',
            abstract: true
        }).state('sqlcmd.connect', {
            url: '/connect/:path/:file',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/cli/win/sqlcmd.exe/views/connect.tpl.html',
                    controller: 'sqlCmdViewController'
                }
            }
        }).state('sqlcmd.connect.db', {
            url: '/:dbname',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/cli/win/sqlcmd.exe/views/database.tpl.html',
                    controller: 'sqlCmdViewController'
                }
            }
        });
    }]).controller('sqlCmdViewController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$q', '$modal', '$filter', '$templateCache', function ($rootScope, $scope, $state, $stateParams, $q, $modal, $filter, $templateCache) {
        var baseUrl = '.';

        function extendModalScope(_scope, $modalInstance) {
            _scope.db = {
                user: 'proto',
                login: 'BUILTIN\\Users',
                roles: [
                    'db_owner',
                    'db_datareader',
                    'db_datawriter'
                ],
                links: {
                    'db_owner': true
                },
                commit: function () {
                    var deferred = $q.defer();
                    try  {
                        var db = _scope.db;
                        if (db) {
                            // Update the UI
                            deferred.notify(db);

                            var cmd = 'EXEC sp_grantdbaccess \'' + db.login + '\', \'' + db.user + '\'';
                            var ident = $stateParams.dbname;
                            $scope.sqlCmd.utils.exec(cmd, {
                                database: ident
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
                                    db.linkUser(db.user, linkName).then(function () {
                                        pending--;
                                        if (pending <= 0) {
                                            // Done adding roles
                                            deferred.resolve(result);
                                        } else {
                                            // Update the UI
                                            deferred.notify(db);
                                        }
                                    }, function (reason) {
                                        deferred.reject(reason);
                                    });
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
                    try  {
                        // Try and execute a command to link the user to a specified role
                        var cmd = 'EXEC sp_addrolemember \'' + roleName + '\', \'' + user + '\'';
                        var ident = $stateParams.dbname;
                        $scope.sqlCmd.utils.exec(cmd, {
                            database: ident
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
                }
            };
            _scope.modalAction = 'Create User';
            _scope.selectedRole = null;
            _scope.ok = function () {
                _scope.db.busy = true;
                _scope.lastSuccess = false;
                _scope.lastFailed = false;
                _scope.db.commit().then(function onSuccess(result) {
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
                        if (/(.*)?.sql$/i.test(file))
                            css = 'glyphicon-cog';
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
                    if (/(.*?\.sql)/i.test(file)) {
                        //$state.go('sqlCmd.edit', {});
                    }
                },
                find: function (elem, callback, errorHandler) {
                    $('.inpSqlCmd').change(function (evt) {
                        var input = $(this).val();
                        try  {
                            var fs = require('fs');
                            var path = require('path');
                            fs.exists(path.join(input, 'SQLCMD.exe'), function (exists) {
                                if (exists) {
                                    $state.go($state.current, {
                                        file: 'SQLCMD.exe',
                                        path: input
                                    }, {
                                        reload: true
                                    });
                                } else {
                                    // Not found
                                    $rootScope.$applyAsync(function () {
                                        angular.extend($scope.sqlCmd, {
                                            error: new Error('SQLCMD.exe not found in: ' + input)
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
                    if (!db)
                        return;
                    $state.transitionTo('sqlcmd.connect.db', {
                        file: $stateParams.file,
                        path: $stateParams.path,
                        dbname: db.DATABASE_NAME
                    }, {
                        reload: false
                    });
                },
                exec: function (sql, opts, callback, errorHandler) {
                    var fs = require('fs');
                    var dir = baseUrl + '/tmp';
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
                        if (callback)
                            callback(result);
                        onDispose();
                    };
                    var onFailure = function (err) {
                        if (errorHandler)
                            errorHandler(err);
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
                resolveFilename: function (filePath) {
                    var fs = require('fs');
                    var path = require('path');

                    try  {
                        var file = path.join(baseUrl, filePath);
                        var stats = fs.statSync(filePath);
                        if (stats.isFile()) {
                            return file;
                        }
                    } catch (ex) {
                    }

                    try  {
                        var tmp = path.join(baseUrl, 'tmp', filePath);
                        var tst = fs.statSync(tmp);
                        if (tst.isFile()) {
                            return tmp;
                        }
                    } catch (ex) {
                    }

                    try  {
                        function sync(p, opts, made) {
                            if (!opts || typeof opts !== 'object') {
                                opts = { mode: opts };
                            }

                            var mode = opts.mode;
                            var xfs = opts.fs || fs;

                            if (mode === undefined) {
                                mode = 777 & (~process.umask());
                            }
                            if (!made)
                                made = null;

                            p = path.resolve(p);

                            try  {
                                xfs.mkdirSync(p, mode);
                                made = made || p;
                            } catch (err0) {
                                switch (err0.code) {
                                    case 'ENOENT':
                                        made = sync(path.dirname(p), opts, made);
                                        sync(p, opts, made);
                                        break;

                                    default:
                                        var stat;
                                        try  {
                                            stat = xfs.statSync(p);
                                        } catch (err1) {
                                            throw err0;
                                        }
                                        if (!stat.isDirectory())
                                            throw err0;
                                        break;
                                }
                            }

                            return made;
                        }
                        ;

                        // Try and retrieve the file from the cache
                        var cache = $templateCache.get(filePath);
                        if (cache) {
                            var tmpDir = path.dirname(tmp);
                            sync(tmpDir, null, null);
                            if (fs) {
                                fs.writeFileSync(tmp, cache);
                            }
                            return tmp;
                        }
                    } catch (ex) {
                        console.warn(ex.message);
                    }

                    // Could not resolve file name, return original
                    return filePath;
                },
                runFile: function (filePath, opts, callback, errorHandler) {
                    var src = filePath;
                    var inp = '"' + path.join(process.cwd(), src) + '"';
                    if (opts.nocount !== false) {
                        var noc = $scope.sqlCmd.utils.resolveFilename('modules/cli/win/sqlcmd.exe/scripts/utils/NoCounts.sql');
                        inp = '"' + path.join(process.cwd(), noc) + '",' + inp;
                    }
                    var arg = ' -S lpc:localhost -E';
                    var ext = ' -s"," -W -w 999 -i ' + inp;
                    if (opts.database) {
                        arg += ' -d ' + opts.database;
                    }
                    angular.extend(opts, {
                        arg: arg,
                        ext: ext,
                        cwd: $scope.sqlCmd.path
                    });

                    // Parse the system paths
                    var cmd = $scope.sqlCmd.exec + arg + ext;
                    var proc = require("child_process");
                    if (proc) {
                        proc.exec(cmd, opts, function (error, stdout, stderr) {
                            try  {
                                if (error) {
                                    var err = {
                                        message: 'Command Failed: ' + error.cmd,
                                        context: error
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
                    if (!db.size)
                        return 0.0;
                    var totl = (db.size.files) ? (db.size.files.total || 0) : 0;
                    return totl;
                },
                getSizeLogs: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.sLogs || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                getSizeData: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.sData || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                getSizeIndex: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.index || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
                    };
                },
                getSizeTables: function (db) {
                    if (!db.size)
                        return 0.0;
                    var curr = db.size.table || 0;
                    var totl = $scope.sqlCmd.utils.getSizeTotal(db);
                    var frac = (totl > 0) ? (parseFloat(curr) / parseFloat(totl)) : 0.0;
                    var perc = (frac * 100);
                    return {
                        value: curr,
                        total: totl,
                        fract: frac,
                        perct: perc
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
                }
            }
        };

        function parseDatabaseInfo(db) {
            // Set the busy flag
            db.busy = true;

            // Check for selected database
            if (db.DATABASE_NAME == $stateParams.dbname) {
                $scope.sqlCmd.target = db;
            }

            // Get the file size and basic info for the database
            var tplFileSizes = $scope.sqlCmd.utils.resolveFilename('modules/cli/win/sqlcmd.exe/scripts/utils/FileSizes.sql');
            $scope.sqlCmd.utils.runFile(tplFileSizes, { database: db.DATABASE_NAME }, function (result) {
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
                                size: parseFloat(obj['SizeKB']) * 1024
                            };
                            grand += info.size;

                            if (/(.*)(.mdf)/i.test(info.path))
                                sData += info.size;
                            if (/(.*)(.ldf)/i.test(info.path))
                                sLogs += info.size;

                            files.push(info);
                        });
                    }
                    db.size = db.size || {};
                    angular.extend(db.size, {
                        sLogs: sLogs,
                        sData: sData,
                        files: {
                            total: grand,
                            items: files
                        }
                    });
                });

                var tplTableSize = $scope.sqlCmd.utils.resolveFilename('modules/cli/win/sqlcmd.exe/scripts/utils/TableSizes.sql');
                $scope.sqlCmd.utils.runFile(tplTableSize, { database: db.DATABASE_NAME }, function (result) {
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
                                    total: parseFloat($filter('parseBytes')(obj['Reserved Space'])) || 0.0
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
                            table: sizeTables
                        });
                        db.busy = !db.tables || !db.views;
                    });
                });

                var tplViewSize = $scope.sqlCmd.utils.resolveFilename('modules/cli/win/sqlcmd.exe/scripts/utils/ListViews.sql');
                $scope.sqlCmd.utils.runFile(tplViewSize, { database: db.DATABASE_NAME }, function (result) {
                    $rootScope.$applyAsync(function () {
                        var views = [];
                        if (result && result.length) {
                            result.forEach(function (obj) {
                                var info = {
                                    key: parseInt(obj['ObjectId']) || 0,
                                    name: obj['ViewName']
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
        try  {
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
                    // Select current database
                    parseDatabaseInfo({
                        DATABASE_NAME: $stateParams.dbname
                    });
                } else {
                    // Get the list of database currently available
                    $scope.sqlCmd.utils.exec('EXEC sp_databases', { nocount: false }, function (result) {
                        $rootScope.$applyAsync(function () {
                            angular.extend($scope.sqlCmd, {
                                result: {
                                    list: result
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
/// <reference path="../../imports.d.ts" />
/// <reference path="win/appcmd.exe/certs.ng.ts" />
/// <reference path="win/sqlcmd.exe/module.ng.ts" />
angular.module('prototyped.cli', [
    'prototyped.ng',
    'prototyped.ng.config',
    'ui.router',
    'prototyped.sqlcmd',
    'prototyped.certs'
]).config([
    '$stateProvider', function ($stateProvider) {
        $stateProvider.state('proto.cmd', {
            url: '/explore',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/index.tpl.html',
                    controller: 'systemCmdViewController'
                }
            }
        }).state('proto.clear', {
            url: '/clear',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/index.tpl.html',
                    controller: 'systemCmdViewController'
                }
            }
        });
    }]).controller('systemCmdViewController', [
    '$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {
        // Define the model
        var context = $scope.cmd = {
            busy: true,
            result: null,
            utils: {
                icon: function (path, file) {
                    var css = '';
                    if (file) {
                        css = 'glyphicon-file';
                        if (/(.*)?.exe$/i.test(file))
                            css = 'glyphicon-open';
                        if (/(.*)?.cmd$/i.test(file))
                            css = 'glyphicon-cog';
                        if (/(.*)?.cer$/i.test(file))
                            css = 'glyphicon-certificate';
                        if (/(.*)?.pem$/i.test(file))
                            css = 'glyphicon-certificate';
                        if (/(.*)?.htm.*$/i.test(file))
                            css = 'glyphicon-globe';
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
                    try  {
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
                                                    list: list
                                                }
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
                },
                getAllPaths: function () {
                    if (!context.result || !context.result.paths)
                        return list;
                    var list = context.result.paths;
                    var u = {}, a = [];
                    for (var i = 0, l = list.length; i < l; ++i) {
                        if (u.hasOwnProperty(list[i])) {
                            continue;
                        }
                        a.push(list[i]);
                        u[list[i]] = 1;
                    }
                    return a;
                }
            }
        };

        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // Set the result
                updates = {
                    busy: false,
                    active: false,
                    result: {}
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
                                list: list
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
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.edge', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('proto.edge', {
            url: '^/edge',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/edge/views/index.tpl.html',
                    controller: 'edgeViewController'
                }
            }
        });
    }]).controller('edgeViewController', [
    '$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {
        var appEdge = {
            stubs: null,
            active: false,
            start: function () {
                if (typeof require === 'undefined')
                    return;
                var edge = require("edge");
                try  {
                    console.log('-------------------------------------------------------------------------------');
                    console.log(' - Connnecting NodeJS with an EdgeJS to the outside world....');
                    console.log('-------------------------------------------------------------------------------');

                    var stubs = appEdge.stubs = {
                        ping: edge.func(function () {
                        })
                    };
                } catch (ex) {
                    appEdge.error = ex;
                    return false;
                }
                return true;
            },
            run: function () {
                // Send a pin out to C# world
                var me = 'JavaScript';
                console.log(' - [ JS ] Sending out a probe named \'' + me + '\'... ');
                appEdge.stubs.ping(me, function (error, result) {
                    if (error)
                        throw error;
                    console.log(result);
                    console.log(' - [ JS ] Seems like the probe made it back!');
                });
            }
        };

        // Define the Edge controller logic
        $scope.edge = {
            active: false,
            detect: function () {
                // Make sure we are in node space
                if (typeof require !== 'undefined') {
                    try  {
                        // Load the AppEdge library
                        var edge = appEdge;
                        if (edge) {
                            // Start loading all the stubs
                            $scope.edge.active = edge.start();

                            // Extend the scope with full functionality
                            angular.extend($scope.edge, edge);
                        }
                    } catch (ex) {
                        // Something went wrong
                        $scope.edge.error = ex;
                        return false;
                    }
                    return true;
                } else {
                    // Method 'require' is undefined, probably inside a browser window
                    $scope.edge.error = new Error('Required libraries not found or unavailable.');
                    return false;
                }
            }
        };

        // Auto-detect if node is available
        if (typeof require !== 'undefined') {
            $timeout(function () {
                $scope.edge.detect();
            });
        }
    }]);
/// <reference path="../imports.d.ts" />
/// <reference path="cli/module.ng.ts" />
/// <reference path="edge/module.ng.ts" />
angular.module('prototyped.ng.features', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.features.views',
    'prototyped.ng.features.styles',
    'prototyped.cli',
    'prototyped.edge'
]).config([
    'appConfigProvider', 'appStateProvider', function (appConfigProvider, appStateProvider) {
        // Define module configuration
        appConfigProvider.config('prototyped.ng.features', {
            active: true,
            hideInBrowserMode: true
        });

        // Define module routes
        var opts = appConfigProvider.current.modules['prototyped.ng.features'];
        appStateProvider.define('/proto/explore', {
            priority: 100,
            menuitem: {
                label: 'Features',
                icon: 'fa fa-flask',
                state: 'proto.cmd'
            },
            cardview: {
                style: typeof require !== 'undefined' ? 'img-advanced' : 'img-advanced-restricted',
                title: 'Advanced Feature Detection',
                desc: 'Samples based on feature detection. Some may not be available for your browser or operating system.'
            },
            visible: function () {
                return opts && opts.hideInBrowserMode ? typeof require !== 'undefined' : appConfigProvider.current.options.showDefaultItems || !opts.hideInBrowserMode;
            }
        }).define('/imports', {
            abstract: true,
            priority: 100,
            menuitem: {
                label: 'Imports',
                icon: 'fa fa-cloud-download',
                state: 'proto.edge'
            },
            cardview: {
                style: 'img-editor',
                title: 'Import Additional Modules',
                desc: 'Load from external sources, modify and/or export to an online repository.'
            },
            visible: function () {
                return opts && opts.hideInBrowserMode;
            }
        });
    }]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('features', {
            url: '/features',
            abstract: true
        }).state('features.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/index.tpl.html',
                    controller: 'featuresViewController'
                }
            }
        });
    }]).controller('featuresViewController', [
    '$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
        // Define the model
        var context = $scope.sample = {
            busy: true,
            text: '',
            utils: {
                list: function (path, callback) {
                    var list = [];
                    try  {
                    } catch (ex) {
                        context.error = ex;
                        console.error(ex.message);
                    }
                    return list;
                }
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
                };
            } else {
                // Not available
                updates.hasNode = false;
                updates.busy = false;
            }
        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        } finally {
            // Extend updates for scope
            angular.extend(context, updates);
        }
    }]);
