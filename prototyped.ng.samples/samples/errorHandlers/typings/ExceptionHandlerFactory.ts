module proto.ng.samples.errorHandlers {

    export class ExceptionHandlerFactory {

        constructor(private $log, private appNode) {
        }

        public handleException(exception, cause): any {
            if (typeof Raven !== 'undefined') {
                this.setUpdatedErrorMessage(arguments, 'Exception [ EX ]: ');
                var ctx = {
                    tags: { source: "Angular Unhandled Exception" }
                };
                Raven.captureException(exception, ctx);
            } else if (this.appNode.active) {
                // ToDo: Hook in some routing or something...
                this.setUpdatedErrorMessage(arguments, 'Exception [ NW ]: ');
            } else {
                this.setUpdatedErrorMessage(arguments, 'Exception [ JS ]: ');
            }
        }

        public setUpdatedErrorMessage(args, prefix) {
            var ex = args.length > 0 ? args[0] : {};
            if (ex.message) {
                ex.message = prefix + ex.message;
            }
            this.$log.error.apply(this.$log, args);
        }

    }

}
