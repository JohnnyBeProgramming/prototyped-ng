module proto.ng.modules.common {

    export interface IAppInfo {
        codeName?: string;
        userAgent?: string;
        versions?: any;
        detects?: any;
        about?: any;
        css?: any;
    }

    export class AppInfo implements IAppInfo {
        public codeName: string;
        public userAgent: string;
        public versions: any;
        public about: any;
        public detects: any;
        public css: any;

        constructor(codeName: string, userAgent: string) {
            this.codeName = codeName;
            this.userAgent = userAgent;
            this.versions = {
                ie: null,
                html: null,
                jqry: null,
                css: null,
                js: null,
                ng: null,
                nw: null,
                njs: null,
                v8: null,
                openssl: null,
                chromium: null,
            };
            this.about = {
                protocol: null,
                browser: {},
                server: {
                    url: null,
                    active: null,
                },
                os: {},
                hdd: { type: null },
            };
            this.detects = {
                jqry: false,
                less: false,
                bootstrap: false,
                ngAnimate: false,
                ngUiRouter: false,
                ngUiUtils: false,
                ngUiBootstrap: false,
            };
            this.css = {
                boostrap2: null,
                boostrap3: null,
            };
        }
    }

} 