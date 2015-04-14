module proto.ng.samples.decorators.controllers {

    export class DecoratorsController {

        constructor($rootScope, $scope, $modal, $q, $timeout, appConfig) {
            var cfg = appConfig['decorators'];

            // Define the model
            var context: any = $scope.decorators = {
                fcall: function () {
                    // Clear last result
                    context.error = null;
                    context.fcallState = null;

                    $timeout(() => {
                        // Timeout action...
                    }, 1500).then(
                        (value) => {
                            context.lastStatus = true;
                            context.fcallState = 'Resolved';
                            context.lastResult = 'Timeout Passed';
                        },
                        (error) => {
                            context.lastStatus = false;
                            context.fcallState = 'Rejected';
                            context.lastResult = 'Timeout Failed: ' + error.message;
                        });

                },
                runPromiseAction: function () {
                    // Clear last result
                    context.error = null;
                    context.lastResult = null;
                    context.confirmStatus = null;

                    // Add new promised action
                    context
                        .getPromisedAction()
                        .then(function onSuccess(result) {
                            context.confirmStatus = true;
                            context.lastStatus = true;
                            context.lastResult = result;
                        }, function onRejected(error) {
                            context.confirmStatus = false;
                            context.lastStatus = false;
                            context.lastResult = error;
                        });
                },
                getPromisedAction: function (callback) {
                    var deferred = $q.defer();
                    $rootScope.$applyAsync(function () {
                        if (confirm('Pass Action?')) {
                            var result = 'The action was passed @ ' + new Date().toLocaleTimeString();
                            deferred.resolve(result);
                        } else {
                            var err = new Error('The action was rejected @ ' + new Date().toLocaleTimeString());
                            deferred.reject(err);
                        }
                    });
                    return deferred.promise;
                },
                openModalWindow: function (templateUrl, status, result) {
                    var modalInstance = $modal.open({
                        templateUrl: templateUrl,
                        controller: function ($scope, $modalInstance) {
                            $scope.status = status;
                            $scope.result = result;

                            // Delegate the controller logic
                            cfg.modalController($scope, $modalInstance);
                        },
                        size: 'sm',
                        resolve: {
                            decorators: function () {
                                console.log(' - Get Decorators...', $scope);
                                return $scope.decorators;
                            }
                        }
                    });
                    return modalInstance;
                },
                triggerAjaxRequest: function () {                    
                    var url = 'http://www.filltext.com/?rows=2&fname={firstName}&lname={lastName}&tel={phone|format}&address={streetAddress}&city={city}&state={usState|abbr}&zip={zip}&pretty=true' //window.location.href;
                    context.lastStatus = null;
                    context.ajaxStatus = null;
                    $.ajax(url, {
                        contentType: 'text/html',
                        success: function (data) {
                            $rootScope.$applyAsync(() => {
                                var isHtmlPartial = !/\<!doctype html\>/i.test(data)
                                context.ajaxStatus = isHtmlPartial;
                                context.ajaxResult = isHtmlPartial ? data : '[ <a href="' + url + '">HTML Document</a> ]';
                                context.lastStatus = true;
                                context.lastResult = 'AJAX Result: ' + url;
                            });
                        },
                        error: function (xhr, desc, ex) {
                            $rootScope.$applyAsync(() => {
                                context.lastStatus = false;
                                context.ajaxStatus = false;
                                context.lastResult = 'AJAX Error: [ ' + desc + ' ] ' + ex || url;
                            });
                        },
                    });
                },
            };
        }

    }

}