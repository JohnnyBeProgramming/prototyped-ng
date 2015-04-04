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
            options: {},
            message: function (title, opts, eventHandlers) {
                // Register the notification api
                if (notify.enabled) {
                    notify.hookNotifications(
                        () => {
                            $rootScope.$applyAsync(() => {
                                notify.ready = true;
                                notify.enabled = true;

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
                            });
                        },
                        () => {
                            notify.ready = false;
                            notify.enabled = false;

                            // User canceled or not available, default to console window
                            console.warn(' - Desktop notifications not available.');
                            $rootScope.$applyAsync(() => {
                                notify.defaultNotify(title, opts);
                            });
                        });
                } else {
                    notify.ready = false;
                    notify.enabled = false;

                    // Notifications disabled, default to console window
                    $rootScope.$applyAsync(() => {
                        notify.defaultNotify(title, opts);
                    });
                }
            },
            defaultNotify: function (title, opts) {
                if ('alertify' in window) {
                    window['alertify'].log(opts.body, opts.type, 3000);
                } else {
                    // Default to console window
                    console.info(opts.body, opts);
                }
            },
            hookAlertify: function (callback, notFound) {
                if (notify.options.alertify) {
                    $rootScope.$applyAsync(() => {
                        angular.extend(notify.options.alertify || {}, {
                            enabled: !notify.options.alertify.enabled,
                        });
                    });
                    return false;
                }

                console.debug(' - Loading Alertify...');
                notify.options.alertify = {
                    busy: true,
                };
                var url = 'https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js';
                $.getScript(url)
                    .done(function (script, textStatus) {
                        $rootScope.$applyAsync(() => {
                            console.debug(' - Alertify loaded.');
                            notify.options.alertify = {
                                enabled: true,
                            };
                        });
                        if (callback) {
                            callback(script, textStatus);
                        }
                    })
                    .fail(function (jqxhr, settings, exception) {
                        $rootScope.$applyAsync(() => {
                            console.warn(' - Alertify failed to loaded.');
                            notify.options.alertify = {
                                enabled: false,
                            };
                        });
                        if (notFound) {
                            notFound(exception, jqxhr, settings);
                        }
                    });
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
                    tag: notify.sameDialog ? 'notify' : 'ctx_' + Date.now(),
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Information_icon.svg/200px-Information_icon.svg.png',
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
        $scope.notifySuccess = function (message, opts) {
            opts = opts || {};
            var enabled = notify.options.alertify && notify.options.alertify.enabled;
            if (enabled && 'alertify' in window) {
                window['alertify'].success(message, 3000);
            } else {
                notify.triggerNotification('Action Succeeded', angular.extend(opts, {
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Crystal_Clear_action_apply.png',
                    body: message,
                }));
            }
        };
        $scope.notifyFailure = function (message, opts) {
            opts = opts || {};
            var enabled = notify.options.alertify && notify.options.alertify.enabled;
            if (enabled && 'alertify' in window) {
                window['alertify'].error(message, 3000);
            } else {
                notify.triggerNotification('Action Failed', angular.extend(opts, {
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Crystal_Clear_action_button_cancel.png/50px-Crystal_Clear_action_button_cancel.png',
                    body: message,
                }));
            }
        };
        $scope.methods = [
            {
                name: 'alert',
                label: 'Alert Dialog',
                action: function (title, message, opts) {
                    var enabled = notify.options.alertify && notify.options.alertify.enabled;
                    if (enabled) {
                        window['alertify'].alert(message);
                    } else {
                        alert(message);
                    }
                },
                enabled: function () { return true; },
            },
            {
                name: 'confirm',
                label: 'Confirmation',
                action: function (title, message, opts) {
                    var enabled = notify.options.alertify && notify.options.alertify.enabled;
                    if (enabled) {
                        window['alertify'].confirm(message, function (val) {
                            if (!notify.showResult) return;
                            if (val) {
                                $scope.notifySuccess('Confirm returned: ' + JSON.stringify(val));
                            } else {
                                $scope.notifyFailure('Confirm was canceled');
                            }
                        });

                    } else {
                        var val = confirm(message);
                        if (!notify.showResult) return;
                        if (val) {
                            $scope.notifySuccess('Confirm returned: ' + JSON.stringify(val));
                        } else {
                            $scope.notifyFailure('Confirm was canceled');
                        }
                    }
                },
                enabled: function () { return true; },
            },
            {
                name: 'prompt',
                label: 'User Prompt',
                action: function (title, message, opts) {
                    var enabled = notify.options.alertify && notify.options.alertify.enabled;
                    var input = 'Test Input';
                    if (enabled) {
                        window['alertify'].prompt(message, function (e, val) {
                            if (!notify.showResult) return;
                            if (e) {
                                $scope.notifySuccess('Prompt returned: ' + JSON.stringify(val));
                            } else {
                                $scope.notifyFailure('Prompt was canceled');
                            }
                        }, input);
                    } else {
                        var val = prompt(message, input);
                        if (!notify.showResult) return;
                        if (val) {
                            $scope.notifySuccess('Prompt returned: ' + JSON.stringify(val));
                        } else {
                            $scope.notifyFailure('Prompt was canceled');
                        }
                    }
                },
                enabled: function () { return true; },
            },
            {
                name: 'notify',
                label: 'Notification',
                action: function (title, message, opts) {
                    if (notify.enabled) {
                        notify.triggerNotification(title, opts)
                    } else if (notify.options.alertify && notify.options.alertify.enabled) {
                        notify.triggerNotification(title, opts)
                    } else {
                        console.groupCollapsed('Notification: ' + message);
                        console.debug(' - Title: ', title);
                        console.debug(' - Options: ', opts);
                        console.groupEnd();
                    }
                },
                enabled: function () {
                    return notify.enabled || notify.options.alertify && notify.options.alertify.enabled;
                },
            },
        ];

        if (notify) {
            notify.ready = null;
            notify.addAlertify = false;
            notify.showResult = true;
            notify.sameDialog = true;
            notify.current = $scope.methods[0];
            notify.hookNotifications(
                () => {
                    // Notifications enabled by user
                    $rootScope.$applyAsync(() => {
                        notify.ready = true;
                        notify.enabled = true;
                        console.debug(' - Desktop notifications active.');
                    });
                },
                () => {
                    // User canceled or not available
                    $rootScope.$applyAsync(() => {
                        notify.ready = true;
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