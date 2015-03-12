/// <reference path="../imports.d.ts" />

angular.module('prototyped.default', [
    //'views/default.tpl.html', // Requires template
    'ui.router',
])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
          .state('default', {
              url: '/',
              views: {
                  'main@': {
                      templateUrl: 'views/default.tpl.html',
                      controller: 'HomeViewCtrl'
                  },
              }
          })
    }])

    .controller('HomeViewCtrl', ['$scope', '$location', '$timeout', function ($scope, $location, $timeout) {
         $scope.result = null;
         $scope.status = null;
         $scope.state = {
             editMode: false,
             location: $location.$$absUrl,
             protocol: $location.$$protocol,
             requireHttps: ($location.$$protocol == 'https'),
         };
         $scope.detect = function () {
             var target = $scope.state.location;
             var started = Date.now();
             $scope.result = null;
             $scope.latency = null;
             $scope.status = { code: 0, desc: '', style: 'label-default' };
             $.ajax({
                 url: target,
                 crossDomain: true,
                 /*
                 username: 'user',
                 password: 'pass',
                 xhrFields: {
                     withCredentials: true
                 }
                  */
                 beforeSend: function (xhr) {
                     $timeout(function () {
                         //$scope.status.code = xhr.status;
                         $scope.status.desc = 'sending';
                         $scope.status.style = 'label-info';
                     });
                 },
                 success: function (data, textStatus, xhr) {
                     $timeout(function () {
                         $scope.status.code = xhr.status;
                         $scope.status.desc = textStatus;
                         $scope.status.style = 'label-success';
                         $scope.result = {
                             valid: true,
                             info: data,
                             sent: started,
                             received: Date.now()
                         };
                     });
                 },
                 error: (xhr : any, textStatus : string, error : any) => {
                     xhr.ex = error;
                     $timeout(function () {
                         $scope.status.code = xhr.status;
                         $scope.status.desc = textStatus;
                         $scope.status.style = 'label-danger';
                         $scope.result = {
                             valid: false,
                             info: xhr,
                             sent: started,
                             error: xhr.statusText,
                             received: Date.now()
                         };
                     });
                 },
                 complete: (xhr, textStatus) => {
                     console.debug(' - Status Code: ' + xhr.status);
                     $timeout(function () {
                         $scope.status.code = xhr.status;
                         $scope.status.desc = textStatus;
                     });
                 }
             }).always(function (xhr) {
                 $timeout(function () {
                     $scope.latency = $scope.getLatencyInfo();
                 });
             });
         }
         $scope.setProtocol = function (protocol) {
             var val = $scope.state.location;
             var pos = val.indexOf('://');
             if (pos > 0) {
                 val = protocol + val.substring(pos);
             }
             $scope.state.protocol = protocol;
             $scope.state.location = val;
             $scope.detect();
         }
         $scope.getProtocolStyle = function (protocol, activeStyle) {
             var cssRes = '';
             var isValid = $scope.state.location.indexOf(protocol + '://') == 0;
             if (isValid) {
                 if (!$scope.result) {
                     cssRes += 'btn-primary';
                 } else if ($scope.result.valid && activeStyle) {
                     cssRes += activeStyle;
                 } else if ($scope.result) {
                     cssRes += $scope.result.valid ? 'btn-success' : 'btn-danger';
                 }
             }
             return cssRes;
         }
         $scope.getStatusIcon = function (activeStyle) {
             var cssRes = '';
             if (!$scope.result) {
                 cssRes += 'glyphicon-refresh';
             } else if (activeStyle && $scope.result.valid) {
                 cssRes += activeStyle;
             } else {
                 cssRes += $scope.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
             }
             return cssRes;
         }
         $scope.submitForm = function () {
             $scope.state.editMode = false;
             if ($scope.state.requireHttps) {
                 $scope.setProtocol('https');
             } else {
                 $scope.detect();
             }
         }
         $scope.getStatusColor = function () {
             var cssRes = $scope.getStatusIcon() + ' ';
             if (!$scope.result) {
                 cssRes += 'busy';
             } else if ($scope.result.valid) {
                 cssRes += 'success';
             } else {
                 cssRes += 'error';
             }
             return cssRes;
         }
         $scope.getLatencyInfo = function () {
             var cssNone = 'text-muted';
             var cssHigh = 'text-success';
             var cssMedium = 'text-warning';
             var cssLow = 'text-danger';
             var info = {
                 desc: '',
                 style: cssNone,
             };

             if (!$scope.result) {
                 return info;
             }

             if (!$scope.result.valid) {
                 info.style = 'text-muted';
                 info.desc = 'Connection Failed';
                 return info;
             }

             var totalMs = $scope.result.received - $scope.result.sent;
             if (totalMs > 2 * 60 * 1000) {
                 info.style = cssNone;
                 info.desc = 'Timed out';
             } else if (totalMs > 1 * 60 * 1000) {
                 info.style = cssLow;
                 info.desc = 'Impossibly slow';
             } else if (totalMs > 30 * 1000) {
                 info.style = cssLow;
                 info.desc = 'Very slow';
             } else if (totalMs > 1 * 1000) {
                 info.style = cssMedium;
                 info.desc = 'Relatively slow';
             } else if (totalMs > 500) {
                 info.style = cssMedium;
                 info.desc = 'Moderately slow';
             } else if (totalMs > 250) {
                 info.style = cssMedium;
                 info.desc = 'Barely Responsive';
             } else if (totalMs > 150) {
                 info.style = cssHigh;
                 info.desc = 'Average Response Time';
             } else if (totalMs > 50) {
                 info.style = cssHigh;
                 info.desc = 'Responsive Enough';
             } else if (totalMs > 15) {
                 info.style = cssHigh;
                 info.desc = 'Very Responsive';
             } else {
                 info.style = cssHigh;
                 info.desc = 'Optimal';
             }
             return info;
         }
     }])

;