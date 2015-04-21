module proto.ng.modules.common.directives {

    export function ResxIncludeDirective($templateCache) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxInclude;
                var cache = $templateCache.get(ident);
                if (cache) {
                    $element.text(cache);
                    //$element.replaceWith(cache);
                }
                return {
                    pre: (scope, element) => { },
                    post: (scope, element) => { }
                }
            }
        }
    }
}
 