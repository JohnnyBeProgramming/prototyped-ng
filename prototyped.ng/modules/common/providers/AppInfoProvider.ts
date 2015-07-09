module proto.ng.modules.common.providers {

    export class AppInfoProvider {

        public appInfo: AppInfo;
        public appState: AppState;

        constructor(private appStateProvider: AppStateProvider) {
            this.appState = appStateProvider.appState;
            this.appInfo = new proto.ng.modules.common.AppInfo(navigator.appCodeName, navigator.userAgent);
            this.init();
        }

        private init() {
            // Define the state
            this.detectBrowserInfo();
        }

        public $get(): AppInfo {
            return this.appInfo;
        }

        private refreshUI(action: () => void) {
            this.appState.updateUI(action);
        }

        public detectBrowserInfo(): any {
            var info = this.appInfo;
            try {
                // Get IE version (if defined)
                if (!!window['ActiveXObject']) {
                    info.versions.ie = 10;
                }

                // Sanitize codeName and userAgent
                this.resolveUserAgent(info);
                info.versions.jqry = typeof jQuery !== 'undefined' ? jQuery.fn.jquery : null;
                info.versions.ng = typeof angular !== 'undefined' ? angular.version.full : null;
                info.versions.nw = this.getVersionInfo('node-webkit');
                info.versions.njs = this.getVersionInfo('node');
                info.versions.v8 = this.getVersionInfo('v8');
                info.versions.openssl = this.getVersionInfo('openssl');
                info.versions.chromium = this.getVersionInfo('chromium');

                // Check for CSS extensions
                info.css.boostrap2 = this.selectorExists('hero-unit');
                info.css.boostrap3 = this.selectorExists('jumbotron');

                // Update location settings
                angular.extend(info.about, {
                    protocol: window.location.protocol,
                    server: {
                        url: window.location.href,
                    },
                });

                // Detect the operating system name
                info.about.os.name = this.detectOSName();

                // Check for jQuery
                info.detects.jqry = typeof jQuery !== 'undefined';

                // Check for general header and body scripts
                var sources: string[] = [];
                $("script").each((i, elem) => {
                    var src = $(elem).attr("src");
                    if (src) sources.push(src);
                });
                // Fast check on known script names
                this.checkScriptLoaded(sources, (src) => info.detects.less = info.detects.less || /(.*)(less.*js)(.*)/i.test(src));
                this.checkScriptLoaded(sources, (src) => info.detects.bootstrap = info.detects.bootstrap || /(.*)(bootstrap)(.*)/i.test(src));
                this.checkScriptLoaded(sources, (src) => info.detects.ngAnimate = info.detects.ngAnimate || /(.*)(angular\-animate)(.*)/i.test(src));
                this.checkScriptLoaded(sources, (src) => info.detects.ngUiRouter = info.detects.ngUiRouter || /(.*)(angular\-ui\-router)(.*)/i.test(src));
                this.checkScriptLoaded(sources, (src) => info.detects.ngUiUtils = info.detects.ngUiUtils || /(.*)(angular\-ui\-utils)(.*)/i.test(src));
                this.checkScriptLoaded(sources, (src) => info.detects.ngUiBootstrap = info.detects.ngUiBootstrap || /(.*)(angular\-ui\-bootstrap)(.*)/i.test(src));

                // Get the client browser details (build a url string)
                var detectUrl = this.getDetectUrl();

                // Send a loaded package to a server to detect more features
                $.getScript(detectUrl)
                    .done((script, textStatus) => {
                        this.refreshUI(() => {
                            // Browser info and details loaded
                            var browserInfo = new window.WhichBrowser();
                            angular.extend(info.about, browserInfo);
                        });
                    })
                    .fail((jqxhr, settings, exception) => {
                        console.error(exception);
                    });

                // Set browser name to IE (if defined)
                if (navigator.appName == 'Microsoft Internet Explorer') {
                    info.about.browser.name = 'Internet Explorer';
                }

                // Check if the browser supports web db's
                var webDB = info.about.webdb = this.getWebDBInfo();
                info.about.webdb.test();

            } catch (ex) {
                console.error(ex);
            }

            // Return the preliminary info
            return info;
        }

        public detectOSName(): string {
            var osName = 'Unknown OS';
            var appVer = navigator.appVersion;
            if (appVer) {
                if (appVer.indexOf("Win") != -1) osName = 'Windows';
                if (appVer.indexOf("Mac") != -1) osName = 'MacOS';
                if (appVer.indexOf("X11") != -1) osName = 'UNIX';
                if (appVer.indexOf("Linux") != -1) osName = 'Linux';
                //if (appVer.indexOf("Apple") != -1) osName = 'Apple';
            }
            return osName;
        }

        public getWebDBInfo(): any {
            var webDB = {
                db: null,
                version: '1',
                active: null,
                used: undefined, // 5MB max
                size: 5 * 1024 * 1024, // 5MB max
                test: (name, desc, dbVer, dbSize) => {
                    try {
                        // Try and open a web db
                        webDB.db = openDatabase(name, webDB.version, desc, webDB.size);
                        webDB.onSuccess(null, null);
                    } catch (ex) {
                        // Nope, something went wrong
                        webDB.onError(null, null);
                    }
                },
                onSuccess: (tx, r) => {
                    if (tx) {
                        if (r) {
                            console.info(' - [ WebDB ] Result: ' + JSON.stringify(r));
                        }
                        if (tx) {
                            console.info(' - [ WebDB ] Trans: ' + JSON.stringify(tx));
                        }
                    }
                    this.refreshUI(() => {
                        webDB.active = true;
                        webDB.used = JSON.stringify(webDB.db).length;
                    });
                },
                onError: (tx, e) => {
                    console.warn(' - [ WebDB ] Warning, not available: ' + e.message);
                    this.refreshUI(() => {
                        webDB.active = false;
                    });
                },
            };
            return webDB;
        }

        public checkScriptLoaded(sources: string[], filter: (val: string) => void) {
            sources.forEach((src) => {
                filter(src);
            });
        }

        public getDetectUrl(): string {
            return (function () {
                var p = [], w = <any>window, d = document, e = 0, f = 0; p.push('ua=' + encodeURIComponent(navigator.userAgent)); e |= w.ActiveXObject ? 1 : 0; e |= w.opera ? 2 : 0; e |= w.chrome ? 4 : 0;
                e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0; e |= ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
                e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0; p.push('e=' + e); f |= 'sandbox' in d.createElement('iframe') ? 1 : 0; f |= 'WebSocket' in w ? 2 : 0;
                f |= w.Worker ? 4 : 0; f |= w.applicationCache ? 8 : 0; f |= w.history && history.pushState ? 16 : 0; f |= (<any>d.documentElement).webkitRequestFullScreen ? 32 : 0; f |= 'FileReader' in w ? 64 : 0;
                p.push('f=' + f); p.push('r=' + Math.random().toString(36).substring(7)); p.push('w=' + screen.width); p.push('h=' + screen.height); var s = d.createElement('script');
                return 'https://api.whichbrowser.net/rel/detect.js?' + p.join('&');
            })()
        }

        public resolveUserAgent(info: proto.ng.modules.common.AppInfo) {
            var cn = info.codeName;
            var ua = info.userAgent;
            if (ua) {
                // Remove start of string in UAgent upto CName or end of string if not found.
                ua = ua.substring((ua + cn).toLowerCase().indexOf(cn.toLowerCase()));
                // Remove CName from start of string. (Eg. '/5.0 (Windows; U...)
                ua = ua.substring(cn.length);
                // Remove any spaves or '/' from start of string.
                while (ua.substring(0, 1) == " " || ua.substring(0, 1) == "/") {
                    ua = ua.substring(1);
                }
                // Remove the end of the string from first characrer that is not a number or point etc.
                var pointer = 0;
                while ("0123456789.+-".indexOf((ua + "?").substring(pointer, pointer + 1)) >= 0) {
                    pointer = pointer + 1;
                }
                ua = ua.substring(0, pointer);

                if (!window.isNaN(ua)) {
                    if (parseInt(ua) > 0) {
                        info.versions.html = ua;
                    }
                    if (parseFloat(ua) >= 5) {
                        info.versions.css = '3.x';
                        info.versions.js = '5.x';
                    }
                }
            }
        }

        public getVersionInfo(ident): any {
            try {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) { }
            return null;
        }

        public selectorExists(selector): any {
            return false; //Just does not seem to work...
            //var ret = css($(selector));
            //return ret;
        }

        private css(a): any {
            var sheets: any = document.styleSheets, o = [];
            for (var i in sheets) {
                var rules = sheets[i].rules || sheets[i].cssRules;
                for (var r in rules) {
                    if (a.is(rules[r].selectorText)) {
                        o.push(rules[r].selectorText);
                    }
                }
            }
            return o;
        }
    }

} 