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

        private start(d3: any) {

            // Set the zoom and navigation on the canvas
            var targs = d3.select('#LayoutView .contents-group');
            var found = d3.select('#LayoutView .contents-group');
            if (found.call && targs.length) {
                found.call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", () => {
                    targs.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
                }));
            }
            return;

            // ToDo: Get keyboard navigation working...
            var ident = '#LayoutView .contents-group';
            d3.select(document.body).on('keydown', function () {
                var step = 200;
                var key = d3.event.key || d3.event.keyCode; // safari doesn't know .key
                var zoom = d3.behavior.zoom();
                var mapsvg = d3.select(ident);

                console.log(' - Key:' + key, mapsvg);

                switch (key) {
                    case 'Esc':
                    case 27:
                        //found.attr("transform", "translate([0 , 0]) scale(1)");
                        zoom.translate([0, 0]).scale(1).event(mapsvg.transition());
                        break;
                    case '+':
                    case '=':
                    case 187:
                        zoom.translate([0, 0]).scale(2.0).event(mapsvg.transition());
                        break;
                    case '-':
                    case 189:
                        zoom.translate([0, 0]).scale(0.5).event(mapsvg.transition());
                        break;
                    case 'Left':
                    case 37:
                        zoom.translate([zoom.translate()[0] + step, zoom.translate()[1]]).event(mapsvg.transition());
                        break;
                    case 'Right':
                    case 39:
                        zoom.translate([zoom.translate()[0] - step, zoom.translate()[1]]).event(mapsvg.transition());
                        break;
                    case 'Up':
                    case 38:
                        zoom.translate([zoom.translate()[0], zoom.translate()[1] + step]).event(mapsvg.transition());
                        break;
                    case 'Down':
                    case 40:
                        zoom.translate([zoom.translate()[0], zoom.translate()[1] - step]).event(mapsvg.transition());
                        break;

                }
            });
        }

        private draw() {
            var info = this.pageLayoutService.node;
            if (this.view) {
                // Clear the old contents
                var contents = this.getContents();
                while (contents.firstChild) {
                    contents.removeChild(contents.firstChild);
                }

                // Add background view
                contents.appendChild(this.drawElem(<proto.ng.modules.common.services.LayoutNode>{
                    x: 0 - document.body.scrollLeft,
                    y: 0 - document.body.scrollTop,
                    width: document.body.offsetWidth,
                    height: document.body.offsetHeight,
                    cssName: 'outer-region',
                    children: [],
                    level: -0.1,
                })[0]);

                // Add the window view
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
                this.view.appendChild(this.getOverlay());
                this.view.appendChild(this.getContents());
                $(this.view).html(function () { return this.innerHTML; });

                // Hook up the scrolling
                if (typeof d3 !== 'undefined') {
                    this.start(d3);
                }
            }
        }

        private drawElem(info): any[] {
            var list = [];

            var zLevel = 2;
            var x = info.x - document.body.scrollLeft;
            var y = info.y - document.body.scrollTop;

            var transform = '';
            var show3D = this.pageLayoutService.isTilted;
            if (show3D) {
                transform += 'translate(200, ' + (300 - (info.level || 0) * zLevel) + ') ';
                transform += 'scale(.6, .6) scale(1, .7) rotate(-30) ';
            } else {
                transform += 'translate(100, 50) ';
                transform += 'scale(.7, .7) ';
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
                this.overlayGroup = $('<rect class="overlay-group" x="0" y="0" width="100%" height="100%"></rect>')[0];
            }
            return this.overlayGroup;
        }

        private getContents(): any {
            if (!this.contentsGroup) {
                this.contentsGroup = $('<g class="contents-group"></g>')[0];
            }
            return this.contentsGroup;
        }

    }

} 