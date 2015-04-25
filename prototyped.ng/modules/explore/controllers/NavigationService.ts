
module proto.ng.modules.explorer {

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

        public onSelect(branch: SiteNode) {
            //this.$rootScope.$broadcast('nodeSelect', this);
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

    export class NavigationService {

        public selected: SiteNode;

        public siteExplorer: SiteNode;
        public clientStates: SiteNode;
        public fileSystem: SiteNode;

        private _treeData: TreeNode[] = [];
        private _treeMap: any = {};

        constructor(private $state, private $q) {
            this.init();
        }

        public init() {
            this.siteExplorer = new proto.ng.modules.explorer.SiteNavigationRoot('Site Explorer', this.$state.get()),
            this.fileSystem = new proto.ng.modules.explorer.SiteNavigationRoot('File System', this.$state.get()),
            this.clientStates = new proto.ng.modules.explorer.SiteNavigationRoot('Client States', this.$state.get()),
            this.register(this.siteExplorer)
                .register(this.fileSystem)
                .register(this.clientStates);
        }

        public register(node: TreeNode): NavigationService {
            var ident: string = node.label;
            if (ident in this._treeMap) return this;
            this._treeMap[ident] = node;
            this._treeData.push(node);
            return this;
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

}
