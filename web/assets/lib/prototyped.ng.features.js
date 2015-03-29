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
    'appConfigProvider', function (appConfigProvider) {
        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.features': {
                active: true,
                hideInBrowserMode: true
            }
        });

        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/proto/explore',
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
                    var opts = appConfig['prototyped.ng.features'];
                    return opts && opts.hideInBrowserMode ? typeof require !== 'undefined' : appConfig.options.showDefaultItems || !opts.hideInBrowserMode;
                }
            });
            appConfig.routers.push({
                url: '/imports',
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
                    var opts = appConfig['prototyped.ng.features'];
                    return opts && opts.hideInBrowserMode;
                }
            });
        }
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
//# sourceMappingURL=prototyped.ng.features.base.js.map
;angular.module('prototyped.ng.features.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('modules/cli/win/appcmd.exe/certs.tpl.html',
    '<div ng-if=!state.current class=results ng-init=detect()><div class="icon pull-left left"><i class="glyphicon glyphicon-certificate"></i> <i class="sub-icon glyphicon" ng-class=getStatusColor()></i></div><div class="info pull-left"><div ng-if=!state.editMode><div class=pull-right><a class=ctrl-sm ng-click="state.editMode = true" href="" ng-hide="result.isDone && !result.valid"><i class="glyphicon glyphicon-plus"></i> New</a></div><h4>Security Certificates <small ng-if=result.certs.store>&nbsp;{{ result.certs.store }}<span ng-if=result.certs.store>, {{ result.certs.desc }}</span></small></h4></div><div ng-if=!state.editMode><p ng-if=!result.isDone><em>Please wait, loading...</em></p><ul ng-if="result.isDone && !result.valid"><li><b>NodeJS Required</b>: Try running this application inside something like <a target=_blank href=https://github.com/rogerwang/node-webkit>Node Webkit</a>.</li><li><b>Not Available:</b> You cannot access the local computer\'s certificate store from a browser window.</li></ul><div ng-if="result != null && result.isDone"><div class="alert alert-danger" ng-if="!result.valid && !$.isEmptyObject(result.error)"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Error:</b> {{ result.error }}</div><div class="alert alert-warning" ng-if="!result.valid && $.isEmptyObject(result.error)"><i class="glyphicon glyphicon-warning-sign"></i> <b>Warning:</b> Limited access to the <em>certificate store</em>.</div></div><div ng-if=result.valid><table class="table table-hover table-condensed"><thead><tr><th>Description</th><th>Thumbprint</th><th><div class=pull-right>Actions</div></th></tr></thead><tbody><tr class=inactive ng-if=!result.items.length><td><span class=text-muted>No results</span></td><td>&nbsp;</td><td>&nbsp;</td></tr><tr class=compact ng-repeat="itm in result.items"><td>{{ itm.name }}</td><td>{{ itm.hash }}</td><td><a href="" ng-click=exportCert(itm)>Export</a></td></tr></tbody></table></div><div ng-if=result.isDone class=text-muted>Last Checked: {{ result.lastUpdated | date:\'mediumTime\' }}</div></div><form ng-if=state.editMode><div class=form-group><h4 class=control-label for=txtTarget>New Certificate Name:</h4><input class=form-control id=txtName ng-model=state.certName></div><button type=submit class="btn btn-primary" ng-click="state.editMode = false;">Create</button></form></div></div><div ng-if=state.current><span class=pull-right><a class="btn btn-sm btn-primary" ng-click="state.current = null">Go Back</a></span> <samp><pre>{{ state.current }}</pre></samp></div><style>.results {\n' +
    '        min-width: 480px;\n' +
    '        display: flex;\n' +
    '    }\n' +
    '\n' +
    '        .results .icon {\n' +
    '            margin: 0 8px;\n' +
    '            font-size: 128px;\n' +
    '            width: 128px !important;\n' +
    '            height: 128px !important;\n' +
    '            position: relative;\n' +
    '            flex-grow: 0;\n' +
    '            flex-shrink: 0;\n' +
    '        }\n' +
    '\n' +
    '            .results .icon .sub-icon {\n' +
    '                font-size: 64px !important;\n' +
    '                width: 64px !important;\n' +
    '                height: 64px !important;\n' +
    '                position: absolute;\n' +
    '                right: 0;\n' +
    '                top: 0;\n' +
    '                margin-top: 100px;\n' +
    '            }\n' +
    '\n' +
    '                .results .icon .sub-icon.success {\n' +
    '                    color: #080;\n' +
    '                }\n' +
    '\n' +
    '                .results .icon .sub-icon.error {\n' +
    '                    color: #D00;\n' +
    '                }\n' +
    '\n' +
    '                .results .icon .sub-icon.warning {\n' +
    '                    color: #0094ff;\n' +
    '                }\n' +
    '\n' +
    '                .results .icon .sub-icon.busy {\n' +
    '                    color: #0094ff;\n' +
    '                }\n' +
    '\n' +
    '        .results .info {\n' +
    '            margin: 0 16px;\n' +
    '            min-height: 128px;\n' +
    '            min-width: 300px;\n' +
    '            display: inline-block;\n' +
    '            flex-grow: 1;\n' +
    '            flex-shrink: 1;\n' +
    '        }\n' +
    '\n' +
    '\n' +
    '            .results .info h4 {\n' +
    '                text-wrap: avoid;\n' +
    '                overflow: hidden;\n' +
    '                white-space: nowrap;\n' +
    '                text-overflow: ellipsis;\n' +
    '            }\n' +
    '\n' +
    '                .results .info h4 a {\n' +
    '                    color: black;\n' +
    '                }\n' +
    '\n' +
    '            .results .info .ctrl-sm {\n' +
    '                font-size: larger;\n' +
    '                margin-left: 8px;\n' +
    '                color: black;\n' +
    '            }\n' +
    '\n' +
    '    .ellipse {\n' +
    '        text-wrap: avoid;\n' +
    '        overflow: hidden;\n' +
    '        white-space: nowrap;\n' +
    '        text-overflow: ellipsis;\n' +
    '    }\n' +
    '\n' +
    '    .info-row {\n' +
    '        display: inline-flex;\n' +
    '    }\n' +
    '\n' +
    '    .info-col-primary {\n' +
    '        flex-grow: 1;\n' +
    '        flex-shrink: 1;\n' +
    '    }\n' +
    '\n' +
    '    .info-col-secondary {\n' +
    '        flex-grow: 0;\n' +
    '        flex-shrink: 0;\n' +
    '    }</style>');
  $templateCache.put('modules/cli/win/sqlcmd.exe/dialogs/dbActions.tpl.html',
    '<div class=modal-header><h4 class=modal-title>Select Database Action</h4></div><div class=modal-body style="min-height: 180px; padding: 6px"><label class="thumbnail alert" ng-class="{ \'alert-info\':modalAction, \'alert-warning\': !modalAction }" style="padding: 8px; margin: 0">Actions:<select ng-model=modalAction style="margin: 0"><option value="">No action selected</option><option value="Create User">Create Users and Roles</option></select></label><div ng-switch=modalAction style="margin-top: 6px"><div ng-switch-default class=docked><em class=text-muted style="padding: 6px; margin: 50px auto">Select an action to start with...</em></div><div ng-switch-when="Create User"><h5>Users &amp; Roles <small>{{ modalAction }}</small></h5><form name=frmCreateUser class=simple-form ng-disabled=db.busy style="margin: 0 8px" novalidate><div class=row><div class=col-md-6><div class="form-group form-group-sm"><label for=txtLoginName>Login user or group</label><input id=txtLoginName name=login ng-model=db.login class=form-control placeholder=DOMAIN\\Username required><div class=text-danger ng-show=frmCreateUser.login.$error.required>Login name is required.</div></div><div class="form-group form-group-sm"><label for=txtUserName>Database username</label><input id=txtUserName name=user ng-model=db.user class=form-control placeholder="Login name for the database" required><div class=text-danger ng-show=frmCreateUser.user.$error.required>Username is required.</div></div></div><div class=col-md-6><div class=form-group><label for=exampleInputFile>Add user to roles:</label><select ng-model=selectedRole style="margin: 0"><option value=+>Create a new role</option><option value="{{ role }}" ng-repeat="role in db.roles">+ {{ role }}</option></select><div ng:if=false class=help-block>The user has no roles</div><div ng:if=true><div class=checkbox ng-repeat="role in db.roles" ng-class="{ \'glow-blue\': db.links[role] }"><label><input type=checkbox ng-model=db.links[role]> {{ role }}</label></div></div></div></div></div><div ng:if=error class="alert alert-danger"><i class="fa fa-warning"></i> <b>Failed:</b> <span>{{ error }}</span></div></form></div></div></div><div class=modal-footer><p class="pull-left help-block">Selected Action: <b ng-class="{ \'text-primary\': !error, \'text-danger\': error }" ng:if=modalAction>{{ modalAction }}</b> <em class=text-muted ng:if=!modalAction>No action selected...</em></p><button id=btnCancel ng-disabled=db.busy class="btn btn-warning" ng-click=cancel()>Cancel</button> <button id=btnUpdate ng-disabled=db.busy class=btn ng-class="{ \'btn-success\': lastSuccess, \'btn-danger\': lastFailed, \'btn-primary\': !lastFailed && !lastSuccess }" ng-click=ok()>Run Selected Action</button></div>');
  $templateCache.put('modules/cli/win/sqlcmd.exe/views/connect.tpl.html',
    '<div class=container><h4>Prototyping SQL Server <small ng:if=!sqlCmd.path>Exploring locally available Data Sources...</small> <small ng:if=sqlCmd.path>{{ sqlCmd.path }}</small></h4><div ng:if=!sqlCmd.path><div ng:if=!sqlCmd.error class="alert alert-warning"><i class="glyphicon glyphicon-warning-sign"></i> <b>Warning:</b> Path to SQLCMD.exe not specified. To continue, you will need to locate it manually.</div><div ng:if=sqlCmd.error class="alert alert-danger"><i class="fa fa-share-square"></i> <b>Error:</b> {{ sqlCmd.error.message }}</div><h5>Specify path to SQLCMD.exe</h5><p><input class=inpSqlCmd ng:click=sqlCmd.utils.find() type=file accept=.exe,.cmd nwdirectory></p></div><div ng:if=sqlCmd.path ng:cloak><p ng:if=sqlCmd.busy><em>Loading...</em></p><p ng:if=!sqlCmd.busy>...</p><div ng:if=!sqlCmd.busy><div ng:if=!appNode.active class="alert alert-warning"><i class="fa fa-warning"></i> <b>Not Available:</b> Application requires a NodeJS (or CommonJS) runtime. Web browsers do not have access to these advanced features...</div><div ng:if="sqlCmd.active && !sqlCmd.error" class="alert alert-success"><i class="fa fa-share-square"></i> <b>Connected!</b> You are now conncted to the local SQL Server Database Engine...</div><div ng:if=sqlCmd.error class="alert alert-danger"><i class="fa fa-share-square"></i> <b>Error:</b> {{ sqlCmd.error.message }}</div><div ng:if=false class="alert alert-info"><i class="fa fa-share-square"></i> <b>Info:</b></div></div><div ng:if=sqlCmd.result><h5>Local Data Sources <small ng:if="sqlCmd.result.list.length > 0">( {{sqlCmd.result.list.length}} databases )</small></h5><div class=row><a href="" ng:click=sqlCmd.utils.select(db) style="color: black; text-decoration:none" class="col-lg-3 col-md-4 col-sm-6" ng-repeat="db in sqlCmd.result.list"><div class="info-row thumbnail"><div class="info-col-secondary img-clipper" style="flex-basis: 50px; background-image: url(http://png.findicons.com/files/icons/1035/human_o2/128/network_server_database.png)"></div><div class=info-col-primary><h5>{{ db.DATABASE_NAME }} <small>{{ db.size.files.total | toBytes }}</small></h5><div ng:if=db.size.files><div class=progress ng-class="{ \'progress-striped active\': db.busy }" style="height: 10px; margin-bottom:3px"><div ng:init="prog = sqlCmd.utils.getSizeLogs(db)" role=progressbar title="Database Logs - {{ prog.perct | number:2 }}% ( {{ prog.value | toBytes:1 }} / {{ prog.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (prog.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-primary inactive-ctrl\':true }" aria-valuenow="{{ (prog.perct | number:2) }}" aria-valuetext="{{ (prog.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div><div ng:if=db.busy ng:init="progData = sqlCmd.utils.getSizeData(db)" role=progressbar title="Database Tables - {{ progData.perct | number:2 }}% ( {{ progData.value | toBytes:1 }} / {{ progData.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (progData.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-warning inactive-ctrl\':true  }" aria-valuenow="{{ (progData.perct | number:2) }}" aria-valuetext="{{ (progData.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div><div ng:if=db.size.index ng:init="progIndex = sqlCmd.utils.getSizeIndex(db)" role=progressbar title="Table Indexes - {{ progIndex.perct | number:2 }}% ( {{ progIndex.value | toBytes:1 }} / {{ progIndex.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (progIndex.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-info\':true }" aria-valuenow="{{ (progIndex.perct | number:2) }}" aria-valuetext="{{ (progIndex.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div><div ng:if=db.size.table ng:init="progTables = sqlCmd.utils.getSizeTables(db)" role=progressbar title="Table Data - {{ progTables.perct | number:2 }}% ( {{ progTables.value | toBytes:1 }} / {{ progTables.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (progTables.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-primary\':true }" aria-valuenow="{{ (progTables.perct | number:2) }}" aria-valuetext="{{ (progTables.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div></div></div><div ng:if="!db.tables && !db.views"><em>Loading...</em></div><div ng:if=db><span ng:if=db.tables.length><b>{{ db.tables.length }}</b> Tables</span> <span ng:if=db.views.length>, <b>{{ db.views.length }}</b> Views</span></div><div ng:if="db.REMARKS != \'NULL\'"><em>Remarks: {{ db.REMARKS }}</em></div></div></div></a></div></div></div></div>');
  $templateCache.put('modules/cli/win/sqlcmd.exe/views/database.tpl.html',
    '<div class=container><h4>Prototyping SQL Server <small ng:if=!sqlCmd.dbname>{{ sqlCmd.path }}</small> <small ng:if=sqlCmd.dbname>{{ sqlCmd.dbname }}</small></h4><div ng:if=!sqlCmd.path><div ng:if=!sqlCmd.error class="alert alert-warning"><i class="glyphicon glyphicon-warning-sign"></i> <b>Warning:</b> Path to SQLCMD.exe not specified. To continue, you will need to locate it manually.</div><div ng:if=sqlCmd.error class="alert alert-danger"><i class="fa fa-share-square"></i> <b>Error:</b> {{ sqlCmd.error.message }}</div><h5>Specify path to SQLCMD.exe</h5><p><input class=inpSqlCmd ng:click=sqlCmd.utils.find() type=file accept=.exe,.cmd nwdirectory></p></div><div ng:if=sqlCmd.path ng:cloak><p ng:if=sqlCmd.busy><em>Loading...</em></p><p ng:if=!sqlCmd.busy>...</p><div ng:if=!sqlCmd.busy><div ng:if=!appNode.active class="alert alert-warning"><i class="fa fa-warning"></i> <b>Not Available:</b> Application requires a NodeJS (or CommonJS) runtime. Web browsers do not have access to these advanced features...</div><div ng:if="sqlCmd.active && !sqlCmd.error" class="alert alert-success"><i class="fa fa-share-square"></i> <b>Connected!</b> You are now conncted to the local SQL Server Database Engine...</div><div ng:if=sqlCmd.error class="alert alert-danger"><i class="fa fa-share-square"></i> <b>Error:</b> {{ sqlCmd.error.message }}</div><div ng:if=false class="alert alert-info"><i class="fa fa-share-square"></i> <b>Info:</b></div></div><div ng:if=sqlCmd.dbname><h5><a ui:sref=sqlcmd.connect href="" style="text-decoration: none; color: #dedede"><i class="glyphicon glyphicon-backward"></i>&nbsp;</a> {{ sqlCmd.dbname }} <small>( {{ sqlCmd.target.size.files.total | toBytes }}<label ng:if=sqlCmd.target.tables.length>, {{ sqlCmd.target.tables.length }} Tables</label><label ng:if=sqlCmd.target.views.length>, {{ sqlCmd.target.views.length }} Views</label>)</small></h5><div class=row><div class=col-md-12><div ng:click=sqlCmd.utils.select(sqlCmd.target)><div class="info-row thumbnail"><div class="info-col-secondary img-clipper" style="flex-basis: 50px; background-image: url(http://png.findicons.com/files/icons/1035/human_o2/128/network_server_database.png)"></div><div class=info-col-primary><h5 class=ellipsis>{{ sqlCmd.target.DATABASE_NAME }} <small>{{ sqlCmd.target.size.files.total | toBytes }}</small></h5><div ng:if=sqlCmd.target.size.files><div class=progress ng-class="{ \'progress-striped active\': sqlCmd.target.busy }" style="height: 10px; margin-bottom:3px"><div ng:init="prog = sqlCmd.utils.getSizeLogs(sqlCmd.target)" role=progressbar title="Database Logs - {{ prog.perct | number:2 }}% ( {{ prog.value | toBytes:1 }} / {{ prog.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (prog.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-primary inactive-ctrl\':true }" aria-valuenow="{{ (prog.perct | number:2) }}" aria-valuetext="{{ (prog.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div><div ng:if="false && sqlCmd.target.busy" ng:init="progData = sqlCmd.utils.getSizeData(sqlCmd.target)" role=progressbar title="Database Tables - {{ progData.perct | number:2 }}% ( {{ progData.value | toBytes:1 }} / {{ progData.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (progData.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-warning inactive-ctrl\':true  }" aria-valuenow="{{ (progData.perct | number:2) }}" aria-valuetext="{{ (progData.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div><div ng:if=sqlCmd.target.size.index ng:init="progIndex = sqlCmd.utils.getSizeIndex(sqlCmd.target)" role=progressbar title="Table Indexes - {{ progIndex.perct | number:2 }}% ( {{ progIndex.value | toBytes:1 }} / {{ progIndex.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (progIndex.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-info\':true }" aria-valuenow="{{ (progIndex.perct | number:2) }}" aria-valuetext="{{ (progIndex.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div><div ng:if=sqlCmd.target.size.table ng:init="progTables = sqlCmd.utils.getSizeTables(sqlCmd.target)" role=progressbar title="Table Data - {{ progTables.perct | number:2 }}% ( {{ progTables.value | toBytes:1 }} / {{ progTables.total | toBytes:1 }} )" class=progress-bar ng-style="{width: (progTables.perct | number:2) + \'%\'}" ng-class="{ \'progress-bar-primary\':true }" aria-valuenow="{{ (progTables.perct | number:2) }}" aria-valuetext="{{ (progTables.perct | number:2) }}%" aria-valuemin=0 aria-valuemax=100></div></div></div><div><div ng:if="!sqlCmd.target.tables && !sqlCmd.target.views"><em>Loading...</em></div><div ng:if=sqlCmd.target class=ellipsis><span ng:if=!sqlCmd.busy class=dropdown style="position: relative"><a href="" style="color: #808080; text-decoration:none" ng-click="sqlCmd.utils.openModalWindow(\'modules/cli/win/sqlcmd.exe/dialogs/dbActions.tpl.html\')">&nbsp; <i class="glyphicon glyphicon-expand"></i> Actions</a></span> <span ng:if=sqlCmd.target.tables.length>| <a href="" style="color: #808080; text-decoration:none">{{ sqlCmd.target.tables.length }} Tables</a></span> <span ng:if=sqlCmd.target.views.length>| <a href="" style="color: #808080; text-decoration:none">{{ sqlCmd.target.views.length }} Views</a></span></div><div ng:if="sqlCmd.target.REMARKS && (sqlCmd.target.REMARKS != \'NULL\')"><em>Remarks: {{ sqlCmd.target.REMARKS }}</em></div></div></div></div></div><div><tabset class=info-tabs><tab heading=Tables><div ng:if="sqlCmd.target.tables.length > 0" class="thumbnail trim-top"><h5 class=ellipsis>Database Tables <small>(<label>{{ sqlCmd.target.tables.length }} items in total</label>)</small></h5><ul ng:if=sqlCmd.target.tables style="padding: 12px; margin: 0"><li ng-repeat="tbl in sqlCmd.target.tables" class=ellipsis style="list-style: none; padding: 0; margin: 0"><i class="glyphicon glyphicon-list" ng-class="{\'glow-blue\': (sqlCmd.targetTable == tbl)}"></i>&nbsp; <a href="" ng-click="sqlCmd.targetTable = tbl" ng-class="{ \'glow-blue\': (sqlCmd.targetTable == tbl) }">{{ tbl.name }}</a><ul ng:if="sqlCmd.targetTable == tbl" style="padding: 0 0 0 8px; margin: 8px"><li ng:if="tbl.cols.length == 0" style="list-style: none; padding: 0; margin: 0"><em>Nothing to display...</em></li><li ng-repeat="col in tbl.cols" style="list-style: none; padding: 0; margin: 0"><i class=glyphicon ng-class="{ \'glyphicon-list\': true }"></i> <a href="" ng-click="sqlCmd.targetColumn == col">{{col}}</a></li></ul></li></ul></div></tab><tab heading=Views><div class="thumbnail trim-top" ng:if="sqlCmd.target.views.length > 0"><h5 class=ellipsis>Database Views <small>(<label>{{ sqlCmd.target.views.length }} items in total</label>)</small></h5><ul ng:if=sqlCmd.target.views style="padding: 12px; margin: 0"><li ng-repeat="view in sqlCmd.target.views" class=ellipsis style="list-style: none; padding: 0; margin: 0"><i class="glyphicon glyphicon-list" ng-class="{\'glow-blue\': (sqlCmd.targetView == view)}"></i>&nbsp; <a href="" ng-click="sqlCmd.targetView = view" ng-class="{ \'glow-blue\': (sqlCmd.targetView == view) }">{{ view.name }}</a><ul ng:if="sqlCmd.targetView == view" style="padding: 0 0 0 8px; margin: 8px"><li ng:if="view.cols.length == 0" style="list-style: none; padding: 0; margin: 0"><em>Nothing to display...</em></li><li ng-repeat="col in tbl.cols" style="list-style: none; padding: 0; margin: 0"><i class=glyphicon ng-class="{ \'glyphicon-list\': true }"></i> <a href="" ng-click="sqlCmd.targetColumn == col">{{col}}</a></li></ul></li></ul></div></tab><tab heading=More...><div class="thumbnail docked trim-top">ToDo: Triggers, stored procedures, FKeys and defaults</div></tab></tabset></div></div></div></div></div></div>');
  $templateCache.put('modules/edge/views/index.tpl.html',
    '<div class=container><h4>Prototyping EdgeJS <small>Interoperability between JavaScript and C#.net, SQL and more</small></h4><div ng:cloak><div class=alert ng-class="{ \'alert-success\': edge.active, \'alert-warning\': !edge.active, \'alert-danger\': edge.error}"><div ng-if=!edge.error><i class=glyphicon ng-class="{ \'glyphicon-ok\':edge.active, \'glyphicon-warning-sign\': !edge.active }"></i> <b>EdgeJS:</b> The current status is <em>{{ edge.active ? \'Connected\' : \'Offline\' }}</em>.</div><div ng-if=edge.error><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Error:</b> {{ edge.error.message ? edge.error.message : edge.error }}.</div></div><div class="btn-group btn-group-sm"><a class="btn btn-primary" ng-if=!edge.active href="" ng-click="edge.active = edge.detect()">Connnect</a> <a class="btn btn-warning" ng-if=edge.active href="" ng-click="edge.active = false">Disconnect</a></div></div></div>');
  $templateCache.put('views/index.tpl.html',
    '<div class=container><h4>Prototyping Local Resources <small>Discover features and command line utilities</small></h4><div ng:cloak><div ng:if=cmd.busy><div class=app-loading><div class=loadtext><label id=preLoaderText>Loading, please wait...</label><div class=spinner><div class=rect1></div><div class=rect2></div><div class=rect3></div><div class=rect4></div><div class=rect5></div><div class=rect7></div><div class=rect7></div><div class=rect8></div><div class=rect9></div><div class=rect10></div><div class=rect11></div><div class=rect12></div></div></div></div></div><div ng:if=!cmd.busy><div ng:if=!appNode.active class="alert alert-warning"><i class="fa fa-warning"></i> <b>Not Available:</b> Application requires a NodeJS (or CommonJS) runtime. Web browsers do not have access to these advanced features...</div><div ng:if="cmd.active && !cmd.result.stderr" class="alert alert-success"><i class="fa fa-share-square"></i> <b>Success!</b> You are now conncted to the local host machine...</div><div ng:if=cmd.result.stderr class="alert alert-danger"><i class="fa fa-share-square"></i> <b>Error:</b> {{ cmd.result.stderr }}</div><div ng:if=false class="alert alert-info"><i class="fa fa-share-square"></i> <b>Info:</b></div></div><div ng:if=!appNode.active><h5>How to run this application</h5><ul style="padding-left: 20px"><li>This software requires access to the <a target=_blank href="https://nodejs.org/">NodeJS</a> framework for some advanced features.</li><li>Nodewebkit is a modified chromium build that adds NodeJS to the DOM script engine (V8).</li><li>See the node-webkit GitHub page for more info: <a target=_blank href="https://github.com/nwjs/nw.js/">https://github.com/nwjs/nw.js</a></li></ul></div><div ng:if=cmd.cwd><h5>Current Working Directory <small>{{ cmd.cwd.path }}</small></h5><ul ng:if=cmd.cwd.list style="padding: 12px; margin: 0"><li ng-repeat="path in cmd.cwd.list" style="list-style: none; padding: 0; margin: 0"><i class=glyphicon ng-class="cmd.utils.icon(cmd.cwd.path, path)"></i>&nbsp; <a href="" ng-click=cmd.utils.list(cmd.cwd.path) ng-class="{ \'glow-blue\': path == cmd.target.path }">{{ path }}</a><ul ng:if="false && cmd.cwd.path == cmd.target.path" style="padding: 0 0 0 8px; margin: 8px"><li ng:if="cmd.cwd.list.length == 0" style="list-style: none; padding: 0; margin: 0"><em>Nothing to display...</em></li><li ng-repeat="item in cmd.cwd.list" style="list-style: none; padding: 0; margin: 0"><i class=glyphicon ng-class="cmd.utils.icon(path, item)"></i> <a href="">{{item}}</a></li></ul></li></ul></div><div ng:if=cmd.result><h5>Additional System Paths</h5><ul ng:if=cmd.result.paths style="padding: 12px; margin: 0"><li ng-repeat="path in cmd.utils.getAllPaths()" style="list-style: none; padding: 0; margin: 0"><i class=glyphicon ng-class="cmd.utils.icon(path, null)"></i>&nbsp; <a href="" ng-click=cmd.utils.list(path) ng-class="{ \'glow-blue\': path == cmd.target.path }">{{ path }}</a><ul ng:if="path == cmd.target.path" style="padding: 0 0 0 8px; margin: 8px"><li ng:if="cmd.target.list.length == 0" style="list-style: none; padding: 0; margin: 0"><em>Nothing to display...</em></li><li ng-repeat="item in cmd.target.list" style="list-style: none; padding: 0; margin: 0"><i class=glyphicon ng-class="cmd.utils.icon(path, item)"></i> <a href="" ng-click="cmd.utils.call(path, item)">{{item}}</a></li></ul></li></ul></div></div></div>');
  $templateCache.put('views/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=proto.cmd><i class=fa ng-class="{ \'fa-refresh glow-blue\': cmd.busy, \'fa-desktop glow-green\': !cmd.busy && appNode.active, \'fa-warning glow-orange\': !cmd.busy && !appNode.active }"></i>&nbsp; Explore All Features</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': !appNode.active }"><a app:nav-link ui:sref=proto.explore data:eat-click-if=!appNode.active><i class="fa fa-folder"></i> Local Filesystem Viewer</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': !appNode.active }"><a app:nav-link ui:sref=sqlcmd.connect data:eat-click-if=!appNode.active><i class="fa fa-database"></i> Connect to Data Source</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': !appNode.active }"><a app:nav-link ui:sref=certs.info data:eat-click-if=!appNode.active><i class="fa fa-certificate"></i> Check Certificates</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': !appNode.active }"><a app:nav-link ui:sref=proto.edge data:eat-click-if=!appNode.active><i class="fa fa-magic"></i> Interop with C#.net</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': !appNode.active }"><a app:nav-link ui:sref=proto.editor><i class="fa fa-edit"></i>&nbsp; File &amp; Text Editor</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': !appNode.active }"><a app:nav-link ui:sref=proto.console><i class="fa fa-terminal"></i>&nbsp; Console Application</a></li></ul>');
}]);
;angular.module('prototyped.ng.features.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/features.min.css',
    "body .card-view .img-advanced{filter:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz1cJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCc+PGZpbHRlciBpZD1cJ2dyYXlzY2FsZVwnPjxmZUNvbG9yTWF0cml4IHR5cGU9XCdtYXRyaXhcJyB2YWx1ZXM9XCcwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwIDAgMCAxIDBcJy8+PC9maWx0ZXI+PC9zdmc+I2dyYXlzY2FsZQ==);filter:gray;-webkit-filter:grayscale(100%);background-size:715px auto;background-position:top right;background-image:url(http://cywee.com/wp-content/uploads/2013/04/Advanced-Technology-715x250.jpg)}body .card-view .img-advanced-restricted{filter:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz1cJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCc+PGZpbHRlciBpZD1cJ2dyYXlzY2FsZVwnPjxmZUNvbG9yTWF0cml4IHR5cGU9XCdtYXRyaXhcJyB2YWx1ZXM9XCcwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwIDAgMCAxIDBcJy8+PC9maWx0ZXI+PC9zdmc+I2dyYXlzY2FsZQ==);filter:gray;-webkit-filter:grayscale(100%);background-color:#fff;background-size:320px auto;background-position:top left;background-image:url(http://betanews.com/wp-content/uploads/2013/07/Missing-Puzzle-Pieces-600x398.jpg)}"
  );

}]);;angular.module('prototyped.ng.features.scripts', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('modules/cli/win/sqlcmd.exe/scripts/utils/FileSizes.sql',
    "SELECT \r" +
    "\n" +
    "\tDB_NAME(database_id) AS DatabaseName,\r" +
    "\n" +
    "\tName AS Logical_Name,\r" +
    "\n" +
    "\tPhysical_Name, (size*8) SizeKB\r" +
    "\n" +
    "FROM \r" +
    "\n" +
    "\tsys.master_files\r" +
    "\n" +
    "WHERE \r" +
    "\n" +
    "\tDB_NAME(database_id) LIKE DB_NAME()"
  );


  $templateCache.put('modules/cli/win/sqlcmd.exe/scripts/utils/ListViews.sql',
    "SELECT \r" +
    "\n" +
    "\tv.object_id  AS ObjectId,\r" +
    "\n" +
    "\tv.name  AS ViewName\r" +
    "\n" +
    "FROM sys.views  v \r" +
    "\n" +
    "WHERE v.is_ms_shipped = 0"
  );


  $templateCache.put('modules/cli/win/sqlcmd.exe/scripts/utils/NoCounts.sql',
    "SET NOCOUNT ON;"
  );


  $templateCache.put('modules/cli/win/sqlcmd.exe/scripts/utils/ShrinkDB.sql',
    "DECLARE @TargetDB varchar(max) SET @TargetDB = DB_NAME()\r" +
    "\n" +
    "DECLARE @InitialSize int\r" +
    "\n" +
    "\r" +
    "\n" +
    "-- Declare the temp table (used to hold info about DB sizes before and after shrink)\r" +
    "\n" +
    "IF OBJECT_ID(N'tempdb..[#TableSizes]') IS NOT NULL DROP TABLE #TableSizes \r" +
    "\n" +
    "CREATE TABLE #TableSizes ([Description] varchar(max), [TotalSize] int, [Reduction] decimal(18,2))\r" +
    "\n" +
    "INSERT INTO #TableSizes SELECT @TargetDB + ' ( before )', SUM(size), 0.00 FROM sys.database_files\r" +
    "\n" +
    "SELECT @InitialSize = [TotalSize] FROM #TableSizes\r" +
    "\n" +
    "\r" +
    "\n" +
    "/*\r" +
    "\n" +
    "-- Set recovery mode to 'Simple'\r" +
    "\n" +
    "ALTER DATABASE Zetes_IMS_Clean SET RECOVERY SIMPLE\r" +
    "\n" +
    "*/\r" +
    "\n" +
    "\r" +
    "\n" +
    "-- Shrink the DB files\r" +
    "\n" +
    "DECLARE @name varchar(max)\r" +
    "\n" +
    "DECLARE db_cursor CURSOR FOR \r" +
    "\n" +
    "SELECT name FROM sys.database_files WHERE state_desc = 'ONLINE'\r" +
    "\n" +
    "\r" +
    "\n" +
    "OPEN db_cursor  \r" +
    "\n" +
    "FETCH NEXT FROM db_cursor INTO @name  \r" +
    "\n" +
    "WHILE @@FETCH_STATUS = 0  \r" +
    "\n" +
    "BEGIN  \r" +
    "\n" +
    "\t   DBCC SHRINKFILE (@name, 1) WITH NO_INFOMSGS\r" +
    "\n" +
    "       \r" +
    "\n" +
    "       FETCH NEXT FROM db_cursor INTO @name  \r" +
    "\n" +
    "END  \r" +
    "\n" +
    "CLOSE db_cursor  \r" +
    "\n" +
    "DEALLOCATE db_cursor\r" +
    "\n" +
    "\r" +
    "\n" +
    "/*\r" +
    "\n" +
    "-- Set recovery mode to 'Full'\r" +
    "\n" +
    "ALTER DATABASE Zetes_IMS_Clean SET RECOVERY FULL\r" +
    "\n" +
    "*/\r" +
    "\n" +
    "\r" +
    "\n" +
    "-- Get the new DB size, and display the compared results\r" +
    "\n" +
    "INSERT INTO #TableSizes SELECT @TargetDB + ' ( after )', SUM(size), (100 * (@InitialSize - SUM(size)) / @InitialSize) FROM sys.database_files\r" +
    "\n" +
    "SELECT \r" +
    "\n" +
    "\t [Description]\r" +
    "\n" +
    "\t,REPLACE(CONVERT(varchar,CONVERT(Money, [TotalSize]),1),'.00','') AS [Size ( kb )]\r" +
    "\n" +
    "\t,[Reduction] AS [Reduced ( % )]\r" +
    "\n" +
    "FROM #TableSizes\r" +
    "\n" +
    "DROP TABLE #TableSizes"
  );


  $templateCache.put('modules/cli/win/sqlcmd.exe/scripts/utils/TableSizes.sql',
    "if object_id(N'tempdb..[#TableSizes]') is not null\r" +
    "\n" +
    "  drop table #TableSizes;\r" +
    "\n" +
    "go\r" +
    "\n" +
    "create table #TableSizes\r" +
    "\n" +
    "(\r" +
    "\n" +
    "    [Table Name] nvarchar(128)   \r" +
    "\n" +
    "  , [Number of Rows] char(11)    \r" +
    "\n" +
    "  , [Reserved Space] varchar(18) \r" +
    "\n" +
    "  , [Data Space] varchar(18)    \r" +
    "\n" +
    "  , [Index Size] varchar(18)    \r" +
    "\n" +
    "  , [Unused Space] varchar(18)  \r" +
    "\n" +
    ");\r" +
    "\n" +
    "go\r" +
    "\n" +
    "\r" +
    "\n" +
    "declare @schemaname varchar(256) ;\r" +
    "\n" +
    "set @schemaname = 'dbo' ;\r" +
    "\n" +
    "\r" +
    "\n" +
    "declare curSchemaTable cursor\r" +
    "\n" +
    "  for select sys.schemas.name + '.' + sys.objects.name\r" +
    "\n" +
    "      from    sys.objects\r" +
    "\n" +
    "    \t\t, sys.schemas\r" +
    "\n" +
    "      where   object_id > 100\r" +
    "\n" +
    "    \t\t  and sys.schemas.name = @schemaname\r" +
    "\n" +
    "    \t\t  and type_desc = 'USER_TABLE'\r" +
    "\n" +
    "    \t\t  and sys.objects.schema_id = sys.schemas.schema_id ;\r" +
    "\n" +
    "\r" +
    "\n" +
    "open curSchemaTable ;\r" +
    "\n" +
    "declare @name varchar(256) ;  \r" +
    "\n" +
    "\r" +
    "\n" +
    "fetch curSchemaTable into @name;\r" +
    "\n" +
    "while ( @@FETCH_STATUS = 0 )\r" +
    "\n" +
    "  begin    \r" +
    "\n" +
    "    insert into #TableSizes\r" +
    "\n" +
    "    \t\texec sp_spaceused @objname = @name;       \r" +
    "\n" +
    "    fetch curSchemaTable into @name;   \r" +
    "\n" +
    "  end\r" +
    "\n" +
    "\r" +
    "\n" +
    "close curSchemaTable;     \r" +
    "\n" +
    "deallocate curSchemaTable;\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "select [Table Name]\r" +
    "\n" +
    "      , [Number of Rows]\r" +
    "\n" +
    "      , [Reserved Space]\r" +
    "\n" +
    "      , [Data Space]\r" +
    "\n" +
    "      , [Index Size]\r" +
    "\n" +
    "      , [Unused Space]\r" +
    "\n" +
    "from    [#TableSizes]\r" +
    "\n" +
    "order by [Table Name];\r" +
    "\n" +
    "\r" +
    "\n" +
    "drop table #TableSizes;"
  );

}]);