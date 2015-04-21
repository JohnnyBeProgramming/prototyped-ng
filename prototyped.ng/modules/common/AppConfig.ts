module proto.ng.common {

    export class AppConfig {
        public version: string;
        public options: AppOptions;
        public routers: any[];

        constructor() {
            this.routers = [];
            this.options = new AppOptions();
        }

    }

}