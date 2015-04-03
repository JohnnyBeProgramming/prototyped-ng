/// <reference path="../imports.d.ts" />
// Constant object with default values
angular.module('prototyped.ng.config', []).constant('appDefaultConfig', {
    version: '0.0.1',
    routers: [],
    options: {
        debug: false,
        showAboutPage: true,
        showDefaultItems: true
    }
}).provider('appConfig', [
    'appDefaultConfig', function (appDefaultConfig) {
        var config = appDefaultConfig;
        return {
            set: function (options) {
                angular.extend(config, options);
            },
            clear: function () {
                config = appDefaultConfig;
            },
            $get: function () {
                return config;
            }
        };
    }]).constant('appConfigLoader', {
    init: function (opts) {
        var configUrl = opts.path;
        var ngTargetApp = opts.name;
        var elem = opts.elem || document.body;
        var cfgModule = angular.module('prototyped.ng.config');
        var oldConfig = angular.injector(['prototyped.ng.config']).get('appConfig');
        if (opts.opts) {
            angular.extend(oldConfig.options, opts.opts);
        }
        if (configUrl) {
            var $http = angular.injector(['ng']).get('$http');
            $http({
                method: 'GET',
                url: configUrl
            }).success(function (data, status, headers, config) {
                console.debug('Configuring ' + ngTargetApp + '...');
                angular.extend(oldConfig, {
                    version: data.version || oldConfig.version
                });
                cfgModule.constant('appConfig', oldConfig);
                angular.bootstrap(elem, [ngTargetApp]);
            }).error(function (ex) {
                console.debug('Starting ' + ngTargetApp + ' with default config.');
                angular.bootstrap(elem, [ngTargetApp]);
            });
        } else {
            console.debug('Starting app ' + ngTargetApp + '...');
            angular.bootstrap(elem, [ngTargetApp]);
        }
    }
});
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (commands) {
            var ConsoleController = (function () {
                function ConsoleController($scope) {
                    this.$scope = $scope;
                    this._proxyList = [];
                    try  {
                        // Set the scope vars
                        $scope.myConsole = this;
                        $scope.lines = [];

                        // Create the list proxies
                        this._currentProxy = new BrowserConsole();
                        this._proxyList.push(this._currentProxy);

                        // Get the required libraries
                        if (typeof require !== 'undefined') {
                            var proc = require('child_process');
                            if (!$.isEmptyObject(proc)) {
                                this._currentProxy = new ProcessConsole(proc);
                                this._proxyList.push(this._currentProxy);
                            }
                        }
                    } catch (ex) {
                        // Could not load required libraries
                        console.error(' - Warning: Console app failed to load required libraries.');
                    } finally {
                        // Initialise the controller
                        this.init();
                    }
                }
                ConsoleController.prototype.init = function () {
                    try  {
                        // Check the command line status and give user some feedback
                        if (this._currentProxy) {
                            this.success('Command line ready and active.');
                        } else {
                            this.warning('Cannot access the command line from the browser.');
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                };

                ConsoleController.prototype.clear = function () {
                    // Clear cache
                    this.$scope.lines = [];

                    // Clear via proxy
                    if (this._currentProxy) {
                        this._currentProxy.clear();
                    }
                };

                ConsoleController.prototype.getProxyName = function () {
                    return (this._currentProxy) ? this._currentProxy.ProxyName : '';
                };
                ConsoleController.prototype.getProxies = function () {
                    return this._proxyList;
                };
                ConsoleController.prototype.setProxy = function (name) {
                    console.info(' - Switching Proxy: ' + name);
                    for (var i = 0; i < this._proxyList.length; i++) {
                        var itm = this._proxyList[i];
                        if (itm.ProxyName == name) {
                            this._currentProxy = itm;
                            break;
                        }
                    }

                    // Refresh UI if needed
                    if (!this.$scope.$$phase)
                        this.$scope.$apply();

                    return this._currentProxy;
                };

                ConsoleController.prototype.command = function (text) {
                    var _this = this;
                    // Try and run the command
                    this.info('' + text);
                    this.$scope.txtInput = '';

                    // Check if proxy exists
                    if (this._currentProxy) {
                        // Check for 'clear screen' command
                        if (text == 'cls')
                            return this.clear();

                        // Run the command via proxy
                        this._currentProxy.command(text, function (msg, tp) {
                            switch (tp) {
                                case 'debug':
                                    _this.debug(msg);
                                    break;
                                case 'info':
                                    _this.info(msg);
                                    break;
                                case 'warn':
                                    _this.warning(msg);
                                    break;
                                case 'succcess':
                                    _this.success(msg);
                                    break;
                                case 'error':
                                    _this.error(msg);
                                    break;
                                default:
                                    _this.debug(msg);
                                    break;
                            }

                            // Refresh UI if needed
                            if (!_this.$scope.$$phase)
                                _this.$scope.$apply();
                        });
                    } else {
                        this.error('Command line is not available...');
                    }
                };

                ConsoleController.prototype.debug = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'debug'
                    });
                };

                ConsoleController.prototype.info = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'info'
                    });
                };

                ConsoleController.prototype.warning = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'warning'
                    });
                };

                ConsoleController.prototype.success = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'success'
                    });
                };

                ConsoleController.prototype.error = function (msg) {
                    this.$scope.lines.push({
                        time: Date.now(),
                        text: msg,
                        type: 'error'
                    });
                };
                return ConsoleController;
            })();
            commands.ConsoleController = ConsoleController;

            var BrowserConsole = (function () {
                function BrowserConsole() {
                    this.ProxyName = 'Browser';
                }
                BrowserConsole.prototype.command = function (text, callback) {
                    try  {
                        var result = eval(text);
                        if (callback && result) {
                            callback(result, 'info');
                        }
                        console.info(result);
                    } catch (ex) {
                        callback(ex, 'error');
                        console.error(ex);
                    }
                };

                BrowserConsole.prototype.clear = function () {
                    console.clear();
                };
                BrowserConsole.prototype.debug = function (msg) {
                    console.debug(msg);
                };
                BrowserConsole.prototype.info = function (msg) {
                    console.info(msg);
                };
                BrowserConsole.prototype.warning = function (msg) {
                    console.warn(msg);
                };
                BrowserConsole.prototype.success = function (msg) {
                    console.info(msg);
                };
                BrowserConsole.prototype.error = function (msg) {
                    console.error(msg);
                };
                return BrowserConsole;
            })();
            commands.BrowserConsole = BrowserConsole;

            var ProcessConsole = (function () {
                function ProcessConsole(_proc) {
                    this._proc = _proc;
                    this.ProxyName = 'System';
                }
                ProcessConsole.prototype.clear = function () {
                };

                ProcessConsole.prototype.command = function (text, callback) {
                    // Call the command line from a child process
                    var proc = eval('process');
                    var ls = this._proc.exec(text, function (error, stdout, stderr) {
                        if (error) {
                            console.groupCollapsed('Command Error: ' + text);
                            console.error(error.stack);
                            console.info(' - Signal received: ' + error.signal);
                            console.info(' - Error code: ' + error.code);
                            console.groupEnd();
                        }
                        if (stdout) {
                            callback('' + stdout, 'info');
                        }
                        if (stderr) {
                            callback('' + stderr, 'error');
                        }
                    }).on('exit', function (code) {
                        //callback(' - Process returned: ' + code, 'debug');
                    });
                };
                return ProcessConsole;
            })();
            commands.ProcessConsole = ProcessConsole;
        })(ng.commands || (ng.commands = {}));
        var commands = ng.commands;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/ConsoleController.ts"/>
angular.module('prototyped.console', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Define the UI states
        $stateProvider.state('proto.console', {
            url: '/console',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/console/views/main.tpl.html',
                    controller: 'proto.ng.commands.ConsoleController'
                }
            }
        });
    }]).controller('proto.ng.commands.ConsoleController', [
    '$scope',
    proto.ng.commands.ConsoleController
]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (editor) {
            var EditorController = (function () {
                function EditorController($scope, $timeout) {
                    this.$scope = $scope;
                    this.$timeout = $timeout;
                    this.isActive = false;
                    this.FileLocation = '';
                    this.LastChanged = null;
                    this.LastOnSaved = null;
                    this.$scope.myWriter = this;
                    try  {
                        // Load file system
                        this._path = require('path');
                        this._fs = require('fs');

                        // Try  and load the node webkit
                        var nwGui = 'nw.gui';
                        this._gui = require(nwGui);
                    } catch (ex) {
                        console.warn(' - [ Editor ] Warning: Could not load all required modules');
                    }
                }
                Object.defineProperty(EditorController.prototype, "FileContents", {
                    get: function () {
                        return this._buffer;
                    },
                    set: function (buffer) {
                        this._buffer = buffer;
                        this.LastChanged = Date.now();
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(EditorController.prototype, "HasChanges", {
                    get: function () {
                        return this.LastChanged != null && this.LastChanged > this.LastOnSaved;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(EditorController.prototype, "HasFileSys", {
                    get: function () {
                        return !$.isEmptyObject(this._gui);
                    },
                    enumerable: true,
                    configurable: true
                });

                EditorController.prototype.init = function () {
                    this.isActive = true;
                };

                EditorController.prototype.openFile = function () {
                    var _this = this;
                    if (this.checkUnsaved())
                        return;

                    if (!$.isEmptyObject(this._gui) && !$.isEmptyObject(this._fs)) {
                        var chooser = $('#fileDialog');
                        chooser.change(function (evt) {
                            var filePath = chooser.val();
                            if (filePath) {
                                // Try and read the file
                                _this._fs.readFile(filePath, 'UTF-8', function (err, data) {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        _this.setText(data);
                                        _this.FileLocation = filePath;
                                        _this.LastChanged = null;
                                        _this.LastOnSaved = null;
                                    }
                                    _this.$scope.$apply();
                                });
                            }
                        });
                        chooser.trigger('click');
                    } else {
                        console.warn(' - [ Editor ] Warning: Shell not available.');
                    }
                };

                EditorController.prototype.openFileLocation = function () {
                    if (this._gui) {
                        this._gui.Shell.openItem(this.FileLocation);
                    } else {
                        console.warn(' - [ Editor ] Warning: Shell not available.');
                    }
                };

                EditorController.prototype.newFile = function () {
                    if (this.checkUnsaved())
                        return;

                    // Clear prev. states
                    this.FileLocation = null;
                    this.LastChanged = null;
                    this.LastOnSaved = null;

                    // Set some intial text
                    this.setText('Enter some text');
                    this.LastChanged = Date.now();

                    // Do post-new operations
                    this.$timeout(function () {
                        // Select file contents
                        var elem = $('#FileContents');
                        if (elem) {
                            elem.select();
                        }
                    });
                };

                EditorController.prototype.saveFile = function (filePath) {
                    var _this = this;
                    if (!filePath)
                        filePath = this.FileLocation;
                    if (!filePath)
                        return this.saveFileAs();
                    if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                        var output = this._buffer;
                        this._fs.writeFile(filePath, output, 'UTF-8', function (err) {
                            if (err) {
                                throw new Error(err);
                            } else {
                                // File has been saved
                                _this.FileLocation = filePath;
                                _this.LastOnSaved = Date.now();
                            }
                            _this.$scope.$apply();
                        });
                    } else {
                        console.warn(' - [ Editor ] Warning: File system not available.');
                    }
                };

                EditorController.prototype.saveFileAs = function () {
                    var _this = this;
                    if (!$.isEmptyObject(this._gui)) {
                        // Get the file name
                        var filePath = this.FileLocation || 'Untitled.txt';
                        var chooser = $('#saveDialog');
                        chooser.change(function (evt) {
                            var filePath = chooser.val();
                            if (filePath) {
                                // Save file in specified location
                                _this.saveFile(filePath);
                            }
                        });
                        chooser.trigger('click');
                    } else {
                        console.warn(' - [ Editor ] Warning: Shell not available.');
                    }
                };

                EditorController.prototype.setText = function (value) {
                    this.FileContents = value;

                    if (!this._textArea) {
                        var myTextArea = $('#FileContents');
                        if (myTextArea.length > 0) {
                            this._textArea = CodeMirror.fromTextArea(myTextArea[0], {
                                //mode: "javascript",
                                autoClearEmptyLines: true,
                                lineNumbers: true,
                                indentUnit: 4
                            });
                        }
                        this._textArea.setValue(value);
                    } else {
                        this._textArea.setValue(value);
                    }
                    /*
                    var totalLines = this._textArea.lineCount();
                    if (totalLines) {
                    this._textArea.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
                    }
                    */
                };

                EditorController.prototype.test = function () {
                    throw new Error('Lala');
                    try  {
                        var dir = './';
                        var log = "Test.log";
                        if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                            var target = this._path.resolve(dir, log);
                            this._fs.writeFile(log, "Hey there!", function (err) {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    var nwGui = 'nw.gui';
                                    var myGui = require(nwGui);
                                    if (!$.isEmptyObject(myGui)) {
                                        myGui.Shell.openItem(target);
                                    } else {
                                        throw new Error('Cannot open the item: ' + target);
                                    }
                                }
                            });
                        } else {
                            console.warn(' - Warning: File system not available...');
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                };

                EditorController.prototype.checkUnsaved = function (msg) {
                    var msgCheck = msg || 'There are unsaved changes.\r\nAre you sure you want to continue?';
                    var hasCheck = this.FileContents != null && this.HasChanges;
                    return (hasCheck && confirm(msgCheck) == false);
                };
                return EditorController;
            })();
            editor.EditorController = EditorController;
        })(ng.editor || (ng.editor = {}));
        var editor = ng.editor;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/EditorController.ts"/>
angular.module('prototyped.editor', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Define the UI states
        $stateProvider.state('proto.editor', {
            url: '/editor',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/editor/views/main.tpl.html',
                    controller: 'proto.ng.editor.EditorController'
                }
            }
        });
    }]).controller('proto.ng.editor.EditorController', [
    '$scope',
    '$timeout',
    proto.ng.editor.EditorController
]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (explorer) {
        var AddressBarController = (function () {
            function AddressBarController($rootScope, $scope, $q) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$scope = $scope;
                this.$q = $q;
                this.history = [];
                $scope.busy = true;
                try  {
                    // Initialise the address bar
                    var elem = $('#addressbar');
                    if (elem) {
                        this.init(elem);

                        this.$rootScope.$on('event:folder-path:changed', function (event, folder) {
                            if (folder != _this.$scope.dir_path) {
                                console.warn(' - Addressbar Navigate: ', folder);
                                _this.$scope.dir_path = folder;
                                _this.navigate(folder);
                            }
                        });
                    } else {
                        throw new Error('Element with id "addressbar" not found...');
                    }
                } catch (ex) {
                    // Initialisation failed
                    console.error(ex);
                }
                $scope.busy = false;
            }
            AddressBarController.prototype.init = function (element) {
                // Set the target HTML element
                this.element = element;

                // Generate the current folder parts
                this.generateOutput('./');
            };

            AddressBarController.prototype.openFolder = function (path) {
                try  {
                    var nwGui = 'nw.gui';
                    var gui = require(nwGui);
                    if (!$.isEmptyObject(gui)) {
                        console.debug(' - Opening Folder: ' + path);
                        gui.Shell.openItem(path + '/');
                    }
                } catch (ex) {
                    console.error(ex);
                }
                this.generateOutput(path);
            };

            AddressBarController.prototype.navigate = function (path) {
                this.generateOutput(path);
            };

            AddressBarController.prototype.select = function (file) {
                console.info(' - select: ', file);
                try  {
                    var req = 'nw.gui';
                    var gui = require(req);
                    gui.Shell.openItem(file);
                } catch (ex) {
                    console.error(ex);
                }
            };

            AddressBarController.prototype.back = function () {
                var len = this.history ? this.history.length : -1;
                if (len > 1) {
                    var last = this.history[len - 2];
                    this.history = this.history.splice(0, len - 2);
                    this.generateOutput(last);
                }
            };

            AddressBarController.prototype.hasHistory = function () {
                var len = this.history ? this.history.length : -1;
                return (len > 1);
            };

            AddressBarController.prototype.generateOutput = function (dir_path) {
                // Set the current dir path
                this.$scope.dir_path = dir_path;
                this.$scope.dir_parts = this.generatePaths(dir_path);
                this.history.push(dir_path);

                // Breadcast event that path has changed
                this.$rootScope.$broadcast('event:folder-path:changed', this.$scope.dir_path);
            };

            AddressBarController.prototype.generatePaths = function (dir_path) {
                try  {
                    // Get dependecies
                    var path = require('path');

                    // Update current path
                    this.$scope.dir_path = dir_path = path.resolve(dir_path);

                    // Try and normalize the folder path
                    var curr = path.normalize(dir_path);
                    if (curr) {
                        // Split path into separate elements
                        var sequence = curr.split(path.sep);
                        var result = [];

                        var i = 0;
                        for (; i < sequence.length; ++i) {
                            result.push({
                                name: sequence[i],
                                path: sequence.slice(0, 1 + i).join(path.sep)
                            });
                        }

                        // Add root for unix
                        if (sequence[0] == '' && process.platform != 'win32') {
                            result[0] = {
                                name: 'root',
                                path: '/'
                            };
                        }

                        // Return thepath sequences
                        return { sequence: result };
                    }
                } catch (ex) {
                    console.error(ex);
                }
            };
            return AddressBarController;
        })();
        explorer.AddressBarController = AddressBarController;
    })(proto.explorer || (proto.explorer = {}));
    var explorer = proto.explorer;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (explorer) {
        var ExplorerController = (function () {
            function ExplorerController($rootScope, $scope, $q) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$scope = $scope;
                this.$q = $q;
                var dir = './';
                try  {
                    // Hook up to the current scope
                    this.$scope.isBusy = true;

                    // Initialize the cotroller
                    this.init(dir);

                    // Hook event for when folder path changes
                    this.$rootScope.$on('event:folder-path:changed', function (event, folder) {
                        if (folder != _this.$scope.dir_path) {
                            console.warn(' - Explorer Navigate: ', folder);
                            _this.$scope.dir_path = folder;
                            _this.navigate(folder);
                        }
                    });
                } catch (ex) {
                    console.error(ex);
                }
            }
            ExplorerController.prototype.init = function (dir) {
                // Resolve the initial folder path
                this.navigate(dir);
            };

            ExplorerController.prototype.navigate = function (dir_path) {
                var _this = this;
                var deferred = this.$q.defer();
                try  {
                    // Set busy flag
                    this.$scope.isBusy = true;
                    this.$scope.error = null;

                    // Resolve the full path
                    var path = require('path');
                    dir_path = path.resolve(dir_path);

                    // Read the folder contents (async)
                    var fs = require('fs');
                    fs.readdir(dir_path, function (error, files) {
                        if (error) {
                            deferred.reject(error);
                            return;
                        }

                        // Split and sort results
                        var folders = [];
                        var lsFiles = [];
                        for (var i = 0; i < files.sort().length; ++i) {
                            var targ = path.join(dir_path, files[i]);
                            var stat = _this.mimeType(targ);
                            if (stat.type == 'folder') {
                                folders.push(stat);
                            } else {
                                lsFiles.push(stat);
                            }
                        }

                        // Generate the contents
                        var result = {
                            path: dir_path,
                            folders: folders,
                            files: lsFiles
                        };

                        // Mark promise as resolved
                        deferred.resolve(result);
                    });
                } catch (ex) {
                    // Mark promise and rejected
                    deferred.reject(ex);
                }

                // Handle the result and error conditions
                deferred.promise.then(function (result) {
                    // Clear busy flag
                    _this.$scope.isBusy = false;
                    _this.$scope.dir_path = result.path;
                    _this.$scope.files = result.files;
                    _this.$scope.folders = result.folders;

                    // Breadcast event that path has changed
                    _this.$rootScope.$broadcast('event:folder-path:changed', _this.$scope.dir_path);
                }, function (error) {
                    // Clear busy flag
                    _this.$scope.isBusy = false;
                    _this.$scope.error = error;
                });

                return deferred.promise;
            };

            ExplorerController.prototype.select = function (filePath) {
                this.$scope.selected = filePath;
            };

            ExplorerController.prototype.open = function (filePath) {
                var req = 'nw.gui';
                var gui = require(req);
                if (gui)
                    gui.Shell.openItem(filePath);
            };

            ExplorerController.prototype.mimeType = function (filepath) {
                var map = {
                    'compressed': ['zip', 'rar', 'gz', '7z'],
                    'text': ['txt', 'md', ''],
                    'image': ['jpg', 'jpge', 'png', 'gif', 'bmp'],
                    'pdf': ['pdf'],
                    'css': ['css'],
                    'excel': ['csv', 'xls', 'xlsx'],
                    'html': ['html'],
                    'word': ['doc', 'docx'],
                    'powerpoint': ['ppt', 'pptx'],
                    'movie': ['mkv', 'avi', 'rmvb']
                };
                var cached = {};

                var fs = require('fs');
                var path = require('path');
                var result = {
                    name: path.basename(filepath),
                    path: filepath,
                    type: null
                };

                try  {
                    var stat = fs.statSync(filepath);
                    if (stat.isDirectory()) {
                        result.type = 'folder';
                    } else {
                        var ext = path.extname(filepath).substr(1);
                        result.type = cached[ext];
                        if (!result.type) {
                            for (var key in map) {
                                var arr = map[key];
                                if (arr.length > 0 && arr.indexOf(ext) >= 0) {
                                    cached[ext] = result.type = key;
                                    break;
                                }
                            }

                            if (!result.type)
                                result.type = 'blank';
                        }
                    }
                } catch (e) {
                    console.error(e);
                }

                return result;
            };
            return ExplorerController;
        })();
        explorer.ExplorerController = ExplorerController;
    })(proto.explorer || (proto.explorer = {}));
    var explorer = proto.explorer;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.explorer', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        $stateProvider.state('proto.explore', {
            url: '^/explore',
            views: {
                'left@': { templateUrl: 'views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/explore/views/index.tpl.html',
                    controller: 'proto.explorer.ExplorerController',
                    controllerAs: 'ctrlExplorer'
                }
            }
        });
    }]).directive('protoAddressBar', [
    '$q', function ($q) {
        return {
            restrict: 'EA',
            scope: {
                target: '=protoAddressBar'
            },
            transclude: false,
            templateUrl: 'modules/explore/views/addressbar.tpl.html',
            controller: 'proto.explorer.AddressBarController',
            controllerAs: 'addrBar'
        };
    }]).controller('proto.explorer.AddressBarController', [
    '$rootScope',
    '$scope',
    '$q',
    proto.explorer.AddressBarController
]).controller('proto.explorer.ExplorerController', [
    '$rootScope',
    '$scope',
    '$q',
    proto.explorer.ExplorerController
]);
/// <reference path="../imports.d.ts" />
angular.module('prototyped.default', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('default', {
            url: '/',
            views: {
                'main@': {
                    templateUrl: 'views/default.tpl.html',
                    controller: 'CardViewCtrl',
                    controllerAs: 'sliderCtrl'
                }
            }
        });
    }]).controller('CardViewCtrl', [
    '$scope', 'appConfig', function ($scope, appConfig) {
        // Make sure 'mySiteMap' exists
        $scope.pages = appConfig.routers || [];

        // initial image index
        $scope._Index = 0;

        $scope.count = function () {
            return $scope.pages.length;
        };

        // if a current image is the same as requested image
        $scope.isActive = function (index) {
            return $scope._Index === index;
        };

        // show prev image
        $scope.showPrev = function () {
            $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.count() - 1;
        };

        // show next image
        $scope.showNext = function () {
            $scope._Index = ($scope._Index < $scope.count() - 1) ? ++$scope._Index : 0;
        };

        // show a certain image
        $scope.showPhoto = function (index) {
            $scope._Index = index;
        };
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.about', [
    'prototyped.ng.views',
    'prototyped.ng.styles',
    'ui.router'
]).config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Define redirects
        $urlRouterProvider.when('/about', '/about/info');

        // Define the UI states
        $stateProvider.state('about', {
            url: '/about',
            abstract: true
        }).state('about.info', {
            url: '/info',
            views: {
                'left@': { templateUrl: 'views/about/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/about/info.tpl.html',
                    controller: 'AboutInfoController'
                }
            }
        }).state('about.online', {
            url: '^/contact',
            views: {
                'left@': { templateUrl: 'views/about/left.tpl.html' },
                'main@': { templateUrl: 'views/about/contact.tpl.html' }
            }
        }).state('about.conection', {
            url: '/conection',
            views: {
                'left@': { templateUrl: 'views/about/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/about/connections.tpl.html',
                    controller: 'AboutConnectionController'
                }
            }
        });
    }]).controller('AboutInfoController', [
    '$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {
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
            return false;
            //var ret = css($(selector));
            //return ret;
        }

        function getVersionInfo(ident) {
            try  {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) {
            }
            return null;
        }

        // Define a function to detect the capabilities
        $scope.detectBrowserInfo = function () {
            var info = {
                about: null,
                versions: {
                    ie: null,
                    html: null,
                    jqry: null,
                    css: null,
                    js: null,
                    ng: null,
                    nw: null,
                    njs: null,
                    v8: null,
                    openssl: null,
                    chromium: null
                },
                detects: {
                    jqry: false,
                    less: false,
                    bootstrap: false,
                    ngAnimate: false,
                    ngUiRouter: false,
                    ngUiUtils: false,
                    ngUiBootstrap: false
                },
                css: {
                    boostrap2: null,
                    boostrap3: null
                },
                codeName: navigator.appCodeName,
                userAgent: navigator.userAgent
            };

            try  {
                // Get IE version (if defined)
                if (!!window['ActiveXObject']) {
                    info.versions.ie = 10;
                }

                // Sanitize codeName and userAgentt
                var cn = info.codeName;
                var ua = info.userAgent;
                if (ua) {
                    // Remove start of string in UAgent upto CName or end of string if not found.
                    ua = ua.substring((ua + cn).toLowerCase().indexOf(cn.toLowerCase()));

                    // Remove CName from start of string. (Eg. '/5.0 (Windows; U...)
                    ua = ua.substring(cn.length);

                    while (ua.substring(0, 1) == " " || ua.substring(0, 1) == "/") {
                        ua = ua.substring(1);
                    }

                    // Remove the end of the string from first characrer that is not a number or point etc.
                    var pointer = 0;
                    while ("0123456789.+-".indexOf((ua + "?").substring(pointer, pointer + 1)) >= 0) {
                        pointer = pointer + 1;
                    }
                    ua = ua.substring(0, pointer);

                    if (!window.isNaN(ua)) {
                        if (parseInt(ua) > 0) {
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

                // Check for CSS extensions
                info.css.boostrap2 = selectorExists('hero-unit');
                info.css.boostrap3 = selectorExists('jumbotron');

                // Detect selected features and availability
                info.about = {
                    protocol: $location.$$protocol,
                    browser: {},
                    server: {
                        active: undefined,
                        url: $location.$$absUrl
                    },
                    os: {},
                    hdd: { type: null }
                };

                // Detect the operating system
                var osName = 'Unknown OS';
                var appVer = navigator.appVersion;
                if (appVer) {
                    if (appVer.indexOf("Win") != -1)
                        osName = 'Windows';
                    if (appVer.indexOf("Mac") != -1)
                        osName = 'MacOS';
                    if (appVer.indexOf("X11") != -1)
                        osName = 'UNIX';
                    if (appVer.indexOf("Linux") != -1)
                        osName = 'Linux';
                    //if (appVer.indexOf("Apple") != -1) osName = 'Apple';
                }
                info.about.os.name = osName;

                // Check for jQuery
                info.detects.jqry = typeof jQuery !== 'undefined';

                // Check for general header and body scripts
                $("script").each(function () {
                    var src = $(this).attr("src");
                    if (src) {
                        // Fast check on known script names
                        info.detects.less = info.detects.less || /(.*)(less.*js)(.*)/i.test(src);
                        info.detects.bootstrap = info.detects.bootstrap || /(.*)(bootstrap)(.*)/i.test(src);
                        info.detects.ngAnimate = info.detects.ngAnimate || /(.*)(angular\-animate)(.*)/i.test(src);
                        info.detects.ngUiRouter = info.detects.ngUiRouter || /(.*)(angular\-ui\-router)(.*)/i.test(src);
                        info.detects.ngUiUtils = info.detects.ngUiUtils || /(.*)(angular\-ui\-utils)(.*)/i.test(src);
                        info.detects.ngUiBootstrap = info.detects.ngUiBootstrap || /(.*)(angular\-ui\-bootstrap)(.*)/i.test(src);
                    }
                });

                // Get the client browser details (build a url string)
                var detectUrl = (function () {
                    var p = [], w = window, d = document, e = 0, f = 0;
                    p.push('ua=' + encodeURIComponent(navigator.userAgent));
                    e |= w.ActiveXObject ? 1 : 0;
                    e |= w.opera ? 2 : 0;
                    e |= w.chrome ? 4 : 0;
                    e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0;
                    e |= ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
                    e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
                    p.push('e=' + e);
                    f |= 'sandbox' in d.createElement('iframe') ? 1 : 0;
                    f |= 'WebSocket' in w ? 2 : 0;
                    f |= w.Worker ? 4 : 0;
                    f |= w.applicationCache ? 8 : 0;
                    f |= w.history && history.pushState ? 16 : 0;
                    f |= d.documentElement.webkitRequestFullScreen ? 32 : 0;
                    f |= 'FileReader' in w ? 64 : 0;
                    p.push('f=' + f);
                    p.push('r=' + Math.random().toString(36).substring(7));
                    p.push('w=' + screen.width);
                    p.push('h=' + screen.height);
                    var s = d.createElement('script');
                    return 'http://api.whichbrowser.net/rel/detect.js?' + p.join('&');
                })();

                // Send a loaded package to a server to detect more features
                $.getScript(detectUrl).done(function (script, textStatus) {
                    $rootScope.$applyAsync(function () {
                        // Browser info and details loaded
                        var browserInfo = new window.WhichBrowser();
                        angular.extend(info.about, browserInfo);
                    });
                }).fail(function (jqxhr, settings, exception) {
                    console.error(exception);
                });

                // Set browser name to IE (if defined)
                if (navigator.appName == 'Microsoft Internet Explorer') {
                    info.about.browser.name = 'Internet Explorer';
                }

                // Check if the browser supports web db's
                var webDB = info.about.webdb = {
                    db: null,
                    version: '1',
                    active: null,
                    size: 5 * 1024 * 1024,
                    test: function (name, desc, dbVer, dbSize) {
                        try  {
                            // Try and open a web db
                            webDB.db = openDatabase(name, webDB.version, desc, webDB.size);
                            webDB.onSuccess(null, null);
                        } catch (ex) {
                            // Nope, something went wrong
                            webDB.onError(null, null);
                        }
                    },
                    onSuccess: function (tx, r) {
                        if (tx) {
                            if (r) {
                                console.info(' - [ WebDB ] Result: ' + JSON.stringify(r));
                            }
                            if (tx) {
                                console.info(' - [ WebDB ] Trans: ' + JSON.stringify(tx));
                            }
                        }
                        $rootScope.$applyAsync(function () {
                            webDB.active = true;
                            webDB.used = JSON.stringify(webDB.db).length;
                        });
                    },
                    onError: function (tx, e) {
                        console.warn(' - [ WebDB ] Warning, not available: ' + e.message);
                        $rootScope.$applyAsync(function () {
                            webDB.active = false;
                        });
                    }
                };
                info.about.webdb.test();
            } catch (ex) {
                console.error(ex);
            }

            // Return the preliminary info
            return info;
        };

        // Define the state
        $scope.info = $scope.detectBrowserInfo();
    }]).controller('AboutConnectionController', [
    '$scope', '$location', '$timeout', function ($scope, $location, $timeout) {
        $scope.result = null;
        $scope.status = null;
        $scope.state = {
            editMode: false,
            location: $location.$$absUrl,
            protocol: $location.$$protocol,
            requireHttps: ($location.$$protocol == 'https')
        };
        $scope.detect = function () {
            var target = $scope.state.location;
            var started = Date.now();
            $scope.result = null;
            $scope.latency = null;
            $scope.status = { code: 0, desc: '', style: 'label-default' };
            $.ajax({
                url: target,
                crossDomain: true,
                /*
                username: 'user',
                password: 'pass',
                xhrFields: {
                withCredentials: true
                }
                */
                beforeSend: function (xhr) {
                    $timeout(function () {
                        //$scope.status.code = xhr.status;
                        $scope.status.desc = 'sending';
                        $scope.status.style = 'label-info';
                    });
                },
                success: function (data, textStatus, xhr) {
                    $timeout(function () {
                        $scope.status.code = xhr.status;
                        $scope.status.desc = textStatus;
                        $scope.status.style = 'label-success';
                        $scope.result = {
                            valid: true,
                            info: data,
                            sent: started,
                            received: Date.now()
                        };
                    });
                },
                error: function (xhr, textStatus, error) {
                    xhr.ex = error;
                    $timeout(function () {
                        $scope.status.code = xhr.status;
                        $scope.status.desc = textStatus;
                        $scope.status.style = 'label-danger';
                        $scope.result = {
                            valid: false,
                            info: xhr,
                            sent: started,
                            error: xhr.statusText,
                            received: Date.now()
                        };
                    });
                },
                complete: function (xhr, textStatus) {
                    console.debug(' - Status Code: ' + xhr.status);
                    $timeout(function () {
                        $scope.status.code = xhr.status;
                        $scope.status.desc = textStatus;
                    });
                }
            }).always(function (xhr) {
                $timeout(function () {
                    $scope.latency = $scope.getLatencyInfo();
                });
            });
        };
        $scope.setProtocol = function (protocol) {
            var val = $scope.state.location;
            var pos = val.indexOf('://');
            if (pos > 0) {
                val = protocol + val.substring(pos);
            }
            $scope.state.protocol = protocol;
            $scope.state.location = val;
            $scope.detect();
        };
        $scope.getProtocolStyle = function (protocol, activeStyle) {
            var cssRes = '';
            var isValid = $scope.state.location.indexOf(protocol + '://') == 0;
            if (isValid) {
                if (!$scope.result) {
                    cssRes += 'btn-primary';
                } else if ($scope.result.valid && activeStyle) {
                    cssRes += activeStyle;
                } else if ($scope.result) {
                    cssRes += $scope.result.valid ? 'btn-success' : 'btn-danger';
                }
            }
            return cssRes;
        };
        $scope.getStatusIcon = function (activeStyle) {
            var cssRes = '';
            if (!$scope.result) {
                cssRes += 'glyphicon-refresh';
            } else if (activeStyle && $scope.result.valid) {
                cssRes += activeStyle;
            } else {
                cssRes += $scope.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
            }
            return cssRes;
        };
        $scope.submitForm = function () {
            $scope.state.editMode = false;
            if ($scope.state.requireHttps) {
                $scope.setProtocol('https');
            } else {
                $scope.detect();
            }
        };
        $scope.getStatusColor = function () {
            var cssRes = $scope.getStatusIcon() + ' ';
            if (!$scope.result) {
                cssRes += 'busy';
            } else if ($scope.result.valid) {
                cssRes += 'success';
            } else {
                cssRes += 'error';
            }
            return cssRes;
        };
        $scope.getLatencyInfo = function () {
            var cssNone = 'text-muted';
            var cssHigh = 'text-success';
            var cssMedium = 'text-warning';
            var cssLow = 'text-danger';
            var info = {
                desc: '',
                style: cssNone
            };

            if (!$scope.result) {
                return info;
            }

            if (!$scope.result.valid) {
                info.style = 'text-muted';
                info.desc = 'Connection Failed';
                return info;
            }

            var totalMs = $scope.result.received - $scope.result.sent;
            if (totalMs > 2 * 60 * 1000) {
                info.style = cssNone;
                info.desc = 'Timed out';
            } else if (totalMs > 1 * 60 * 1000) {
                info.style = cssLow;
                info.desc = 'Impossibly slow';
            } else if (totalMs > 30 * 1000) {
                info.style = cssLow;
                info.desc = 'Very slow';
            } else if (totalMs > 1 * 1000) {
                info.style = cssMedium;
                info.desc = 'Relatively slow';
            } else if (totalMs > 500) {
                info.style = cssMedium;
                info.desc = 'Moderately slow';
            } else if (totalMs > 250) {
                info.style = cssMedium;
                info.desc = 'Barely Responsive';
            } else if (totalMs > 150) {
                info.style = cssHigh;
                info.desc = 'Average Response Time';
            } else if (totalMs > 50) {
                info.style = cssHigh;
                info.desc = 'Responsive Enough';
            } else if (totalMs > 15) {
                info.style = cssHigh;
                info.desc = 'Very Responsive';
            } else {
                info.style = cssHigh;
                info.desc = 'Optimal';
            }
            return info;
        };
    }]);
/// <reference path="../imports.d.ts" />
/// <reference path="../modules/config.ng.ts" />
/// <reference path="../modules/default.ng.ts" />
/// <reference path="../modules/about/module.ng.ts" />
// Define main module with all dependencies
angular.module('prototyped.ng', [
    'prototyped.ng.config',
    'prototyped.ng.views',
    'prototyped.ng.styles',
    'prototyped.default',
    'prototyped.about',
    'prototyped.editor',
    'prototyped.explorer',
    'prototyped.console'
]).config([
    'appConfigProvider', function (appConfigProvider) {
        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng': {
                active: true
            }
        });

        // Define the routing components (menus, card views etc...)
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/proto',
                abstract: true,
                priority: 0,
                menuitem: {
                    label: 'Explore',
                    state: 'proto.cmd',
                    icon: 'fa fa-cubes'
                },
                cardview: {
                    style: 'img-explore',
                    title: 'Explore Features & Options',
                    desc: 'You can explore locally installed features and find your way around the site by clicking on this card...'
                },
                visible: function () {
                    return appConfig.options.showDefaultItems;
                },
                children: [
                    { label: 'Discovery', icon: 'fa fa-refresh', state: 'modules.discover' },
                    { label: 'Connnect', icon: 'fa fa-gears', state: 'modules.connect' },
                    { divider: true },
                    { label: 'Clean & Exit', icon: 'fa fa-recycle', state: 'modules.clear' }
                ]
            });
            appConfig.routers.push({
                url: '/about',
                abstract: true,
                priority: 1000,
                menuitem: {
                    label: 'About',
                    state: 'about.info',
                    icon: 'fa fa-info-circle'
                },
                cardview: {
                    style: 'img-about',
                    title: 'About this software',
                    desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
                },
                visible: function () {
                    return appConfig.options.showAboutPage;
                }
            });
        }
    }]).config([
    '$urlRouterProvider', function ($urlRouterProvider) {
        // Define redirects
        $urlRouterProvider.when('/proto', '/proto/explore').when('/sandbox', '/samples').when('/imports', '/edge');
    }]).config([
    '$stateProvider', function ($stateProvider) {
        // Set up routing...
        $stateProvider.state('proto', {
            url: '/proto',
            abstract: true
        });
    }]).constant('appNode', {
    html5: true,
    active: typeof require !== 'undefined',
    ui: function () {
        if (typeof require !== 'undefined') {
            return require('nw.gui');
        }
        return undefined;
    },
    win: function () {
        if (typeof require !== 'undefined') {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win) {
                return win;
            }
        }
        return undefined;
    },
    reload: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.reloadIgnoringCache();
        }
    },
    close: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.close();
        }
    },
    debug: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win.isDevToolsOpen()) {
            win.closeDevTools();
        } else {
            win.showDevTools();
        }
    },
    toggleFullscreen: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.toggleFullscreen();
        }
    },
    kiosMode: function () {
        var gui = require('nw.gui');
        var win = gui.Window.get();
        if (win) {
            win.toggleKioskMode();
        }
    }
}).constant('appStatus', {
    logs: [],
    show: {
        all: true,
        log: false,
        info: true,
        warn: true,
        error: true,
        debug: false
    }
}).directive('appClean', [
    '$rootScope', '$window', '$route', '$state', 'appNode', 'appStatus', function ($rootScope, $window, $route, $state, appNode, appStatus) {
        return function (scope, elem, attrs) {
            var keyCtrl = false;
            var keyShift = false;
            var keyEvent = $(document).on('keyup keydown', function (e) {
                // Update key states
                var hasChanges = false;
                if (keyCtrl != e.ctrlKey) {
                    hasChanges = true;
                    keyCtrl = e.ctrlKey;
                }
                if (keyShift != e.shiftKey) {
                    hasChanges = true;
                    keyShift = e.shiftKey;
                }
                if (hasChanges) {
                    $(elem).find('i').toggleClass('glow-blue', !keyShift && keyCtrl);
                    $(elem).find('i').toggleClass('glow-orange', keyShift);
                }
            });
            $(elem).attr('tooltip', 'Refresh');
            $(elem).attr('tooltip-placement', 'bottom');
            $(elem).click(function (e) {
                if (keyShift) {
                    // Full page reload
                    if (appNode.active) {
                        console.debug(' - Reload Node Webkit...');
                        appNode.reload();
                    } else {
                        console.debug(' - Reload page...');
                        $window.location.reload(true);
                    }
                } else if (keyCtrl) {
                    // Fast route reload
                    console.debug(' - Reload route...');
                    $route.reload();
                } else {
                    // Fast state reload
                    console.debug(' - Refresh state...');
                    $state.reload();
                }

                // Clear all previous status messages
                appStatus.logs = [];
                console.clear();
            });
            scope.$on('$destroy', function () {
                $(elem).off('click');
                keyEvent.off('keyup keydown');
            });
        };
    }]).directive('appClose', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.close();
            });
        };
    }]).directive('appDebug', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.debug();
            });
        };
    }]).directive('appKiosk', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.kiosMode();
            });
        };
    }]).directive('appFullscreen', [
    'appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.toggleFullscreen();
            });
        };
    }]).directive('appVersion', [
    'appConfig', 'appNode', function (appConfig, appNode) {
        function getVersionInfo(ident) {
            try  {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) {
            }
            return null;
        }

        return function (scope, elm, attrs) {
            var targ = attrs['appVersion'];
            var val = null;
            if (!targ) {
                val = appConfig.version;
            } else
                switch (targ) {
                    case 'angular':
                        val = angular.version.full;
                        break;
                    case 'nodeweb-kit':
                        val = getVersionInfo('node-webkit');
                        break;
                    case 'node':
                        val = getVersionInfo('node');
                        break;
                    default:
                        val = getVersionInfo(targ) || val;

                        break;
                }
            if (!val && attrs['defaultText']) {
                val = attrs['defaultText'];
            }
            if (val) {
                $(elm).text(val);
            }
        };
    }]).filter('interpolate', [
    'appNode', function (appNode) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appNode.version);
        };
    }]).filter('fromNow', [
    '$filter', function ($filter) {
        return function (dateString, format) {
            try  {
                if (typeof moment !== 'undefined') {
                    return moment(dateString).fromNow(format);
                } else {
                    return ' at ' + $filter('date')(dateString, 'HH:mm:ss');
                }
            } catch (ex) {
                console.error(ex);
                return 'error';
            }
        };
    }]).filter('isArray', function () {
    return function (input) {
        return angular.isArray(input);
    };
}).filter('isNotArray', function () {
    return function (input) {
        return !angular.isArray(input);
    };
}).filter('typeCount', [function () {
        return function (input, type) {
            var count = 0;
            if (input.length > 0) {
                input.forEach(function (itm) {
                    if (!itm)
                        return;
                    if (!itm.type)
                        return;
                    if (itm.type == type)
                        count++;
                });
            }
            return count;
        };
    }]).filter('listReverse', function () {
    return function (input) {
        var result = [];
        var length = input.length;
        if (length) {
            for (var i = length - 1; i !== 0; i--) {
                result.push(input[i]);
            }
        }
        return result;
    };
}).filter('toBytes', function () {
    return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes))
            return '-';
        if (typeof precision === 'undefined')
            precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
}).filter('parseBytes', function () {
    return function (bytesDesc, precision) {
        var match = /(\d+) (\w+)/i.exec(bytesDesc);
        if (match && (match.length > 2)) {
            var bytes = match[1];
            var floatVal = parseFloat(bytes);
            if (isNaN(floatVal) || !isFinite(floatVal))
                return '[?]';
            if (typeof precision === 'undefined')
                precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
            var number = Math.floor(Math.log(floatVal) / Math.log(1024));
            var pow = -1;
            units.forEach(function (itm, i) {
                if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0)
                    pow = i;
            });
            if (pow > 0) {
                var ret = (floatVal * Math.pow(1024, pow)).toFixed(precision);
                return ret;
            }
        }
        return bytesDesc;
    };
}).directive('eatClickIf', [
    '$parse', '$rootScope', function ($parse, $rootScope) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var fn = $parse(attr.eatClickIf);
                return {
                    pre: function link(scope, element) {
                        var eventName = 'click';
                        element.on(eventName, function (event) {
                            var callback = function () {
                                if (fn(scope, { $event: event })) {
                                    // prevents ng-click to be executed
                                    event.stopImmediatePropagation();

                                    // prevents href
                                    event.preventDefault();
                                    return false;
                                }
                            };
                            if ($rootScope.$$phase) {
                                scope.$evalAsync(callback);
                            } else {
                                scope.$apply(callback);
                            }
                        });
                    },
                    post: function () {
                    }
                };
            }
        };
    }]).directive('toHtml', [
    '$sce', '$filter', function ($sce, $filter) {
        function getHtml(obj) {
            try  {
                return 'toHtml:\'pre\' - ' + $filter('toXml')(obj, 'pre');
            } catch (ex) {
                return 'toHtml:error - ' + ex.message;
            }
        }
        return {
            restrict: 'EA',
            scope: {
                toHtml: '&'
            },
            transclude: false,
            controller: function ($scope, $sce) {
                var val = $scope.toHtml();
                var html = getHtml(val);
                $scope.myHtml = $sce.trustAsHtml(html);
            },
            template: '<div ng-bind-html="myHtml"></div>'
        };
    }]).filter('toXml', [function () {
        function toXmlString(name, input, expanded, childExpanded) {
            var val = '';
            var sep = '';
            var attr = '';
            if ($.isArray(input)) {
                if (expanded) {
                    for (var i = 0; i < input.length; i++) {
                        val += toXmlString(null, input[i], childExpanded);
                    }
                } else {
                    name = 'Array';
                    attr += sep + ' length="' + input.length + '"';
                    val = 'Array[' + input.length + ']';
                }
            } else if ($.isPlainObject(input)) {
                if (expanded) {
                    for (var id in input) {
                        if (input.hasOwnProperty(id)) {
                            var child = input[id];
                            if ($.isArray(child) || $.isPlainObject(child)) {
                                val = toXmlString(id, child, childExpanded);
                            } else {
                                sep = ' ';
                                attr += sep + id + '="' + toXmlString(null, child, childExpanded) + '"';
                            }
                        }
                    }
                } else {
                    name = 'Object';
                    for (var id in input) {
                        if (input.hasOwnProperty(id)) {
                            var child = input[id];
                            if ($.isArray(child) || $.isPlainObject(child)) {
                                val += toXmlString(id, child, childExpanded);
                            } else {
                                sep = ' ';
                                attr += sep + id + '="' + toXmlString(null, child, childExpanded) + '"';
                            }
                        }
                    }
                    //val = 'Object[ ' + JSON.stringify(input) + ' ]';
                }
            }
            if (name) {
                val = '<' + name + '' + attr + '>' + val + '</' + name + '>';
            }
            return val;
        }
        return function (input, rootName) {
            return toXmlString(rootName || 'xml', input, true);
        };
    }]).directive('domReplace', function () {
    return {
        restrict: 'A',
        require: 'ngInclude',
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
}).directive('resxInclude', [
    '$templateCache', function ($templateCache) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxInclude;
                var cache = $templateCache.get(ident);
                if (cache) {
                    $element.text(cache);
                    //$element.replaceWith(cache);
                }
                return {
                    pre: function (scope, element) {
                    },
                    post: function (scope, element) {
                    }
                };
            }
        };
    }]).directive('resxImport', [
    '$templateCache', '$document', function ($templateCache, $document) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxImport;
                var cache = $templateCache.get(ident);
                if ($('[resx-src="' + ident + '"]').length <= 0) {
                    var html = '';
                    if (/(.*)(\.css)/i.test(ident)) {
                        if (cache != null) {
                            html = '<style resx-src="' + ident + '">' + cache + '</style>';
                        } else {
                            html = '<link resx-src="' + ident + '" href="' + ident + '" rel="stylesheet" type="text/css" />';
                        }
                    } else if (/(.*)(\.js)/i.test(ident)) {
                        if (cache != null) {
                            html = '<script resx-src="' + ident + '">' + cache + '</script>';
                        } else {
                            html = '<script resx-src="' + ident + '" src="' + ident + '">' + cache + '</script>';
                        }
                    }
                    if (html) {
                        $element.replaceWith(html);
                    }
                }
                return {
                    pre: function (scope, element) {
                    },
                    post: function (scope, element) {
                    }
                };
            }
        };
    }]).run([
    '$rootScope', '$state', 'appConfig', 'appNode', 'appStatus', function ($rootScope, $state, appConfig, appNode, appStatus) {
        // Extend root scope with (global) vars
        angular.extend($rootScope, {
            appConfig: appConfig,
            appNode: appNode,
            status: appStatus,
            startAt: Date.now(),
            state: $state
        });
    }]).run([
    'appConfig', function (appConfig) {
        console.debug(' - Current Config: ', appConfig);
    }]);
;angular.module('prototyped.ng.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('modules/console/views/main.tpl.html',
    '<div class=console><style>.contents.docked {\n' +
    '            padding: 0 !important;\n' +
    '            margin: 0 !important;\n' +
    '        }\n' +
    '\n' +
    '        .console {\n' +
    '            display: flex;\n' +
    '            flex-direction: column;\n' +
    '            width: 100%;\n' +
    '        }\n' +
    '\n' +
    '        .cmd-output {\n' +
    '            width: 100%;\n' +
    '            padding: 6px;\n' +
    '        }</style><div class="dock-tight btn-group btn-group-sm"><a href=./index.html class="btn btn-default pull-left"><i class="glyphicon glyphicon-chevron-left"></i></a><div class="btn-group btn-group-sm pull-right"><a href="" class="btn btn-default dropdown-toggle" data-toggle=dropdown><i class="glyphicon glyphicon-chevron-right"></i> <span class=caret></span></a><ul class=dropdown-menu role=menu><li ng-repeat="itm in myConsole.getProxies()"><a href="" ng-click=myConsole.setProxy(itm.ProxyName)>Switch to {{ itm.ProxyName }}</a></li></ul></div><a href="" class="btn btn-default pull-right" ng-click=myConsole.clear()><i class="glyphicon glyphicon-trash"></i></a><div class="input-group input-group-sm"><label for=txtInput class=input-group-addon>{{ myConsole.getProxyName() }}:</label><input id=txtInput class="cmd-input form-control" tabindex=1 ng-model=txtInput ng-keypress="($event.which === 13)?myConsole.command(txtInput):0" placeholder="Enter Command Here"></div></div><div class="cmd-output dock-fill"><div class=cmd-line ng-repeat="ln in lines"><span class=text-{{ln.type}}><i class=glyphicon title="{{ln.time | date:\'hh:mm:ss\'}}" ng-class="{ \'glyphicon-chevron-right\':ln.type==\'info\', \'glyphicon-ok-sign\':ln.type==\'success\', \'glyphicon-warning-sign\':ln.type==\'warning\', \'glyphicon-exclamation-sign\':ln.type==\'error\' }"></i> <span class=cmd-text>{{ln.text}}</span></span></div></div></div>');
  $templateCache.put('modules/editor/views/main.tpl.html',
    '<div class=text-editor ng-init=myWriter.init()><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/codemirror.min.js></script><link href=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/codemirror.min.css rel=stylesheet><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/xml/xml.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/css/css.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/javascript/javascript.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/htmlmixed/htmlmixed.min.js></script><style resx:import=modules/editor/styles/css/editor.min.css></style><div class="btn-group btn-group-sm dock-tight"><a ng-href="/" ng-click="myWriter.checkUnsaved() && $event.preventDefault()" class="btn btn-default pull-left"><i class="glyphicon glyphicon-chevron-left"></i></a> <a href="" class="btn btn-default pull-left" ng-click=myWriter.newFile()><i class="glyphicon glyphicon-file"></i></a> <a href="" class="btn btn-default pull-left" ng-click=myWriter.openFile() ng-disabled=!myWriter.HasFileSys><i class="glyphicon glyphicon-folder-open"></i></a><div class="btn-group btn-group-sm pull-right"><a href="" ng-disabled=!myWriter.FileLocation class="btn btn-default dropdown-toggle" data-toggle=dropdown><i class="glyphicon glyphicon-save"></i> <span class=caret></span></a><ul class=dropdown-menu role=menu><li ng-class="{\'disabled\': !myWriter.HasFileSys || !myWriter.FileContents}"><a href="" ng-click=myWriter.saveFileAs()><i class="glyphicon glyphicon-floppy-disk"></i> Save file as...</a></li><li ng-class="{\'disabled\': !myWriter.HasFileSys || !myWriter.FileLocation}"><a href="" ng-click=myWriter.openFileLocation() ng-disabled="!myWriter.HasFileSys || !myWriter.FileLocation"><i class="glyphicon glyphicon-save"></i>Open file...</a></li></ul></div><a href="" class="btn btn-default pull-right" ng-click=myWriter.saveFile() ng-disabled="!(myWriter.HasFileSys && myWriter.HasChanges)"><i class="glyphicon glyphicon-floppy-disk"></i></a><div class="input-group input-group-sm"><label for=txtFileName class=input-group-addon>File:</label><input id=txtFileName class="cmd-input form-control" tabindex=1 value={{myWriter.FileLocation}} placeholder="{{ myWriter.FileLocation || \'Create new or open existing...\' }}" ng-readonly="true"></div></div><textarea id=FileContents class="text-area dock-fill" ng-disabled="myWriter.FileContents == null" ng-model=myWriter.FileContents></textarea><input style=display:none id=fileDialog type=file accept=".txt,.json"> <input style=display:none id=saveDialog type=file accept=.txt nwsaveas></div>');
  $templateCache.put('modules/explore/views/addressbar.tpl.html',
    '<div class="view-toolbar btn-group btn-group-sm"><style>#addressbar {\n' +
    '            background: none;\n' +
    '            padding: 0;\n' +
    '            margin: 0;\n' +
    '        }\n' +
    '\n' +
    '            #addressbar li {\n' +
    '                padding: 0;\n' +
    '                margin: 0;\n' +
    '            }</style><a href="" class="btn btn-default pull-right" ng-click=addrBar.openFolder(dir_path) ng-disabled=!dir_parts><i class="glyphicon glyphicon-folder-open"></i></a> <a href="" ng-click=addrBar.back() class="btn btn-default pull-right" ng-disabled=!addrBar.hasHistory()><i class="glyphicon glyphicon-chevron-left"></i></a><div class="input-group input-group-sm"><label class=input-group-addon>Path:</label><div class="form-control nav-address-bar"><ul id=addressbar class=breadcrumb ng-show=dir_parts><li ng-repeat="itm in dir_parts.sequence" data-path={{itm.path}}><a href="" ng-click=addrBar.navigate(itm.path)>{{itm.name}}</a></li></ul><div class=text-error style="padding-left: 8px" ng-show=!dir_parts><i class="glyphicon glyphicon-bullhorn"></i> No access to local file system.</div></div></div></div>');
  $templateCache.put('modules/explore/views/index.tpl.html',
    '<div style="width: 100%" ng:cloak><style>.view-selector {\n' +
    '            padding: 3px;\n' +
    '            margin-right: 8px;\n' +
    '        }\n' +
    '        .view-selector a {\n' +
    '            color: #808080;\n' +
    '            text-decoration: none;\n' +
    '        }</style><div class="view-selector pull-right" ng-init="viewMode = { desc:\'Default View\', css:\'fa fa-th\', view: \'view-med\' }"><div class="input-group pull-left"><a href="" class=dropdown-toggle data-toggle=dropdown aria-expanded=false><i ng-class=viewMode.css></i> {{ viewMode.desc || \'Default View\' }} <span class=caret></span></a><ul class="pull-right dropdown-menu" role=menu><li><a href="" ng-click="viewMode = { desc:\'Large Icons\', css:\'fa fa-th-large\', view: \'view-large\' }"><i class="fa fa-th-large"></i> Large Icons</a></li><li><a href="" ng-click="viewMode = { desc:\'Medium Icons\', css:\'fa fa-th\', view: \'view-med\' }"><i class="fa fa-th"></i> Medium Icons</a></li><li><a href="" ng-click="viewMode = { desc:\'Details View\', css:\'fa fa-list\', view: \'view-details\' }"><i class="fa fa-list"></i> Details View</a></li><li class=divider></li><li><a href="" ng-click="viewMode = { desc:\'Default View\', css:\'fa fa-th\', view: \'view-med\' }">Use Default</a></li></ul></div></div><h4>File Browser <small>Explore files and folders on your local system</small></h4><div id=fileExplorer ng-class=viewMode.view><div proto:address-bar></div><div class=loader ng-show=isBusy><br><em style="padding: 24px">Loading...</em></div><div ng-show="!isBusy && dir_path"><div class=folder-contents ng-if="!folders.length && !files.length"><em>No files or folders were found...</em></div><div class=folder-contents ng-if=folders.length><h5>File Folders</h5><div id=files class=files><a href="" class="file centered" ng-click=ctrlExplorer.navigate(itm.path) ng-repeat="itm in folders"><div class=icon><i class="glyphicon glyphicon-folder-open" style="font-size: 32px"></i></div><div class="name ellipsis">{{ itm.name }}</div></a></div></div><div class=folder-contents ng-if=files.length><h5>Application Files</h5><div id=files class=files><a href="" class="file centered" ng-repeat="itm in files" ng-class="{ \'focus\' : (selected == itm.path)}" ng-click=ctrlExplorer.select(itm.path) ng-dblclick=ctrlExplorer.open(itm.path)><div class=icon ng-switch=itm.type><i ng-switch-default class="fa fa-file-o" style="font-size: 32px"></i> <i ng-switch-when=blank class="fa fa-file-o" style="font-size: 32px"></i> <i ng-switch-when=text class="fa fa-file-text-o" style="font-size: 32px"></i> <i ng-switch-when=image class="fa fa-file-image-o" style="font-size: 32px"></i> <i ng-switch-when=pdf class="fa fa-file-pdf-o" style="font-size: 32px"></i> <i ng-switch-when=css class="fa fa-file-code-o" style="font-size: 32px"></i> <i ng-switch-when=html class="fa fa-file-code-o" style="font-size: 32px"></i> <i ng-switch-when=word class="fa fa-file-word-o" style="font-size: 32px"></i> <i ng-switch-when=powerpoint class="fa fa-file-powerpoint-o" style="font-size: 32px"></i> <i ng-switch-when=movie class="fa fa-file-movie-o" style="font-size: 32px"></i> <i ng-switch-when=excel class="fa fa-file-excel-o" style="font-size: 32px"></i> <i ng-switch-when=compressed class="fa fa-file-archive-o" style="font-size: 32px"></i></div><div class="name ellipsis">{{ itm.name }}</div></a></div></div></div><div ng-show="!isBusy && !dir_path"><br><h5><i class="glyphicon glyphicon-warning-sign"></i> Warning <small>All features not available</small></h5><div class="alert alert-warning"><p><b>Please Note:</b> You are running this from a browser window.</p><p>For security reasons, web browsers do not have permission to use the local file system, or other advanced operating system features.</p><p>To use this application with full functionality, you need an elevated runtime (<a href=/about/info>see this how to</a>).</p></div></div></div></div>');
  $templateCache.put('views/about/connections.tpl.html',
    '<div ng:cloak style="width: 100%"><div ng-if=!state.showRaw class=results ng-init=detect()><div class="icon pull-left left"><i class="glyphicon glyphicon-globe"></i> <i class="sub-icon glyphicon" ng-class=getStatusColor()></i></div><div class="info pull-left"><div><div class=pull-right><a class=ctrl-sm ng-click="state.editMode = true" href=""><i class="glyphicon glyphicon-pencil"></i></a></div><h4 ng-if=!state.editMode><a href="{{ state.location }}">{{ state.location }}</a></h4></div><div ng-if=!state.editMode><div ng-if=state.location><p class=info-row><div class="info-col-primary pull-left">Protocol: <span class="btn-group btn-group-xs" role=group aria-label=...><button type=button ng-disabled=state.requireHttps class="btn btn-default" ng-click="setProtocol(\'http\')" ng-class="state.requireHttps ? \'disabled\' : getProtocolStyle(\'http\', \'btn-warning\')"><i class=glyphicon ng-class="getStatusIcon(\'glyphicon-eye-open\')" ng-if="state.location.indexOf(\'http://\') == 0"></i> HTTP</button> <button type=button class="btn btn-default" ng-click="setProtocol(\'https\')" ng-class="getProtocolStyle(\'https\')"><i class=glyphicon ng-class="getStatusIcon(\'glyphicon-eye-close\')" ng-if="state.location.indexOf(\'https://\') == 0"></i> HTTPS</button></span></div><div class="info-col-secondary pull-right"><span class="btn-group btn-group-xs" role=group><a ng-if=result.info class="btn btn-default" href="" ng-click="state.activeTab = (state.activeTab == \'result\') ? null : \'result\'" ng-class="{\'btn-info\':(state.activeTab == \'result\'), \'btn-default\':(state.activeTab != \'result\')}"><i class="glyphicon glyphicon-file"></i> View Result</a> <a ng-if=state.location class=btn href="" ng-click="state.activeTab = (state.activeTab == \'preview\') ? null : \'preview\'" ng-class="{\'btn-info\':(state.activeTab == \'preview\'), \'btn-default\':(state.activeTab != \'preview\')}"><i class=glyphicon ng-class="{\'glyphicon-eye-close\':state.showPreview, \'glyphicon-eye-open\':!state.showPreview}"></i> {{ state.showPreview ? \'Hide\' : \'Show\' }} Preview</a></span></div><br class="clearfix"></p><p class=info-row><div class="info-col-primary pull-left" ng-if=result><div class=info-col-ellipse>Latency: {{ result.received - result.sent }}ms <span ng-if=latency.desc ng-class=latency.style>(<em>{{ latency.desc }}</em>)</span></div></div><div class="info-col-primary pull-left" ng-if=!result><em>Checking...</em></div><div class="info-col-secondary pull-right"><span ng-if="status.code >= 0" class="pull-right label" ng-class=status.style title="Status: {{ status.desc }}, Code: {{ status.code }}">{{ status.desc }}: {{ status.code }}</span></div><br class="clearfix"></p></div><div ng-if="result != null"><p><div class="alert alert-warning" ng-if="result.valid && state.protocol == \'http\'"><i class="glyphicon glyphicon-eye-open"></i> <b>Warning:</b> The web connection <b class=text-danger>is not secure</b>, use <a href="" ng-click="setProtocol(\'https\')">HTTPS</a>.</div><div class="alert alert-success" ng-if="result.valid && state.protocol == \'https\'"><i class="glyphicon glyphicon-ok"></i> <b>Validated:</b> The web connection looks secure.</div><div class="alert alert-danger" ng-if="!result.valid && result.error && result.error != \'error\'"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Failed:</b> {{ result.error }}</div><div class="alert alert-danger" ng-if="!result.valid && !(result.error && result.error != \'error\')"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Offline:</b> Connection could not be established.</div></p></div></div><form ng-if=state.editMode><div class=form-group><h4 class=control-label for=txtTarget>Enter the website URL to connect to:</h4><input class=form-control id=txtTarget ng-model=state.location></div><div class=form-group><div class=checkbox><label><input type=checkbox ng-model=state.requireHttps> Require secure connection</label></div><div class=checkbox ng-class="\'disabled text-muted\'" ng-if=state.requireHttps><label><input type=checkbox ng-model=state.requireCert ng-disabled=true> Requires Client Certificate</label></div></div><div class=form-group ng-show=state.requireCert><label for=exampleInputFile>Select Client Certificate:</label><input type=file id=exampleInputFile><p class=help-block>This must be a valid client certificate.</p></div><button type=submit class="btn btn-primary" ng-click=submitForm()>Update</button></form></div></div><div ng-if="state.activeTab == \'preview\'" class="panel panel-default"><div class=panel-heading><b class=panel-title><i class="glyphicon glyphicon-globe"></i> <a target=_blank href="{{ state.location }}">{{ state.location }}</a></b></div><div class="panel-body info-row iframe-body" style="min-height: 480px"><iframe class=info-col-primary ng-src="{{ state.location }}" frameborder=0>IFrame not available</iframe></div></div><div ng-if="state.activeTab == \'result\'" class=source><span class=pull-right><a class="btn btn-sm btn-primary" ng-click="state.activeTab = null">Close</a></span> <samp><pre>{{ result.info }}</pre></samp></div></div><style>.results {\n' +
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
    '    .info-row {\n' +
    '        display: flex;\n' +
    '    }\n' +
    '\n' +
    '    .info-row-links {\n' +
    '        color: silver;\n' +
    '    }\n' +
    '\n' +
    '        .info-row-links a {\n' +
    '            color: #4a4a4a;\n' +
    '            margin-left: 8px;\n' +
    '        }\n' +
    '\n' +
    '            .info-row-links a:hover {\n' +
    '                color: #000000;\n' +
    '            }\n' +
    '\n' +
    '    .info-col-primary {\n' +
    '        flex-grow: 1;\n' +
    '        flex-shrink: 1;\n' +
    '    }\n' +
    '\n' +
    '    .info-col-secondary {\n' +
    '        flex-grow: 0;\n' +
    '        flex-shrink: 0;\n' +
    '    }\n' +
    '\n' +
    '    .iframe-body {\n' +
    '        margin: 0;\n' +
    '        padding: 0;\n' +
    '    }\n' +
    '\n' +
    '        .iframe-body iframe {\n' +
    '            margin: 0;\n' +
    '            padding: 0;\n' +
    '        }</style>');
  $templateCache.put('views/about/contact.tpl.html',
    '<div style="width: 100%"><h4>About <small>Contact Us Online</small></h4><hr><div><i class="fa fa-home"></i> Visit our home page - <a href=http://www.prototyped.info>www.prototyped.info</a></div><hr></div>');
  $templateCache.put('views/about/info.tpl.html',
    '<div id=about-info style="width: 100%"><style resx:import=assets/css/images.min.css></style><div class=row><div class="col-lg-8 col-md-12 info-overview"><h4>About <small>your current status and application architecture</small></h4><hr><div class=row><div class="col-md-3 panel-left"><h5><i class="fa fa-gear"></i> My Client <small><span ng-if=true class=ng-cloak><b app:version ng-class="{ \'text-success glow-green\': appInfo.version }">loading...</b></span> <span ng-if=false><b class="text-danger glow-red"><i class="glyphicon glyphicon-remove"></i> Offline</b></span></small></h5><div ng:if=true><a class="panel-icon-lg img-terminal"><div ng:if="info.about.browser.name == \'Chrome\'" class="panel-icon-inner img-chrome"></div><div ng:if="info.about.browser.name == \'Chromium\'" class="panel-icon-inner img-chromium"></div><div ng:if="info.about.browser.name == \'Firefox\'" class="panel-icon-inner img-firefox"></div><div ng:if="info.about.browser.name == \'Internet Explorer\'" class="panel-icon-inner img-iexplore"></div><div ng:if="info.about.browser.name == \'Opera\'" class="panel-icon-inner img-opera"></div><div ng:if="info.about.browser.name == \'Safari\'" class="panel-icon-inner img-safari"></div><div ng:if="info.about.browser.name == \'SeaMonkey\'" class="panel-icon-inner img-seamonkey"></div><div ng:if="info.about.browser.name == \'Spartan\'" class="panel-icon-inner img-spartan"></div><div ng:if="info.about.os.name == \'Windows\'" class="panel-icon-overlay img-windows"></div><div ng:if="info.about.os.name == \'MacOS\'" class="panel-icon-overlay img-mac-os"></div><div ng:if="info.about.os.name == \'Apple\'" class="panel-icon-overlay img-apple"></div><div ng:if="info.about.os.name == \'UNIX\'" class="panel-icon-overlay img-unix"></div><div ng:if="info.about.os.name == \'Linux\'" class="panel-icon-overlay img-linux"></div><div ng:if="info.about.os.name == \'Ubuntu\'" class="panel-icon-overlay img-ubuntu"></div></a><p class=panel-label title="{{ info.about.os.name }} @ {{ info.about.os.version.alias }}">Host System: <b ng:if=info.about.os.name>{{ info.about.os.name }}</b> <em ng:if=!info.about.os.name>checking...</em> <span ng:if=info.about.os.version.alias>@ {{ info.about.os.version.alias }}</span></p><p class=panel-label title="{{ info.about.browser.name }} @ {{ info.about.browser.version.major }}.{{ info.about.browser.version.minor }}{{ info.about.browser.version.build ? \'.\' + info.about.browser.version.build : \'\' }}">User Agent: <b ng:if=info.about.browser.name>{{ info.about.browser.name }}</b> <em ng:if=!info.about.browser.name>detecting...</em> <span ng:if=info.about.browser.version>@ {{ info.about.browser.version.major }}.{{ info.about.browser.version.minor }}{{ info.about.browser.version.build ? \'.\' + info.about.browser.version.build : \'\' }}</span></p></div><div ng-switch=info.about.hdd.type class=panel-icon-lg><a ng-switch-default class="panel-icon-lg inactive-gray img-drive"></a> <a ng-switch-when=true class="panel-icon-lg img-drive-default"></a> <a ng-switch-when=onl class="panel-icon-lg img-drive-onl"></a> <a ng-switch-when=usb class="panel-icon-lg img-drive-usb"></a> <a ng-switch-when=ssd class="panel-icon-lg img-drive-ssd"></a> <a ng-switch-when=web class="panel-icon-lg img-drive-web"></a> <a ng-switch-when=mac class="panel-icon-lg img-drive-mac"></a> <a ng-switch-when=warn class="panel-icon-lg img-drive-warn"></a> <a ng-switch-when=hist class="panel-icon-lg img-drive-hist"></a> <a ng-switch-when=wifi class="panel-icon-lg img-drive-wifi"></a><div ng:if=info.about.webdb.active class="panel-icon-inset-bl img-webdb"></div></div><p ng:if=info.about.webdb.active class="panel-label ellipsis">Local databsse is <b class=glow-green>Online</b></p><p ng:if=!info.about.webdb.active class="panel-label text-muted ellipsis"><em>No local storage found</em></p><p ng:if=!info.about.webdb.active class="panel-label text-muted"><div class=progress ng-style="{ height: \'10px\' }" title="{{(100 * progA) + \'%\'}} ( {{info.about.webdb.used}} / {{info.about.webdb.size}} )"><div ng:init="progA = (info.about.webdb.size > 0) ? (info.about.webdb.used||0)/info.about.webdb.size : 0" class=progress-bar ng-class="\'progress-bar-info\'" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"></div></div></p></div><div ng-init="tabOverviewMain = 0" ng-switch=tabOverviewMain class="col-md-6 panel-mid"><h5><span ng-if="info.about.server.active == undefined">Checking...</span> <span ng-if="info.about.server.active != undefined">Current Status</span> <small><span ng-if=!info.about.server><em class=text-muted>checking...</em></span> <span ng-if="info.about.server.active === false"><b class="text-danger glow-red">Offline</b>, faulty or disconnected.</span> <span ng-if="info.about.server.active && appNode.active">Connected via <b class="text-warning glow-orange">web client</b>.</span> <span ng-if="info.about.server.active && !appNode.active"><b class="text-success glow-green">Online</b> and fully operational.</span></small></h5><p class=ellipsis ng:if=info.about.server.url>Server Url: <a target=_blank ng-class="{ \'glow-green\':appNode.active || info.about.protocol == \'https\', \'glow-blue\':!appNode.active && info.about.protocol == \'http\', \'glow-red\':info.about.protocol == \'file\' }" ng-href="{{ info.about.server.url }}">{{ info.about.server.url }}</a></p><p><a href="" ng-click="tabOverviewMain = 0">Summary</a> | <a href="" ng-click="tabOverviewMain = 1">Details</a></p><div><div ng-switch-default><em>Loading...</em></div><div ng-switch-when=0><p>...</p></div><div ng-switch-when=1><pre>OS: {{ info.about.os }}</pre><pre>Browser: {{ info.about.browser }}</pre><pre>Server: {{ info.about.server }}</pre><pre>WebDB: {{ info.about.webdb }}</pre><pre>HDD: {{ info.about.hdd }}</pre></div></div></div><div class="col-md-3 panel-right"><h5><i class="fa fa-gear"></i> Web Server <small><span class=ng-cloak><b ng-class="{ \'text-success glow-green\': info.about.server.active, \'text-danger glow-red\': info.about.server.active == false }" app:version=server default-text="{{ info.about.server.active ? (info.about.server.active ? \'Online\' : \'Offline\') : \'n.a.\' }}">requesting...</b></span></small></h5><div ng:if=info.about.server.local><a class="panel-icon-lg img-server-local"></a></div><div ng:if=!info.about.server.local ng-class="{ \'inactive-gray\': true || info.versions.jqry }"><a class="panel-icon-lg img-server"><div ng:if="info.about.server.type == \'iis\'" class="panel-icon-inset img-iis"></div><div ng:if="info.about.server.type == \'node\'" class="panel-icon-inset img-node"></div><div ng:if="info.about.server.type == \'apache\'" class="panel-icon-inset img-apache"></div><div ng:if="info.about.server.name == \'Windows\'" class="panel-icon-overlay img-windows"></div><div ng:if="info.about.server.name == \'MacOS\'" class="panel-icon-overlay img-mac-os"></div><div ng:if="info.about.server.name == \'Apple\'" class="panel-icon-overlay img-apple"></div><div ng:if="info.about.server.name == \'UNIX\'" class="panel-icon-overlay img-unix"></div><div ng:if="info.about.server.name == \'Linux\'" class="panel-icon-overlay img-linux"></div></a><div ng:if=info.about.sql class="panel-icon-lg img-sqldb"></div></div></div></div><hr></div><div class="col-lg-4 hidden-md" ng:init="info.showUnavailable = false"><h4>Inspirations <small>come from great ideas</small></h4><hr><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.ng }" ng:hide="!info.showUnavailable && !info.versions.ng"><a class=app-info-icon target=_blank href="https://angularjs.org/"><div ng:if=true class="img-clipper img-angular"></div></a><div class=app-info-info><h5>Angular JS <small><span ng:if=info.versions.ng>@ v{{info.versions.ng}}</span> <span ng:if=!info.versions.ng><em>not found</em></span></small></h5><p ng:if=!info.versions.ng class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href="https://angularjs.org//">angularjs.org</a> for more info.</p><p ng:if=info.detects.ngUiUtils class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Utils found.</p><p ng:if=info.detects.ngUiRouter class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Router found.</p><p ng:if=info.detects.ngUiBootstrap class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Bootrap found.</p><p ng:if=info.detects.ngAnimate class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular Animations active.</p></div></div><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.nw }" ng:hide="!info.showUnavailable && !info.versions.nw"><a class=app-info-icon target=_blank href="http://nwjs.io/"><div ng:if=true class="img-clipper img-nodewebkit"></div></a><div class=app-info-info><h5>Node Webkit <small><span ng:if=info.versions.nw>@ v{{info.versions.nw}}</span> <span ng:if=!info.versions.nw><em>not available</em></span></small></h5><p ng:if=!info.versions.nw class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href="http://nwjs.io/">nwjs.io</a> for more info.</p><p ng:if=info.versions.nw class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are connected to node webkit.</p><p ng:if=info.versions.chromium class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running Chromium @ {{ info.versions.chromium }}.</p></div></div><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.njs }" ng:hide="!info.showUnavailable && !info.versions.njs"><a class=app-info-icon target=_blank href=http://www.nodejs.org><div ng:if=true class="img-clipper img-nodejs"></div></a><div class=app-info-info><h5>Node JS <small><span ng:if=info.versions.njs>@ v{{info.versions.njs}}</span> <span ng:if=!info.versions.njs><em>not available</em></span></small></h5><p ng:if=!info.versions.njs class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href=http://www.nodejs.org>NodeJS.org</a> for more info.</p><p ng:if=info.versions.njs class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are inside a node js runtime.</p><p ng:if=info.versions.v8 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running V8 @ {{ info.versions.v8 }}.</p><p ng:if=info.versions.openssl class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running OpenSSL @ {{ info.versions.openssl }}.</p></div></div><div class="app-aside-collapser centered" ng-if=!appNode.active><a href="" ng:show=!info.showUnavailable ng-click="info.showUnavailable = !info.showUnavailable">Show More</a> <a href="" ng:show=info.showUnavailable ng-click="info.showUnavailable = !info.showUnavailable">Hide Inactive</a></div><hr><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.html }"><div class=app-info-icon><div ng:if="info.about.browser.name != \'Internet Explorer\'" class="img-clipper img-html5"></div><div ng:if="info.about.browser.name == \'Internet Explorer\'" class="img-clipper img-html5-ie"></div></div><div class=app-info-info><h5>HTML Rendering Mode <small><span ng-if=info.versions.html>@ v{{ info.versions.html }}</span> <span ng-if=!info.versions.html><em>unknown</em></span></small></h5><p ng:if="info.versions.html >= \'5.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running a modern browser.</p><p ng:if="info.versions.html < \'5.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> Your browser is out of date. Try upgrading.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.js }"><div class=app-info-icon><div ng:if=!info.versions.v8 class="img-clipper img-js-default"></div><div ng:if=info.versions.v8 class="img-clipper img-js-v8"></div></div><div class=app-info-info><h5>Javascript Engine<small><span ng:if=info.versions.js>@ v{{ info.versions.js }}</span> <span ng:if=!info.versions.js><em>not found</em></span></small></h5><p ng:if="info.versions.js >= \'5.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You have a modern javascript engine.</p><p ng:if="info.versions.js < \'5.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> Javascript is out of date or unavailable.</p><p ng:if=info.versions.v8 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Javascript V8 engine, build v{{info.versions.v8}}.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.css }"><div class=app-info-icon><div ng:if=true class="img-clipper img-css3"></div></div><div class=app-info-info><h5>Cascading Styles <small><span ng:if=info.versions.css>@ v{{ info.versions.css }}</span> <span ng:if=!info.versions.css><em class=text-muted>not found</em></span></small></h5><p ng:if="info.versions.css >= \'3.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>You have an up-to-date style engine.</span></p><p ng:if="info.versions.css < \'3.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <span>CSS out of date. Styling might be broken.</span></p><p ng:if=info.css.boostrap2 class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <span>Bootstrap 2 is depricated. Upgrade to 3.x.</span></p><p ng:if=info.css.boostrap3 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>Bootstrap and/or UI componets found.</span></p><p ng:if=info.detects.less class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>Support for LESS has been detected.</span></p><p ng:if=info.detects.bootstrap class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Bootstrap and/or UI Componets found.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.jqry }"><div class=app-info-icon><div ng:if=true class="img-clipper img-jquery"></div></div><div class=app-info-info><h5>jQuery <small><span ng:if=info.versions.jqry>@ v{{ info.versions.jqry }}</span> <span ng:if=!info.versions.jqry><em>not found</em></span></small></h5><p ng:if=info.versions.jqry class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> jQuery or jqLite is loaded.</p><p ng:if="info.versions.jqry < \'1.10\'" class=text-danger><i class="glyphicon glyphicon-warning-sign glow-orange"></i> jQuery is out of date!</p></div></div><hr></div></div></div>');
  $templateCache.put('views/about/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.info><i class="fa fa-info-circle"></i>&nbsp; About this app</a></li><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.online><i class="fa fa-globe"></i>&nbsp; Visit us online</a></li><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.conection><i class="fa fa-plug"></i>&nbsp; Check Connectivity</a></li></ul>');
  $templateCache.put('views/common/components/contents.tpl.html',
    '<div id=contents class=contents><div id=left ui:view=left xxx-ng:include=views/common/components/left.tpl.html ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div><div id=main ui:view=main xxx-ng:include=views/common/components/main.tpl.html><em>Main View</em></div></div>');
  $templateCache.put('views/common/components/footer.tpl.html',
    '<span class=pull-left><label ng:show="status.logs | typeCount:\'error\'" class=ng-cloak><i class="glyphicon glyphicon-exclamation-sign glow-red"></i> <a href="" class=ng-cloak>Errors ({{ status.logs | typeCount:\'error\' }})</a></label><label ng:show="status.logs | typeCount:\'warn\'" class=ng-cloak><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <a href="" class=ng-cloak>Warnings ({{ status.logs | typeCount:\'warn\' }})</a></label></span> <span ng:if=false><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></span> <span ng:if=true class=ng-cloak>Client Version: <span app:version><em>Loading...</em></span> |</span> <span ui:view=foot>Powered by <a href="https://angularjs.org/">AngularJS</a> <span ng:if=appNode.active class=ng-cloak>&amp; <a href=https://github.com/rogerwang/node-webkit>Node Webkit</a></span></span> <span ng:if=startAt class=ng-cloak>| Started {{ startAt | fromNow }}</span>');
  $templateCache.put('views/common/components/left.tpl.html',
    '<div id=left ui:view=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div>');
  $templateCache.put('views/common/components/main.tpl.html',
    '<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml><head><title></title></head><body></body></html>');
  $templateCache.put('views/common/components/menu.tpl.html',
    '<div id=menu class=dragable><div class=pull-right><a ui:sref=default class="btn btn-default">Home</a></div><div ui:view=menu><ul class="nav navbar-nav"><li ui:sref-active=open><a ui:sref=default>Default</a></li><li ui:sref-active=open ng:repeat="route in appConfig.routers | orderBy:\'(priority || 1)\'" ng:if="route.menuitem && (!route.visible || route.visible())"><a ng:if=route.menuitem.state ui:sref="{{ route.menuitem.state }}">{{ route.menuitem.label }}</a> <a ng:if=!route.menuitem.state ng:href="{{ route.url }}">{{ route.menuitem.label }}</a></li></ul></div></div>');
  $templateCache.put('views/default.tpl.html',
    '<div id=cardViewer class="docked float-left card-view card-view-x"><style resx:import=assets/css/prototyped.min.css></style><style>.contents {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '            background: #E0E0E0!important;\n' +
    '        }</style><div class="slider docked"><a class="arrow prev" href="" ng-show=false ng-click=showPrev()><i class="glyphicon glyphicon-chevron-left"></i></a> <a class="arrow next" href="" ng-show=false ng-click=showNext()><i class="glyphicon glyphicon-chevron-right"></i></a><div class=boxed><a class="card fixed-width slide" ng-class="{ \'inactive-gray-25\': route.cardview.ready === false }" ng-repeat="route in pages | orderBy:\'(priority || 1)\'" ng-if="route.cardview && (!route.visible || route.visible())" ng-href={{route.url}} ng-class="{ \'active\': isActive($index) }" ng-swipe-right=showPrev() ng-swipe-left=showNext()><div class=card-image ng-class=route.cardview.style><div class=banner></div><h2>{{route.cardview.title}}</h2></div><p>{{route.cardview.desc}}</p></a></div><ul class="small-only slider-nav"><li ng-repeat="page in pages" ng-class="{\'active\':isActive($index)}"><a href="" ng-click=showPhoto($index); title={{page.title}}><i class="glyphicon glyphicon-file"></i></a></li></ul></div></div>');
}]);
;angular.module('prototyped.ng.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';
	  $templateCache.put('assets/css/app.min.css',"@import url(https://cdnjs.cloudflareęom/ajax/libs/nĄmaĭze/3.0.2ıĳĵiķ.minęss);ĀĂĄĆĈĊČĎĐĒĴxĔŇbootstrapřĤĦśŝşšpĹ.ĺľcŉ/ŧŞŠŢńņňŊŌāăąćĉċčďđēĕėęěĝğġģcĥħĩīĭįħnguĠr-ěadņg-bġ/ļ6ĻĬoƝƟơġŷŇŰźōŽŐƀœƃĒřƇĚĜĞƙƍƏĨĪĬĮİanāatƍűŮƧǆǈǊƮŹŋƲŏſŒƂŕƅĖĘƻƊƾťƐǂƓİfont-awesĥĸ4ŭƧư/ǦǨǪǬǮmģŅƯŉŋśdy{Ǝěr:#3Ȋ;Ƕǩsłe:11pxȌǧǩfaŅly:Verdǆa,GenevȥTahĥȥsǆs-sȡif;ƞspĠȞğeȖɀx-ƞĢctiǧ:ȅumn}#ǻnu{Ĵrgņ:6ȕ;pƝƞƖ:3ɝȻȽaȞběck;śȢȡ:dŝǊd Ȕx gšyɑɓućlɖġən:0ɞɠƟʇɾȨʀƘ ĭʃɘɚʈɟdɡgʇȺiȼȾ:ņĭȩ;ĭşȵtylȑĲȩʍɔʁʑi a{ǊxǩdeƎšɉɋʬeɑƎǨȨŞ{ɦʟɃȌʪɄɆʺʽʆrow;ǽ-heigČ:520ȕɑʪftʓʅɛɝʗʙɣɝɃ-ɻ˒ʛ˭shrņk˱ˋƬȏĐ21˟Ȗɯʹȇɳčeɶɸɺɼɾaņ˥ɚɜȖ˩ʋɤɂ˹˯wȒˊɁȵ˴˶̙́ɱ̄ɵɷȕ̉ɨ̋ņ h2̎ʆʖʊɢ̔ ʈȍȵȐȒ8ˬȘ-Ǭ˙˛700̨n̪5̭ʇ̳ ̐ʉʘ̓ɝ̠ƚśčĥ:Ǯĭ̥̇#f2͛͛ȗǷ̽˚t:śl̂̓ͅ sĴlʂʶǩwŪ:avoid;ovȡğ˰hͷʹn;wͿǊȵɟcʫ˒Ū;ͯ-ͺͼě̘eͭiďʝͨ˴͇̹ɹ͂ɒ̌̈́ę˄ȡ̆ʵɁǩŁgʆΉ˃rɑǦŝȡ͇̱͋̒ˬ̖ˑ̴̘˹˳˵n˷λ̛Ƣ˻:24͏Ą̂ɲɴ̤̆ɹɻ̧"['']().decompress());
	  $templateCache.put('assets/css/prototyped.min.css',"body .docked{flex-grow:1;čď-shrinkĖ;display:ęx;heightĖ00%;overčĔ:none}ĀĂĄĆĈ-tıĳČĎĐĒĿ0ĘŐěĝğġ0Ņāăąćk-fillŏĚŒĕėĬŗĞĠĖŜŇ.eťipsĥ{tďt-wrap:avoidĹĻĽlĿhƇden;wƎŻěpaceŀĔƀp;ŻxŽĺļľĕŴlŶŸsűŞdƀgabĎ{žebkiŽƁp-regił:Ưag;ƶƸƺ-usļěŴecĴŁŃƭĄǕ-ǅƱƳeƵwƷƹƻpƽƿǁǃŁǚưǈǠǊŽǍǏǎĎǓƃutoǗ.ğƙŌĻđƀy{oƘcƺĪ.5ĘŤŻrƃlpha(ȃƙȆ=50)ȊlȌ:ĒĩscaĎ(1Ķ%) Ȕȅty(0ȈȚǉǢŢȋļȞȀȡȣeȥȧȩȫȆȯȱǈmozȵȜȷȣȐȒɀȭȗșǈoɈȝɋȑȓȄȖȘ)ǹǻǓiǾȟĪhƤrȂəȭ:.75!importantțɕȏɗɎy=ɬ)ɮɰɲɴɶɸȷɢȺȤȦķȿɨȮȰɿʁɱɳɵɷȳǋţɉȍʈȢʊȾȪʎɂɿɄɆɔɊɺɍʎɾ5ʀɯʓʄʖɓʙɹɌɘȕɏʑʮʃʕɝnǼɠeǿĩ-25ɧʷȇ˅ʆȍɖʩˈ=˅ȚʳʇȹʝȼʋȨʠˈɂˑǬǡʘȶʛ˕ȻȽʌ˚Ȭʏ.˝-Ʌɇ˓ˌʨʶ˨ːʬɒʦ˰ʵɼ˴ɜņŞɞǽˁɢ˄5:ɤƊˇ˨ɪɬʒʻʅ˯Ȏ˹ʪʹʂʔ̎ˡȸȠ˖˥˙ɼʢʬ̌̕ʖǭȴ̏ʜˤ˘ʍ˛ʐ˵ˬʥ̏ˍ˲Ȗ̓ʯʕ˶̯˱˺̳̍tʽʿɡȀ-Ȧ̈Ȇɪū̗̰˺Ȧ˒̗̦ʞ˦̝Ȱ1Ỵ̄ˠʚ̘yʉ˗ʟ͐.͒ʤˮ̸͇ʪ̶͊̑͡ˏ͊̽ɟ̿˃Ȧ̅ɥ̓ɩɫɭʺ̡ˋ̐ɻ̟̒͵ʰͷ͍͚͏ʡ̫ʭ̔ͽʗŽ̥ˣ͎̜΂ͳȲ˭˷͸ˎ˳̺Ͷ-ʲͦ͹ˏΕʰͪ̀-ǓrŦɼɪ6ȉ̷ͧ˳Φ͖͋Ϳ̛̩˨ɂΫ˞ǮΑή̨˧ɁȰγ̭͖͈͠ʪμΘο͢ˏΫǹgƌwǿeƑ{coƌȍ#ĶbȘŔơŽĜaĆĕ0 ϟ2px ϔ0ϖĶψϊƾĊϏϑɲ:#DĶƠżŗϜœϠ ϢϤϲϩ˽ĄωĔΗƀngǞϐϒϱff8dϴϙϷϝ:ϟϡϣϥЌЎϿŝЁϫƳuЈϯϓĶ94ЌϵƢВϹЖϽФЦfǹƿsuȜs{mğžƇth:480ϣģĥħĩīŐбeгеĄiϐnзarǁnД 8тfłϚizƛ12јĭwлнѠѢ̠ͽįōĴѧϣѩ̵ɱŸŌǃƿĨ̀ŕŨēϞѹĐĜŮŚщыtsэяĄгb-юłČћěѝƛ64ѯͼ̵Ѥdм:ғҕ΅̵ѫĲĴҜxѰʅѲƺǂѕƲsϑǶe;ĞҡДƠȃҳmђєŋҵʋϣ҂д҄эnњёѓğі16тиn-ҠĳĖѡӊйҘҚ3ĶтĤĦĨĪğƩŃ-ƳŠѽǿĿūŖѿřŰЀ.вҿ҅Ǻӂo h4ź϶ſƁƃƅƇƉƥϊ̅ƏƑƓƕˁĦƙƛŁӸƟБɥƦ:ƨƪĥҾьӰњӳ4 aϮЊϦśӫğњƾĔ{әхĪĬʽԡѻ-ӞkжЉϰŸlƊԩɓԫԭ҅Ԛ԰ϓ4aԽԽ;ҷӅӌĎfĴѢԵԢϋԸԙͯ̇ԻϱĶԞМԕɓЉ-pĞՂȁŬũĢŬӨů1Չ՗ǎяdђ՜Ŗ՞ŔՠŘůՓŲԠɓɥview{ƊŌʝ-ȣıѕǷpՉյշwĄƘŃlҋяԬg{ӔѦӑĭӎѭ֓;ƘdĤІҶҸӆϟaǶӲȦӘфӛ:ӡĈ֘oѳҩ:ѶaѸbƙkŒundϬpeֱƜֺּɷֳĈֶָҐўǵǷ ѮĭֵׂēַֹҧѴցȃ ƚɶļքƊնոֈɵŴ֌ł֎מ֊סӌğŃɦ֑:9ϼĮİҲ׭ӊ֞ѕӉϤ֡Ƿ;׍ֹׄƿֻֽǩ׾׀׺ִ׼׆ƛ׸Ӳ8׶؄׃׏ׅג֮חȌזƑȌךļלև.։נҌՄgפ؞֍ɥӛ{ұӏŔĀtǷmҳ׫пт֕оѢ֭֫ǃҫҭŻ؍׎oאֿ؀Զe׿ׁ؅؏ֹŸׇ؉ ر׌نؾؐ֬Ҩǃւؕטrؘrؚآ֋؟ף؜ןٝ֍ğǎt֐ѥос֔װӏ4٪Ձ״ҳՅĴ2Ҕ׌oجoخŔؑظbҬlҮؼ؆؂فـم؎ِوґ׈Ӳٮт׻ه՘ْד:ؓļٖؗԟӱΗכֆٜצٟ؝٢ע٤eŽƳӄєҳٽҪٿغүڑڊڇ־څڈؽؿڭږؖژڗrƓ٨ңׯѬқٶ;ٳĵڐٸحۉَډؿى؈֢ ңٙٛ٠ץĨbŴڪӆ׶ԙ֢ШƻƩgѕھۢžƞӺƆƈԍӿƎ֚ԂƔƺԅȄԈƝƁۨۮĿԐŷԒڛԡօםۘנиċБտۥڻٗՉɴٿĄt՚Һp{֛֙gۍ׺ɲƐrܓƜŃՁйس3рۊrܜܓԬeՆƾϜiǍҳĀܧǏւƾѬܭĤܰձ˾mgΠƩǤļ٧ҙнٍۃҲ݆ܖğܘŔՂګ3З؉ۨ܉ۦڼڿڲؿڶڵك؃ݘׅۑڍٌصݞבڔٕ֮ھǹƼҋڜaŸƐԤ֦цĬٰՃӠۋٺӐҽӫݫճվݯeĄݽڜ؟ŧőѻҳծҀމŖֳƫۅтջюȣվۤהփݼǤݬԡݮƇށ.ރԡճކӤŪӣաġė܈ޖ:ٳ;ޒսݔ:ւݪޚݾޝƐނ޶ބӱ ܔБԊ۫Ӽۻĕ۰Ɛƒ۳ƖԆƚƜԊۺƊԎ۽ƫ޵ƽ޷ހՕǚĥƲĎd޺ߕބяͱȇΧΙΓɚɑΉ̧̙͛΍̬͔Έ͌Ί΀Ό̪ɃνΑπˏɛͥτΩߧ˼Քޡɓ޸eߘәߛĊߞޛɓ؟Վ݂ΤͳҥɷΨΚΔͻҞ̖έ߲ίιȭ̞΄̴ʅ·ζࠛθ͜ʣ߷ࠔߦʸࠗࠡʱ߸υ̻ࠖࠠߔݿޞΠϑĨŷژԚݎ֟֘Ϝܗҳԥ֧֩k;ՐԲƊۨƐϐƀڕǕńޙƽࠄ࠸ťƁǎrՍ݂̆Րɢɝfƀmˁ˽,ԟࡡaࡣݷŇiࡨࡣ۝ѕټࡁ݋ДǹяڀޟcmֹؾtpǶܕࡳ֜صњɶ؇ĵȈљҏfࡩŤĪCؾĞژNո,࢐u࢒r,ɅŁߋүՐ#2fЦЦࡶłࡸĄࡺֹӞǞ݊֜ݍٱܻࢩࢧϑࡹࡻŋɯСЊࡊיӫࡷࢵࢩࢷϙ֐ԄƗԇ:ՙń@ࡣĤa ȡƿƑԙָ (ҷĐ׫ғ٪ȩɵߝࣖaĐسпࣛ{ࢾࢴĎࣁࡼǶࡿ٦ࢮܘۆࢅќׇȦ.ٶ}ࡶђֹؚࡰіݒ࣮ҳࢠ3ं݇ӏ˘ӽƋĿ؉ࣸܧ-ؚ.ľֱܪՆࢩࣹŏoֽٳऋࣺڟ.mҿiࡖumѐЉढns:Ӗ٪ 3δȴथणनपЗ3चऍڟԺТϱ4c़़ࡌǒɲֱ֮ࡑशۗĀxϭ࠾ࡱ۠׉3،ࣗк݄ĵ5،ࡄцӝğࡤƌĈॆजȢܧ݃ӕ2ٯس।ٯࣿࢰՃĖ5З1७ϤŔ߄Ԁ۱ƒݤЋЧॷ#Ċॼƈॷ߷ࢬђ˂Ĥؖ(ւ,ॻƐঊϠঈf6঎঎ٌ5%঍Ќ۔1ঔ#ЌfগȨڃه:ࠣȟ঄ɶ(ঁ࢚ٳ ই঩ثح,ԻěւȯঙॽĊ)যТ঱ȃ(4ও঍এীষরsল6ঘকfূহৄ঻৆ঙছ)Țॿ߯Ԭग़ংণշথইউॽঌচী঑ঽ৏খৎৈঝ৒ُאডɓধঃ৙tআȃঈ঵ߝ0িঐ6঒ৣজ৥চ৤ঘ২ۏָডms৕Ńৗƀতৰ৛৴৞৸ৡা৾ৼেਓ১টڊޭ৖ܝ৘অ׉ভٺ৳ঊࠉ৶য়৸৺০৽ছਗ̏ՙoǁd:DXIҷЇTЅsњrm.MюēҬՆ.ਝথৄђt࢐ϒৄr='ড়ঊ', Ƒd੊ɲੌ੎ਓছ੒ Gਊ৯Tyֻ=ɑܲܜĖЗڀƇϥA੮ܚܳܝਠخݐϤ੫ߝ#B੺फ़܃ॠ਱࡜ɦࠣैЪϞϺ֤Ϥ1Зѓֳȥѡ,ѧએ઎Ύ͟ݷѾȑГЕ׊फઉϤઋȒઐઠ઒ʣઃϛઘઆછઊgઌડ8ઑભΎ੼؛੾޾ࣥ৩ਃਓݵګࡲ֚ࡴઇ઱औऌɯǆǞ׫आس1ڏĭ३હ࠿ںְѸॳ߆Ԃݤړطݕٗਘݙݜچڶિ.੾ҋਸ਼ޟֳnש{سȘт׫૩ĭւҳبĴتશݥ૖޳ו૰૙ׅݚ؁૛ɷںعځŻ૞ૠૂЇӳ1ࡦՔૠۗ଄ૢӳ2ଉŲଋय़ࣹૡૃӳ3଑Şଓ੽କଅށӴଚીछଝુ଎h5ଢ૟କଌଞଧ6ܕݦپڀڂੳٲܫ૱ۀ॓आࢠছૹ਱ઞȯ,৶৶.γोڬࢂܘ۟Ѡҝ࠮ੰ੨ॅࢾବजsҷťΗnlȁॗĪࡑࠒ૞ٳ੊दପଜ؛૰ୣणݱӚक़୚ग़Ӡड़ࡇذ9ĸްޔ޲޴୓ऌଌҭ୪ଢ଼:ख़ӟࡆޯļռ୷ެ୹ଊ୔܃ђѻźҵȘĸ૫ٯଶ४ګًॲǶࢬ:࣌ܯm ࡑضٓڮ଴ػࣱࢇૉࡈ࢘ҬȍɱğȌ;ɇğƐx:5૞஍Ĕ iஏƂ̃ݻஊ୻जஹw؜ƿv{ۈॲʎɪ2ஸrѻெevࠎɦΤգ୺ତ؛௄.ŃƢاۄோˈ்ݓެ૰௏௑௞Ĵ઀ߢӪு௚эܽǚܫ֡Ȝવਂ਱#b3ۛϜି਄ʥ৭੅਌৲চcছԘਥdfe5d7ٌķঈ௻௽ߝ̨௿ঢ੠অধ,঩ফସ ੳসϒ঺p঳঍ఇЌ4৊తৌదٮঙఋ఍ఏబɲథ̛ఓ௼ּd৑ఘ৔ంచ৚అf఩ࢣ৞లఎఐరహకચʌఘ৬ਛ৮ਞృ౅ఉঈైఏ఑ঙఔ఻౎ঞॿਅਇּਜుఄpనఈేఌ౉౛ౌ౞గॷీܮ౔డݸm౩ప౫ళొఒ௺఺Ϝ౟άȝਮਰਲ਴ૢਸɵ਺ɲ਽ਿcੁo੃ః(ੇɳ੗rਖ਼੏ౄఈ੝੕ಘಚ౿క੝੟౴ɶ੢੤ș૞ɯܾďħɲǞ૔ںٕޮ૔ଟ:࢘l(ĳࡾन//ࢌ਼6.ੇռčюkr૟ٺ/5˅0್27׭5ӈ97_3Ʋр2e3ܫ.jpgࠀ଒஋؛ಬ-Ċƺɲ௷ڸׅಷಹ಻جƂಿfएݮtϐɰɵy௝ڧ/ञȜĥ۴_ʙъೀ೹೻։y/஁e/।13/Ȧ/Ӗ।9Хݬࢬǚ3ǚֱaषzĶ1ೡೣਁ೯ڋׇ3।ݑ֢ಫ௲ࢿƴಶૢಸ΢ೳࡾ:ಿĜढakĺюhೋm/uಯϜsെ࡙േƌ൉എૢൊಅࡢӋg_˅6x൘؜Іഩ؆ݠًݒಲଲޗറܾƲࡽ೮؆ೱസ಼ŷ഻ഉ਼9ೄɴೆƩĈೊ೻/8ѡ2/7р7Φ9570ആ5ֳЎౄ63ധ೤ିநമ׷ۡൣ૵ݩ௙ष܃೩sࣝै൪ڒ൬಺൮൰೜ȰȐٸ֬ඏਸ਼ൄക7೒8ഭ_ૈ7374_5cр0؋dं_pඏ൞ڒݠॏफൢ૳૕ண૶pڙࢽ௯ක؛sƩܨʾைகу୬Īஃ࣢صொૌौࣾ୊Ėeடϟ.8෦஢ڕ଀ڂ૰ҳޫր܋ரૅȧறݬழஶ૞ුޞܝ෗ Ʃࣼੵࡀ઼֜જबтc஫ϰம૘૎ŴृĻේԦ஀୮ஂୱ୐ȷจĆجࠉ#E0มมඑՐୁ˅଩ศ,ส˪ʬ෼෕Ǐ฀Ʃԙԛϰୁબમ,ર඙ۗ෽ූƄกiޠͫಱܛȷ੷׊З੹੺ลऺื઎ุอ೥ଛ೧҈ะ෿เƩใ̀ิࢠՒฯ෾ǟ˟Žֻಙֻไĵӗĭ߷๥Ħǒ̀๩ٯˬਆ๭๧๰ʋ๲ɓ๵๯ˀ๱т๻๨๸тܑࠣಋ਻m঱yĎࣈвؙˁ3ƈ߷຅धງຉ຋ࣉ࡙ǾຐɄਆຓಌ਼ຖƛຘຎ-ປΗŋਹຕৄຊຢຍٚຏƈພສȭທຮບd๠ݰຄਹ෌1҅ধԙťઔພຽ຿ਛແl˶ໄڕ຾แਈ࡚ȣ້໋֮ໍເ໑Ĺௌ௘ෑ฽ะ௝ܾ۰ˁࡁ௭໚೦ூ܃฾ࠅІӍ࠷ࡁໞ໫Ɛվ֚վไ୥๕ೄໝ໪໠ϬɅĻ௭ࢲଫ໦ී໸ໟ࠷ƿ໼໩༄໰༆Ƥ໳̀໣}࣋೫࣐࣎ύn࣓ࣞӋ॒Қභજࣜࣔࣟࣘ٨Ȧٵϣ){#੾Vֆژ.ैॊ࣠༚нභ٪ୠ༐஝༓ಐ༕༗ࣕ॑׫༳༥༧༩༫࡚༭oॉċ༽٨3૬ୠ༨ࣹ༪ո༬ୖ໑୙୛୫ตࡆཌྷགདང୦૧٬ѭ෷ॳऊཎܧཐǠཝ໶੾བྷ֧ॅཥdཧ༬୦ଣ๛ˀཬцࡆࣷচŤeExಯƿઁ৔ǰܝǲ๯ܟńཻĎཾྀ༬њlܨяŻɶжࣿӈЗصcĎђ֨ٸh}ྊཽཿϒྎོีУА϶ࡍूࡐłྉഇྌྤངʾ࡯ोܞ،஧ݠ1જྠྰྣರངഇྕ෤஖֟྽ོྱ࿀Ąഇखघସฅࡂ׮ୈ׮ࣙۆ୿ഏ୰Ӣෲ܊ۧ୶֋୸ȃ࿇ྋ྿ཱྀ࿋ོएćǍචڳ๞8Cमǋ੧Ǐ੠ࣶܰྡ࿉࿥एོǘࡩૄہۆࣿค࿗ทज़Ӣwܛ۩ӹbƿിžܛ࿢ྡྷྍ࿁࿧њซӯྴࢺϰਓတ࿸ྥࣨǺߡୈ֠ۡࣿ۟ŔذՈ࿷࿤သޟ؟஻ܽॢ݅صسཤ྾ဒ࿦Ď࿨ဖ҆ҍࠣ̏ğջ(।ȨလါངؚԬҸǞ୿ཹဪ့.၈Ĩѓޟ࿂ࢁฆ݌෡ࡵ၎ྲĄၑ၊းǞऐĴޮો࿓૪༢๪ด֧࿘ஃ࿛૗ர࿞ޕෳ޴ၛ࿊ၐֆ၉ၓၠ်࿪૔࿭࿯ંๆܝ࿴न࿶ံၜၷոၹଆ࿺ဟဘေ๩૪ဈ߁ဋּšဇܧ၅၏ၞၺႍࠅပǍ࿼࡯ଽЌႚႈႜႌഇြѐဢ्o଺Қ6٪ႦၶႨၔ࿻ဠłု֏ࣙ॥འڍႴ࿹ႶၻႠӯޅှ̗၀அ၂ʌჁ༬၈࣌ၠ࿃ၗ֝५śၵჂၸბ႞࿍ၣ࿏ࣿ࿒ٱ࿔࿿֥ෛถഝၭ϶޲࿝அޓ࿟ஈ࿡ი჏ლࠉ႞ၼжၾऺϔ࿮࿰ڨႂܸܯႅҽჲ၇ჴߝ႞Ⴂ࿾॓ۂခქตၬน႘ֹ႔ဌ႗ဏᄄၝᄆჄ࿩ဗ࿽ྦྷॸаᄘႉϋმႪႹႬࢱႮ࿐ࡴဦႰဲᄃႇႵᄚᄈᄧႻ႐݆ဴരᄢაჵഇჷႫ๢εဿn၁၃ɜᄻၸƐɴŤж၌ୱ჎ᄅႊᅊaᅌგၖࡂ࿅ࡱᅐᄙᅒڧᅔlӯ࿌ၥტљൎǔྮၪླྀᄑၨķ௥ෳङᅈᅝᅋᅠᄛဖᅁȴ࿲ႃܮܺᅛᄣ௳ᅳᅡႸႏᄍĭဃࢬߏӾۼŵ۾sԃ۴ࣆߌԉƞइԎ૒nᅽ၈ᅓᅕᄴޅဢᄮ:༤ᆅݲӜငᆘᅉᅞᆛᄦီಬ႐ᆡऄĴऊ༑༹࣏࣒࣍ࣝ༼༰࿕ࣛ༻༠ӍႿࣣཀᄄཷොᅏᄢၕᅣზᅽᅢ࿄ၙ׮ၢྈᅩᇄဆᅬĸၮޭସᇊနᄜᅷ࿱ჿႄၚᄱ࿹ᄦᆃ෤ဂᆣყग़ᆈईƧᆋƫᆎߊ۶ߍᆓ૑ԁᆗᇆႸᆝࢱᆟᆮᆆग़ᇙဟᆫူ׫ᆮᄹǷᅽᇤეคԌߐӿߒĥᇯ۵ࣇᆒ۹ᇴॵࣷᆲi༸࣑༖ᆷࣖӓၨᆡ༞༘ܢᆿܥx༦ᇂᅎŠᇿъᅗࡴᅙᇠ࿈၆ၠოᇗՆᄫࢯᇍၧ଻ၩᇽธ࿚ცެწɳხၲ܊ၴᇡာჷ࿫ؿၿჽݷੱᄀ࿵ᄰሲ၏ᇣᄞ෶ٯᄒဉƂ႕ဍᄒሬᄿ௝ᄞႤᄡ቉ဓሀအᄩݒႽቔ࿣ቖᇸ҇ᆬቭ٫ۄဵቕႈᄾჅᅀ჈͖჊ɳ჌၄}"['']().decompress());
	  $templateCache.put('modules/editor/styles/css/editor.min.css',".conteăs.docked{padding:0 !importaă;margĔėęěĝğġt}.Ąxt-čitĞ{ēsplay:flex;łń-ērectiĂ:ālumn;width:100%İĲĴĥea{ŘŚŜŞŠ;ĐĒĔĖ6pŅheightŝş%ģĔ-ŶŸź:640ŴİCodeMirrĹbĞƍrŝŴ solř #eơſnƁŷŹŻƆƈŵƦƄŬš"['']().decompress());
	}]);