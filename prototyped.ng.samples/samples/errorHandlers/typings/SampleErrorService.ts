/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />

module proto.ng.samples.errorHandlers {

    export class SampleErrorService {
        public busy: boolean = false;
        public name: string = 'notify';
        public label: string = 'User Notifications';
        public locked: boolean = false;
        public lastError: any = null;

        public isOnline: boolean = false;
        public isEnabled: boolean = false;
        //get isEnabled(): boolean { return ErrorHandlers.enabled; }
        //set isEnabled(state: boolean) { ErrorHandlers.enabled = state; }

        get enabled(): boolean { return this.isEnabled; }
        set enabled(state: boolean) { this.isEnabled = state; }

        get errorHandlers(): any[] { return ErrorHandlers.ListAll(); }

        constructor(private $rootScope, private $log, private appConfig, private raven: raven.RavenService, private google: google.GoogleErrorService) {
            // Hook the global handlers
            ErrorHandlers.logs = $log;
            ErrorHandlers.Register(this);
            ErrorHandlers.Register(google);
            ErrorHandlers.Register(raven);
        }

        public handleException(source: string, ex: any, tags: any) {
            if (!this.isOnline) return;
            this.$log.log(' - Notifying User: "' + ex.message + '"...');
            if ('alertify' in window) {
                window['alertify'].log(source + ': ' + ex.message, 'error', 3000);
            }
        }

        public detect() {
            var scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js';
            try {
                // Load required libraries if not defined
                if ('alertify' in window) {
                    this.isEnabled = true;
                    this.isOnline = true;
                } else {
                    this.$log.log('Loading: ' + scriptUrl);
                    this.busy = true;
                    $.getScript(scriptUrl, (data, textStatus, jqxhr) => {
                        this.$rootScope.$applyAsync(() => {
                            this.busy = false;
                            this.isEnabled = true;
                            this.isOnline = true;
                        });
                    });
                }

            } catch (ex) {
                this.isOnline = false;
                this.lastError = ex;
            }
            return this.isOnline;

            try {
                // Load required libraries if not defined
                var url = 'https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js';
                $.getScript(url)
                    .done((script, textStatus) => {
                        this.$rootScope.$applyAsync(() => {
                            this.isOnline = true;
                            this.isEnabled = true;
                        });
                    })
                    .fail((jqxhr, settings, exception) => {
                        this.$rootScope.$applyAsync(() => {
                            this.isOnline = false;
                            this.isEnabled = false;
                        });
                    });
                this.isOnline = false;
                this.isEnabled = false;
            } catch (ex) {
                this.isOnline = false;
            }

            return false;
        }

        public checkChanged(handler) {
            if (!handler) return;
            if (!handler.enabled) {
                if (handler.attach) {
                    handler.attach();
                } else {
                    handler.enabled = true;
                }
            } else if (handler.enabled) {
                if (handler.dettach) {
                    handler.dettach();
                } else {
                    handler.enabled = false;
                }
            }
        }

        public throwManagedException() {
            var tags = {
                startedAt: Date.now()
            };
            try {
                this.$log.info('About to break something...');
                window['does not exist'].managedSampleError++;
            } catch (ex) {
                HandleException('Managed Sample', ex, tags);
                this.$log.warn('Exception caught and swallowed.');
                // throw ex; // this will be caught by the global exception handler
            }
        }

        public throwAjaxException() {
            // XXXXXXXXXXXXXXXXXXXX

            var ajaxCfg = {
                current: null,
                getDesc: function (itm) {
                    var cfg = ajaxCfg;
                    switch (cfg.current) {
                        case cfg.errHttp: return 'Ajax Error (HTTP)';
                        case cfg.errSuccess: return 'Ajax Error (Success)';
                        case cfg.errFailed: return 'Ajax Error (Failed)';
                    }
                    return 'Ajax Error';
                },
                callError: function () {
                    var call = ajaxCfg.current;
                    if (!call) {
                        call = ajaxCfg.errHttp;
                    }
                    call();
                },
                select: function (itm) {
                    ajaxCfg.current = itm;
                },
                errHttp: function () {
                    $.ajax({
                        url: "https://wwwx.i.am/missing.html",
                        dataType: "text/html",
                        success: function (result) { },
                        error: function (xhr) { }
                    });
                },
                errSuccess: function () {
                    $.ajax({
                        url: "/index.html",
                        dataType: "text/html",
                        success: function (result) {
                            // Response recieved...
                            console.info(' - AJAX got response...');
                            window['does not exist'].ajaxOnSuccessSample++;
                        },
                        error: function (xhr) { }
                    });
                },
                errFailed: function () {
                    $.ajax({
                        url: "/missing.index.html",
                        dataType: "text/html",
                        success: function (result) { },
                        error: function (xhr) {
                            console.warn(" - Ajax Error [" + xhr.status + "] " + xhr.statusText);
                            window['does not exist'].ajaxOnErrorSample++;
                        }
                    });
                },
            };

            this.$log.info('Throwing AJAX request...');
            ajaxCfg.current = ajaxCfg.errHttp;
            ajaxCfg.callError();
        }

        public throwAngularException() {
            this.$log.info('About to break Angular...');
            this.$rootScope.$applyAsync(() => {
                this.$rootScope.missing.ngSampleError++;
            });
        }

        public throwTimeoutException() {
            this.$log.info('Setting timeout...');
            setTimeout(() => {
                this.$log.info('Entering timeout...');
                window['does not exist'].timeoutSampleError++;
                this.$log.info('Exit timeout...');
            }, 2 * 1000);
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