/// <reference path="../../imports.d.ts" />
/// <reference path="providers/AppNodeProvider.ts" />

module proto.ng.modules.common {

    export interface IAppRoute {
        name?: string;
        url?: string;
        state?: any;
        menuitem?: any;
        cardview?: any;
        children?: IAppRoute[];
        visible?: () => boolean;
    }

    export class AppState {
        public debug: boolean;
        public html5: boolean;
        public title: string;
        public version: string;
        public current: {
            state: {
                name: string
            }
        };
        public proxy: string;
        public node: AppNode;
        public routers: IAppRoute[];
        public logs: any[];
        /*
        public show: {
            all: true,
            log: false,
            info: true,
            warn: true,
            error: true,
            debug: false,
        },
        */

        public get config() { return this.appConfig; }

        public get state() { return this._state; }
        public set state(val: any) { this._state = val; }

        private _state: any;

        constructor(private $stateProvider, private appNodeProvider: proto.ng.modules.common.providers.AppNodeProvider, private appConfig) {
            this.logs = [];
            this.html5 = true;
            this.title = appConfig.title || 'Prototyped';
            this.version = appConfig.version || '1.0.0';
            this.node = appNodeProvider.$get();
            this.routers = [];
            this.current = {
                state: null
            };
        }

        public getIcon(): string {
            var icon = (this.node.active) ? 'fa fa-desktop' : 'fa fa-cube';
            var match = /\/!(\w+)!/i.exec(this.proxy || '');
            if (match && match.length > 1) {
                switch (match[1]) {
                    case 'test': return 'fa fa-flask glow-blue animate-glow';
                    case 'debug': return 'fa fa-bug glow-orange animate-glow';
                }
            }

            if (this.current && this.current.state) {
                var currentState = this.current.state.name;
                this.routers.forEach((itm, i) => {
                    if (itm.menuitem && itm.menuitem.state == currentState) {
                        icon = itm.menuitem.icon;
                    }
                });
            }
            return icon;
        }

        public getColor(): string {
            var logs = this.logs;
            if (logs.some((val, i, array): boolean => val.type == 'error')) {
                return 'glow-red';
            }
            if (logs.some((val, i, array): boolean => val.type == 'warn')) {
                return 'glow-orange';
            }
            if (logs.some((val, i, array): boolean => val.type == 'info')) {
                return 'glow-blue';
            }
            if (this.node.active) {
                return 'glow-green';
            }
            return '';
        }

        public navigate(route: IAppRoute) {
            var hasState = route.name && route.state;
            if (hasState && route.menuitem && route.menuitem.state) {
                this.state.go(route.menuitem.state);
            } else if (hasState && !route.state.abstract) {
                console.debug(' - State: ' + route.name, route.state);
                this.state.go(route.name);
            } else if (route.url) {
                console.debug(' - Direct Url: ', route.url);
                window.location.href = route.url;
            }
        }

        public proxyAvailable(ident): boolean {
            var loc = window.location;
            if (loc.pathname == '/' && !loc.hash) return false;
            switch (ident) {
                case 'debug': return true;
                case 'test': return true;
                default: false;
            }
        }

        public setProxy(ident: string) {
            var loc = window.location;
            var match = /#\/!\w+!\//i.exec(loc.hash);
            if (match) {
                var sep = loc.href.indexOf('?') < 0 ? '?' : '';
                var url = loc.protocol + '//' + loc.host + sep + '/#/!' + ident + '!' + (loc.pathname || '/') + loc.hash.substring(match[0].length);
                console.log(' - Change Proxy: ', url);
                window.location.href = url;
            } else {
                console.log(' - Set Proxy: ', url);
                var url = loc.protocol + '//' + loc.host + '/#/!' + ident + '!' + (loc.pathname || '/');
                window.location.href = url;
            }
        }

        public cancelProxy() {
            var loc = window.location;
            var match = /#\/!\w+!\//i.exec(loc.hash);
            if (match) {
                console.log(' - Cancel Proxy: ', match);
                var url = loc.protocol + '//' + loc.host + (loc.pathname || '/') + loc.hash.substring(match[0].length);
                window.location.href = url;
            }
        }
    }

}