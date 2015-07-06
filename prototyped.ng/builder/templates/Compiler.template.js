(function (window, document) {
    try {
        // Define the payload
        var encoders = {};
        var module = {};
        var ctx = window.___ctx___ = window.___ctx___ || {
            init: function () {
                // Save Initial state
                if (!ctx.state) {
                    ctx.state = {
                        head: document.head.innerHTML,
                        body: document.body.innerHTML,
                    };
                }

                // Include: String Prototype
                /*{1}*/

                // Link included module
                if (module.exports) {
                    encoders.sp = module.exports;

                    var spx = new encoders.sp();
                    encoders.lzw = spx.encoders.lwz;
                    encoders.md5 = spx.encoders.md5;
                    encoders.base64 = spx.encoders.base64;
                    module.exports = null;
                }
                // Link included module
                if (module.exports) {
                    module.exports = null;
                }
            },
            reset: function () {
                if (ctx.state) {
                    document.head.innerHTML = ctx.state.head;
                    document.body.innerHTML = ctx.state.body;
                }
                console.clear();
            },
            insert: function (parentElem, item) {
                console.log('   + ' + item.type);
                switch (item.type) {
                    case 'script':
                        if (item.text) {
                            item.text['']().script(parentElem);
                        }
                        break;
                    case 'html':
                        if (item.text) {
                            ctx.html(parentElem, item.text);
                        }
                        break;
                    case 'comment':
                        if (item.text) {
                            ctx.comment(parentElem, item.text);
                        }
                        break;
                    default: break;
                }
            },
            title: function (desc) {
                if (desc) {
                    document.title = desc;
                }
            },
            link: function (attrs, callback) {
                var link = document.createElement('link');
                link.onload = function (evt) {
                    if (callback) callback(url, evt);
                }
                for (var attrName in attrs) {
                    link[attrName] = attrs[attrName];
                }
                document.head.appendChild(link);
            },
            base: function (path) {
                var elem = document.createElement("base");
                elem.setAttribute('href', path);
                document.getElementsByTagName("head")[0].appendChild(elem);
            },
            meta: function (attrs) {
                var elem = document.createElement("meta");
                for (var name in attrs) {
                    elem.setAttribute(name, attrs[name]);
                }
                document.getElementsByTagName("head")[0].appendChild(elem);
            },
            html: function (parentElem, contents) {
                if (contents) {
                    var div = document.createElement('div');
                    div.innerHTML = contents;
                    if (div.childNodes && div.childNodes.length) {
                        for (var i = 0; i < div.childNodes.length; i++) {
                            var child = div.childNodes[i];
                            (parentElem || document.body).appendChild(child);
                        }
                    }
                }
            },
            comment: function (parentElem, text) {
                if (text) {
                    var c = document.createComment(text);
                    (parentElem || document.body).appendChild(c);
                }
            },
            style: function (contents, parentElem) {
                var style = document.createElement('style');
                style.textContent = contents;
                (parentElem || document.head).appendChild(style);
            },
            script: function (input, isUrl, parentElem) {
                if (isUrl) {
                    // This is an import url
                    input['']().inject();
                } else {
                    // This is javascript contents
                    input['']().script(parentElem || document.body);
                }
            },
            load: function (payload) {
                if (payload) {
                    var success = true;
                    try {
                        // Decode and parse contents of the payload
                        var decoded = encoders.base64.decode(payload);
                        var htmlObj = JSON.parse(decoded);

                        if (htmlObj.clean) {
                            document.head.innerHTML = '';
                            document.body.innerHTML = '';
                        }

                        console.log(' - Unpacking:', htmlObj);

                        // 1) Set document Language
                        var html = document.getElementsByTagName('html')[0];
                        if (htmlObj.lang && (html.lang != htmlObj.lang)) {
                            console.log(' - Setting Language: ', htmlObj.lang);
                            html.lang = htmlObj.lang;
                        }

                        // 2) Load Headers
                        if (htmlObj.head && htmlObj.head.length) {
                            console.log(' - Loading Headers...');
                            htmlObj.head.forEach(function (item) {
                                ctx.insert(document.head, item);
                            });
                        }

                        // 3) Load Body
                        if (htmlObj.body && htmlObj.body.length) {
                            console.log(' - Loading Body...');
                            htmlObj.body.forEach(function (item) {
                                ctx.insert(document.body, item);
                            });
                        }

                        // 4) Call Ready
                        ctx.ready = true;
                        console.log(' - Ready.');

                    } catch (ex) {
                        success = false;
                        alert(ex.message);
                    }

                }
            },
        };

        // Check if available
        if (!ctx.ready) {
            ctx.init();
        } else if (ctx.state) {
            ctx.reset();
        }

        // Load contents
        ctx.load(/*{0}*/);

    } catch (ex) {
        alert(ex.message);
    }

    return ctx;

})(window || {}, document || {});
