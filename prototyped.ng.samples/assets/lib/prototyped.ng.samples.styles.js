angular.module('prototyped.ng.samples.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/samples.min.css',
    "body .sample-info{padding:8px}body #CompressionView .progress{height:16px;margin-bottom:6px}body #CompressionView .progress .progress-bar{font-size:11px;line-height:12px;padding:2px 0}body .content-border-glow{outline:1px solid #ff6a00;box-shadow:0 0 5px #ff6a00 inset;position:relative}body .content-border-glow.-before:before{content:'Intercepted HTML';padding:3px;color:#fff;font-size:9px;top:0;left:0;position:absolute;background-color:rgba(0,0,0,.5)}"
  );

}]);