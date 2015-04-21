module proto.ng.modules.common.controllers {

    export class CardViewController {

        public get pages(): IAppRoute[] { return this.appState.routers; }

        private _index = 0;

        constructor(private appState: proto.ng.modules.common.AppState) {
        }

        public count(): number {
            return this.pages.length;
        }

        public isActive(index: number): boolean {
            return this._index === index;
        }

        public showPrev() {
            this._index = (this._index > 0) ? --this._index : this.count() - 1;
        }

        public showNext() {
            this._index = (this._index < this.count() - 1) ? ++this._index : 0;
        }

        public showItem(index: number) {
            this._index = index;
        }
    }

} 