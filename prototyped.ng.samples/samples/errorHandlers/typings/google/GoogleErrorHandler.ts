/// <reference path="GoogleErrorService.ts" />

declare var _gaq: any;

module proto.ng.samples.errorHandlers.google {

    export class GoogleErrorHandler {

        public locked: boolean = false;
        public name: string = 'google';
        public label: string = 'Google Analytics';

        get enabled(): boolean { return this.service.isEnabled; }
        set enabled(state: boolean) { this.service.isEnabled = state; }

        constructor(private service: GoogleErrorService) { }

        public attach() {
            var isOnline = this.service.detect();
            this.service.isEnabled = isOnline;
        }

        public dettach() {
            this.service.isEnabled = false;
        }
    }

} 