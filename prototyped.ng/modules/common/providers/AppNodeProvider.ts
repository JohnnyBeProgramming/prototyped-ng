module proto.ng.common.providers {

    export class AppNodeProvider {
        public appNode: AppNode;

        constructor() {
            this.appNode = new AppNode();
        }

        public $get(): AppNode {
            return this.appNode;
        }
    }

} 