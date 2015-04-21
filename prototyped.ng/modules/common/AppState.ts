/// <reference path="../../imports.d.ts" />
/// <reference path="providers/AppNodeProvider.ts" />

module proto.ng.common {

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

        constructor(private $stateProvider, private appNodeProvider: proto.ng.common.providers.AppNodeProvider, private appConfig) {
            this.logs = [];
            this.html5 = true;
            this.title = appConfig.title || 'Prototyped';
            this.version = appConfig.version || '1.0.0';
            this.node = appNodeProvider.$get();
            this.current = {
                state: null
            };
        }

        public getIcon(): string {
            var icon = (this.node.active) ? 'fa fa-desktop' : 'fa fa-cube';
            var match = /\/!(\w+)!/i.exec(this.proxy || '');
            if (match && match.length > 1) {
                switch (match[1]) {
                    case 'test': return 'fa fa-puzzle-piece glow-blue animate-glow';
                    case 'debug': return 'fa fa-bug glow-orange animate-glow';
                }
            }

            if (this.current && this.current.state) {
                var currentState = this.current.state.name;
                this.appConfig.routers.forEach((itm, i) => {
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

    }

}