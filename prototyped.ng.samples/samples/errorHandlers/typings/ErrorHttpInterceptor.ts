module proto.ng.samples.errorHandlers {

    export class ErrorHttpInterceptor {

        constructor(private $log, private $q) {
        }

        public responseError(rejection) {
            this.$log.error('HTTP response error: ' + rejection.config || rejection.status);
            if (typeof Raven !== 'undefined') {
                var ctx = {
                    tags: { source: "Angular Http Interceptor" }
                };
                var err = new Error('HTTP response error');
                Raven.captureException(err, angular.extend(ctx, {
                    extra: {
                        config: rejection.config,
                        status: rejection.status
                    }
                }));
            }
            return this.$q.reject(rejection);
        }

    }

}
 