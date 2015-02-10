'use strict';

angular.module('myApp.samples.fillText', [])

    .config(['$stateProvider', function ($stateProvider) {

        // Now set up the states
        $stateProvider
            .state('samples.fillText', {
                url: '/filltext',
                views: {
                    'left@': { templateUrl: 'samples/left.html' },
                    'main@': {
                        templateUrl: 'samples/fillText/main.html',
                        controller: 'sampleFillTextController'
                    },
                }
            })

    }])

    .controller('sampleFillTextController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', function ($rootScope, $scope, $state, $stateParams, $q) {

        // Define the model
        var context = $scope.filltext = {
            busy: true,
            rows: 10,
            args: [
                { id: 'business', val: '{business}' },
                { id: 'firstname', val: '{firstName}' },
                { id: 'lastname', val: '{lastName}' },
                { id: 'email', val: '{email}' },
                { id: 'tel', val: '{phone|format}' },
                { id: 'city', val: '{city}' },
                { id: 'active', val: '{bool|n}' },
            ],
            test: function () {
                try {
                    // Set busy flag
                    context.busy = true;

                    // Build requested fields
                    var data = {};
                    context.args.forEach(function (obj) {
                        if (obj.id) data[obj.id] = obj.val;
                    });

                    // Define the request
                    var req = angular.extend(data, {
                        'rows': context.rows,
                    });

                    // Define the request data
                    context.fetch(req)
                        .then(function (data) {
                            context.resp = data;
                        })
                        .catch(function (error) {
                            context.error = error;
                        })
                        .finally(function () {
                            $rootScope.$applyAsync(function () {
                                context.busy = false;
                            });
                        });

                    // Define the request and response handlers
                    console.debug(' - Requesting...');
                } catch (ex) {
                    context.error = ex;
                }
            },
            fetch: function (data) {
                var url = "http://www.filltext.com/?delay=0&callback=?";
                var deferred = $q.defer();

                $.getJSON(url, data)
                    .done(function (data) {
                        deferred.resolve(data);
                    })
                    .fail(function (xhr, desc, err) {
                        var error = new Error('Error [' + xhr.status + ']: ' + xhr.statusText + ' - ' + err);
                        deferred.reject(error);
                    });

                return deferred.promise;
            },
            getArgs: function () {
            },
        };

        // Apply updates (including async)
        var updates = {};
        try {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true,
                };

            } else {
                // Not available
                updates.hasNode = false;
                updates.busy = false;
            }
        } catch (ex) {
            updates.busy = false;
            updates.error = ex;
        } finally {
            // Extend updates for scope
            angular.extend(context, updates);
        }

    }]);