angular.module('prototyped.ng.samples.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/samples.min.css',
    "body .sample-info{padding:8px}body #CompressionView .progress{height:16px;margin-bottom:6px}body #CompressionView .progress .progress-bar{font-size:11px;line-height:12px;padding:2px 0}"
  );

}]);