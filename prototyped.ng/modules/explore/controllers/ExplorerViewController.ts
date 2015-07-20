﻿///<reference path="../../../imports.d.ts"/>
///<reference path="../../common/services/NavigationService.ts"/>

module proto.ng.modules.explorer {

    export class ExplorerViewController {

        public selected: proto.ng.modules.common.services.SiteNode;

        constructor(private $rootScope, private $scope, private $q, public pageLayout: proto.ng.modules.common.services.PageLayoutService) {
        }

        public toggleDockedRegion() {
            this.pageLayout.toggle();
        }

    }

} 