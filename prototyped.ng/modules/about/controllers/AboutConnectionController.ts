module proto.ng.modules.about.controllers {

    export class AboutConnectionController {

        public result: any;
        public status: any;
        public latency: any;
        public state: any = {
            editMode: false,
            location: undefined,
            protocol: undefined,
            requireHttps: false,
        }

        constructor(private $scope, private $location, private appState: proto.ng.modules.common.AppState, public appInfo: proto.ng.modules.common.AppInfo) {
            this.init();
        }

        private init() {
            this.$scope.info = this.appInfo;

            this.result = null;
            this.status = null;
            this.state = {
                editMode: false,
                location: this.$location.$$absUrl,
                protocol: this.$location.$$protocol,
                requireHttps: (this.$location.$$protocol == 'https'),
            };

            this.detect();
        }

        public detect() {
            var target = this.state.location;
            var started = Date.now();
            this.result = null;
            this.latency = null;
            this.status = { code: 0, desc: '', style: 'label-default' };
            $.ajax({
                url: target,
                crossDomain: true,
                /*
                username: 'user',
                password: 'pass',
                xhrFields: {
                    withCredentials: true
                }
                */
                beforeSend: (xhr) => {
                    this.appState.updateUI(() => {
                        //this.status.code = xhr.status;
                        this.status.desc = 'sending';
                        this.status.style = 'label-info';
                    });
                },
                success: (data, textStatus, xhr) => {
                    this.appState.updateUI(() => {
                        this.status.code = xhr.status;
                        this.status.desc = textStatus;
                        this.status.style = 'label-success';
                        this.result = {
                            valid: true,
                            info: data,
                            sent: started,
                            received: Date.now()
                        };
                    });
                },
                error: (xhr: any, textStatus: string, error: any) => {
                    xhr.ex = error;
                    this.appState.updateUI(() => {
                        this.status.code = xhr.status;
                        this.status.desc = textStatus;
                        this.status.style = 'label-danger';
                        this.result = {
                            valid: false,
                            info: xhr,
                            sent: started,
                            error: xhr.statusText,
                            received: Date.now()
                        };
                    });
                },
                complete: (xhr, textStatus) => {
                    console.debug(' - Status Code: ' + xhr.status);
                    this.appState.updateUI(() => {
                        this.status.code = xhr.status;
                        this.status.desc = textStatus;
                    });
                }
            })
                .always((xhr) => {
                    this.appState.updateUI(() => {
                        this.latency = this.getLatencyInfo();
                    });
                });
        }

        public submitForm() {
            this.state.editMode = false;
            if (this.state.requireHttps) {
                this.setProtocol('https');
            } else {
                this.detect();
            }
        }

        public getLatencyInfo(): any {
            var cssNone = 'text-muted';
            var cssHigh = 'text-success';
            var cssMedium = 'text-warning';
            var cssLow = 'text-danger';
            var info = {
                desc: '',
                style: cssNone,
            };

            if (!this.result) {
                return info;
            }

            if (!this.result.valid) {
                info.style = 'text-muted';
                info.desc = 'Connection Failed';
                return info;
            }

            var totalMs = this.result.received - this.result.sent;
            if (totalMs > 2 * 60 * 1000) {
                info.style = cssNone;
                info.desc = 'Timed out';
            } else if (totalMs > 1 * 60 * 1000) {
                info.style = cssLow;
                info.desc = 'Impossibly slow';
            } else if (totalMs > 30 * 1000) {
                info.style = cssLow;
                info.desc = 'Very slow';
            } else if (totalMs > 1 * 1000) {
                info.style = cssMedium;
                info.desc = 'Relatively slow';
            } else if (totalMs > 500) {
                info.style = cssMedium;
                info.desc = 'Moderately slow';
            } else if (totalMs > 250) {
                info.style = cssMedium;
                info.desc = 'Barely Responsive';
            } else if (totalMs > 150) {
                info.style = cssHigh;
                info.desc = 'Average Response Time';
            } else if (totalMs > 50) {
                info.style = cssHigh;
                info.desc = 'Responsive Enough';
            } else if (totalMs > 15) {
                info.style = cssHigh;
                info.desc = 'Very Responsive';
            } else {
                info.style = cssHigh;
                info.desc = 'Optimal';
            }
            return info;
        }

        public getStatusColor(): string {
            var cssRes = this.getStatusIcon() + ' ';
            if (!this.result) {
                cssRes += 'busy';
            } else if (this.result.valid) {
                cssRes += 'success';
            } else {
                cssRes += 'error';
            }
            return cssRes;
        }

        public getStatusIcon(activeStyle?: string): string {
            var cssRes = '';
            if (!this.result) {
                cssRes += 'glyphicon-refresh';
            } else if (activeStyle && this.result.valid) {
                cssRes += activeStyle;
            } else {
                cssRes += this.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
            }
            return cssRes;
        }

        public getProtocolStyle(protocol, activeStyle): string {
            var cssRes = '';
            var isValid = this.state.location.indexOf(protocol + '://') == 0;
            if (isValid) {
                if (!this.result) {
                    cssRes += 'btn-primary';
                } else if (this.result.valid && activeStyle) {
                    cssRes += activeStyle;
                } else if (this.result) {
                    cssRes += this.result.valid ? 'btn-success' : 'btn-danger';
                }
            }
            return cssRes;
        }

        public setProtocol(protocol) {
            var val = this.state.location;
            var pos = val.indexOf('://');
            if (pos > 0) {
                val = protocol + val.substring(pos);
            }
            this.state.protocol = protocol;
            this.state.location = val;
            this.detect();
        }
    }

}  