///<reference path="../../../imports.d.ts"/>
///<reference path="../../common/services/NavigationService.ts"/>

module proto.ng.modules.explorer {

    export class ExternalLinksViewController {

        public selected: proto.ng.modules.common.services.SiteNode;

        constructor(private $rootScope, private $sce, private $q, public navigation: proto.ng.modules.common.services.NavigationService) {
            this.init();
        }

        public init() {
            if (this.navigation.externalLinks) {
                this.navigation.externalLinks.UpdateUI = () => {
                    this.$rootScope.$applyAsync(() => { });
                }
                this.navigation.externalLinks.OnSelect = (node) => {
                    this.$rootScope.$applyAsync(() => {
                        console.log(' - Loading: ' + node.data);
                        this.selected = node;
                    });
                }
            }
            this.$sce.trustAsHtml($('#ExternalExplorerPanel')[0]);
        }

        public trustSrc(src: string): string {
            return this.$sce.trustAsResourceUrl(src);
        }

        public openExternal() {
            if (this.selected) {
                window.open(this.selected.data, this.selected.label);
            }
        }

        public refreshExternal() {
            if (this.selected) {
                $('#ExternalExplorerPanel').attr('src', (i, val) => {
                    return this.trustSrc(val);
                });
            }
        }
    }

} 