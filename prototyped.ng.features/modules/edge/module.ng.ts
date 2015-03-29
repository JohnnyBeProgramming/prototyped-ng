/// <reference path="../../imports.d.ts" />

angular.module('prototyped.edge', [
    'ui.router',
])

    .config(['$stateProvider', ($stateProvider) => {

        // Now set up the states
        $stateProvider
            .state('proto.edge', {
                url: '^/edge',
                views: {
                    'left@': { templateUrl: 'modules/features/views/left.tpl.html' },
                    'main@': {
                        templateUrl: 'modules/edge/views/index.tpl.html',
                        controller: 'edgeViewController'
                    },
                }
            })


    }])

    .controller('edgeViewController', ['$rootScope', '$scope', '$state', '$window', '$location', '$timeout', function ($rootScope, $scope, $state, $window, $location, $timeout) {
        var appEdge = {
            stubs: null, // will be replaced on start
            active: false,
            start: function () {
                if (typeof require === 'undefined') return;
                var edge = require("edge");
                try {
                    console.log('-------------------------------------------------------------------------------');
                    console.log(' - Connnecting NodeJS with an EdgeJS to the outside world....');
                    console.log('-------------------------------------------------------------------------------');

                    var stubs = appEdge.stubs = {
                        ping: edge.func(function () {/*
                    async (input) => { 
                        var msg = " - [ C# ] Welcome '{1}', recieved @ {0:hh:mm:ss tt}";
                        return string.Format(msg, DateTime.Now ,input); 
                    }
                */}),
                    };

                } catch (ex) {
                    appEdge.error = ex;
                    return false;
                }
                return true;
            },
            run: function () {

                // Send a pin out to C# world
                var me = 'JavaScript';
                console.log(' - [ JS ] Sending out a probe named \'' + me + '\'... ');
                appEdge.stubs.ping(me, function (error, result) {
                    if (error) throw error;
                    console.log(result);
                    console.log(' - [ JS ] Seems like the probe made it back!');
                });

            },
        };

        // Define the Edge controller logic
        $scope.edge = {
            active: false,
            detect: function () {
                // Make sure we are in node space
                if (typeof require !== 'undefined') {
                    try {
                        // Load the AppEdge library
                        var edge = appEdge;
                        if (edge) {
                            // Start loading all the stubs
                            $scope.edge.active = edge.start();

                            // Extend the scope with full functionality
                            angular.extend($scope.edge, edge);
                        }
                    } catch (ex) {
                        // Something went wrong
                        $scope.edge.error = ex;
                        return false;
                    }
                    return true;
                } else {
                    // Method 'require' is undefined, probably inside a browser window
                    $scope.edge.error = new Error('Required libraries not found or unavailable.');
                    return false;
                }
            },
        };

        // Auto-detect if node is available
        if (typeof require !== 'undefined') {
            $timeout(function () {
                $scope.edge.detect();
            });
        }
        
    }])

