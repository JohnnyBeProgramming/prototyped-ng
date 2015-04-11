/// <reference path="LogInterceptor.ts" />
/// <reference path="raven/RavenService.ts" />
/// <reference path="google/GoogleErrorService.ts" />

module proto.ng.samples.errorHandlers {

    export function ConfigureErrorHandlers(appConfigProvider) {
        appConfigProvider.set({
            'errorHandlers': [
                {
                    name: 'proto',
                    locked: true,
                    enabled: true,
                    label: 'Prototyped Handlers'
                },
            ],
        });
    }

    export function ConfigureGoogle(appConfigProvider) {
        appConfigProvider.set({
            'googleConfig': {
                publicKey: 'UA-61791366-1',
            },
        });
    }

    export function ConfigureRaven(appConfigProvider) {
        appConfigProvider.set({
            'ravenConfig': {
                publicKey: 'https://e94eaeaab36f4d14a99e0472e85ba289@app.getsentry.com/36391',
            },
        });
    }

    export function ConfigureProviders($provide, $httpProvider) {

        // Register http error handler
        $httpProvider.interceptors.push('errorHttpInterceptor');

        // Intercept all log messages
        $provide.decorator('$log', ['$delegate', 'appStatus', function ($delegate, appStatus) {
            // Define the interceptor
            var interceptor = new proto.ng.samples.errorHandlers.LogInterceptor($delegate, appStatus);

            // Return the original delegate
            return $delegate;
        }]);
    }

}  