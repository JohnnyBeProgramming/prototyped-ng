angular.module('prototyped.ng.features.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/features.min.css',
    "body .card-view .img-advanced{filter:grayscale(100%);background-size:715px auto;background-position:top right;background-image:url(http://cywee.com/wp-content/uploads/2013/04/Advanced-Technology-715x250.jpg)}"
  );

}]);