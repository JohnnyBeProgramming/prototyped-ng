// ----------------------------------------------------------------------
// Geo Locator sample definition
// ----------------------------------------------------------------------
///<reference path="../../imports.d.ts"/>
///<reference path="controllers/GeoController.ts"/>

angular.module('prototyped.ng.samples.location', [
    'ui.router'
])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples.location', {
                url: '/location',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/location/views/main.tpl.html',
                        controller: 'proto.ng.samples.GeoController',
                        constrollerAs: 'geoCtrl',
                    },
                }
            })
    }])
    .config(['$provide', ($provide) => {
        // Define a decorator to check duration of request 
        $provide.decorator("geo", ($delegate) => {
            return {
                locate: () => {
                    var start = Date.now();
                    var result = $delegate.locate();
                    result.always(() => {
                        console.info("Geo location took: " + (Date.now() - start) + "ms");
                    });
                    return result;
                }
            };
        });

    }])

// ----------------------------------------------------------------------
// Define the geo factories, services and filters
// ----------------------------------------------------------------------
    .factory('geo', ['$q', '$rootScope', ($q, $rootScope) => { return new proto.utils.GeoFactory($rootScope, $q); }])
    .service('geoService', ['$q', '$rootScope', ($q, $rootScope) => { return new proto.utils.GeoFactory($rootScope, $q); }])

    .filter('latitude', [() => { return proto.utils.GeoFactory.FormatLatitude; }])
    .filter('longitude', [() => { return proto.utils.GeoFactory.FormatLongitude; }])

    .filter('formatted', [() => proto.String.FormatFilter])

// ----------------------------------------------------------------------
// Register Controller(s)
// ----------------------------------------------------------------------
    .controller('proto.ng.samples.GeoController', [
        '$rootScope',
        '$scope',
        'geoService',
        proto.ng.samples.location.GeoController
    ])

    .run(['$rootScope', function ($rootScope) {
    }])

