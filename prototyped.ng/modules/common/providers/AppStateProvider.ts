module proto.ng.common.providers {

    export class AppStateProvider {
        public appState: AppState;

        constructor(private $stateProvider: any, private appConfigProvider: any, private appNodeProvider: AppNodeProvider) {
            var appConfig = appConfigProvider.$get();
            this.appState = new AppState($stateProvider, appNodeProvider, appConfig);
            this.appState.debug = appConfig.debug || false;
        }

        public $get(): any {
            return this.appState;
        }
    }

} 