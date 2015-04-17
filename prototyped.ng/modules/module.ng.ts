/// <reference path="../imports.d.ts" />
/// <reference path="../modules/config.ng.ts" />
/// <reference path="../modules/about/module.ng.ts" />

// Define main module with all dependencies
angular.module('prototyped.ng', [
    'prototyped.ng.config',
    'prototyped.ng.views',
    'prototyped.ng.styles',

// Define sub modules
    'prototyped.about',
    'prototyped.editor',
    'prototyped.explorer',
    'prototyped.console',
])

    .config(['appConfigProvider', function (appConfigProvider) {

        // Define module configuration
        appConfigProvider.set({
            'prototyped.ng': {
                active: true,
            }
        });

        // Define the routing components (menus, card views etc...)
        var appConfig = appConfigProvider.$get();
        if (appConfig) {
            // Define module routes
            appConfig.routers.push({
                url: '/explore',
                abstract: true,
                priority: 0,
                menuitem: {
                    label: 'Explore',
                    state: 'proto.explore',
                    icon: 'fa fa-cubes',
                },
                cardview: {
                    style: 'img-explore',
                    title: 'Explore Features & Options',
                    desc: 'You can explore locally installed features and find your way around the site by clicking on this card...'
                },
                visible: function () {

                    return appConfig.options.showDefaultItems;
                },
                children: [
                    { label: 'Discovery', icon: 'fa fa-refresh', state: 'modules.discover', },
                    { label: 'Connnect', icon: 'fa fa-gears', state: 'modules.connect', },
                    { divider: true },
                    { label: 'Clean & Exit', icon: 'fa fa-recycle', state: 'modules.clear', },
                ],
            });
            appConfig.routers.push({
                url: '/about',
                abstract: true,
                priority: 1000,
                menuitem: {
                    label: 'About',
                    state: 'about.info',
                    icon: 'fa fa-info-circle',
                },
                cardview: {
                    style: 'img-about',
                    title: 'About this software',
                    desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
                },
                visible: function () {
                    return appConfig.options.showAboutPage;
                },
            });
        }

    }])
    .config(['$urlRouterProvider', ($urlRouterProvider) => {

        // Define redirects
        $urlRouterProvider
            .when('/proto', '/proto/explore')
            .when('/sandbox', '/samples')
            .when('/imports', '/edge');

    }])
    .config(['$stateProvider', ($stateProvider) => {

        // Set up routing...
        $stateProvider
            .state('default', {
                url: '/',
                views: {
                    'main@': {
                        templateUrl: 'views/default.tpl.html',
                        controller: 'CardViewCtrl',
                        controllerAs: 'sliderCtrl',
                    },
                }
            })
            .state('proto', {
                url: '/proto',
                abstract: true,
            })

    }])

    .constant('appNode', {
        html5: true,
        active: typeof require !== 'undefined',
        ui: function () {
            if (typeof require !== 'undefined') {
                return require('nw.gui');
            }
            return undefined;
        },
        win: function () {
            if (typeof require !== 'undefined') {
                var gui = require('nw.gui');
                var win = gui.Window.get();
                if (win) {
                    return win;
                }
            }
            return undefined;
        },
        reload: function () {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win) {
                win.reloadIgnoringCache();
            }
        },
        close: function () {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win) {
                win.close();
            }
        },
        debug: function () {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win.isDevToolsOpen()) {
                win.closeDevTools();
            } else {
                win.showDevTools()
            }
        },
        toggleFullscreen: function () {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win) {
                win.toggleFullscreen();
            }
        },
        kiosMode: function () {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            if (win) {
                win.toggleKioskMode();
            }
        },
    })

    .constant('appStatus', {
        logs: [],
        show: {
            all: true,
            log: false,
            info: true,
            warn: true,
            error: true,
            debug: false,
        },
    })


    .controller('CardViewCtrl', ['$scope', 'appConfig', function ($scope, appConfig) {
        // Make sure 'mySiteMap' exists
        $scope.pages = appConfig.routers || [];

        // initial image index
        $scope._Index = 0;

        $scope.count = function () {
            return $scope.pages.length;
        };

        // if a current image is the same as requested image
        $scope.isActive = function (index) {
            return $scope._Index === index;
        };

        // show prev image
        $scope.showPrev = function () {
            $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.count() - 1;
        };

        // show next image
        $scope.showNext = function () {
            $scope._Index = ($scope._Index < $scope.count() - 1) ? ++$scope._Index : 0;
        };

        // show a certain image
        $scope.showPhoto = function (index) {
            $scope._Index = index;
        };
    }])


    .directive('appClean', ['$rootScope', '$window', '$route', '$state', 'appNode', 'appStatus', function ($rootScope, $window, $route, $state, appNode, appStatus) {
        return function (scope, elem, attrs) {
            var keyCtrl = false;
            var keyShift = false;
            var keyEvent = $(document).on('keyup keydown', function (e) {
                // Update key states
                var hasChanges = false;
                if (keyCtrl != e.ctrlKey) {
                    hasChanges = true;
                    keyCtrl = e.ctrlKey;
                }
                if (keyShift != e.shiftKey) {
                    hasChanges = true;
                    keyShift = e.shiftKey;
                }
                if (hasChanges) {
                    $(elem).find('i').toggleClass('glow-blue', !keyShift && keyCtrl);
                    $(elem).find('i').toggleClass('glow-orange', keyShift);
                }
            });
            $(elem).attr('tooltip', 'Refresh');
            $(elem).attr('tooltip-placement', 'bottom');
            $(elem).click(function (e) {
                if (keyShift) {
                    // Full page reload
                    if (appNode.active) {
                        console.debug(' - Reload Node Webkit...');
                        appNode.reload();
                    } else {
                        console.debug(' - Reload page...');
                        $window.location.reload(true);
                    }
                } else if (keyCtrl) {
                    // Fast route reload
                    console.debug(' - Reload route...');
                    $route.reload();
                } else {
                    // Fast state reload
                    console.debug(' - Refresh state...');
                    $state.reload();
                }

                // Clear all previous status messages
                appStatus.logs = [];
                console.clear();
            });
            scope.$on('$destroy', function () {
                $(elem).off('click');
                keyEvent.off('keyup keydown');
            });
        };
    }])
    .directive('appClose', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.close();
            });
        };
    }])
    .directive('appDebug', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.debug();
            });
        };
    }])
    .directive('appKiosk', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.kiosMode();
            });
        };
    }])
    .directive('appFullscreen', ['appNode', function (appNode) {
        return function (scope, elem, attrs) {
            // Only enable the button in a NodeJS context (extended functionality)
            $(elem).css('display', appNode.active ? '' : 'none');
            $(elem).click(function () {
                appNode.toggleFullscreen();
            });
        };
    }])

    .directive('appVersion', ['appConfig', 'appNode', function (appConfig, appNode) {

        function getVersionInfo(ident) {
            try {
                if (typeof process !== 'undefined' && process.versions) {
                    return process.versions[ident];
                }
            } catch (ex) { }
            return null;
        }

        return function (scope, elm, attrs) {
            var targ = attrs['appVersion'];
            var val = null;
            if (!targ) {
                val = appConfig.version;
            } else switch (targ) {
                case 'angular':
                    val = angular.version.full;
                    break;
                case 'nodeweb-kit':
                    val = getVersionInfo('node-webkit');
                    break;
                case 'node':
                    val = getVersionInfo('node');
                    break;
                default:
                    val = getVersionInfo(targ) || val;
                    // Not found....
                    break;
            }
            if (!val && attrs['defaultText']) {
                val = attrs['defaultText'];
            }
            if (val) {
                $(elm).text(val);
            }
        };
    }])

    .filter('interpolate', ['appNode', function (appNode) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, appNode.version);
        };
    }])
    .filter('fromNow', ['$filter', function ($filter) {
        return function (dateString, format) {
            try {
                if (typeof moment !== 'undefined') {
                    return moment(dateString).fromNow(format);
                } else {
                    return ' at ' + $filter('date')(dateString, 'HH:mm:ss');
                }
            } catch (ex) {
                console.error(ex);
                return 'error';
            }
        };
    }])

    .filter('isArray', function () {
        return function (input) {
            return angular.isArray(input);
        };
    })
    .filter('isNotArray', function () {
        return function (input) {
            return !angular.isArray(input);
        };
    })
    .filter('typeCount', [() => {
        return function (input, type) {
            var count = 0;
            if (input.length > 0) {
                input.forEach(function (itm) {
                    if (!itm) return;
                    if (!itm.type) return;
                    if (itm.type == type) count++;
                });
            }
            return count;
        };
    }])
    .filter('listReverse', function () {
        return function (input) {
            var result = [];
            var length = input.length;
            if (length) {
                for (var i = length - 1; i !== 0; i--) {
                    result.push(input[i]);
                }
            }
            return result;
        };
    })
    .filter('toBytes', function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    })
    .filter('parseBytes', function () {
        return function (bytesDesc, precision) {
            var match = /(\d+) (\w+)/i.exec(bytesDesc);
            if (match && (match.length > 2)) {
                var bytes = match[1];
                var floatVal = parseFloat(bytes);
                if (isNaN(floatVal) || !isFinite(floatVal)) return '[?]';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
                var number = Math.floor(Math.log(floatVal) / Math.log(1024));
                var pow = -1;
                units.forEach(function (itm, i) {
                    if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0) pow = i;
                });
                if (pow > 0) {
                    var ret = (floatVal * Math.pow(1024, pow)).toFixed(precision);
                    return ret;
                }
            }
            return bytesDesc;
        }
    })
    .directive('eatClickIf', ['$parse', '$rootScope', function ($parse, $rootScope) {
        return {
            priority: 100, // this ensure eatClickIf be compiled before ngClick
            restrict: 'A',
            compile: function ($element, attr) {
                var fn = $parse(attr.eatClickIf);
                return {
                    pre: function link(scope, element) {
                        var eventName = 'click';
                        element.on(eventName, function (event) {
                            var callback = function () {
                                if (fn(scope, { $event: event })) {
                                    // prevents ng-click to be executed
                                    event.stopImmediatePropagation();
                                    // prevents href 
                                    event.preventDefault();
                                    return false;
                                }
                            };
                            if ($rootScope.$$phase) {
                                scope.$evalAsync(callback);
                            } else {
                                scope.$apply(callback);
                            }
                        });
                    },
                    post: function () { }
                }
            }
        }
    }])

    .directive('toHtml', ['$sce', '$filter', function ($sce, $filter) {
        function getHtml(obj) {
            try {
                return 'toHtml:\'pre\' - ' + $filter('toXml')(obj, 'pre');
            } catch (ex) {
                return 'toHtml:error - ' + ex.message;
            }
        }
        return {
            restrict: 'EA',
            scope: {
                toHtml: '&',
            },
            transclude: false,
            controller: function ($scope, $sce) {
                var val = $scope.toHtml();
                var html = getHtml(val);
                $scope.myHtml = $sce.trustAsHtml(html);
            },
            template: '<div ng-bind-html="myHtml"></div>'
        }
    }])
    .filter('toXml', [function () { // My custom filter
        function toXmlString(name: string, input: any, expanded: boolean, childExpanded?: boolean) {
            var val = '';
            var sep = '';
            var attr = '';
            if ($.isArray(input)) {
                if (expanded) {
                    for (var i = 0; i < input.length; i++) {
                        val += toXmlString(null, input[i], childExpanded);
                    }
                } else {
                    name = 'Array';
                    attr += sep + ' length="' + input.length + '"';
                    val = 'Array[' + input.length + ']';
                }
            } else if ($.isPlainObject(input)) {
                if (expanded) {
                    for (var id in input) {
                        if (input.hasOwnProperty(id)) {
                            var child = input[id];
                            if ($.isArray(child) || $.isPlainObject(child)) {
                                val = toXmlString(id, child, childExpanded);
                            } else {
                                sep = ' ';
                                attr += sep + id + '="' + toXmlString(null, child, childExpanded) + '"';
                            }
                        }
                    }
                } else {
                    name = 'Object';
                    for (var id in input) {
                        if (input.hasOwnProperty(id)) {
                            var child = input[id];
                            if ($.isArray(child) || $.isPlainObject(child)) {
                                val += toXmlString(id, child, childExpanded);
                            } else {
                                sep = ' ';
                                attr += sep + id + '="' + toXmlString(null, child, childExpanded) + '"';
                            }
                        }
                    }
                    //val = 'Object[ ' + JSON.stringify(input) + ' ]';
                }
            }
            if (name) {
                val = '<' + name + '' + attr + '>' + val + '</' + name + '>';
            }
            return val;
        }
        return function (input, rootName) {
            return toXmlString(rootName || 'xml', input, true);
        }
    }])

    .directive('domReplace', function () {
        return {
            restrict: 'A',
            require: 'ngInclude',
            link: function (scope, el, attrs) {
                el.replaceWith(el.children());
            }
        };
    })
    .directive('resxInclude', ['$templateCache', function ($templateCache) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxInclude;
                var cache = $templateCache.get(ident);
                if (cache) {
                    $element.text(cache);
                    //$element.replaceWith(cache);
                }
                return {
                    pre: (scope, element) => { },
                    post: (scope, element) => { }
                }
            }
        }
    }])
    .directive('resxImport', ['$templateCache', '$document', function ($templateCache, $document) {
        return {
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var ident = attr.resxImport;
                var cache = $templateCache.get(ident);
                if ($('[resx-src="' + ident + '"]').length <= 0) {
                    var html = '';
                    if (/(.*)(\.css)/i.test(ident)) {
                        if (cache != null) {
                            html = '<style resx-src="' + ident + '">' + cache + '</style>';
                        } else {
                            html = '<link resx-src="' + ident + '" href="' + ident + '" rel="stylesheet" type="text/css" />';
                        }
                    } else if (/(.*)(\.js)/i.test(ident)) {
                        if (cache != null) {
                            html = '<script resx-src="' + ident + '">' + cache + '</script>';
                        } else {
                            html = '<script resx-src="' + ident + '" src="' + ident + '">' + cache + '</script>';
                        }
                    }
                    if (html) {
                        $element.replaceWith(html);
                    }
                }
                return {
                    pre: (scope, element) => { },
                    post: (scope, element) => { }
                }
            }
        }
    }])

    .directive('abnTree', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            template: "<ul class=\"nav nav-list nav-pills nav-stacked abn-tree\">\n  <li ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\" ng-animate=\"'abn-tree-animate'\" ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'') + ' ' +row.classes.join(' ')\" class=\"abn-tree-row\"><a ng-click=\"user_clicks_branch(row.branch)\"><i ng-class=\"row.tree_icon\" ng-click=\"row.branch.expanded = !row.branch.expanded\" class=\"indented tree-icon\"> </i><span class=\"indented tree-label\">{{ row.label }} </span></a></li>\n</ul>",
            replace: true,
            scope: {
                treeData: '=',
                onSelect: '&',
                initialSelection: '@',
                treeControl: '='
            },
            link: function (scope, element, attrs) {
                var error, expand_all_parents, expand_level, for_all_ancestors, for_each_branch, get_parent, n, on_treeData_change, select_branch, selected_branch, tree;
                error = function (s) {
                    console.log('ERROR:' + s);
                    debugger;
                    return void 0;
                };
                if (attrs.iconExpand == null) {
                    attrs.iconExpand = 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
                }
                if (attrs.iconCollapse == null) {
                    attrs.iconCollapse = 'icon-minus glyphicon glyphicon-minus fa fa-minus';
                }
                if (attrs.iconLeaf == null) {
                    attrs.iconLeaf = 'icon-file  glyphicon glyphicon-file  fa fa-file';
                }
                if (attrs.expandLevel == null) {
                    attrs.expandLevel = '3';
                }
                expand_level = parseInt(attrs.expandLevel, 10);
                if (!scope.treeData) {
                    alert('no treeData defined for the tree!');
                    return;
                }
                if (scope.treeData.length == null) {
                    if (scope.treeData.label != null) {
                        scope.treeData = [scope.treeData];
                    } else {
                        alert('treeData should be an array of root branches');
                        return;
                    }
                }
                for_each_branch = function (f) {
                    var do_f, root_branch, _i, _len, _ref, _results;
                    do_f = function (branch, level) {
                        var child, _i, _len, _ref, _results;
                        f(branch, level);
                        if (branch.children != null) {
                            _ref = branch.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _results.push(do_f(child, level + 1));
                            }
                            return _results;
                        }
                    };
                    _ref = scope.treeData;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        root_branch = _ref[_i];
                        _results.push(do_f(root_branch, 1));
                    }
                    return _results;
                };
                selected_branch = null;
                select_branch = function (branch) {
                    if (!branch) {
                        if (selected_branch != null) {
                            selected_branch.selected = false;
                        }
                        selected_branch = null;
                        return;
                    }
                    if (branch !== selected_branch) {
                        if (selected_branch != null) {
                            selected_branch.selected = false;
                        }
                        branch.selected = true;
                        selected_branch = branch;
                        expand_all_parents(branch);
                        if (branch.onSelect != null) {
                            return $timeout(function () {
                                return branch.onSelect(branch);
                            });
                        } else {
                            if (scope.onSelect != null) {
                                return $timeout(function () {
                                    return scope.onSelect({
                                        branch: branch
                                    });
                                });
                            }
                        }
                    }
                };
                scope.user_clicks_branch = function (branch) {
                    if (branch !== selected_branch) {
                        return select_branch(branch);
                    }
                };
                get_parent = function (child) {
                    var parent;
                    parent = void 0;
                    if (child.parent_uid) {
                        for_each_branch(function (b) {
                            if (b.uid === child.parent_uid) {
                                return parent = b;
                            }
                        });
                    }
                    return parent;
                };
                for_all_ancestors = function (child, fn) {
                    var parent;
                    parent = get_parent(child);
                    if (parent != null) {
                        fn(parent);
                        return for_all_ancestors(parent, fn);
                    }
                };
                expand_all_parents = function (child) {
                    return for_all_ancestors(child, function (b) {
                        return b.expanded = true;
                    });
                };
                scope.tree_rows = [];
                on_treeData_change = function () {
                    var add_branch_to_list, root_branch, _i, _len, _ref, _results;
                    for_each_branch(function (b, level) {
                        if (!b.uid) {
                            return b.uid = "" + Math.random();
                        }
                    });
                    for_each_branch(function (b) {
                        var child, _i, _len, _ref, _results;
                        if (angular.isArray(b.children)) {
                            _ref = b.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _results.push(child.parent_uid = b.uid);
                            }
                            return _results;
                        }
                    });
                    scope.tree_rows = [];
                    for_each_branch(function (branch) {
                        var child, f;
                        if (branch.children) {
                            if (branch.children.length > 0) {
                                f = function (e) {
                                    if (typeof e === 'string') {
                                        return {
                                            label: e,
                                            children: []
                                        };
                                    } else {
                                        return e;
                                    }
                                };
                                return branch.children = (function () {
                                    var _i, _len, _ref, _results;
                                    _ref = branch.children;
                                    _results = [];
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        child = _ref[_i];
                                        _results.push(f(child));
                                    }
                                    return _results;
                                })();
                            }
                        } else {
                            return branch.children = [];
                        }
                    });
                    add_branch_to_list = function (level, branch, visible) {
                        var child, child_visible, tree_icon, _i, _len, _ref, _results;
                        if (branch.expanded == null) {
                            branch.expanded = false;
                        }
                        if (branch.classes == null) {
                            branch.classes = [];
                        }
                        if (!branch.noLeaf && (!branch.children || branch.children.length === 0)) {
                            tree_icon = attrs.iconLeaf;
                            if (branch.classes.indexOf("leaf") < 0) {
                                branch.classes.push("leaf");
                            }
                        } else {
                            if (branch.expanded) {
                                tree_icon = attrs.iconCollapse;
                            } else {
                                tree_icon = attrs.iconExpand;
                            }
                        }
                        scope.tree_rows.push({
                            level: level,
                            branch: branch,
                            label: branch.label,
                            classes: branch.classes,
                            tree_icon: tree_icon,
                            visible: visible
                        });
                        if (branch.children != null) {
                            _ref = branch.children;
                            _results = [];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                child_visible = visible && branch.expanded;
                                _results.push(add_branch_to_list(level + 1, child, child_visible));
                            }
                            return _results;
                        }
                    };
                    _ref = scope.treeData;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        root_branch = _ref[_i];
                        _results.push(add_branch_to_list(1, root_branch, true));
                    }
                    return _results;
                };
                scope.$watch('treeData', on_treeData_change, true);
                if (attrs.initialSelection != null) {
                    for_each_branch(function (b) {
                        if (b.label === attrs.initialSelection) {
                            return $timeout(function () {
                                return select_branch(b);
                            });
                        }
                    });
                }
                n = scope.treeData.length;
                for_each_branch(function (b, level) {
                    b.level = level;
                    return b.expanded = b.level < expand_level;
                });
                if (scope.treeControl != null) {
                    if (angular.isObject(scope.treeControl)) {
                        tree = scope.treeControl;
                        tree.expand_all = function () {
                            return for_each_branch(function (b, level) {
                                return b.expanded = true;
                            });
                        };
                        tree.collapse_all = function () {
                            return for_each_branch(function (b, level) {
                                return b.expanded = false;
                            });
                        };
                        tree.get_first_branch = function () {
                            n = scope.treeData.length;
                            if (n > 0) {
                                return scope.treeData[0];
                            }
                        };
                        tree.select_first_branch = function () {
                            var b;
                            b = tree.get_first_branch();
                            return tree.select_branch(b);
                        };
                        tree.get_selected_branch = function () {
                            return selected_branch;
                        };
                        tree.get_parent_branch = function (b) {
                            return get_parent(b);
                        };
                        tree.select_branch = function (b) {
                            select_branch(b);
                            return b;
                        };
                        tree.get_children = function (b) {
                            return b.children;
                        };
                        tree.select_parent_branch = function (b) {
                            var p;
                            if (b == null) {
                                b = tree.get_selected_branch();
                            }
                            if (b != null) {
                                p = tree.get_parent_branch(b);
                                if (p != null) {
                                    tree.select_branch(p);
                                    return p;
                                }
                            }
                        };
                        tree.add_branch = function (parent, new_branch) {
                            if (parent != null) {
                                parent.children.push(new_branch);
                                parent.expanded = true;
                            } else {
                                scope.treeData.push(new_branch);
                            }
                            return new_branch;
                        };
                        tree.add_root_branch = function (new_branch) {
                            tree.add_branch(null, new_branch);
                            return new_branch;
                        };
                        tree.expand_branch = function (b) {
                            if (b == null) {
                                b = tree.get_selected_branch();
                            }
                            if (b != null) {
                                b.expanded = true;
                                return b;
                            }
                        };
                        tree.collapse_branch = function (b) {
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                b.expanded = false;
                                return b;
                            }
                        };
                        tree.get_siblings = function (b) {
                            var p, siblings;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                p = tree.get_parent_branch(b);
                                if (p) {
                                    siblings = p.children;
                                } else {
                                    siblings = scope.treeData;
                                }
                                return siblings;
                            }
                        };
                        tree.get_next_sibling = function (b) {
                            var i, siblings;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                siblings = tree.get_siblings(b);
                                n = siblings.length;
                                i = siblings.indexOf(b);
                                if (i < n) {
                                    return siblings[i + 1];
                                }
                            }
                        };
                        tree.get_prev_sibling = function (b) {
                            var i, siblings;
                            if (b == null) {
                                b = selected_branch;
                            }
                            siblings = tree.get_siblings(b);
                            n = siblings.length;
                            i = siblings.indexOf(b);
                            if (i > 0) {
                                return siblings[i - 1];
                            }
                        };
                        tree.select_next_sibling = function (b) {
                            var next;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                next = tree.get_next_sibling(b);
                                if (next != null) {
                                    return tree.select_branch(next);
                                }
                            }
                        };
                        tree.select_prev_sibling = function (b) {
                            var prev;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                prev = tree.get_prev_sibling(b);
                                if (prev != null) {
                                    return tree.select_branch(prev);
                                }
                            }
                        };
                        tree.get_first_child = function (b) {
                            var _ref;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                                    return b.children[0];
                                }
                            }
                        };
                        tree.get_closest_ancestor_next_sibling = function (b) {
                            var next, parent;
                            next = tree.get_next_sibling(b);
                            if (next != null) {
                                return next;
                            } else {
                                parent = tree.get_parent_branch(b);
                                return tree.get_closest_ancestor_next_sibling(parent);
                            }
                        };
                        tree.get_next_branch = function (b) {
                            var next;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                next = tree.get_first_child(b);
                                if (next != null) {
                                    return next;
                                } else {
                                    next = tree.get_closest_ancestor_next_sibling(b);
                                    return next;
                                }
                            }
                        };
                        tree.select_next_branch = function (b) {
                            var next;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                next = tree.get_next_branch(b);
                                if (next != null) {
                                    tree.select_branch(next);
                                    return next;
                                }
                            }
                        };
                        tree.last_descendant = function (b) {
                            var last_child;
                            if (b == null) {
                                debugger;
                            }
                            n = b.children.length;
                            if (n === 0) {
                                return b;
                            } else {
                                last_child = b.children[n - 1];
                                return tree.last_descendant(last_child);
                            }
                        };
                        tree.get_prev_branch = function (b) {
                            var parent, prev_sibling;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                prev_sibling = tree.get_prev_sibling(b);
                                if (prev_sibling != null) {
                                    return tree.last_descendant(prev_sibling);
                                } else {
                                    parent = tree.get_parent_branch(b);
                                    return parent;
                                }
                            }
                        };
                        return tree.select_prev_branch = function (b) {
                            var prev;
                            if (b == null) {
                                b = selected_branch;
                            }
                            if (b != null) {
                                prev = tree.get_prev_branch(b);
                                if (prev != null) {
                                    tree.select_branch(prev);
                                    return prev;
                                }
                            }
                        };
                    }
                }
            }
        };
    }])

    .run(['$rootScope', '$state', '$filter', 'appConfig', 'appNode', 'appStatus', function ($rootScope, $state, $filter, appConfig, appNode, appStatus) {

        // Extend root scope with (global) vars
        angular.extend($rootScope, {
            appConfig: appConfig,
            appNode: appNode,
            status: appStatus,
            startAt: Date.now(),
            state: $state,
        });

        // Hook extended function(s)
        appStatus.getIcon = function () {
            var match = /\/!(\w+)!/i.exec(appNode.proxy || '');
            if (match && match.length > 1) {
                switch (match[1]) {
                    case 'test': return 'fa fa-puzzle-piece glow-blue animate-glow';
                    case 'debug': return 'fa fa-bug glow-orange animate-glow';
                }
            }
            return (appNode.active) ? 'fa-desktop' : 'fa-cube';
        }
        appStatus.getColor = function () {
            var logs = appStatus.logs;
            if ($filter('typeCount')(logs, 'error')) {
                return 'glow-red';
            }
            if ($filter('typeCount')(logs, 'warn')) {
                return 'glow-orange';
            }
            if ($filter('typeCount')(logs, 'info')) {
                return 'glow-blue';
            }
            if (appNode.active > 0) {
                return 'glow-green';
            }
            return '';
        }

    }])
    .run(['appConfig', function (appConfig) {
        console.debug(' - Current Config: ', appConfig);
    }])

