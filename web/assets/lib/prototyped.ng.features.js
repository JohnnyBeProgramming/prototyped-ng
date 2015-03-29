/// <reference path="../imports.d.ts" />
angular.module('prototyped.ng.features', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.features.views',
    'prototyped.ng.features.styles'
]).config([
    'appConfigProvider', function (appConfigProvider) {
        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.features': {
                active: true
            }
        });
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/features',
                menuitem: {
                    label: 'Explore'
                },
                cardview: {
                    style: 'img-advanced',
                    title: 'Advanced Feature Detection',
                    desc: 'Based on feature detection. Some features are available for specific operating systems only.'
                }
            });
        }
    }]).config([
    '$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider.state('features', {
            url: '/features',
            abstract: true
        }).state('features.info', {
            url: '',
            views: {
                'left@': { templateUrl: 'features/left.tpl.html' },
                'main@': {
                    templateUrl: 'features/main.tpl.html',
                    controller: 'featuresViewController'
                }
            }
        });
    }]).controller('featuresViewController', [
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
//# sourceMappingURL=prototyped.ng.features.base.js.map
;angular.module('prototyped.ng.features.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/jade_include.jade',
    '<h1>I\'m an include!</h1>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/process_jade.jade',
    '<p class=example>Hello World!</p><div id=greeting>Nice</div>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/process_jade_custom.jade',
    '<a href=href>Great</a>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/process_jade_with_include.jade',
    '<h1>I\'m an include!</h1>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/empty_attribute.tpl.html',
    '<div ui-view></div>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/five.tpl.html',
    '<div class="quotes should be escaped"><span><span><span>Lorem ipsum</span></span></span></div>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/four.tpl.html',
    'This data is "in quotes" And this data is \'in single quotes\'');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/one.tpl.html',
    '1 2 3');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/pattern.tpl.html',
    '<form><span class=registration-error ng-show=regForm.password.$error.pattern>- Fail to match..</span> <input type=password ng-model=registerForm.password name=password ng-pattern="/^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[\\d\\W]).*$/" required></form>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/process_function.tpl.html',
    '<h1>(ONE)</h1><h2>(TWO)</h2><h3>(THREE)</h3>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/process_template.tpl.html',
    '<h1><%= html2js.process_template.testMessages.title %></h1><h2><%= html2js.process_template.testMessages.subtitle %></h2>');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/three.tpl.html',
    'Multiple Lines');
  $templateCache.put('builder/node_modules/grunt-html2js/test/fixtures/two.tpl.html',
    'Testing');
}]);
;angular.module('prototyped.ng.features.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/features.min.css',
    "body .card-view .img-advanced{filter:grayscale(100%);background-size:715px auto;background-position:top right;background-image:url(http://cywee.com/wp-content/uploads/2013/04/Advanced-Technology-715x250.jpg)}"
  );

}]);