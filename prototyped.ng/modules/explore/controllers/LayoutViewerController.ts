///<reference path="../../../imports.d.ts"/>

declare var remoteScripts: any;

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
        private overlayGroup: any;
        private contentsGroup: any;

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

            $(document).scroll(() => {
                this.draw();
            });

            // Load D3 libraries if not defined
            if (typeof d3 !== 'undefined') {
                this.start(d3);
            } else {
                var url = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js';
                if (typeof remoteScripts !== 'undefined') {
                    remoteScripts.define(url, () => typeof d3 !== 'undefined', () => {
                        this.start(d3);
                    });
                } else {
                    $.getScript(url, (data, textStatus, jqxhr) => {
                        this.start(d3);
                    });
                }
            }
        }

        private draw() {
            var info = this.pageLayoutService.node;
            if (this.view) {
                //var overlay = this.getOverlay();

                // Draw the background container
                var contents = this.getContents();
                while (contents.firstChild) {
                    contents.removeChild(contents.firstChild);
                }

                // Add background and window
                contents.appendChild(this.drawElem(<proto.ng.modules.common.services.LayoutNode>{
                    x: 0 - document.body.scrollLeft,
                    y: 0 - document.body.scrollTop,
                    width: document.body.offsetWidth,
                    height: document.body.offsetHeight,
                    cssName: 'outer-region',
                    children: [],
                    level: -0.1,
                })[0]);
                contents.appendChild(this.drawElem(<proto.ng.modules.common.services.LayoutNode>{
                    x: document.body.scrollLeft,
                    y: document.body.scrollTop,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    cssName: 'window-region',
                    children: [],
                    level: 0.1,
                })[0]);

                // Add all the elements
                var layout = this.drawElem(info);
                if (layout) {
                    layout = layout.sort((a, b) => {
                        return parseFloat(a.getAttribute('z')) - parseFloat(b.getAttribute('z'));
                    });
                    layout.forEach((item, i) => {
                        contents.appendChild(item)
                    });
                }

                // Redraw contents
                while (this.view.firstChild) {
                    this.view.removeChild(this.view.firstChild);
                }
                this.view.appendChild(this.getContents());
                $(this.view).html(function () { return this.innerHTML; });

                // Hook up the scrolling
                if (typeof d3 !== 'undefined') {
                    this.start(d3);
                }
            }
        }

        private start(d3: any) {
            var found = d3.select('#LayoutView .contents-group');
            if (found.length) {
                found.call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", () => {
                    found.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
                }));
            }
        }

        private drawElem(info): any[] {
            var list = [];

            var zLevel = 2;
            var x = info.x - document.body.scrollLeft;
            var y = info.y - document.body.scrollTop;
            var transform = '';
            {
                transform += 'translate(200, ' + (300 - (info.level || 0) * zLevel) + ') ';
                transform += 'scale(.6, .6) scale(1, .7) rotate(-30) ';
            }

            if (info.x !== undefined && info.y !== undefined) {
                var rect = $('<rect x="' + x + '" y="' + y + '" z="' + info.level + '" width="' + info.width + '" height="' + info.height + '" class="' + info.cssName + '" transform="' + transform + '" />');
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

        private getOverlay(): any {
            if (!this.overlayGroup) {
                this.overlayGroup = $('<g class="overlay-group"></g>')[0];
                this.view.appendChild(this.overlayGroup);
            }
            return this.overlayGroup;
        }

        private getContents(): any {
            if (!this.contentsGroup) {
                this.contentsGroup = $('<g class="contents-group"></g>')[0];
                this.view.appendChild(this.contentsGroup);
            }
            return this.contentsGroup;
        }

    }

} 