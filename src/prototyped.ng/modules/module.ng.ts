/// <reference path="../imports.d.ts" />
/// <reference path="../modules/default.ng.ts" />
/// <reference path="../modules/about.ng.ts" />
 
angular.module('prototyped.ng', [
    'prototyped.ng.views',
    'prototyped.ng.sql',
    
    'prototyped.ng.default',
    'prototyped.ng.about',

    // Define sub modules
    'prototyped.features',
    'prototyped.edge',
])


    .config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {

        // Define redirects
        $urlRouterProvider.when('/prototyped', '/prototyped/cmd');

        // Now set up the states
        $stateProvider
            .state('prototyped', {
                url: '/prototyped',
                abstract: true,
            })

    }])

    .filter('isArray', () => {
        return (input) => {
            return angular.isArray(input);
        };
    })
    .filter('isNotArray', () => {
        return (input) => {
            return !angular.isArray(input);
        };
    })
    .filter('typeCount', ['appStatus', (appStatus) => {
        return (input, type) => {
            var count = 0;
            if (input.length > 0) {
                input.forEach((itm) => {
                    if (!itm) return;
                    if (!itm.type) return;
                    if (itm.type == type) count++;
                });
            }
            return count;
        };
    }])
    .filter('listReverse', () => {
        return (input) => {
            var result = [];
            var length = input ? input.length : 0;
            if (length) {
                for (var i = length - 1; i !== 0; i--) {
                    result.push(input[i]);
                }
            }
            return result;
        };
    })
    .filter('toBytes', () => {
        return (bytes, precision) => {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    })
    .filter('parseBytes', () => {
        return (bytesDesc, precision) => {
            var match = /(\d+) (\w+)/i.exec(bytesDesc);
            if (match && (match.length > 2)) {
                var bytes = match[1];
                var intVal = parseInt(bytes);
                if (isNaN(parseFloat(bytes)) || !isFinite(intVal)) return '[?]';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
                var number = Math.floor(Math.log(intVal) / Math.log(1024));
                var pow = -1;
                units.forEach(function (itm, i) {
                    if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0) pow = i;
                });
                if (pow > 0) {
                    var ret = (intVal * Math.pow(1024, pow)).toFixed(precision);
                    return ret;
                }
            }
            return bytesDesc;
        }
    })
    .directive('eatClickIf', ['$parse', '$rootScope', function ($parse, $rootScope) {
        return {
            priority: 100, // this ensure eatClickIf be compiled before ngClick
            restrict: 'A',
            compile: function ($element, attr) {
                var fn = $parse(attr.eatClickIf);
                return {
                    pre: function link(scope, element) {
                        var eventName = 'click';
                        element.on(eventName, function (event) {
                            var callback = function () {
                                if (fn(scope, { $event: event })) {
                                    // prevents ng-click to be executed
                                    event.stopImmediatePropagation();
                                    // prevents href 
                                    event.preventDefault();
                                    return false;
                                }
                            };
                            if ($rootScope.$$phase) {
                                scope.$evalAsync(callback);
                            } else {
                                scope.$apply(callback);
                            }
                        });
                    },
                    post: function () { }
                }
            }
        }
    }])
