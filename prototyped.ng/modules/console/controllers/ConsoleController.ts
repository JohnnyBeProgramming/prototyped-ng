///<reference path="../../../imports.d.ts"/>

module proto.ng.modules.commands {

    export class ConsoleController {

        private _currentProxy: IConsoleProxy;
        private _proxyList: IConsoleProxy[] = [];

        constructor(private $scope: any, private $log: any) {
            try {
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

        init() {
            try {
                // Check the command line status and give user some feedback
                if (this._currentProxy) {
                    this.success('Command line ready and active.');
                } else {
                    this.warning('Cannot access the command line from the browser.');
                }
            } catch (ex) {
                console.error(ex);
            }
        }

        clear() {
            // Clear cache
            this.$scope.lines = [];

            // Clear via proxy
            if (this._currentProxy) {
                this._currentProxy.clear();
            }
        }

        getProxyName(): string {
            return (this._currentProxy) ? this._currentProxy.ProxyName : '';
        }
        getProxies(): IConsoleProxy[] {
            return this._proxyList;
        }
        setProxy(name: string): IConsoleProxy {
            console.info(' - Switching Proxy: ' + name);
            for (var i = 0; i < this._proxyList.length; i++) {
                var itm = this._proxyList[i];
                if (itm.ProxyName == name) {
                    this._currentProxy = itm;
                    break;
                }
            }

            // Refresh UI if needed
            if (!this.$scope.$$phase) this.$scope.$apply();

            return this._currentProxy;
        }

        command(text: string) {
            // Try and run the command
            this.info('' + text);
            this.$scope.txtInput = '';

            // Check if proxy exists
            if (this._currentProxy) {
                // Check for 'clear screen' command
                if (text == 'cls') return this.clear();

                // Run the command via proxy
                this._currentProxy.command(text, (msg, tp) => {
                    switch (tp) {
                        case 'debug': this.debug(msg); break;
                        case 'info': this.info(msg); break;
                        case 'warn': this.warning(msg); break;
                        case 'succcess': this.success(msg); break;
                        case 'error': this.error(msg); break;
                        default: this.debug(msg); break;
                    }

                    // Refresh UI if needed
                    if (!this.$scope.$$phase) this.$scope.$apply();
                });
            } else {
                this.error('Command line is not available...');
            }
        }

        debug(msg: string) {
            this.$scope.lines.push({
                time: Date.now(),
                text: msg,
                type: 'debug',
            });
        }

        info(msg: string) {
            this.$log.info(msg);
            this.$scope.lines.push({
                time: Date.now(),
                text: msg,
                type: 'info',
            });
        }

        warning(msg: string) {
            this.$log.warn(msg);
            this.$scope.lines.push({
                time: Date.now(),
                text: msg,
                type: 'warning',
            });
        }

        success(msg: string) {
            this.$log.info(msg);
            this.$scope.lines.push({
                time: Date.now(),
                text: msg,
                type: 'success',
            });
        }

        error(msg: string) {
            this.$log.error(msg);
            this.$scope.lines.push({
                time: Date.now(),
                text: msg,
                type: 'error',
            });
        }

    }

    export interface IConsoleProxy {
        ProxyName: string;

        clear();
        command(text: string, callback: (text: string, type?: string) => void);
    }

    export interface ILoggerProxy {
        debug(msg: string);
        info(msg: string);
        warning(msg: string);
        success(msg: string);
        error(msg: string);
    }

    export class BrowserConsole implements IConsoleProxy, ILoggerProxy {
        public ProxyName: string = 'Browser';

        constructor() { }

        public command(text: string, callback: (text: string, type?: string) => void) {
            try {
                var result = eval(text);
                if (callback && result) {
                    callback(result, 'info');
                }
                console.info(result);
            } catch (ex) {
                callback(ex, 'error');
                console.error(ex);
            }
        }

        public clear() { console.clear() }
        public debug(msg: string) { console.debug(msg); }
        public info(msg: string) { console.info(msg); }
        public warning(msg: string) { console.warn(msg); }
        public success(msg: string) { console.info(msg); }
        public error(msg: string) { console.error(msg); }
    }


    export class ProcessConsole implements IConsoleProxy {
        public ProxyName: string = 'System';

        constructor(private _proc: any) { }

        public clear() { }

        public command(text: string, callback: (text: string, type?: string) => void) {
            // Call the command line from a child process
            var proc = eval('process');
            var ls = this._proc
                .exec(text, (error: any, stdout: any, stderr: any) => {
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
                })
                .on('exit', (code) => {
                    //callback(' - Process returned: ' + code, 'debug');
                });
        }
    }

}