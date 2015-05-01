module proto.ng.modules.common.filters {

    export function TrustedUrlFilter($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        }
    }
}  