module proto.ng.modules.common.filters {

    export function TypeCountFilter() {
        return function (input, type) {
            var count = 0;
            if (!input) return null;
            if (input.length > 0) {
                input.forEach(function (itm) {
                    if (!itm) return;
                    if (!itm.type) return;
                    if (itm.type == type) count++;
                });
            }
            return count;
        };
    }
} 