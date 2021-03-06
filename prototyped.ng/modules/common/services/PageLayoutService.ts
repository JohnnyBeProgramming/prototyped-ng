﻿
module proto.ng.modules.common.services {

    export class PageLayoutService {

        public root: any;
        public selected: SiteNode;
        public node: LayoutExplorerRoot;
        public isTilted: boolean = true;
        public isDocked: boolean = false;

        private callbacks: any[] = [];

        constructor(private $q: any, private navigationService: proto.ng.modules.common.services.NavigationService) {
            this.init();
        }

        public init() {
            this.root = document.body;
            this.node = new LayoutExplorerRoot('PageLayout', this.root);
            this.node.filter = (elem) => this.filter(elem);
            this.node.excludes = [];
        }

        public addFilter(func: (elem: HTMLElement) => boolean) {
            this.node.excludes.push(func);
        }

        public addCallback(func: (rootNode: HTMLElement) => void) {
            this.callbacks.push(func);
        }

        public build(callback?) {
            var rootNode = this.node.parse(this.root);
            if (rootNode) {
                this.node.children = [rootNode];
            }
            if (callback) callback(rootNode);

            if (this.callbacks) this.callbacks.forEach((func: any) => {
                if (func) func(rootNode);
            });
        }

        private filter(elem: HTMLElement): boolean {
            if (!$(elem).is(':visible')) {
                return false;
            }

            if (!this.isDocked) {
                var isDockContainer = $(elem).hasClass('docked-container');
                return !isDockContainer;
            }

            var inspectionView = $('.inspection-view');
            if (inspectionView.length && inspectionView[0] == elem) {
                return false;
            }
            return true;
        }

        public togglePerspective() {
            this.isTilted = !this.isTilted;
            this.build();
        }

        public toggleDocked() {
            this.isDocked = !this.isDocked;
            this.build();
        }

    }

    export class LayoutNode extends proto.ng.modules.common.services.SiteNode {

        public x: number;
        public y: number;
        public width: number;
        public height: number;

        constructor(private elem: HTMLElement, public cssName: string, public level: number) {
            super(elem.tagName, null);
            this.init(elem);
        }

        public init(elem) {
            var rect = elem.getBoundingClientRect ? elem.getBoundingClientRect() : null;
            if (rect) {
                this.x = rect.left;
                this.y = rect.top;
            } else {
                this.x = elem.offsetLeft;
                this.y = elem.offsetTop;
            }
            this.width = elem.offsetWidth;
            this.height = elem.offsetHeight;
        }
    }

    export class LayoutExplorerRoot extends proto.ng.modules.common.services.SiteNode {

        public excludes: any[] = [];
        public filter: (elem: HTMLElement) => boolean;

        constructor(nodeName: string, private root: HTMLElement) {
            super(nodeName, null);
        }

        public check(elem: HTMLElement): boolean {
            var skipElem = false;

            if (this.excludes) {
                this.excludes.forEach((item) => {
                    if (item == elem) skipElem = true;
                });
            }

            if (!skipElem && this.filter) {
                skipElem = !this.filter(elem);
            }

            return !skipElem;
        }

        public level(elem: HTMLElement): number {
            var lvl = 0;
            var ctx = elem;
            while (ctx != null && ctx != this.root) {
                lvl++;
                ctx = ctx.parentElement;
            }
            return lvl;
        }

        public parse(elem: HTMLElement, className: string = 'inner-region') {
            if (!this.check(elem)) {
                return null;
            }

            if (elem.tagName == 'A') {
                className += ' ng-link';
            }
            if (elem.tagName == 'FORM') {
                className += ' ng-form';
            }
            if (elem.tagName == 'LABEL') {
                className += ' ng-label';
            }
            if ($(elem).is(':input')) {
                className += ' ng-input';
            }
            if ($(elem).is(':button')) {
                className += ' ng-button';

                if ($(elem).attr('type') == 'submit') {
                    className += ' ng-submit';
                } else if ($(elem).is(':reset')) {
                    className += ' ng-reset';
                }
            }

            var scope = angular.element(elem).isolateScope();
            if ($(elem).hasClass('ng-scope') /*angular.isDefined(scope)*/) {
                className += ' ng-elem';
            } else if (jQuery.hasData(elem) && !jQuery.isEmptyObject(jQuery.data(elem))) {
                className += ' ng-data';
            }

            var lvl = this.level(elem);
            var info = new LayoutNode(elem, className, lvl);
            if (info.x === undefined || info.y === undefined || (info.width == 0 && info.height == 0)) {
                return null;
            }

            for (var i = 0; i < elem.childNodes.length; i++) {
                var child = this.parse(<HTMLElement>elem.childNodes[i]);
                if (child) {
                    info.children.push(child);
                }
            }

            return info;
        }
    }
} 