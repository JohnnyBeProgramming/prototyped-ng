angular.module('prototyped.ng.features.views', []).run(['$templateCache', function($templateCache) {
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
