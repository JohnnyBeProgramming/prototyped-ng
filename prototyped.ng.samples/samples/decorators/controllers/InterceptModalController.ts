module proto.ng.samples.decorators.controllers {

    export class InterceptModalController {

        constructor(private $scope, private $modalInstance, private status, private result) {
            $scope.status = status;
            $scope.result = result;

            // Define modal scope
            $scope.allowEmpty = typeof result === 'undefined';
            $scope.action = status ? 'Accept' : 'Reject';
            $scope.modalAction = (typeof status !== 'undefined') ? 'resp' : 'req';
            $scope.promisedValue = status ? result : undefined;
            $scope.rejectValue = !status ? result : new Error("Interceptor rejected the action.");
            $scope.getStatus = function () { return $scope.action == 'Accept'; };
            $scope.getResult = function () { return $scope.getStatus() ? $scope.promisedValue : $scope.rejectValue; };
            $scope.getType = function () {
                var result = $scope.getResult();
                return (typeof result);
            };
            $scope.getBody = function () { return JSON.stringify($scope.getResult()); };
            $scope.setToggle = function (val) {
                $scope.allowEmpty = val;
            };
            $scope.ok = function () {
                if (!$scope.allowEmpty && !$scope.promisedValue) {
                    alert($scope.allowEmpty);
                    return;
                }
                $modalInstance.close($scope.promisedValue);
            };
            $scope.cancel = function () {
                if (!$scope.allowEmpty && !$scope.rejectValue) {
                    return;
                }
                $modalInstance.dismiss($scope.rejectValue);
            };
        }

    }

}