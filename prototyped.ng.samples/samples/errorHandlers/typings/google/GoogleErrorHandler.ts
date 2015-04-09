﻿/// <reference path="GoogleErrorService.ts" />

module proto.ng.samples.errorHandlers.google {

    export class GoogleErrorHandler {

        public locked: boolean = true;
        public name: string = 'google';
        public label: string = 'Google Analytics';

        get enabled(): boolean { return this.service.isEnabled; }
        set enabled(state: boolean) { this.service.isEnabled = state; }

        constructor(private service: GoogleErrorService) { }

        public attach() {
            var isOnline = this.service.detect();
            this.service.isEnabled = true;
            this.service.handler.enabled = true;
        }

        public dettach() {
            this.service.isEnabled = false;
            this.service.handler.enabled = false;
        }

    }

} 