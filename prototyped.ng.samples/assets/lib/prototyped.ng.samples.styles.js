angular.module('prototyped.ng.samples.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/samples.min.css',
    "body .sample-info{padding:8px}"
  );

}]);