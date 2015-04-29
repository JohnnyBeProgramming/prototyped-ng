/// <reference path="../imports.d.ts" />
angular.module('prototyped.ng.extended', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.extended.views',
    'prototyped.ng.extended.styles'
]).config([
    'appConfigProvider', 'appStateProvider', function (appConfigProvider, appStateProvider) {
        // Define module state
        appStateProvider.config('prototyped.ng.extended', {
            active: true,
            hideInBrowserMode: true
        }).define('extended', {
            url: '/extend',
            priority: 100,
            state: {
                url: '/extend',
                abstract: true
            },
            menuitem: {
                label: 'Extenders',
                icon: 'fa fa-flask',
                state: 'extended.info'
            },
            cardview: {
                style: 'img-extended',
                title: 'Extended Functionality',
                desc: 'Dynamically load and extend features. Inject new modules into the current runtime.'
            }
        }).state('extended.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'views/extended/left.tpl.html' },
                'main@': {
                    templateUrl: 'views/extended/index.tpl.html',
                    controller: 'extenderViewController'
                }
            }
        });
    }]).controller('extenderViewController', [
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
    }]).run([
    '$templateCache', function ($templateCache) {
        var element = document.head;
        var cssPath = 'assets/css/extended.min.css';
        if ($('[resx-src="' + cssPath + '"]').length <= 0) {
            var html = '<link resx-src="' + cssPath + '" href="' + cssPath + '" rel="stylesheet" type="text/css" />';
            var cache = $templateCache.get(cssPath);
            if (cache != null) {
                html = '<style resx-src="' + cssPath + '">' + cache + '</style>';
            }
            console.debug(' - Attaching: ' + cssPath);
            $(element).append(html);
        }
    }]);
