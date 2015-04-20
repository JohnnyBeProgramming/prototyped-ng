module proto.ng.explorer {

    export class ExplorerViewController {

        public selected: SiteNode;

        constructor(private $rootScope, private $scope, private $q, public navigation: NavigationService) {
        }

    }

} 