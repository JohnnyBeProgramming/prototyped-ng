module proto.ng.samples.decorators {

    export class StackTraceUtils {
        public static filters: any[] = [
            function (include, item) {
                // Exclude loading bar delegates
                if (/(loading-bar)/i.test(item.filename)) return false;
                return include;
            },
            function (include, item) {
                // Ignore routing...?
                if (/(angular-ui-router)/i.test(item.filename)) return false;
                return include;
            },
            /*
            function (include, item) {
                if (/(localhost)/i.test(item.hostname)) return true;
                return include;
            },
            function (include, item) {
                if (/(localhost)/i.test(item.hostname)) return true;
                return include;
            },
            function (include, item) {
                if (/(scope\.decorators\.openModalWindow)/i.test(item.source)) return false;
                return include;
            },
            function (include, item) {
                if (/(Scope\._scope\.ok)/i.test(item.source)) return false;
                return include;
            },
            */
            function (include, item) {
                return include
                    || /(scope\.decorators\.fcall)/i.test(item.source);
            },
            function (include, item) {
                return include
                    || /(scope\.decorators\.runPromiseAction)/i.test(item.source);
            },
        ];
    }

} 