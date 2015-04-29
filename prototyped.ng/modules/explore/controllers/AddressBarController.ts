///<reference path="../../../imports.d.ts"/>

module proto.ng.modules.explorer {

    export function AddressBarDirective() : any {
        return {
            restrict: 'EA',
            scope: {
                target: '=protoAddressBar'
            },
            transclude: false,
            templateUrl: 'modules/explore/views/addressbar.tpl.html',
            controller: 'AddressBarController',
            controllerAs: 'addrBar'
        };
    }

    export class AddressBarController {

        private element: any;
        private history: string[] = [];

        constructor(private $rootScope : any, private $scope: any, private $q: any) {
            $scope.busy = true;
            try {
                // Initialise the address bar
                var elem = $('#addressbar');
                if (elem) {
                    this.init(elem);
                    this.$rootScope.$on('event:folder-path:changed', (event, folder) => {
                        if (folder != this.$scope.dir_path) {
                            this.$scope.dir_path = folder;
                            this.navigate(folder);
                        }
                    });
                } else {
                    throw new Error('Element with id "addressbar" not found...');
                }
            } catch (ex) {
                // Initialisation failed
                console.warn(ex);
            }
            $scope.busy = false;
        }

        init(element: JQuery) {
            // Set the target HTML element
            this.element = element;

            // Generate the current folder parts
            this.generateOutput('./');
        }

        openFolder(path?: string) {
            try {
                var nwGui = 'nw.gui';
                var gui = require(nwGui);
                if (!$.isEmptyObject(gui)) {
                    console.debug(' - Opening Folder: ' + path);
                    gui.Shell.openItem(path + '/');
                }
            } catch (ex) {
                console.warn(ex);
            }
            this.generateOutput(path);
        }

        navigate(path?: string) {
            this.generateOutput(path);
        }

        select(file?: string) {
            console.info(' - select: ', file);
            try {
                var req = 'nw.gui';
                var gui = require(req);
                gui.Shell.openItem(file);
            } catch (ex) {
                console.error(ex);
            }
        }

        back() {
            var len = this.history ? this.history.length : -1;
            if (len > 1) {
                var last = this.history[len - 2];
                this.history = this.history.splice(0, len - 2);
                this.generateOutput(last);
            }
        }

        hasHistory() {
            var len = this.history ? this.history.length : -1;
            return (len > 1);
        }

        generateOutput(dir_path: string) {
            // Set the current dir path
            this.$scope.dir_path = dir_path;
            this.$scope.dir_parts = this.generatePaths(dir_path);
            this.history.push(dir_path);

            // Breadcast event that path has changed
            this.$rootScope.$broadcast('event:folder-path:changed', this.$scope.dir_path);
        }

        generatePaths(dir_path: string) {
            if (typeof require === 'undefined') return;
            try {
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
                            path: sequence.slice(0, 1 + i).join(path.sep),
                        });
                    }

                    // Add root for unix
                    if (sequence[0] == '' && process.platform != 'win32') {
                        result[0] = {
                            name: 'root',
                            path: '/',
                        };
                    }

                    // Return thepath sequences
                    return { sequence: result };
                }
            } catch (ex) {
                console.error(ex);
            }
        }

    }

}