/// <reference path="../../imports.d.ts" />

declare var Notification: new (title, opts) => any;

angular.module('myApp.samples.notifications', [])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
            .state('samples.notifications', {
                url: '/notifications',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/notifications/main.tpl.html',
                        controller: 'notificationsController'
                    },
                }
            })
    }])

    .service('notifyService', ['$rootScope', function ($rootScope) {
        var notify: any = {
            enabled: false,
            message: function (title, opts, eventHandlers) {
                // Register the notification api
                if (notify.enabled) {
                    notify.hookNotifications(
                        () => {
                            // Notifications enabled by user
                            if ('Notification' in window) {
                                // Create a new notification messsage
                                var notification = new Notification(title, opts);
                                if (eventHandlers) {
                                    // Add event handlers
                                    angular.extend(notification, eventHandlers);
                                }
                            }
                            console.debug(' - Notifications enabled.');
                        },
                        () => {
                            // User canceled or not available, default to console window
                            console.info(title, opts);
                            console.warn(' - Notifications not available.');
                        });
                } else {
                    // Notifications disabled, default to console window
                    console.info(title, opts);
                }
            },
            hookNotifications: function (callback, notFound) {
                if ('Notification' in window) {
                    // API supported, request permission and notify
                    window['Notification'].requestPermission(function (status) {
                        var isActive = notify.enabled = (status == 'granted');
                        if (isActive) {
                            // Display a notification message too the user                            
                            if (callback) {
                                callback(status);
                            }
                        } else if (status == 'denied') {
                            if (notFound) {
                                notFound();
                            }
                        }
                    });
                } else {
                    // API not supported
                    console.warn(' - Web notifications not supported by your browser...');
                    if (notFound) {
                        notFound();
                    }
                }
            },
            isPatched: function () {
                return notify.enabled;
            },
            triggerNotification: function (message?: string, opts?: any) {
                var msgOpts = {
                    tag: 'ctx_' + Date.now(),
                    icon: 'assets/favicon.png',
                    title: 'Web Notifications',
                    body: message,
                };
                angular.extend(msgOpts, opts || {});

                // Display a notification message too the user
                notify.message(msgOpts.title, msgOpts);
            },
        };

        return notify;
    }])

    .controller('notificationsController', ['$rootScope', '$scope', 'notifyService', function ($rootScope, $scope, notify) {
        $scope.ready = null;
        if (notify) {
            notify.hookNotifications(
                () => {
                    // Notifications enabled by user
                    $rootScope.$applyAsync(() => {
                        $scope.ready = true;
                        notify.enabled = true;
                        console.debug(' - Desktop notifications active.');
                    });
                },
                () => {
                    // User canceled or not available
                    $rootScope.$applyAsync(() => {
                        $scope.ready = false;
                        notify.enabled = false;
                        console.warn(' - Desktop notifications not available.');
                    });
                });
        }
    }])

    .run(['$rootScope', 'notifyService', function ($rootScope, notifyService) {
        // Link the notification service globally
        angular.extend($rootScope, {
            notify: notifyService,
        });
    }])