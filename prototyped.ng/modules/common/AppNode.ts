module proto.ng.modules.common {

    export class AppNode {
        public active: boolean;

        public get gui(): any { return this.active ? this.ui() : null; }
        public get window(): any { return this.active ? this.win() : null; }

        constructor() {
            this.active = typeof require !== 'undefined';
        }

        public ui(): any {
            if (this.active) {
                return require('nw.gui');
            }
            return null;
        }

        public win(): any {
            if (this.gui) {
                var win = this.gui.Window.get();
                return win;
            }
            return null;
        }

        public reload() {
            var win = this.window;
            if (win) {
                win.reloadIgnoringCache();
            }
        }

        public close() {
            var win = this.window;
            if (win) {
                win.close();
            }
        }

        public debug() {
            var win = this.window;
            if (win.isDevToolsOpen()) {
                win.closeDevTools();
            } else {
                win.showDevTools()
            }
        }

        public toggleFullscreen() {
            var win = this.window;
            if (win) {
                win.toggleFullscreen();
            }
        }

        public kiosMode() {
            var win = this.window;
            if (win) {
                win.toggleKioskMode();
            }
        }
    }

}