/// <reference path="RavenService.ts" />

module proto.ng.samples.errorHandlers.raven {

    export class RavenErrorHandler {

        public name: string = 'raven';
        public label: string = 'Sentry via RavenJS';

        get enabled(): boolean { return this.service.isEnabled; }
        set enabled(state: boolean) { this.service.isEnabled = state; }

        constructor(private service: RavenService) { }

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