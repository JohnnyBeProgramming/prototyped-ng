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
                            { id: 'id', val: '{number}', type: 'fillText' },
                            { id: 'username', val: '{username}', type: 'fillText' },
                            { id: 'firstname', val: '{firstName}', type: 'fillText' },
                            { id: 'lastname', val: '{lastName}', type: 'fillText' },
                            { id: 'email', val: '{email}', type: 'fillText' },
                            { id: 'mobile', val: '{phone|format}', type: 'fillText' },
                            { id: 'active', val: '{bool|n}', type: 'fillText' },
                        ],
                    },
                    {
                        name: 'Company Info',
                        rows: 10,
                        args: [
                            { id: 'business', val: '{business}', type: 'fillText' },
                            { id: 'city', val: '{city}', type: 'fillText' },
                            { id: 'contact', val: '{firstName}', type: 'fillText' },
                            { id: 'tel', val: '{phone|format}', type: 'fillText' },
                        ],
                    },
                    {
                        name: 'Product Info',
                        rows: 10,
                        args: [
                            { id: 'id', val: '{number}', type: 'fillText' },
                            { id: 'name', val: '{lorem|2}', type: 'fillText' },
                            { id: 'desc', val: '{lorem|20}', type: 'fillText' },                            
                            { id: 'type', val: '{number|10000}', type: 'fillText' },
                            { id: 'category', val: '{ccType|abbr}', type: 'fillText' },
                            { id: 'created', val: '{date|1-1-1990,1-1-2050}', type: 'fillText' },
                            { id: 'active', val: '{bool|n}', type: 'fillText' },
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