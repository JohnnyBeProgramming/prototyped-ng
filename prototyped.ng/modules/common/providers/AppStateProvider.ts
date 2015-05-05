module proto.ng.modules.common.providers {

    export class AppStateProvider {
        public appState: AppState;

        public get appConfig(): AppConfig { return this.appConfigProvider.current; }

        constructor(private $stateProvider: any, private $locationProvider, private $urlRouterProvider: any, private appConfigProvider: AppConfigProvider, private appNodeProvider: AppNodeProvider) {
            var appConfig = appConfigProvider.$get();
            this.appState = new AppState($stateProvider, appNodeProvider, appConfig);
            this.init();
        }

        private init() {
            this.appState.debug = false;
            try {
                // Try and figure out router mode from the initial url
                var pageLocation = typeof window !== 'undefined' ? window.location.href : '';
                if (pageLocation.indexOf('#') >= 0) {
                    var routePrefix = '';
                    var routeProxies = [
                        '/!test!',
                        '/!debug!',
                    ];

                    // Check for specific routing prefixes
                    routeProxies.forEach(function (name) {
                        if (pageLocation.indexOf('#' + name) >= 0) {
                            routePrefix = name;
                            return;
                        }
                    });

                    // Override the default behaviour (only if required)
                    if (routePrefix) {
                        this.$locationProvider.hashPrefix(routePrefix);
                    }

                    this.appState.proxy = routePrefix;
                    this.appState.html5 = !routePrefix;
                    this.appState.debug = /debug/i.test(routePrefix);

                    $(document.body).toggleClass('debug', this.appState.debug);
                    $(document.body).toggleClass('tests', /test/i.test(routePrefix));

                    // Show a hint message to the  user
                    var proxyName = this.appState.proxy;
                    if (proxyName) {
                        var checkName = /\/!(\w+)!/.exec(proxyName);
                        if (checkName) proxyName = checkName[1];

                        console.debug(' - Proxy Active: ' + proxyName);

                        var css = 'alert alert-info';
                        switch (proxyName) {
                            case 'debug': css = 'alert alert-warning'; break;
                            case 'test': css = 'alert alert-info'; break;
                        }

                        var div: any = $('<div draggable="true" class="top-hint"></div>');
                        if (div) {
                            var text = $('<span>Note: Proxy router <b>' + proxyName + '</b> is active.</span>');
                            var icon = $('<i class="' + this.appState.getIcon() + '" style="margin-right:4px;"></i>');
                            var link = $('<a href="" class="pull-right glyphicon glyphicon-remove" style="text-decoration: none; padding: 3px;"></a>');
                            var span = $('<span class="tab non-dragable ' + css + '"></span>');
                            link.click(() => {
                                this.appState.cancelProxy();
                            });
                            span.append(link);
                            span.append(icon);
                            span.append(text);
                            div.append(span);
                        }
                        if (div.draggable) {
                            div.draggable({ axis: "x" });
                        }
                        $(document.body).append(div);
                    }
                }

                // Configure the pretty urls for HTML5 mode
                this.$locationProvider.html5Mode(this.appState.html5);

            } catch (ex) {
                throw ex;
            }
        }

        public $get(): any {
            return this.appState;
        }

        public when(srcUrl: string, dstUrl: string): AppStateProvider {
            this.$urlRouterProvider.when(srcUrl, dstUrl);
            return this;
        }

        public otherwise(dstUrl: string): AppStateProvider {
            this.$urlRouterProvider.otherwise(dstUrl);
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