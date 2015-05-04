/// <reference path="../../common/services/NavigationService.ts" />

module proto.ng.modules.about.controllers {

    export class ConnectedNode extends proto.ng.modules.common.services.SiteNode {
        public status: string;

        public static UpdateUI: (action: () => void) => void = () => { };

        constructor(name: string, public url: string) {
            super(name, url);
            this.classes = ['tree-item'];
        }

        public detect() {
            try {
                this.status = 'Checking';
                this.classes = ['tree-item', 'loading'];
                $.ajax({
                    url: this.url,
                    type: 'HEAD',
                    timeout: 1000,
                    statusCode: {
                        200: (response) => {
                            ConnectedNode.UpdateUI(() => {
                                this.status = 'Online';
                                this.classes = ['tree-item', 'online'];
                            });
                        },
                        400: (response) => {
                            ConnectedNode.UpdateUI(() => {
                                this.status = 'Offline';
                                this.classes = ['tree-item', 'offline'];
                            });
                        },
                        404: (response) => {
                            ConnectedNode.UpdateUI(() => {
                                this.status = 'Not Found';
                                this.classes = ['tree-item', 'offline'];
                            });
                        },
                        0: (response) => {
                            ConnectedNode.UpdateUI(() => {
                                this.classes = ['tree-item', 'warning'];
                                this.status = 'Unknown';
                            });
                        }
                    }
                });
            } catch (ex) {
                ConnectedNode.UpdateUI(() => {
                    this.status = 'Failed';
                    this.classes = ['tree-item', 'offline'];
                });
            }
        }
    }

    export class ScriptNode extends ConnectedNode {

        constructor(name: string, public url: string) {
            super(name, url);
        }

    }

    export class DomainNode extends ConnectedNode {
        public scripts: ScriptNode[] = [];

        constructor(domain: string) {
            super(domain, domain);
        }

        public refresh() {
            if (this.children) {
                this.children.forEach((child: ConnectedNode) => {
                    child.detect();
                });
            }
            this.detect();
        }
    }

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
        public domains: DomainNode[] = [];
        public localhost: DomainNode;
        public selected: proto.ng.modules.common.services.SiteNode;
        private links: any = {};

        constructor(private $scope, private $location, private appState: proto.ng.modules.common.AppState, public appInfo: proto.ng.modules.common.AppInfo, public navigation: proto.ng.modules.common.services.NavigationService) {
            this.init();
        }

        private init() {
            ConnectedNode.UpdateUI = (action) => {
                this.appState.updateUI(action);
            };

            this.$scope.info = this.appInfo;

            this.result = null;
            this.status = null;
            this.state = {
                editMode: false,
                location: this.$location.$$absUrl,
                protocol: this.$location.$$protocol,
                requireHttps: (this.$location.$$protocol == 'https'),
            };

            this.localhost = this.links['localhost'] = this.createNode('localhost');
            this.localhost.label = 'Local Web Resources';

            this.getScripts();
            this.detect();

            this.domains.forEach((node: DomainNode) => {
                node.refresh();
            });
        }

        public detect() {
            var target = this.state.location;
            var started = Date.now();
            this.result = null;
            this.latency = null;
            this.status = { code: 0, desc: '', style: 'label-default' };
            $.ajax({
                url: target,
                type: 'HEAD',
                timeout: 10000,
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

        public createNode(domain: string): DomainNode {
            var node = new DomainNode(domain);
            node.onSelect = (itm) => { this.nodeSelect(itm); };
            this.domains.push(node);
            return node;
        }

        public nodeSelect(item: proto.ng.modules.common.services.SiteNode) {
            if (this.selected == item) {
                item.expanded = !item.expanded;
                return;
            }
            if (this.selected) {
                this.selected.selected = false;
            }
            item.selected = true;
            this.selected = item;

            if (item.data) {
                var url = item.data;
                if (!/https?\:\/\//i.test(url)) {
                    url = 'http://' + url;
                }
                this.state.location = url;
                this.detect();
            }
        }

        public addLink(source, path, type) {
            var linkElem = (<any>$('<a href="' + path + '"></a>')[0]);
            var hostname: string = linkElem.hostname;
            var pathDesc: string = linkElem.pathname;
            var hostNode: DomainNode = (hostname in this.links) ? this.links[hostname] : null;
            if (!hostNode) {
                hostNode = this.createNode(hostname);
                this.links[hostname] = hostNode;
            }
            var scriptNode = new ScriptNode(pathDesc, linkElem.href);
            scriptNode.onSelect = (itm) => { this.nodeSelect(itm); };
            hostNode.children.push(scriptNode);
        }

        public getScripts() {
            // Get header scripts
            $(document.head).find('script[src]').each((i, elem) => {
                this.addLink('head', $(elem).attr('src'), $(elem).attr('type') || 'text/javascript');
            });
            $(document.head).find('link[href]').each((i, elem) => {
                this.addLink('head', $(elem).attr('href'), $(elem).attr('type') || 'css/stylesheet');
            });

            // Get body scripts
            $(document.body).find('script[src]').each((i, elem) => {
                this.addLink('body', $(elem).attr('src'), $(elem).attr('type') || 'text/javascript');
            });
            $(document.head).find('link[href]').each((i, elem) => {
                this.addLink('body', $(elem).attr('href'), $(elem).attr('type') || 'css/stylesheet');
            });
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