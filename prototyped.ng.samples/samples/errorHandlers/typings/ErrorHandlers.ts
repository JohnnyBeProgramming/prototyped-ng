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
}  