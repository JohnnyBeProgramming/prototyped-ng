/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />

module proto.ng.samples.errorHandlers {

    export class SampleErrorService {

        public enabled: boolean = true;

        constructor(private $rootScope, private $log, private appConfig, private raven: raven.RavenService, private googleErrorService: google.GoogleErrorService) {
        }

        public checkChanged(handler) {
            this.$rootScope.$applyAsync(() => {
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
            });
        }

        throwManagedException() {
            this.$rootScope.$applyAsync(() => {
                var ctx = { tags: { source: "Sample Managed Exception" } };
                try {
                    this.$log.info('About to break something...');
                    Raven.context(ctx, () => {
                        window['does not exist'].managedSampleError++;
                    });
                } catch (ex) {
                    // throw ex; // this will also be caught by the global Angular exception handler
                    this.$log.warn('Exception caught and swallowed.');
                }
            });
        }

        throwAjaxException() {
            this.$rootScope.$applyAsync(() => {
                this.$log.info('Doing AJAX request...');

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
                            url: "/i.am.missing.html",
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
            });
        }

        throwAngularException() {
            this.$rootScope.$applyAsync(() => {
                this.$log.info('About to break Angular...');
                this.$rootScope.missing.ngSampleError++;
            });
        }

        throwTimeoutException() {
            this.$log.info('Setting timeout...');
            setTimeout(() => {
                this.$rootScope.$applyAsync(() => {
                    this.$log.info('Entering timeout...');
                    window['does not exist'].timeoutSampleError++;
                    this.$log.info('Exit timeout...');
                });
            }, 2 * 1000);
        }
    }

}  