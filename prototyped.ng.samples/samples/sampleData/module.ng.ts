/// <reference path="../../imports.d.ts" />
/// <reference path="../../../typings/firebase/firebase.d.ts" />
/// <reference path="controllers/SampleDataController.ts" />

angular.module('prototyped.ng.samples.sampleData', [
    'firebase',
])
    .config(['appConfigProvider', function (appConfigProvider) {
        appConfigProvider
            .config('sampleData', {
                enabled: appConfigProvider.getPersisted('sampleData.enabled') == '1',
                dataUrl: 'https://dazzling-heat-2165.firebaseio.com',
                fillText: 'http://www.filltext.com/?delay=0&callback=?',
                defaults: [
                    {
                        name: 'Person Data',
                        rows: 10,
                        args: [
                            { id: 'id', val: '{number}' },
                            { id: 'username', val: '{username}' },
                            { id: 'firstname', val: '{firstName}' },
                            { id: 'lastname', val: '{lastName}' },
                            { id: 'email', val: '{email}' },
                            { id: 'mobile', val: '{phone|format}' },
                            { id: 'active', val: '{bool|n}' },
                        ],
                    },
                    {
                        name: 'Company Info',
                        rows: 10,
                        args: [
                            { id: 'business', val: '{business}' },
                            { id: 'city', val: '{city}' },
                            { id: 'contact', val: '{firstName}' },
                            { id: 'tel', val: '{phone|format}' },
                        ],
                    },
                    {
                        name: 'Product Info',
                        rows: 10,
                        args: [
                            { id: 'id', val: '{number}' },
                            { id: 'name', val: '{lorem|2}' },
                            { id: 'desc', val: '{lorem|20}' },                            
                            { id: 'type', val: '{number|10000}' },
                            { id: 'category', val: '{ccType|abbr}' },
                            { id: 'created', val: '{date|1-1-1990,1-1-2050}' },
                            { id: 'active', val: '{bool|n}' },
                        ],
                    }
                ],
            });
    }])
    .config(['$stateProvider', function ($stateProvider) {

        // Now set up the states
        $stateProvider
            .state('samples.sampleData', {
                url: '/sampleData',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/sampleData/main.tpl.html',
                        controller: 'sampleDataController',
                        controllerAs: 'sampleData'
                    },
                }
            })

    }])

    .controller('sampleDataController', [
        '$rootScope',
        '$scope',
        '$state',
        '$stateParams',
        '$q',
        '$firebaseAuth',
        '$firebaseObject',
        '$firebaseArray',
        'appConfig',
        proto.ng.samples.data.SampleDataController
    ]);