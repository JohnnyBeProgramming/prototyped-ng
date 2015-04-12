/// <reference path="../imports.d.ts" />
/// <reference path="compression/module.ng.ts" />
/// <reference path="decorators/module.ng.ts" />
/// <reference path="errorHandlers/module.ng.ts" />
/// <reference path="notifications/module.ng.ts" />
/// <reference path="sampleData/module.ng.ts" />
/// <reference path="styles3d/module.ng.ts" />

angular.module('prototyped.ng.samples', [
    'prototyped.ng',
    'prototyped.ng.config',
    'prototyped.ng.samples.views',
    'prototyped.ng.samples.styles',

    'prototyped.ng.samples.errorHandlers',
    'prototyped.ng.samples.sampleData',
    'prototyped.ng.samples.location',
    'prototyped.ng.samples.decorators',
    'prototyped.ng.samples.notifications',
    'prototyped.ng.samples.compression',
    'prototyped.ng.samples.styles3d',
])

// Extend appConfig with module config
    .config(['appConfigProvider', function (appConfigProvider) {

        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng.samples': {
                active: true,
            }
        });
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/samples',
                menuitem: {
                    label: 'Samples',
                    icon: 'fa fa-share-alt',     
                    state: 'samples.info',           
                },
                cardview: {
                    style: 'img-sandbox',
                    title: 'Prototyped Sample Code',
                    desc: 'A selection of samples to test, play and learn about web technologies.'
                },
            });
        }
    }])

    .config(['$stateProvider', function ($stateProvider) {
        // Now set up the states
        $stateProvider
            .state('samples', {
                url: '/samples',
                abstract: true,
            })
            .state('samples.info', {
                url: '',
                views: {
                    'left@': { templateUrl: 'samples/left.tpl.html' },
                    'main@': {
                        templateUrl: 'samples/main.tpl.html',
                        controller: 'sampleViewController'
                    },
                }
            })

    }])

    .controller('sampleViewController', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
        // Define the model
        var context: any = $scope.sample = {
            busy: true,
            text: '',
            utils: {
                list: function (path, callback) {
                    var list = [];
                    try {
                    } catch (ex) {
                        context.error = ex;
                        console.error(ex.message);
                    }
                    return list;
                }
            },
        };

        // Apply updates (including async)
        var updates = <any>{};
        try {
            // Check for required libraries
            if (typeof require !== 'undefined') {
                // We are now in NodeJS!
                updates = {
                    busy: false,
                    hasNode: true,
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
    }])

    .directive('bsSwitch', function ($parse, $timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function link(scope: any, element: any, attrs : any, controller: any) {
                var isInit = false;

                /**
                 * Return the true value for this specific checkbox.
                 * @returns {Object} representing the true view value; if undefined, returns true.
                 */
                var getTrueValue = function () {
                    if (attrs.type === 'radio') {
                        return attrs.value || $parse(attrs.ngValue)(scope) || true;
                    }
                    var trueValue = ($parse(attrs.ngTrueValue)(scope));
                    if (!angular.isString(trueValue)) {
                        trueValue = true;
                    }
                    return trueValue;
                };

                /**
                 * Get a boolean value from a boolean-like string, evaluating it on the current scope.
                 * @param value The input object
                 * @returns {boolean} A boolean value
                 */
                var getBooleanFromString = function (value) {
                    return scope.$eval(value) === true;
                };

                /**
                 * Get a boolean value from a boolean-like string, defaulting to true if undefined.
                 * @param value The input object
                 * @returns {boolean} A boolean value
                 */
                var getBooleanFromStringDefTrue = function (value) {
                    return (value === true || value === 'true' || !value);
                };

                /**
                 * Returns the value if it is truthy, or undefined.
                 *
                 * @param value The value to check.
                 * @returns the original value if it is truthy, {@link undefined} otherwise.
                 */
                var getValueOrUndefined = function (value) {
                    return (value ? value : undefined);
                };

                /**
                 * Get the value of the angular-bound attribute, given its name.
                 * The returned value may or may not equal the attribute value, as it may be transformed by a function.
                 *
                 * @param attrName  The angular-bound attribute name to get the value for
                 * @returns {*}     The attribute value
                 */
                var getSwitchAttrValue = function (attrName) {
                    var map = {
                        'switchRadioOff': getBooleanFromStringDefTrue,
                        'switchActive': function (value) {
                            return !getBooleanFromStringDefTrue(value);
                        },
                        'switchAnimate': getBooleanFromStringDefTrue,
                        'switchLabel': function (value) {
                            return value ? value : '&nbsp;';
                        },
                        'switchIcon': function (value) {
                            if (value) {
                                return '<span class=\'' + value + '\'></span>';
                            }
                        },
                        'switchWrapper': function (value) {
                            return value || 'wrapper';
                        },
                        'switchInverse': getBooleanFromString,
                        'switchReadonly': getBooleanFromString
                    };
                    var transFn = map[attrName] || getValueOrUndefined;
                    return transFn(attrs[attrName]);
                };

                /**
                 * Set a bootstrapSwitch parameter according to the angular-bound attribute.
                 * The parameter will be changed only if the switch has already been initialized
                 * (to avoid creating it before the model is ready).
                 *
                 * @param element   The switch to apply the parameter modification to
                 * @param attr      The name of the switch parameter
                 * @param modelAttr The name of the angular-bound parameter
                 */
                var setSwitchParamMaybe = function (element, attr, modelAttr) {
                    if (!isInit) {
                        return;
                    }
                    var newValue = getSwitchAttrValue(modelAttr);
                    element.bootstrapSwitch(attr, newValue);
                };

                var setActive = function (active: any) {
                    setSwitchParamMaybe(element, 'disabled', 'switchActive');
                };

                /**
                 * If the directive has not been initialized yet, do so.
                 */
                var initMaybe = function () {
                    // if it's the first initialization
                    if (!isInit) {
                        var viewValue = (controller.$modelValue === getTrueValue());
                        isInit = !isInit;
                        // Bootstrap the switch plugin
                        if ('bootstrapSwitch' in element) {
                            element.bootstrapSwitch({
                                radioAllOff: getSwitchAttrValue('switchRadioOff'),
                                disabled: getSwitchAttrValue('switchActive'),
                                state: viewValue,
                                onText: getSwitchAttrValue('switchOnText'),
                                offText: getSwitchAttrValue('switchOffText'),
                                onColor: getSwitchAttrValue('switchOnColor'),
                                offColor: getSwitchAttrValue('switchOffColor'),
                                animate: getSwitchAttrValue('switchAnimate'),
                                size: getSwitchAttrValue('switchSize'),
                                labelText: attrs.switchLabel ? getSwitchAttrValue('switchLabel') : getSwitchAttrValue('switchIcon'),
                                wrapperClass: getSwitchAttrValue('switchWrapper'),
                                handleWidth: getSwitchAttrValue('switchHandleWidth'),
                                labelWidth: getSwitchAttrValue('switchLabelWidth'),
                                inverse: getSwitchAttrValue('switchInverse'),
                                readonly: getSwitchAttrValue('switchReadonly')
                            });
                        }
                        if (attrs.type === 'radio') {
                            controller.$setViewValue(controller.$modelValue);
                        } else {
                            controller.$setViewValue(viewValue);
                        }
                    }
                };

                /**
                 * Listen to model changes.
                 */
                var listenToModel = function () {

                    attrs.$observe('switchActive', function (newValue) {
                        var active = getBooleanFromStringDefTrue(newValue);
                        // if we are disabling the switch, delay the deactivation so that the toggle can be switched
                        if (!active) {
                            $timeout(function () {
                                setActive(active);
                            });
                        } else {
                            // if we are enabling the switch, set active right away
                            setActive(active);
                        }
                    });

                    function modelValue() {
                        return controller.$modelValue;
                    }

                    // When the model changes
                    scope.$watch(modelValue, function (newValue) {
                        initMaybe();
                        if (newValue !== undefined) {
                            element.bootstrapSwitch('state', newValue === getTrueValue(), false);
                        }
                    }, true);

                    // angular attribute to switch property bindings
                    var bindings = {
                        'switchRadioOff': 'radioAllOff',
                        'switchOnText': 'onText',
                        'switchOffText': 'offText',
                        'switchOnColor': 'onColor',
                        'switchOffColor': 'offColor',
                        'switchAnimate': 'animate',
                        'switchSize': 'size',
                        'switchLabel': 'labelText',
                        'switchIcon': 'labelText',
                        'switchWrapper': 'wrapperClass',
                        'switchHandleWidth': 'handleWidth',
                        'switchLabelWidth': 'labelWidth',
                        'switchInverse': 'inverse',
                        'switchReadonly': 'readonly'
                    };

                    var observeProp = function (prop, bindings) {
                        return function () {
                            attrs.$observe(prop, function () {
                                setSwitchParamMaybe(element, bindings[prop], prop);
                            });
                        };
                    };

                    // for every angular-bound attribute, observe it and trigger the appropriate switch function
                    for (var prop in bindings) {
                        attrs.$observe(prop, observeProp(prop, bindings));
                    }
                };

                /**
                 * Listen to view changes.
                 */
                var listenToView = function () {
                    if (attrs.type === 'radio') {
                        // when the switch is clicked
                        element.on('change.bootstrapSwitch', function (e) {
                            // discard not real change events
                            if ((controller.$modelValue === controller.$viewValue) && (e.target.checked !== (<any>$(e.target)).bootstrapSwitch('state'))) {
                                // $setViewValue --> $viewValue --> $parsers --> $modelValue
                                // if the switch is indeed selected
                                if (e.target.checked) {
                                    // set its value into the view
                                    controller.$setViewValue(getTrueValue());
                                } else if (getTrueValue() === controller.$viewValue) {
                                    // otherwise if it's been deselected, delete the view value
                                    controller.$setViewValue(undefined);
                                }
                            }
                        });
                    } else {
                        // When the checkbox switch is clicked, set its value into the ngModel
                        element.on('switchChange.bootstrapSwitch', function (e) {
                            // $setViewValue --> $viewValue --> $parsers --> $modelValue
                            controller.$setViewValue(e.target.checked);
                        });
                    }
                };

                // Listen and respond to view changes
                listenToView();

                // Listen and respond to model changes
                listenToModel();

                // On destroy, collect ya garbage
                scope.$on('$destroy', function () {
                    element.bootstrapSwitch('destroy');
                });
            }
        };
    })
    .directive('bsSwitch', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            template: '<input bs-switch>',
            replace: true
        };
    })