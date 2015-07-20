///<reference path="../../../imports.d.ts"/>

module proto.ng.modules.explorer {

    export function LayoutViewerDirective(): any {
        return {
            restrict: 'EA',
            scope: {
                root: '=pageLayoutViewer'
            },
            replace: true,
            transclude: false,
            templateUrl: 'modules/explore/views/layout.tpl.html',
            controller: 'LayoutViewerController',
            controllerAs: 'viewCtrl',
            link: (scope, element, attrs) => {
                scope.setView(element[0]);
            },
        };
    }

    export class LayoutViewerController {

        private view: HTMLElement;

        constructor(private $rootScope: any, private $scope: any, private pageLayoutService: proto.ng.modules.common.services.PageLayoutService) {
            $scope.setView = (view) => {
                this.view = view;
                this.init(document.body);
            }
        }

        private init(root) {

            // Add the layout view to the excludes list
            this.pageLayoutService.addFilter((elem) => elem == this.view);
            this.pageLayoutService.addCallback((rootNode) => {
                this.draw();
            });
            this.pageLayoutService.build();

            /* ToDo: get navigation working...
            this.navigationService['layoutNodes'] = [
                this.node,
                new proto.ng.modules.common.services.SiteNode('One', null),
            ];
            */

            // Load D3 libraries if not defined
            if (typeof d3 !== 'undefined') {
                this.start(d3);
            } else {
                console.log(' - Loading D3....');
                var url = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js';
                $.getScript(url, (data, textStatus, jqxhr) => {
                    console.log(' - D3 Loaded:', d3);
                    this.start(d3);
                });
            }
        }

        private start(d3: any) {
            var found = d3.select('#LayoutView .layoutGroup');
            if (found.length) {
                found.call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", () => {
                    found.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                }));
            }
        }

        private draw() {
            var info = this.pageLayoutService.node;
            if (this.view) {
                // Set content with and height

                // Draw the background container
                var layout = this.drawElem(info);
                var background = this.drawElem(<proto.ng.modules.common.services.LayoutNode>{
                    x: 0,
                    y: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    cssName: 'outer-region',
                    children: [],
                    level: -0.1,
                });

                var group = $('<g class="layoutGroup"></g>')[0];
                if (background.length) group.appendChild(background[0]);
                if (layout) layout.forEach((item) => group.appendChild(item));

                // Draw contents
                while (this.view.firstChild) {
                    this.view.removeChild(this.view.firstChild);
                }
                this.view.appendChild(group);
                $(this.view).html(function () {return this.innerHTML });

                if (typeof d3 !== 'undefined') {
                    this.start(d3);
                }
            }
        }

        private drawElem(info): any[] {
            var list = [];

            var zLevel = 8;
            var transform = '';
            {
                transform += 'translate(200, ' + (300 - (info.level || 0) * zLevel) + ') ';
                transform += 'scale(.6, .6) scale(1, .7) rotate(-30) ';
            }

            if (info.x !== undefined && info.y !== undefined) {
                var rect = $('<rect x="' + info.x + '" y="' + info.y + '" width="' + info.width + '" height="' + info.height + '" class="' + info.cssName + '" transform="' + transform + '" />');
                list.push(rect[0]);
            }

            if (info.children) {
                info.children.forEach((child) => {
                    var elems = this.drawElem(child);
                    if (elems && elems.length) {
                        elems.forEach((el) => {
                            list.push(el);
                        });
                    }
                });
            }

            return list;
        }

    }

} 