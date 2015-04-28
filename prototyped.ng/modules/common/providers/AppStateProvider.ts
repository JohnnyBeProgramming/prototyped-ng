module proto.ng.modules.common.providers {

    export class AppStateProvider {
        public appState: AppState;

        public get appConfig(): AppConfig { return this.appConfigProvider.current; }

        constructor(private $stateProvider: any, private $urlRouterProvider: any, private appConfigProvider: AppConfigProvider, private appNodeProvider: AppNodeProvider) {
            var appConfig = appConfigProvider.$get();
            this.appState = new AppState($stateProvider, appNodeProvider, appConfig);
            this.appState.debug = false;
        }

        public $get(): any {
            return this.appState;
        }

        public when(srcUrl: string, dstUrl: string): AppStateProvider {
            this.$urlRouterProvider.when(srcUrl, dstUrl);
            return this;
        }

        public config(ident: string, options: any): AppStateProvider {
            this.appConfigProvider.config(ident, options);
            return this;
        }

        public state(ident: string, options: any): AppStateProvider {
            this.$stateProvider.state(ident, options);
            return this;
        }

        public define(name: string, value: IAppRoute): AppStateProvider {
            this.appState.routers.push(value);
            if (!value.name) value.name = name;
            if (value.state && value.name) {
                this.state(name, value.state);
            }
            return this;
        }
    }

} 