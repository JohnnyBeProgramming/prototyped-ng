module proto.ng.samples.errorHandlers {

    export class LogInterceptor {

        constructor(private $delegate, private appStatus) {
            this.init();
        }

        public init() {
            // Intercept messages
            var show = this.appStatus.config;
            var $delegate = this.$delegate;

            $delegate.debug = this.intercept($delegate.debug, (msg) => { if (show.all || show.debug) this.attach('debug', msg) });
            $delegate.log = this.intercept($delegate.log, (msg) => { this.attach('log', msg) });
            $delegate.info = this.intercept($delegate.info, (msg) => { this.attach('info', msg) });
            $delegate.warn = this.intercept($delegate.warn, (msg, ext) => { this.attach('warn', msg, ext) });
            $delegate.error = this.intercept($delegate.error, (msg, ext) => { this.attach('error', msg.message ? msg.message : msg, ext) });

            return this;
        }

        public intercept(func, callback) {
            return () => {
                var args = [].slice.call(arguments);
                callback.apply(null, args);
                func.apply(this.$delegate, args);
            };
        }

        private attach(msgType, msgDesc, msgExt?) {
            var itm: any = {
                type: msgType,
                desc: msgDesc,
                time: Date.now()
            };
            if (msgExt) {
                itm.ext = msgExt;
            }
            this.appStatus.logs.push(itm);
        }
    }
} 