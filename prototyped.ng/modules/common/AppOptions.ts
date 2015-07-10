module proto.ng.modules.common {

    export class AppOptions {
        public showAboutPage: boolean;
        public showDefaultItems: boolean;
        public includeDefaultStyles: boolean;
        public includeSandboxStyles: boolean;

        public constructor() {
            this.showAboutPage = true;
            this.showDefaultItems = true;
            this.includeDefaultStyles = true;
            this.includeSandboxStyles = false;
        }
    }

} 