///<reference path="../../../imports.d.ts"/>

module proto.ng.editor {

    export class EditorController {

        public isActive: boolean = false;

        public FileLocation: string = '';
        public get FileContents(): string { return this._buffer; }
        public set FileContents(buffer: string) { this._buffer = buffer; this.LastChanged = Date.now(); }

        public LastChanged: number = null;
        public LastOnSaved: number = null;
        public get HasChanges(): Boolean { return this.LastChanged != null && this.LastChanged > this.LastOnSaved; }
        public get HasFileSys(): Boolean { return !$.isEmptyObject(this._gui); }

        private _fs: any;
        private _path: any;
        private _gui: any;
        private _buffer: string;
        private _textArea: CodeMirror;

        constructor(private $scope: any, private $timeout: any) {
            this.$scope.myWriter = this;
            try {
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

        init() {
            this.isActive = true;
        }

        openFile() {
            if (this.checkUnsaved()) return;

            if (!$.isEmptyObject(this._gui) && !$.isEmptyObject(this._fs)) {
                var chooser = $('#fileDialog');
                chooser.change((evt) => {
                    var filePath = chooser.val();
                    if (filePath) {
                        // Try and read the file
                        this._fs.readFile(filePath, 'UTF-8', (err, data) => {
                            if (err) {
                                // Could not read file contents
                                throw new Error(err);
                            } else {
                                this.FileContents = data;
                                this.FileLocation = filePath;
                                this.LastChanged = null;
                                this.LastOnSaved = null;
                            }
                            this.$scope.$apply();
                        });
                    }
                });
                chooser.trigger('click');
            } else {
                console.warn(' - [ Editor ] Warning: Shell not available.');
            }
        }

        openFileLocation() {
            if (this._gui) {
                this._gui.Shell.openItem(this.FileLocation);
            } else {
                console.warn(' - [ Editor ] Warning: Shell not available.');
            }
        }

        newFile() {
            if (this.checkUnsaved()) return;

            // Clear prev. states
            this.FileLocation = null;
            this.LastChanged = null;
            this.LastOnSaved = null;

            // Set some intial text
            this.FileContents = 'Enter some text';
            this.LastChanged = Date.now();

            if (!this._textArea) {
                var myTextArea = $('#FileContents');
                if (myTextArea.length > 0) {
                    this._textArea = CodeMirror.fromTextArea(myTextArea[0], {
                        mode: "javascript",
                        autoClearEmptyLines: true,
                        lineNumbers: true,
                        indentUnit: 4,
                    });
                }
            }
            this._textArea.setValue(this.FileContents);
            //var totalLines = this._textArea.lineCount();
            //this._textArea.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });

            // Do post-new operations
            this.$timeout(() => {
                // Select file contents
                var elem = $('#FileContents');
                if (elem) {
                    elem.select();
                }
            });
        }

        saveFile(filePath?: string) {
            if (!filePath) filePath = this.FileLocation;
            if (!filePath) return this.saveFileAs();
            if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                var output = this._buffer;
                this._fs.writeFile(filePath, output, 'UTF-8', (err) => {
                    if (err) {
                        // Could not save the file
                        throw new Error(err);
                    } else {
                        // File has been saved
                        this.FileLocation = filePath;
                        this.LastOnSaved = Date.now();
                    }
                    this.$scope.$apply();
                });
            } else {
                console.warn(' - [ Editor ] Warning: File system not available.');
            }
        }

        saveFileAs() {
            if (!$.isEmptyObject(this._gui)) {
                // Get the file name 
                var filePath = this.FileLocation || 'Untitled.txt';
                var chooser = $('#saveDialog');
                chooser.change((evt) => {
                    var filePath = chooser.val();
                    if (filePath) {
                        // Save file in specified location
                        this.saveFile(filePath);
                    }
                });
                chooser.trigger('click');
            } else {
                console.warn(' - [ Editor ] Warning: Shell not available.');
            }
        }

        test() {
            throw new Error('Lala');
            try {
                var dir = './';
                var log = "Test.log"
                if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                    var target = this._path.resolve(dir, log)
                    this._fs.writeFile(log, "Hey there!", (err) => {
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
        }

        checkUnsaved(msg?:string): boolean {
            var msgCheck = msg || 'There are unsaved changes.\r\nAre you sure you want to continue?';
            var hasCheck = this.FileContents != null && this.HasChanges;
            return (hasCheck && confirm(msgCheck) == false);
        }
    }

} 