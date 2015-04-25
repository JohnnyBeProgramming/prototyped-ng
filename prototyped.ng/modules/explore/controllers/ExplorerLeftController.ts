///<reference path="../../../imports.d.ts"/>

module proto.ng.modules.explorer {

    export class ExplorerLeftController {

        constructor(private $rootScope: any, private $scope: any, public navigation: proto.ng.modules.explorer.NavigationService) {
            $scope.navigation = navigation;
        }

    }

} 