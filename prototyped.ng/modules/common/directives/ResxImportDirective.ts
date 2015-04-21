module proto.ng.modules.common.directives {

    export function ResxImportDirective($templateCache, $document) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxImport;
                var cache = $templateCache.get(ident);
                if ($('[resx-src="' + ident + '"]').length <= 0) {
                    var html = '';
                    if (/(.*)(\.css)/i.test(ident)) {
                        if (cache != null) {
                            html = '<style resx-src="' + ident + '">' + cache + '</style>';
                        } else {
                            html = '<link resx-src="' + ident + '" href="' + ident + '" rel="stylesheet" type="text/css" />';
                        }
                    } else if (/(.*)(\.js)/i.test(ident)) {
                        if (cache != null) {
                            html = '<script resx-src="' + ident + '">' + cache + '</script>';
                        } else {
                            html = '<script resx-src="' + ident + '" src="' + ident + '">' + cache + '</script>';
                        }
                    }
                    if (html) {
                        $element.replaceWith(html);
                    }
                }
                return {
                    pre: (scope, element) => { },
                    post: (scope, element) => { }
                }
            }
        }
    }
}
 