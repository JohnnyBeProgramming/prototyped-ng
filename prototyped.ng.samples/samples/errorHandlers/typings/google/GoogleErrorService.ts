/// <reference path="../../../../imports.d.ts" />

declare var ga: any;

module proto.ng.samples.errorHandlers.google {

    export class GoogleErrorService {
        public busy: boolean = false;
        public name: string = 'google';
        public label: string = 'Google Analytics';
        public locked: boolean = false;
        public editMode: boolean = false;
        public isOnline: boolean = false;
        public isEnabled: boolean = false;
        public lastError: any = null;
        public config: any;

        get enabled(): boolean { return this.isEnabled; }
        set enabled(state: boolean) { this.isEnabled = state; }

        constructor(private $rootScope, private $log, private appConfig) {
            this.config = appConfig.googleConfig;
        }

        public handleException(source: string, ex: any, tags: any) {
            if (!this.isOnline) return;
            if ('_gaq' in window) {
                this.$log.log(' - Sending Analytics: "' + ex.message + '"...');
                var ctx = [
                    '_trackEvent',
                    source,
                    ex.message,
                    ex.filename + ':  ' + ex.lineno,
                    true
                ];
                window['_gaq'].push(ctx);
            }
        }

        public detect() {
            try {
                // Load required libraries if not defined
                this.$log.log('Detecting: Google Analytics...', this.config);
                if ('_gaq' in window) {
                    this.init();
                } else {
                    var urlGa = 'https://ssl.google-analytics.com/ga.js';
                    this.$log.log('Loading: ' + urlGa);
                    this.busy = true;
                    $.getScript(urlGa, (data, textStatus, jqxhr) => {
                        this.$rootScope.$applyAsync(() => {
                            this.busy = false;
                            this.isEnabled = true;
                            this.init();
                        });
                    });
                }
            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }

            return false;
        }

        public init() {
            // Check for scripts and auto-load
            if (!this.isOnline && this.config.publicKey) {
                this.setupGoogle();
            }
        }

        public connect(publicKey) {
            try {
                // Setup google analytics
                this.$rootScope.$applyAsync(() => {
                    this.$log.log('Connecting Google Services....', publicKey);

                    var _gaq = window['_gaq'] = window['_gaq'] || [];
                    _gaq.push(['_setAccount', publicKey]);

                    //ga('create', publicKey, 'auto');

                    this.isOnline = true;
                });
            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
        }

        public disconnect() {
            this.isOnline = false;
        }

        public setupGoogle() {
            try {
                // Disconnect for any prev sessions
                if (this.isOnline) {
                    this.disconnect();
                }

                // Try to connect with public key                
                this.connect(this.config.publicKey);
            } catch (ex) {
                // Something went wrong
                this.$log.warn('Google services failed to initialise.');
                throw ex;
            }
        }

        public attach() {
            var isOnline = this.detect();
            this.isEnabled = isOnline;
        }

        public dettach() {
            this.isEnabled = false;
        }
    }

}