module proto.ng.explorer {

    export class SiteNode {
        public label: string;
        public children: any[] = [];
        public classes: string[] = [];

        constructor(nodeName?: string) {
            this.label = nodeName;
        }
    }

    export class SiteNavigationRoot extends SiteNode {

        constructor(private $q: any, nodeName?: string) {
            super(nodeName);
            this.init();
        }

        public init() {
            this.children = [];
        }

        public onSelect() {
        }
    }

    export class NavigationService {
        private TreeData: any = [];

        constructor(private $state, private $q) {
            this.init();
        }

        public init() {
            this.TreeData = [
                new proto.ng.explorer.SiteNavigationRoot(this.$q, 'Home Page')
            ];
        }

        public getTreeData() {
            return this.TreeData;
        }

    }

}
