module proto.ng.samples.errorHandlers {

    export class ExceptionHandlerFactory {

        constructor(private $log, private appNode) {
        }

        public handleException(exception, cause) {
            try {
                var source = this.appNode.active ? 'Angular[ NW ]' : 'Angular[ JS ]';
                proto.ng.samples.errorHandlers.HandleException(source, exception, {
                    cause: cause,
                });
            } catch (ex) {
                this.$log.error.apply(this.$log, ['Critical fault in angular error reporting...', ex]);
            }
            if (this.appNode.active) {
                // ToDo: Hook in some routing or something...
            }
        }

    }

}
