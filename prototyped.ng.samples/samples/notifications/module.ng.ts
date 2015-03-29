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

    .constant('notificationsConfig', {
        debug: true,
        enabled: false,
        getPersisted: function (cname) {
            var name = cname + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return '';
        },
        setPersisted: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + ((exdays || 7) * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },
        notify: function (title, opts, eventHandlers) {
            if ('Notification' in window) {
                // Create a new notification messsage
                var notification = new Notification(title, opts);

                // Add event handlers
                if (eventHandlers) {
                    angular.extend(notification, eventHandlers);
                }
                /*
                {
                    onclick: function () {
                        console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
                    },
                    onclose: function () {
                        console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
                    },
                    onerror: function () {
                        console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
                    },
                    onshow: function () {
                        console.log(' - Event "' + event.type + '" triggered for notification "' + notification.tag + '"');
                    },
                }
                 */

                return notification;
            } else {
                // Default to console window
                console.info(title, opts);
            }
        },
        hookNotifications: function (callback, notFound) {
            if ('Notification' in window) {
                // API supported, request permission and notify
                window['Notification'].requestPermission(function (status) {
                    if (callback) {
                        callback(status);
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
    })

    .config(['$httpProvider', 'notificationsConfig', function ($httpProvider, cfg) {

        // Get the value from persisted store
        cfg.enabled = cfg.getPersisted('notifications.enabled') == '1';
    }])

    .controller('notificationsController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', '$timeout', '$window', 'notificationsConfig', function ($rootScope, $scope, $state, $stateParams, $q, $timeout, $window, cfg) {
        // Define the model
        var context = $scope.notifications = {
            busy: true,
            apply: function () {
                // Set the persisted value                
                var opts;
                var val = cfg.enabled ? '0' : '1';
                if (val) {
                    opts = {
                        tag: 'notifications.enabled',
                        icon: 'assets/favicon.png',
                        body: 'Success! Web notifications are now enabled.',
                    };
                } else {
                    opts = {
                        tag: 'notifications.disabled',
                        icon: 'assets/favicon.png',
                        body: 'Removed. Web notifications are now disabled.',
                    };
                }

                cfg.hookNotifications(function () {
                    $rootScope.$applyAsync(function () {
                        // Set active flag and update UI
                        var isActive = cfg.enabled = (status == 'granted');
                        if (isActive) {
                            // Display a notification message too the user
                            cfg.notify('Web Notifications', opts);
                        } else if (status == 'denied') {
                            console.log(' - User declined...');
                        }
                        $window.location.reload(true);
                    });
                });
                cfg.setPersisted('notifications.enabled', val);
            },
            isPatched: function () {
                return cfg.enabled;
            },
            triggerNotification: function () {
                // Display a notification message too the user
                cfg.notify('Web Notifications', {
                    tag: 'ctx_' + Date.now(),
                    icon: 'assets/favicon.png',
                    body: 'Notifications are supported by your browser.',
                });
            },
        };

        // Apply updates (including async)
        var updates = <any>{};
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

    }])

    .run(['notificationsConfig', function (cfg) {
        // Register the notification api
        if (cfg.enabled) {
            cfg.hookNotifications(
                () => {
                    // Notifications enabled by user
                    console.debug(' - Notifications enabled.');
                },
                () => {
                    // User canceled or not available
                    console.warn(' - Notifications not available.');
                });
        }
    }])