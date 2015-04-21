﻿module proto.ng.common {

    export class AppOptions {
        public showAboutPage: boolean;
        public showDefaultItems: boolean;

        public constructor() {
            this.showAboutPage = true;
            this.showDefaultItems = true;
        }
    }

} 