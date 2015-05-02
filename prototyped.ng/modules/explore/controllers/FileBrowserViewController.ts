///<reference path="../../../imports.d.ts"/>

module proto.ng.modules.explorer {

    export class FileBrowserViewController {

        constructor(private $rootScope: any, private $scope: any, private $q: any, public navigation: proto.ng.modules.common.services.NavigationService) {
            var dir = './';
            try {
                // Hook up to the current scope
                this.$scope.isBusy = true;

                // Initialize the cotroller
                this.init(dir);

                // Hook event for when folder path changes
                this.$rootScope.$on('event:folder-path:changed', (event, folder) => {
                    if (folder != this.$scope.dir_path) {
                        this.$scope.dir_path = folder;
                        this.navigate(folder);
                    }
                });
            } catch (ex) {
                console.warn(ex);
            }
        }

        init(dir: string) {
            // Hook site navigation nodes
            this.navigation.fileSystem.UpdateUI = () => {
                this.$rootScope.$applyAsync(() => {
                });
            }
            this.navigation.fileSystem.OnSelect = (node: proto.ng.modules.common.services.SiteNode) => {
                var folder = node.data;
                if (folder != this.$scope.dir_path) {
                    this.$scope.dir_path = folder;
                    this.navigate(folder);
                }
            }

            // Resolve the initial folder path
            this.navigate(dir);
        }

        navigate(dir_path: string) {
            var deferred = this.$q.defer();
            if (typeof require === 'undefined') {
                deferred.reject(new Error('Required libraries not available.'));
            } else {
                try {
                    // Set busy flag
                    this.$scope.isBusy = true;
                    this.$scope.error = null;

                    // Resolve the full path
                    var path = require('path');
                    dir_path = path.resolve(dir_path);

                    // Read the folder contents (async)
                    var fs = require('fs');
                    fs.readdir(dir_path, (error, files) => {
                        if (error) {
                            deferred.reject(error);
                            return;
                        }

                        // Split and sort results
                        var folders = [];
                        var lsFiles = [];
                        for (var i = 0; i < files.sort().length; ++i) {
                            var targ = path.join(dir_path, files[i]);
                            var stat = this.mimeType(targ);
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
            }

            // Handle the result and error conditions
            deferred.promise.then(
                (result) => {
                    // Clear busy flag
                    this.$scope.isBusy = false;
                    this.$scope.dir_path = result.path;
                    this.$scope.files = result.files;
                    this.$scope.folders = result.folders;

                    // Breadcast event that path has changed
                    this.$rootScope.$broadcast('event:folder-path:changed', this.$scope.dir_path);
                },
                (error) => {
                    // Clear busy flag
                    this.$scope.isBusy = false;
                    this.$scope.error = error;
                });

            return deferred.promise;
        }

        select(filePath: any) {
            this.$scope.selected = filePath;
        }

        open(filePath: string) {
            var req = 'nw.gui';
            var gui = require(req);
            if (gui) gui.Shell.openItem(filePath);
        }

        mimeType(filepath: string): any {
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
                'movie': ['mkv', 'avi', 'rmvb'],
            };
            var cached = {};

            var fs = require('fs');
            var path = require('path');
            var result = {
                name: path.basename(filepath),
                path: filepath,
                type: null,
            };

            try {
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
        }
    }

}