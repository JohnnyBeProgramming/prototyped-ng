module proto.ng.modules.common.filters {

    export function FromNowFilter($filter) {
        return function (dateString, format) {
            try {
                if (typeof moment !== 'undefined') {
                    return moment(dateString).fromNow(format);
                } else {
                    return ' at ' + $filter('date')(dateString, 'HH:mm:ss');
                }
            } catch (ex) {
                console.error(ex);
                return 'error';
            }
        };
    }

} 