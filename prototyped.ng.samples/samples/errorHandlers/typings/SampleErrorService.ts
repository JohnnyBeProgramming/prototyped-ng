/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />

module proto.ng.samples.errorHandlers {

    export class ErrorHandlers {
        public static enabled: boolean = true;
        public static logs: any = null;
        private static list: any[] = [];

        public static Register(handler: any) {
            this.list.push(handler);
        }

        public static ListAll(): any[] {
            return this.list;
        }
    }

    export function HandleException(source: string, error: any, tags: any) {
        var enabled = ErrorHandlers.enabled;
        if (enabled) {
            try {
                // Notify all handlers that are enabled
                ErrorHandlers.ListAll().forEach((service: any) => {
                    if (service.isEnabled && service.handleException) {
                        service.handleException(source, error, tags || {});
                    }
                });
            } catch (ex) {
                // Something went wrong :(
                console.error('Critical fault in error reporting services...', ex);
            }
        }

        // Display error in the console...
        var $log: any = ErrorHandlers.logs || angular.injector(['ng']).get('$log');
        if ($log) $log.error.apply($log, [source + ': ' + error.message || error, tags]);

        return enabled;
    }

    export class SampleErrorService {

        get enabled(): boolean { return ErrorHandlers.enabled; }
        set enabled(state: boolean) { ErrorHandlers.enabled = state; }

        constructor(private $rootScope, private $log, private appConfig, private raven: raven.RavenService, private google: google.GoogleErrorService) {
            // Hook the global handlers
            ErrorHandlers.logs = $log;
            ErrorHandlers.Register(google);
            ErrorHandlers.Register(raven);
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

    }

}  