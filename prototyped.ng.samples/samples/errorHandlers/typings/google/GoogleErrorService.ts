/// <reference path="GoogleErrorHandler.ts" />

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
            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
            return this.isOnline;
        }

        public init() {
            // Check for Raven.js and auto-load
            if (!this.isOnline && this.config.publicKey) {
                this.$log.log(' - Initialising Google Services....');
                this.setupGoogle();
            }
        }

        public connect(publicKey) {
            try {
                //service.isOnline = true;
            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
        }

        public disconnect() {
            this.isOnline = false;
        }

        public setupGoogle() {
            if (typeof google === 'undefined') return;
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