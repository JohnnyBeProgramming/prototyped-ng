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
;angular.module('prototyped.ng.extended.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('views/extended/index.tpl.html',
    '<div class=container><h4>Extenders and Runtime Modifiers <small>Detect modules and check for extenders</small></h4><div ng:cloak><div ng:if=cmd.busy><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></div><div ng:if=!cmd.busy><h5>Select the modules you would like to extend:</h5><p>...</p></div></div></div>');
  $templateCache.put('views/extended/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=proto.cmd><i class=fa ng-class="{ \'fa-refresh glow-blue\': cmd.busy, \'fa-desktop glow-green\': !cmd.busy && appNode.active, \'fa-warning glow-orange\': !cmd.busy && !appNode.active }"></i>&nbsp; Find All Extenders</a></li></ul>');
}]);
;angular.module('prototyped.ng.extended.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/extended.min.css',
    "body .card-view .img-extended{filter:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz1cJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCc+PGZpbHRlciBpZD1cJ2dyYXlzY2FsZVwnPjxmZUNvbG9yTWF0cml4IHR5cGU9XCdtYXRyaXhcJyB2YWx1ZXM9XCcwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwIDAgMCAxIDBcJy8+PC9maWx0ZXI+PC9zdmc+I2dyYXlzY2FsZQ==);filter:gray;-webkit-filter:grayscale(100%);background-size:715px auto;background-position:top right;background-image:url(http://cywee.com/wp-content/uploads/2013/04/Advanced-Technology-715x250.jpg)}"
  );

}]);