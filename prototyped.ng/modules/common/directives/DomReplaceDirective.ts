module proto.ng.modules.common.directives{

    export function DomReplaceDirective() {
        return {
            restrict: 'A',
            require: 'ngInclude',
            link: function (scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    }
}
