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

        public config(ident: string, options: any) : AppStateProvider {
            this.appConfigProvider.config(ident, options);
            return this;
        }

        public state(ident: string, options: any): AppStateProvider {
            this.$stateProvider.state(ident, options);
            return this;
        }

        public define(url: string, value: IAppRoute): AppStateProvider {
            if (!value.url) value.url = url;
            this.appState.routers.push(value);
            return this;
        }
    }

} 