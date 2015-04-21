module proto.ng.modules.common {

    export class AppConfig {
        public version: string;
        public options: AppOptions;
        public modules: any = {};

        constructor() {
            this.options = new AppOptions();            
        }
    }

}