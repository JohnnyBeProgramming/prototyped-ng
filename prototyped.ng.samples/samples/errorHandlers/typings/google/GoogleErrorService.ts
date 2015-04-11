/// <reference path="GoogleErrorHandler.ts" />

declare var ga: any;

module proto.ng.samples.errorHandlers.google {

    export class GoogleErrorService {

        public editMode: boolean = false;
        public isOnline: boolean = false;
        public isEnabled: boolean = false;
        public lastError: any = null;
        public config: any;
        public handler: any;

        constructor(private $rootScope, private $log, private appConfig) {
            this.config = appConfig.googleConfig;
            this.handler = new GoogleErrorHandler(this);
            appConfig.errorHandlers.push(this.handler);
        }

        public detect() {
            try {
                // Load required libraries if not defined
                this.$log.log('Detecting: Google Analytics...', this.config);
                if ('ga' in window) {
                    this.init();
                } else {
                    this.$log.log('Loading: Google Analytics...');
                    this.handler.busy = true;

                    var urlAnalytics = 'data:text/javascript;charset=base64,PHNjcmlwdD4oZnVuY3Rpb24oaSxzLG8sZyxyLGEsbSl7aVsnR29vZ2xlQW5hbHl0aWNzT2JqZWN0J109cjtpW3JdPWlbcl18fGZ1bmN0aW9uKCl7KGlbcl0ucT1pW3JdLnF8fFtdKS5wdXNoKGFyZ3VtZW50cyl9LGlbcl0ubD0xKm5ld0RhdGUoKTthPXMuY3JlYXRlRWxlbWVudChvKSxtPXMuZ2V0RWxlbWVudHNCeVRhZ05hbWUobylbMF07YS5hc3luYz0xO2Euc3JjPWc7bS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShhLG0pfSkod2luZG93LGRvY3VtZW50LCdzY3JpcHQnLCcvL3d3dy5nb29nbGUtYW5hbHl0aWNzLmNvbS9hbmFseXRpY3MuanMnLCdnYScpOzwvc2NyaXB0Pg==';
                    $.getScript(urlAnalytics, (data, textStatus, jqxhr) => {
                        this.$rootScope.$applyAsync(() => {
                            this.handler.busy = false;
                            this.init();
                        });
                    });
                }
                this.isOnline = true;
            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
            return this.isOnline;
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

                    ga('create', publicKey, 'auto');

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

    }

}