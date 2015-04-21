/// <reference path="LogInterceptor.ts" />
/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />

module proto.ng.samples.errorHandlers {

    export function ConfigureProviders($provide, $httpProvider) {

        // Register http error handler
        $httpProvider.interceptors.push('errorHttpInterceptor');

        // Intercept all log messages
        $provide.decorator('$log', ['$delegate', 'appState', function ($delegate, appState) {
            // Define the interceptor
            var interceptor = new proto.ng.samples.errorHandlers.LogInterceptor($delegate, appState);

            // Return the original delegate
            return $delegate;
        }]);
    }

}  