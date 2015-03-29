angular.module('prototyped.ng.features.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/features.min.css',
    "body .features-info{padding:8px}"
  );

}]);