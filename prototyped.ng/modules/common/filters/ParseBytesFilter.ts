module proto.ng.modules.common.filters {

    export function ParseBytesFilter() {
        return function (bytesDesc, precision) {
            var match = /(\d+) (\w+)/i.exec(bytesDesc);
            if (match && (match.length > 2)) {
                var bytes = match[1];
                var floatVal = parseFloat(bytes);
                if (isNaN(floatVal) || !isFinite(floatVal)) return '[?]';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
                var number = Math.floor(Math.log(floatVal) / Math.log(1024));
                var pow = -1;
                units.forEach(function (itm, i) {
                    if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0) pow = i;
                });
                if (pow > 0) {
                    var ret = (floatVal * Math.pow(1024, pow)).toFixed(precision);
                    return ret;
                }
            }
            return bytesDesc;
        }
    }
} 