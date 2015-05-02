module proto.ng.modules.about.controllers {

    export class AboutInfoController {

        constructor(private $scope, public appInfo: proto.ng.modules.common.AppInfo) {
            this.init();
        }

        private init() {
            this.$scope.info = this.appInfo;
        }

    }

} 