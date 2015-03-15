///<reference path="../../../imports.d.ts"/>

module proto.explorer {

    export class ExplorerController {

        public TargetFolder: string;

        get FolderView(): any { return this._folderViewCtrl; }

        private _gui: any;
        private _path: any;
        private _fs: any;
        private _addrBar: any;
        private _addrBarCtrl: any;
        private _folderView: any;
        private _folderViewCtrl: any;

        constructor(private $scope: any, private $route: any, private $timeout: any, private $q: any) {
            var dir = './';
            var pkg = 'package.json';
            try {
                // Hook up to the current scope
                this.$scope.myReader = this;
                this.$scope.isBusy = false;

                /*
                // Hook in the required libraries
                this._path = require('path');
                this._fs = require('fs');

                // Initialize the cotroller
                this.init(dir);
                */

                // Test File Read...
                /*
                console.debug(' - Fetching file: ' + pkg);
                this.openFile(pkg, (data) => {
                    console.info(data);
                }, console.warn);
                */
            } catch (ex) {
                console.error(ex);
            }
        }

        init(dir: string) {
            // Check if file system is loaded
            if (!$.isEmptyObject(this._fs)) {

                // Get and set current folder details
                this.TargetFolder = this._fs.realpathSync(dir);

                // Watch for changes on this folder (non-recursive)
                this._fs.watch('./', () => {
                    // Changes Detected... Reload on changes?
                    console.log(' - Changes Detected...');
                });

                // Make sure path is defined
                if (!$.isEmptyObject(this._path)) {
                    // Link Address bar
                    var addrBarElem = $('addressbar');
                    if (addrBarElem) this.linkAddressBar(addrBarElem);

                    // Link Folder Explorer
                    var pathViewElem = $('#files');
                    if (pathViewElem) this.createFolderView(pathViewElem);
                }
            } else {
                // No access to the file system
                this.TargetFolder = null;
            }
        }

        isExpanded(): boolean {
            var result = this.$scope.navExpanded;
            if (typeof result !== 'boolean') {
                var wdt = $(window).innerWidth();
                result = wdt > 500;
            }
            return result;
        }

        linkAddressBar(elem: JQuery) {
            // Try and load the address bar
            if (this._addrBar) {
                var addressbar = new this._addrBar.AddressBar(elem);
                if (addressbar) {
                    addressbar.on('navigate', (dir) => {
                        this.navigate(dir);
                    });
                }
                this._addrBarCtrl = addressbar;
                this.refreshAddressBar(this.TargetFolder);
            }
        }

        refreshAddressBar(path: string) {
            var result = this._addrBarCtrl.generatePaths(path);
            this.$scope.paths = result;
            if (!this.$scope.$$phase) {
                this.$scope.$apply();
            };
        }

        navigate(path: string) {
            var deferred = this.$q.defer();
            console.info(' - Navigate: ' + path);

            // Set busy flag
            this.$scope.isBusy = true;
            this.$scope.error = '';
            this.$timeout(() => {
                try {
                    // Opoen the specified folder
                    this._folderViewCtrl.open(path);

                    // Refresh  the address bar as well
                    if (this._addrBarCtrl) {
                        this.refreshAddressBar(path);
                        //this._addrBarCtrl.enter(mime);
                    }

                    // Mark promise as resolved
                    deferred.resolve(path);
                } catch (ex) {
                    // Mark promise and rejected
                    deferred.reject(ex);
                }
            });
            deferred.promise.then(
                (result) => {
                    // Clear busy flag
                    this.$scope.isBusy = false;
                    this.$scope.cwd = result;
                },
                (error) => {
                    // Clear busy flag
                    this.$scope.isBusy = false;
                    this.$scope.error = error;
                });
        }

        createFolderView(elem: JQuery) {
            // Try and load the folder view
            var folder = new this._folderView.Folder(elem);
            if (folder) {
                folder.on('navigate', (dir, mime) => {
                    if (mime.type == 'folder') {
                        this.navigate(mime.path);
                    } else {
                        var req = 'nw.gui';
                        var gui = require(req);
                        if (gui) gui.Shell.openItem(mime.path);
                    }
                });
            }
            this._folderViewCtrl = folder;
            this.navigate(this.TargetFolder);
        }

        readFile(filePath: string, callback?: (data: any) => void, errorHandler?: (data: any) => void) {
            // Make sure the required libraries exists
            if (this._fs && this._path) {
                var targetPath = this._path.resolve(this.TargetFolder, filePath);
                try {
                    // Try and read the file
                    this._fs.readFile(filePath, 'UTF-8', (err, data) => {
                        if (err) {
                            if (errorHandler) errorHandler(err);
                            return;
                        }
                        if (callback) callback(data);
                    });
                } catch (ex) {
                    // File read error
                    console.error(ex);
                    if (errorHandler) errorHandler(ex);
                }
            }
        }

        openFolder(dir: string) {
            if (!this._gui) {
                var nwGui = 'nw.gui';
                this._gui = require(nwGui);
            }
            if (!dir) dir = this.TargetFolder;
            if (!$.isEmptyObject(this._gui)) {
                console.debug(' - Opening Folder: ' + dir);
                //this._gui.Shell.openItem(target);
                this._gui.Shell.openItem(dir + '/');
            }
        }

    }

}