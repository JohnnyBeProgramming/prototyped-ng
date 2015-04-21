module proto.ng.modules.common.filters {

    export function InterpolateFilter(appState: proto.ng.modules.common.AppState) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appState.version);
        };
    }

}