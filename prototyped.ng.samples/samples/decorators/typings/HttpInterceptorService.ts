module proto.ng.samples.decorators {

    export function InterceptHttpResponse(response) {
        if (response.data && response.status === 200) {
            var out = DecorateHttpContents(response.data);
            if (out) {
                response.data = out;
            }
        }
    }

    export function DecorateHttpContents(html): string {
        var inp = $(html);
        if (inp.length) inp.each((i, elem: any) => {
            var el = $(elem);
            el.addClass('content-border-glow');
            el.addClass('-before');
        });
        var out = $('<p>').append(inp).html();
        return out;
    }

    export function InterceptorAjaxRequest(evt) {
        // Decorate the intercepted html
        var me = evt.target;
        var out = proto.ng.samples.decorators.DecorateHttpContents(me.responseText);
        angular.extend(me, {
            response: out,
            responseText: out,
        });
    }

} 