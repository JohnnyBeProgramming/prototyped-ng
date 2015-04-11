/// <reference path="RavenErrorHandler.ts" />

declare var Raven: any;

module proto.ng.samples.errorHandlers.raven {

    export class RavenService {

        public editMode: boolean = false;
        public isOnline: boolean = false;
        public isEnabled: boolean = false;
        public lastError: any = null;
        public config: any;
        public handler: any;

        constructor(private $rootScope, private $log, private appConfig) {
            this.config = appConfig.ravenConfig;
            this.handler = new RavenErrorHandler(this);
            appConfig.errorHandlers.push(this.handler);
        }

        public handleException(source: string, ex: any, tags: any) {
            if (!this.isOnline) return;
            if (typeof Raven !== 'undefined') {
                this.$log.log(' - Sending Raven: "' + ex.message + '"...');
                Raven.captureException(ex, {
                    source: source,
                    tags: tags
                });
            }
        }

        public detect() {
            var urlRavenJS = 'https://cdn.ravenjs.com/1.1.18/raven.min.js';
            try {
                // Load required libraries if not defined
                if (typeof Raven === 'undefined') {
                    this.$log.log('Loading: ' + urlRavenJS);
                    this.handler.busy = true;
                    $.getScript(urlRavenJS, (data, textStatus, jqxhr) => {
                        this.$rootScope.$applyAsync(() => {
                            this.handler.busy = false;
                            this.init();
                        });
                    });
                } else {
                    this.init();
                }

            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
            return this.isOnline;
        }

        public init() {
            // Check for Raven.js and auto-load
            if (!this.isOnline && this.config.publicKey) {
                this.$log.log('Initialising RavenJS....');
                this.setupRaven();
            }
        }

        public connect(publicKey) {
            try {
                this.lastError = null;
                Raven.config(publicKey, {
                    shouldSendCallback: (data) => {
                        // Only return true if data should be sent
                        var isActive = publicKey && this.isEnabled;
                        return isActive;
                    },
                    dataCallback: (data) => {
                        // Add something to data
                        return data;
                    },
                }).install();

                this.isOnline = true;
            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
        }

        public disconnect() {
            if (typeof Raven !== 'undefined') {
                Raven.uninstall();
            }
            this.isOnline = false;
        }

        public setupRaven() {
            if (typeof Raven === 'undefined') return;
            try {
                // Disconnect for any prev sessions
                if (this.isOnline) {
                    this.disconnect();
                }

                // Try to connect with public key                
                this.connect(this.config.publicKey);

                // Success
                console.info(' - Done.');
            } catch (ex) {
                // Something went wrong
                console.warn(' - RavenJS failed to initialise.');
                throw ex;
            }
        }

    }

}