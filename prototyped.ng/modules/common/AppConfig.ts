module proto.ng.modules.common {

    export class AppConfig {
        public title: string;
        public version: string;
        public options: AppOptions;
        public modules: any = {};

        constructor() {
            this.options = new AppOptions();            
        }
    }

}