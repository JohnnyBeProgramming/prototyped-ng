module proto.ng.modules.common.filters {

    export function IsArrayFilter() {
        return function (input) {
            return angular.isArray(input);
        };
    }

    export function IsNotArrayFilter() {
        return function (input) {
            return angular.isArray(input);
        };
    }

} 