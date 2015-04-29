///<reference path="../../../imports.d.ts"/>
///<reference path="../../common/services/NavigationService.ts"/>

module proto.ng.modules.explorer {

    export class ExplorerLeftController {

        constructor(private $rootScope: any, private $scope: any, public navigation: proto.ng.modules.common.services.NavigationService) {
            $scope.navigation = navigation;
        }

    }

} 