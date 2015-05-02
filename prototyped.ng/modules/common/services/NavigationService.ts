
module proto.ng.modules.common.services {

    export class NavigationService {

        public selected: SiteNode;

        public siteExplorer: SiteExplorerRoot;
        public externalLinks: ExternalLinksRoot;
        public clientStates: SiteNavigationRoot;
        public fileSystem: FileBrowserRoot;

        private _treeData: TreeNode[] = [];
        private _treeMap: any = {};

        constructor(private $state, private appState: AppState) {
            this.init();
        }

        public init() {
            this.siteExplorer = new SiteExplorerRoot('Site Explorer', this.appState);
            this.register(this.siteExplorer)

            this.externalLinks = new ExternalLinksRoot('External Links', this.appState);
            this.register(this.externalLinks);

            if (this.appState.node.active) {
                this.fileSystem = new FileBrowserRoot('File Browser');
                this.register(this.fileSystem)
            }

            if (this.appState.debug) {
                this.clientStates = new SiteNavigationRoot('Client States', this.$state.get());
                this.register(this.clientStates)
            }
        }

        public register(node: TreeNode): NavigationService {
            var ident: string = node.label;
            if (ident in this._treeMap) return this;
            this._treeMap[ident] = node;
            this._treeData.push(node);
            return this;
        }

        public findByLabel(ident: string): SiteNode {
            var node: SiteNode;
            this._treeData.forEach((itm: SiteNode) => {
                if (itm.label == ident) node = itm;
            });
            return node;
        }

        public getTreeData(ident?: string): TreeNode[] {
            var ret: TreeNode[] = [];
            if (!ident && this._treeData) {
                return this._treeData;
            } else if (this._treeData.length) {
                this._treeData.forEach(function (itm, i) {
                    if (itm.label == ident) {
                        ret.push(itm);
                    }
                });
            }
            return ret;
        }

    }

    export class TreeNode {
        public label: string;
        public children: any[] = [];
        public classes: string[] = [];
        public expanded: boolean;
        public selected: boolean;
        public data: any;

        constructor(nodeName?: string) {
            this.label = nodeName;
        }
    }

    export class SiteNode extends TreeNode {
        constructor(nodeName: string, private state: any) {
            super(nodeName);
            this.data = state;
        }

        public onSelect(node: SiteNode) {
            //this.$rootScope.$broadcast('nodeSelect', this);
        }
    }

    export class SiteExplorerRoot extends SiteNode {

        constructor(nodeName: string, private appState: proto.ng.modules.common.AppState) {
            super(nodeName, null);
            this.init();
        }

        public init() {
            this.children = [];
            this.appState.routers.forEach((route, i) => {
                if (route.menuitem) {
                    var node = new SiteNode(route.menuitem.label, route);
                    if (node) {
                        node.onSelect = (item: SiteNode) => {
                            this.appState.navigate(item.data);
                        }
                    }
                    this.children.push(node);
                }
            });
        }
    }

    export class FileBrowserRoot extends SiteNode {

        public OnSelect: (node: SiteNode) => void;
        public UpdateUI: () => void;

        constructor(nodeName: string) {
            super(nodeName, './');
            this.init();
        }

        public init() {
            this.children = [];
            try {
                if (typeof require === 'undefined') return;

                // Resolve the full path
                var path = require('path');
                var target = path.resolve(this.data);
                var pattern = /[^\\]+\\?$/i;
                if (!pattern.test(target) || target == '' || target.indexOf('\\') < 0) {
                    this.label = target || 'Drive Root';
                    this.populateItem(this, target);
                } else {
                    var links: SiteNode[] = [];
                    var cwd = target;
                    while (pattern.test(cwd) && cwd != '') {
                        var label = pattern.exec(cwd)[0];
                        var folder = cwd.replace(pattern, '');
                        if (label) {
                            if (label.lastIndexOf('\\') == label.length - 1) label = label.substring(0, label.length - 1);
                            var linked = new SiteNode(label, cwd);
                            linked.onSelect = (itm) => {
                                this.selectItem(itm);
                            };
                            links.push(linked);
                        }
                        cwd = folder;
                    }
                    var last: SiteNode = this;
                    while (links.length) {
                        var node = links.pop();
                        last.children.push(node);
                        last = node;
                        last.expanded = true;
                        this.populateItem(node, node.data);
                    }
                }
            } catch (ex) {
                throw ex;
            }
        }

        public populateItem(parentNode: SiteNode, target: string) {
            if (!target) return;
            try {
                // Read the folder contents
                var fs = require('fs');
                var path = require('path');
                fs.readdir(target, (error, files) => {
                    if (error) {
                        console.warn('Could not read from filesystem: ', error);
                        return;
                    }

                    // Split and sort results
                    for (var i = 0; i < files.sort().length; ++i) {
                        try {
                            var targ = path.join(target, files[i]);
                            if (!parentNode.children.some((val: SiteNode) => { return val.label == files[i]; })) {
                                var stat = fs.statSync(targ);
                                if (stat.isDirectory()) {
                                    // Folder item
                                    var name = path.basename(targ);
                                    var linked = new SiteNode(name, targ);
                                    linked.onSelect = (itm) => {
                                        this.selectItem(itm);
                                    }
                                    parentNode.children.push(linked);
                                } else {
                                    // File item
                                }
                            }
                        } catch (ex) { }
                    }

                    parentNode.children.sort((a: SiteNode, b: SiteNode) => a.label == b.label ? 0 : (a.label > b.label ? 1 : -1));
                    parentNode.data.cached = true;

                    if (this.UpdateUI) {
                        this.UpdateUI();
                    }
                });

            } catch (ex) {
                console.warn(ex.message);
            }
        }

        public selectItem(node: SiteNode) {
            if (!node.data.cached) {
                this.populateItem(node, node.data);
            }
            if (this.OnSelect) {
                this.OnSelect(node);
            }
        }
    }

    export class SiteNavigationRoot extends SiteNode {

        private stateCache: any = {};

        constructor(nodeName: string, private states: any[]) {
            super(nodeName, null);
            this.init();
        }

        public init() {
            this.children = [];
            this.states.forEach((state, i) => {
                if (state.url == '^' || state.name == '') {
                    this.data = state; // Root node
                } else if (state.name.indexOf('.') < 0) {
                    this.addItem(this, [state.name], state);
                } else {
                    var parts = state.name.split('.');
                    this.addItem(this, parts, state);
                }
            });
        }

        public addItem(parentNode: SiteNode, paths: string[], state: any) {
            if (paths && paths.length) {
                var ident = paths[0];
                var parts = paths.splice(1);
                var node: SiteNode = this.stateCache[ident];
                if (!node) {
                    node = new SiteNode(ident, null);
                    this.stateCache[ident] = node;
                    parentNode.children.push(node);
                }
                if (!parts.length) {
                    node.data = state;
                } else {
                    this.addItem(node, parts, state);
                }
            }
        }
    }

    export class ExternalLinksRoot extends SiteNode {

        public OnSelect: (node: SiteNode) => void;
        public UpdateUI: () => void;

        constructor(nodeName: string, private appState: proto.ng.modules.common.AppState) {
            super(nodeName, '[externals]');
            this.init();
        }

        public init() {
            this.children = [];
            /*
            this.addGroup(this, 'Local Resources', [
                window.location.protocol + '//' + window.location.host + '/',
                window.location.protocol + '//' + window.location.host + '?/#/!test!/',
                window.location.protocol + '//' + window.location.host + '?/#/!debug!/',
            ]).expanded = false;
            */
            this.addGroup(this, 'Online Resources', [
                {
                    name: 'Wikipedia', url: 'https://www.wikipedia.org'
                },
                {
                    name: 'Wolfram Alpha', url: 'http://www.wolframalpha.com/',
                },
                {
                    name: 'Global Wind Maps', url: 'http://earth.nullschool.net/#current/wind/isobaric/1000hPa/orthographic=344.96,20.39,286',
                },
                {
                    name: 'Disaster Info Map', url: 'http://hisz.rsoe.hu/alertmap/index2.php',
                }
                //'http://map.ipviking.com/',
                //'https://maps.google.com',
                //'http://www.flightradar24.com',
            ]);
            this.addGroup(this, 'Development Resources', [
                {
                    name: 'Javascript Fiddler', url: 'https://jsfiddle.net/',
                },
                {
                    name: 'Microsoft.net Fiddler', url: 'https://dotnetfiddle.net/',
                },
                {
                    name: 'Font Awesome', url: 'http://fontawesome.io/icons/',
                },
                {
                    name: 'CSS3 Generator', url: 'http://css3generator.com/',
                },
                {
                    name: 'Regular Expressions', url: 'https://regex101.com/',
                },
                //'http://getbootstrap.com/',
            ]).expanded = false;
            /*
            this.addGroup(this, 'Additional Resources', [
                'http://www.databaseanswers.org/data_models/',
                'http://brunoimbrizi.com/experiments/#/07',
                'http://brunoimbrizi.com/experiments/#/03',
            ]).expanded = false;
            this.addGroup(this, 'Popular Websites', [
                'https://www.google.com',
                'https://www.facebook.com',
                'https://www.twitter.com',
                'https://www.reddit.com',
            ]).expanded = false;
            */
        }

        public addGroup(parent: proto.ng.modules.common.services.SiteNode, name: string, urls: any[]): proto.ng.modules.common.services.SiteNode {
            var node = new SiteNode(name, urls);
            if (urls) {
                urls.forEach((info: any) => {
                    if (typeof info == 'string') {
                        node.children.push(this.createLink(info));
                    } else {
                        node.children.push(this.createLink(info.url, info.name));
                    }
                });
            }
            if (parent) {
                parent.children.push(node);
            }
            return node;
        }

        public createLink(url: string, label?: string): SiteNode {
            var node = new SiteNode(label || url, url);
            if (node) {
                node.onSelect = (item) => {
                    if (this.OnSelect) {
                        this.OnSelect(item);
                    }
                };

                if (!label) {
                    var hostname = <string>(<any>$('<a href="' + node.data + '"></a>')[0]).hostname;
                    node.label = 'Loading: ' + hostname.replace('www.', '');
                    $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(node.data) + '&callback=?', (data) => {
                        var match = /\<title\>(.+)\<\/title\>/i.exec(data.contents);
                        if (match && match.length > 1) {
                            node.label = match[1];
                        }
                        if (this.UpdateUI) this.UpdateUI();
                    });
                }
            }
            return node;
        }
    }

}