/// <reference path="../imports.d.ts" />
angular.module('prototyped.ng.extended', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.extended.views',
    'prototyped.ng.extended.styles'
]).config([
    'appConfigProvider', function (appConfigProvider) {
        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.extended': {
                active: true,
                hideInBrowserMode: true
            }
        });

        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/extend',
                priority: 100,
                menuitem: {
                    label: 'Extenders',
                    icon: 'fa fa-flask',
                    state: 'extended.info'
                },
                cardview: {
                    style: 'img-extended',
                    title: 'Extend the Current App',
                    desc: 'Dynamically load and extended features. Inject new modules into the current runtime.'
                }
            });
        }
    }]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('extended', {
            url: '/extend',
            abstract: true
        }).state('extended.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'views/extended/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/extended/index.tpl.html',
                    controller: 'extendViewController'
                }
            }
        });
    }]).controller('extendedViewController', [
    '$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
        // Define the model
        var context = $scope.sample = {
            busy: true,
            text: '',
            utils: {
                list: function (path, callback) {
                    var list = [];
                    try  {
                    } catch (ex) {
                        context.error = ex;
                        console.error(ex.message);
                    }
                    return list;
                }
            }
        };

        // Apply updates (including async)
        var updates = {};
        try  {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true
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
//# sourceMappingURL=prototyped.ng.extended.base.js.map
