var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (services) {
                    var NavigationService = (function () {
                        function NavigationService($state, appState) {
                            this.$state = $state;
                            this.appState = appState;
                            this._treeData = [];
                            this._treeMap = {};
                            this.init();
                        }
                        NavigationService.prototype.init = function () {
                            this.siteExplorer = new SiteExplorerRoot('Site Explorer', this.appState);
                            this.register(this.siteExplorer);

                            this.externalLinks = new ExternalLinksRoot('External Links', this.appState);
                            this.register(this.externalLinks);

                            if (this.appState.node.active) {
                                this.fileSystem = new FileBrowserRoot('File Browser');
                                this.register(this.fileSystem);
                            }

                            if (this.appState.debug) {
                                this.clientStates = new SiteNavigationRoot('Client States', this.$state.get());
                                this.register(this.clientStates);
                            }
                        };

                        NavigationService.prototype.register = function (node) {
                            var ident = node.label;
                            if (ident in this._treeMap)
                                return this;
                            this._treeMap[ident] = node;
                            this._treeData.push(node);
                            return this;
                        };

                        NavigationService.prototype.findByLabel = function (ident) {
                            var node;
                            this._treeData.forEach(function (itm) {
                                if (itm.label == ident)
                                    node = itm;
                            });
                            return node;
                        };

                        NavigationService.prototype.getTreeData = function (ident) {
                            var ret = [];
                            if (!ident && this._treeData) {
                                return this._treeData;
                            } else if (this._treeData.length) {
                                this._treeData.forEach(function (itm, i) {
                                    if (itm.label == ident) {
                                        ret.push(itm);
                                    }
                                });
                            }
                            return ret;
                        };
                        return NavigationService;
                    })();
                    services.NavigationService = NavigationService;

                    var TreeNode = (function () {
                        function TreeNode(nodeName) {
                            this.children = [];
                            this.classes = [];
                            this.label = nodeName;
                        }
                        return TreeNode;
                    })();
                    services.TreeNode = TreeNode;

                    var SiteNode = (function (_super) {
                        __extends(SiteNode, _super);
                        function SiteNode(nodeName, state) {
                            _super.call(this, nodeName);
                            this.state = state;
                            this.data = state;
                        }
                        SiteNode.prototype.onSelect = function (node) {
                            //this.$rootScope.$broadcast('nodeSelect', this);
                        };
                        return SiteNode;
                    })(TreeNode);
                    services.SiteNode = SiteNode;

                    var SiteExplorerRoot = (function (_super) {
                        __extends(SiteExplorerRoot, _super);
                        function SiteExplorerRoot(nodeName, appState) {
                            _super.call(this, nodeName, null);
                            this.appState = appState;
                            this.init();
                        }
                        SiteExplorerRoot.prototype.init = function () {
                            var _this = this;
                            this.children = [];
                            this.appState.routers.forEach(function (route, i) {
                                if (route.menuitem) {
                                    var node = new SiteNode(route.menuitem.label, route);
                                    if (node) {
                                        node.onSelect = function (item) {
                                            _this.appState.navigate(item.data);
                                        };
                                    }
                                    _this.children.push(node);
                                }
                            });
                        };
                        return SiteExplorerRoot;
                    })(SiteNode);
                    services.SiteExplorerRoot = SiteExplorerRoot;

                    var FileBrowserRoot = (function (_super) {
                        __extends(FileBrowserRoot, _super);
                        function FileBrowserRoot(nodeName) {
                            _super.call(this, nodeName, './');
                            this.init();
                        }
                        FileBrowserRoot.prototype.init = function () {
                            var _this = this;
                            this.children = [];
                            try  {
                                if (typeof require === 'undefined')
                                    return;

                                // Resolve the full path
                                var path = require('path');
                                var target = path.resolve(this.data);
                                var pattern = /[^\\]+\\?$/i;
                                if (!pattern.test(target) || target == '' || target.indexOf('\\') < 0) {
                                    this.label = target || 'Drive Root';
                                    this.populateItem(this, target);
                                } else {
                                    var links = [];
                                    var cwd = target;
                                    while (pattern.test(cwd) && cwd != '') {
                                        var label = pattern.exec(cwd)[0];
                                        var folder = cwd.replace(pattern, '');
                                        if (label) {
                                            if (label.lastIndexOf('\\') == label.length - 1)
                                                label = label.substring(0, label.length - 1);
                                            var linked = new SiteNode(label, cwd);
                                            linked.onSelect = function (itm) {
                                                _this.selectItem(itm);
                                            };
                                            links.push(linked);
                                        }
                                        cwd = folder;
                                    }
                                    var last = this;
                                    while (links.length) {
                                        var node = links.pop();
                                        last.children.push(node);
                                        last = node;
                                        last.expanded = true;
                                        this.populateItem(node, node.data);
                                    }
                                }
                            } catch (ex) {
                                throw ex;
                            }
                        };

                        FileBrowserRoot.prototype.populateItem = function (parentNode, target) {
                            var _this = this;
                            if (!target)
                                return;
                            try  {
                                // Read the folder contents
                                var fs = require('fs');
                                var path = require('path');
                                fs.readdir(target, function (error, files) {
                                    if (error) {
                                        console.warn('Could not read from filesystem: ', error);
                                        return;
                                    }

                                    for (var i = 0; i < files.sort().length; ++i) {
                                        try  {
                                            var targ = path.join(target, files[i]);
                                            if (!parentNode.children.some(function (val) {
                                                return val.label == files[i];
                                            })) {
                                                var stat = fs.statSync(targ);
                                                if (stat.isDirectory()) {
                                                    // Folder item
                                                    var name = path.basename(targ);
                                                    var linked = new SiteNode(name, targ);
                                                    linked.onSelect = function (itm) {
                                                        _this.selectItem(itm);
                                                    };
                                                    parentNode.children.push(linked);
                                                } else {
                                                    // File item
                                                }
                                            }
                                        } catch (ex) {
                                        }
                                    }

                                    parentNode.children.sort(function (a, b) {
                                        return a.label == b.label ? 0 : (a.label > b.label ? 1 : -1);
                                    });
                                    parentNode.data.cached = true;

                                    if (_this.UpdateUI) {
                                        _this.UpdateUI();
                                    }
                                });
                            } catch (ex) {
                                console.warn(ex.message);
                            }
                        };

                        FileBrowserRoot.prototype.selectItem = function (node) {
                            if (!node.data.cached) {
                                this.populateItem(node, node.data);
                            }
                            if (this.OnSelect) {
                                this.OnSelect(node);
                            }
                        };
                        return FileBrowserRoot;
                    })(SiteNode);
                    services.FileBrowserRoot = FileBrowserRoot;

                    var SiteNavigationRoot = (function (_super) {
                        __extends(SiteNavigationRoot, _super);
                        function SiteNavigationRoot(nodeName, states) {
                            _super.call(this, nodeName, null);
                            this.states = states;
                            this.stateCache = {};
                            this.init();
                        }
                        SiteNavigationRoot.prototype.init = function () {
                            var _this = this;
                            this.children = [];
                            this.states.forEach(function (state, i) {
                                if (state.url == '^' || state.name == '') {
                                    _this.data = state; // Root node
                                } else if (state.name.indexOf('.') < 0) {
                                    _this.addItem(_this, [state.name], state);
                                } else {
                                    var parts = state.name.split('.');
                                    _this.addItem(_this, parts, state);
                                }
                            });
                        };

                        SiteNavigationRoot.prototype.addItem = function (parentNode, paths, state) {
                            if (paths && paths.length) {
                                var ident = paths[0];
                                var parts = paths.splice(1);
                                var node = this.stateCache[ident];
                                if (!node) {
                                    node = new SiteNode(ident, null);
                                    this.stateCache[ident] = node;
                                    parentNode.children.push(node);
                                }
                                if (!parts.length) {
                                    node.data = state;
                                } else {
                                    this.addItem(node, parts, state);
                                }
                            }
                        };
                        return SiteNavigationRoot;
                    })(SiteNode);
                    services.SiteNavigationRoot = SiteNavigationRoot;

                    var ExternalLinksRoot = (function (_super) {
                        __extends(ExternalLinksRoot, _super);
                        function ExternalLinksRoot(nodeName, appState) {
                            _super.call(this, nodeName, '[externals]');
                            this.appState = appState;
                            this.init();
                        }
                        ExternalLinksRoot.prototype.init = function () {
                            this.children = [];

                            /*
                            this.addGroup(this, 'Local Resources', [
                            window.location.protocol + '//' + window.location.host + '/',
                            window.location.protocol + '//' + window.location.host + '?/#/!test!/',
                            window.location.protocol + '//' + window.location.host + '?/#/!debug!/',
                            ]).expanded = false;
                            */
                            this.addGroup(this, 'Online Resources', [
                                {
                                    name: 'Wikipedia', url: 'https://www.wikipedia.org'
                                },
                                {
                                    name: 'Wolfram Alpha', url: 'https://www.wolframalpha.com/'
                                },
                                {
                                    name: 'Global Wind Maps', url: 'https://earth.nullschool.net/#current/wind/isobaric/1000hPa/orthographic=344.96,20.39,286'
                                },
                                {
                                    name: 'Disaster Info Map', url: 'http://hisz.rsoe.hu/alertmap/index2.php'
                                }
                            ]);
                            this.addGroup(this, 'Development Resources', [
                                {
                                    name: 'Javascript Fiddler', url: 'https://jsfiddle.net/'
                                },
                                {
                                    name: 'Microsoft.net Fiddler', url: 'https://dotnetfiddle.net/'
                                },
                                {
                                    name: 'Font Awesome', url: 'http://fontawesome.io/icons/'
                                },
                                {
                                    name: 'CSS3 Generator', url: 'https://css3generator.com/'
                                },
                                {
                                    name: 'Regular Expressions', url: 'https://regex101.com/'
                                }
                            ]).expanded = false;
                            /*
                            this.addGroup(this, 'Additional Resources', [
                            'http://www.databaseanswers.org/data_models/',
                            'http://brunoimbrizi.com/experiments/#/07',
                            'http://brunoimbrizi.com/experiments/#/03',
                            ]).expanded = false;
                            this.addGroup(this, 'Popular Websites', [
                            'https://www.google.com',
                            'https://www.facebook.com',
                            'https://www.twitter.com',
                            'https://www.reddit.com',
                            ]).expanded = false;
                            */
                        };

                        ExternalLinksRoot.prototype.addGroup = function (parent, name, urls) {
                            var _this = this;
                            var node = new SiteNode(name, urls);
                            if (urls) {
                                urls.forEach(function (info) {
                                    if (typeof info == 'string') {
                                        node.children.push(_this.createLink(info));
                                    } else {
                                        node.children.push(_this.createLink(info.url, info.name));
                                    }
                                });
                            }
                            if (parent) {
                                parent.children.push(node);
                            }
                            return node;
                        };

                        ExternalLinksRoot.prototype.createLink = function (url, label) {
                            var _this = this;
                            var node = new SiteNode(label || url, url);
                            if (node) {
                                node.onSelect = function (item) {
                                    if (_this.OnSelect) {
                                        _this.OnSelect(item);
                                    }
                                };

                                if (!label) {
                                    var hostname = $('<a href="' + node.data + '"></a>')[0].hostname;
                                    node.label = 'Loading: ' + hostname.replace('www.', '');
                                    $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(node.data) + '&callback=?', function (data) {
                                        var match = /\<title\>(.+)\<\/title\>/i.exec(data.contents);
                                        if (match && match.length > 1) {
                                            node.label = match[1];
                                        }
                                        if (_this.UpdateUI)
                                            _this.UpdateUI();
                                    });
                                }
                            }
                            return node;
                        };
                        return ExternalLinksRoot;
                    })(SiteNode);
                    services.ExternalLinksRoot = ExternalLinksRoot;
                })(common.services || (common.services = {}));
                var services = common.services;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../common/services/NavigationService.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (about) {
                (function (controllers) {
                    var ConnectedNode = (function (_super) {
                        __extends(ConnectedNode, _super);
                        function ConnectedNode(name, url) {
                            _super.call(this, name, url);
                            this.url = url;
                            this.classes = ['tree-item'];
                        }
                        ConnectedNode.prototype.detect = function () {
                            var _this = this;
                            try  {
                                this.status = 'Checking';
                                this.classes = ['tree-item', 'loading'];
                                $.ajax({
                                    url: this.url,
                                    type: 'HEAD',
                                    timeout: 1000,
                                    statusCode: {
                                        200: function (response) {
                                            ConnectedNode.UpdateUI(function () {
                                                _this.status = 'Online';
                                                _this.classes = ['tree-item', 'online'];
                                            });
                                        },
                                        400: function (response) {
                                            ConnectedNode.UpdateUI(function () {
                                                _this.status = 'Offline';
                                                _this.classes = ['tree-item', 'offline'];
                                            });
                                        },
                                        404: function (response) {
                                            ConnectedNode.UpdateUI(function () {
                                                _this.status = 'Not Found';
                                                _this.classes = ['tree-item', 'offline'];
                                            });
                                        },
                                        0: function (response) {
                                            ConnectedNode.UpdateUI(function () {
                                                _this.classes = ['tree-item', 'warning'];
                                                _this.status = 'Unknown';
                                            });
                                        }
                                    }
                                });
                            } catch (ex) {
                                ConnectedNode.UpdateUI(function () {
                                    _this.status = 'Failed';
                                    _this.classes = ['tree-item', 'offline'];
                                });
                            }
                        };
                        ConnectedNode.UpdateUI = function () {
                        };
                        return ConnectedNode;
                    })(proto.ng.modules.common.services.SiteNode);
                    controllers.ConnectedNode = ConnectedNode;

                    var ScriptNode = (function (_super) {
                        __extends(ScriptNode, _super);
                        function ScriptNode(name, url) {
                            _super.call(this, name, url);
                            this.url = url;
                        }
                        return ScriptNode;
                    })(ConnectedNode);
                    controllers.ScriptNode = ScriptNode;

                    var DomainNode = (function (_super) {
                        __extends(DomainNode, _super);
                        function DomainNode(domain) {
                            _super.call(this, domain, domain);
                            this.scripts = [];
                        }
                        DomainNode.prototype.refresh = function () {
                            if (this.children) {
                                this.children.forEach(function (child) {
                                    child.detect();
                                });
                            }
                            this.detect();
                        };
                        return DomainNode;
                    })(ConnectedNode);
                    controllers.DomainNode = DomainNode;

                    var AboutConnectionController = (function () {
                        function AboutConnectionController($scope, $location, appState, appInfo, navigation) {
                            this.$scope = $scope;
                            this.$location = $location;
                            this.appState = appState;
                            this.appInfo = appInfo;
                            this.navigation = navigation;
                            this.state = {
                                editMode: false,
                                location: undefined,
                                protocol: undefined,
                                requireHttps: false
                            };
                            this.domains = [];
                            this.links = {};
                            this.init();
                        }
                        AboutConnectionController.prototype.init = function () {
                            var _this = this;
                            ConnectedNode.UpdateUI = function (action) {
                                _this.appState.updateUI(action);
                            };

                            this.$scope.info = this.appInfo;

                            this.result = null;
                            this.status = null;
                            this.state = {
                                editMode: false,
                                location: this.$location.$$absUrl,
                                protocol: this.$location.$$protocol,
                                requireHttps: (this.$location.$$protocol == 'https')
                            };

                            this.localhost = this.links['localhost'] = this.createNode('localhost');
                            this.localhost.label = 'Local Web Resources';

                            this.getScripts();
                            this.detect();

                            this.domains.forEach(function (node) {
                                node.refresh();
                            });
                        };

                        AboutConnectionController.prototype.detect = function () {
                            var _this = this;
                            var target = this.state.location;
                            var started = Date.now();
                            this.result = null;
                            this.latency = null;
                            this.status = { code: 0, desc: '', style: 'label-default' };
                            $.ajax({
                                url: target,
                                type: 'HEAD',
                                timeout: 10000,
                                crossDomain: true,
                                /*
                                username: 'user',
                                password: 'pass',
                                xhrFields: {
                                withCredentials: true
                                }
                                */
                                beforeSend: function (xhr) {
                                    _this.appState.updateUI(function () {
                                        //this.status.code = xhr.status;
                                        _this.status.desc = 'sending';
                                        _this.status.style = 'label-info';
                                    });
                                },
                                success: function (data, textStatus, xhr) {
                                    _this.appState.updateUI(function () {
                                        _this.status.code = xhr.status;
                                        _this.status.desc = textStatus;
                                        _this.status.style = 'label-success';
                                        _this.result = {
                                            valid: true,
                                            info: data,
                                            sent: started,
                                            received: Date.now()
                                        };
                                    });
                                },
                                error: function (xhr, textStatus, error) {
                                    xhr.ex = error;
                                    _this.appState.updateUI(function () {
                                        _this.status.code = xhr.status;
                                        _this.status.desc = textStatus;
                                        _this.status.style = 'label-danger';
                                        _this.result = {
                                            valid: false,
                                            info: xhr,
                                            sent: started,
                                            error: xhr.statusText,
                                            received: Date.now()
                                        };
                                    });
                                },
                                complete: function (xhr, textStatus) {
                                    _this.appState.updateUI(function () {
                                        _this.status.code = xhr.status;
                                        _this.status.desc = textStatus;
                                    });
                                }
                            }).always(function (xhr) {
                                _this.appState.updateUI(function () {
                                    _this.latency = _this.getLatencyInfo();
                                });
                            });
                        };

                        AboutConnectionController.prototype.submitForm = function () {
                            this.state.editMode = false;
                            if (this.state.requireHttps) {
                                this.setProtocol('https');
                            } else {
                                this.detect();
                            }
                        };

                        AboutConnectionController.prototype.createNode = function (domain) {
                            var _this = this;
                            var node = new DomainNode(domain);
                            node.onSelect = function (itm) {
                                _this.nodeSelect(itm);
                            };
                            this.domains.push(node);
                            return node;
                        };

                        AboutConnectionController.prototype.nodeSelect = function (item) {
                            if (this.selected == item) {
                                item.expanded = !item.expanded;
                                return;
                            }
                            if (this.selected) {
                                this.selected.selected = false;
                            }
                            item.selected = true;
                            this.selected = item;

                            if (item.data) {
                                var url = item.data;
                                if (!/https?\:\/\//i.test(url)) {
                                    url = 'http://' + url;
                                }
                                this.state.location = url;
                                this.detect();
                            }
                        };

                        AboutConnectionController.prototype.addLink = function (source, path, type) {
                            var _this = this;
                            var linkElem = $('<a href="' + path + '"></a>')[0];
                            var hostname = linkElem.hostname;
                            var pathDesc = linkElem.pathname;
                            var hostNode = (hostname in this.links) ? this.links[hostname] : null;
                            if (!hostNode) {
                                hostNode = this.createNode(hostname);
                                this.links[hostname] = hostNode;
                            }
                            var scriptNode = new ScriptNode(pathDesc, linkElem.href);
                            scriptNode.onSelect = function (itm) {
                                _this.nodeSelect(itm);
                            };
                            hostNode.children.push(scriptNode);
                        };

                        AboutConnectionController.prototype.getScripts = function () {
                            var _this = this;
                            // Get header scripts
                            $(document.head).find('script[src]').each(function (i, elem) {
                                _this.addLink('head', $(elem).attr('src'), $(elem).attr('type') || 'text/javascript');
                            });
                            $(document.head).find('link[href]').each(function (i, elem) {
                                _this.addLink('head', $(elem).attr('href'), $(elem).attr('type') || 'css/stylesheet');
                            });

                            // Get body scripts
                            $(document.body).find('script[src]').each(function (i, elem) {
                                _this.addLink('body', $(elem).attr('src'), $(elem).attr('type') || 'text/javascript');
                            });
                            $(document.head).find('link[href]').each(function (i, elem) {
                                _this.addLink('body', $(elem).attr('href'), $(elem).attr('type') || 'css/stylesheet');
                            });
                        };

                        AboutConnectionController.prototype.getLatencyInfo = function () {
                            var cssNone = 'text-muted';
                            var cssHigh = 'text-success';
                            var cssMedium = 'text-warning';
                            var cssLow = 'text-danger';
                            var info = {
                                desc: '',
                                style: cssNone
                            };

                            if (!this.result) {
                                return info;
                            }

                            if (!this.result.valid) {
                                info.style = 'text-muted';
                                info.desc = 'Connection Failed';
                                return info;
                            }

                            var totalMs = this.result.received - this.result.sent;
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
                        };

                        AboutConnectionController.prototype.getStatusColor = function () {
                            var cssRes = this.getStatusIcon() + ' ';
                            if (!this.result) {
                                cssRes += 'busy';
                            } else if (this.result.valid) {
                                cssRes += 'success';
                            } else {
                                cssRes += 'error';
                            }
                            return cssRes;
                        };

                        AboutConnectionController.prototype.getStatusIcon = function (activeStyle) {
                            var cssRes = '';
                            if (!this.result) {
                                cssRes += 'glyphicon-refresh';
                            } else if (activeStyle && this.result.valid) {
                                cssRes += activeStyle;
                            } else {
                                cssRes += this.result.valid ? 'glyphicon-ok' : 'glyphicon-remove';
                            }
                            return cssRes;
                        };

                        AboutConnectionController.prototype.getProtocolStyle = function (protocol, activeStyle) {
                            var cssRes = '';
                            var isValid = this.state.location.indexOf(protocol + '://') == 0;
                            if (isValid) {
                                if (!this.result) {
                                    cssRes += 'btn-primary';
                                } else if (this.result.valid && activeStyle) {
                                    cssRes += activeStyle;
                                } else if (this.result) {
                                    cssRes += this.result.valid ? 'btn-success' : 'btn-danger';
                                }
                            }
                            return cssRes;
                        };

                        AboutConnectionController.prototype.setProtocol = function (protocol) {
                            var val = this.state.location;
                            var pos = val.indexOf('://');
                            if (pos > 0) {
                                val = protocol + val.substring(pos);
                            }
                            this.state.protocol = protocol;
                            this.state.location = val;
                            this.detect();
                        };
                        return AboutConnectionController;
                    })();
                    controllers.AboutConnectionController = AboutConnectionController;
                })(about.controllers || (about.controllers = {}));
                var controllers = about.controllers;
            })(modules.about || (modules.about = {}));
            var about = modules.about;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (about) {
                (function (controllers) {
                    var AboutInfoController = (function () {
                        function AboutInfoController($scope, appInfo) {
                            this.$scope = $scope;
                            this.appInfo = appInfo;
                            this.init();
                        }
                        AboutInfoController.prototype.init = function () {
                            this.$scope.info = this.appInfo;
                        };
                        return AboutInfoController;
                    })();
                    controllers.AboutInfoController = AboutInfoController;
                })(about.controllers || (about.controllers = {}));
                var controllers = about.controllers;
            })(modules.about || (modules.about = {}));
            var about = modules.about;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (providers) {
                    var AppInfoProvider = (function () {
                        function AppInfoProvider(appStateProvider) {
                            this.appStateProvider = appStateProvider;
                            this.appState = appStateProvider.appState;
                            this.appInfo = new proto.ng.modules.common.AppInfo(navigator.appCodeName, navigator.userAgent);
                            this.init();
                        }
                        AppInfoProvider.prototype.init = function () {
                            // Define the state
                            this.detectBrowserInfo();
                        };

                        AppInfoProvider.prototype.$get = function () {
                            return this.appInfo;
                        };

                        AppInfoProvider.prototype.refreshUI = function (action) {
                            this.appState.updateUI(action);
                        };

                        AppInfoProvider.prototype.detectBrowserInfo = function () {
                            var _this = this;
                            var info = this.appInfo;
                            try  {
                                // Get IE version (if defined)
                                if (!!window['ActiveXObject']) {
                                    info.versions.ie = 10;
                                }

                                // Sanitize codeName and userAgent
                                this.resolveUserAgent(info);
                                info.versions.jqry = typeof jQuery !== 'undefined' ? jQuery.fn.jquery : null;
                                info.versions.ng = typeof angular !== 'undefined' ? angular.version.full : null;
                                info.versions.nw = this.getVersionInfo('node-webkit');
                                info.versions.njs = this.getVersionInfo('node');
                                info.versions.v8 = this.getVersionInfo('v8');
                                info.versions.openssl = this.getVersionInfo('openssl');
                                info.versions.chromium = this.getVersionInfo('chromium');

                                // Check for CSS extensions
                                info.css.boostrap2 = this.selectorExists('hero-unit');
                                info.css.boostrap3 = this.selectorExists('jumbotron');

                                // Update location settings
                                angular.extend(info.about, {
                                    protocol: window.location.protocol,
                                    server: {
                                        url: window.location.href
                                    }
                                });

                                // Detect the operating system name
                                info.about.os.name = this.detectOSName();

                                // Check for jQuery
                                info.detects.jqry = typeof jQuery !== 'undefined';

                                // Check for general header and body scripts
                                var sources = [];
                                $("script").each(function (i, elem) {
                                    var src = $(elem).attr("src");
                                    if (src)
                                        sources.push(src);
                                });

                                // Fast check on known script names
                                this.checkScriptLoaded(sources, function (src) {
                                    return info.detects.less = info.detects.less || /(.*)(less.*js)(.*)/i.test(src);
                                });
                                this.checkScriptLoaded(sources, function (src) {
                                    return info.detects.bootstrap = info.detects.bootstrap || /(.*)(bootstrap)(.*)/i.test(src);
                                });
                                this.checkScriptLoaded(sources, function (src) {
                                    return info.detects.ngAnimate = info.detects.ngAnimate || /(.*)(angular\-animate)(.*)/i.test(src);
                                });
                                this.checkScriptLoaded(sources, function (src) {
                                    return info.detects.ngUiRouter = info.detects.ngUiRouter || /(.*)(angular\-ui\-router)(.*)/i.test(src);
                                });
                                this.checkScriptLoaded(sources, function (src) {
                                    return info.detects.ngUiUtils = info.detects.ngUiUtils || /(.*)(angular\-ui\-utils)(.*)/i.test(src);
                                });
                                this.checkScriptLoaded(sources, function (src) {
                                    return info.detects.ngUiBootstrap = info.detects.ngUiBootstrap || /(.*)(angular\-ui\-bootstrap)(.*)/i.test(src);
                                });

                                // Get the client browser details (build a url string)
                                var detectUrl = this.getDetectUrl();

                                // Send a loaded package to a server to detect more features
                                $.getScript(detectUrl).done(function (script, textStatus) {
                                    _this.refreshUI(function () {
                                        // Browser info and details loaded
                                        var browserInfo = new window.WhichBrowser();
                                        angular.extend(info.about, browserInfo);
                                    });
                                }).fail(function (jqxhr, settings, exception) {
                                    console.error(exception);
                                });

                                // Set browser name to IE (if defined)
                                if (navigator.appName == 'Microsoft Internet Explorer') {
                                    info.about.browser.name = 'Internet Explorer';
                                }

                                // Check if the browser supports web db's
                                var webDB = info.about.webdb = this.getWebDBInfo();
                                info.about.webdb.test();
                            } catch (ex) {
                                console.error(ex);
                            }

                            // Return the preliminary info
                            return info;
                        };

                        AppInfoProvider.prototype.detectOSName = function () {
                            var osName = 'Unknown OS';
                            var appVer = navigator.appVersion;
                            if (appVer) {
                                if (appVer.indexOf("Win") != -1)
                                    osName = 'Windows';
                                if (appVer.indexOf("Mac") != -1)
                                    osName = 'MacOS';
                                if (appVer.indexOf("X11") != -1)
                                    osName = 'UNIX';
                                if (appVer.indexOf("Linux") != -1)
                                    osName = 'Linux';
                                //if (appVer.indexOf("Apple") != -1) osName = 'Apple';
                            }
                            return osName;
                        };

                        AppInfoProvider.prototype.getWebDBInfo = function () {
                            var _this = this;
                            var webDB = {
                                db: null,
                                version: '1',
                                active: null,
                                used: undefined,
                                size: 5 * 1024 * 1024,
                                test: function (name, desc, dbVer, dbSize) {
                                    try  {
                                        // Try and open a web db
                                        webDB.db = openDatabase(name, webDB.version, desc, webDB.size);
                                        webDB.onSuccess(null, null);
                                    } catch (ex) {
                                        // Nope, something went wrong
                                        webDB.onError(null, null);
                                    }
                                },
                                onSuccess: function (tx, r) {
                                    if (tx) {
                                        if (r) {
                                            console.info(' - [ WebDB ] Result: ' + JSON.stringify(r));
                                        }
                                        if (tx) {
                                            console.info(' - [ WebDB ] Trans: ' + JSON.stringify(tx));
                                        }
                                    }
                                    _this.refreshUI(function () {
                                        webDB.active = true;
                                        webDB.used = JSON.stringify(webDB.db).length;
                                    });
                                },
                                onError: function (tx, e) {
                                    console.warn(' - [ WebDB ] Warning, not available: ' + e.message);
                                    _this.refreshUI(function () {
                                        webDB.active = false;
                                    });
                                }
                            };
                            return webDB;
                        };

                        AppInfoProvider.prototype.checkScriptLoaded = function (sources, filter) {
                            sources.forEach(function (src) {
                                filter(src);
                            });
                        };

                        AppInfoProvider.prototype.getDetectUrl = function () {
                            return (function () {
                                var p = [], w = window, d = document, e = 0, f = 0;
                                p.push('ua=' + encodeURIComponent(navigator.userAgent));
                                e |= w.ActiveXObject ? 1 : 0;
                                e |= w.opera ? 2 : 0;
                                e |= w.chrome ? 4 : 0;
                                e |= 'getBoxObjectFor' in d || 'mozInnerScreenX' in w ? 8 : 0;
                                e |= ('WebKitCSSMatrix' in w || 'WebKitPoint' in w || 'webkitStorageInfo' in w || 'webkitURL' in w) ? 16 : 0;
                                e |= (e & 16 && ({}.toString).toString().indexOf("\n") === -1) ? 32 : 0;
                                p.push('e=' + e);
                                f |= 'sandbox' in d.createElement('iframe') ? 1 : 0;
                                f |= 'WebSocket' in w ? 2 : 0;
                                f |= w.Worker ? 4 : 0;
                                f |= w.applicationCache ? 8 : 0;
                                f |= w.history && history.pushState ? 16 : 0;
                                f |= d.documentElement.webkitRequestFullScreen ? 32 : 0;
                                f |= 'FileReader' in w ? 64 : 0;
                                p.push('f=' + f);
                                p.push('r=' + Math.random().toString(36).substring(7));
                                p.push('w=' + screen.width);
                                p.push('h=' + screen.height);
                                var s = d.createElement('script');
                                return 'https://api.whichbrowser.net/rel/detect.js?' + p.join('&');
                            })();
                        };

                        AppInfoProvider.prototype.resolveUserAgent = function (info) {
                            var cn = info.codeName;
                            var ua = info.userAgent;
                            if (ua) {
                                // Remove start of string in UAgent upto CName or end of string if not found.
                                ua = ua.substring((ua + cn).toLowerCase().indexOf(cn.toLowerCase()));

                                // Remove CName from start of string. (Eg. '/5.0 (Windows; U...)
                                ua = ua.substring(cn.length);

                                while (ua.substring(0, 1) == " " || ua.substring(0, 1) == "/") {
                                    ua = ua.substring(1);
                                }

                                // Remove the end of the string from first characrer that is not a number or point etc.
                                var pointer = 0;
                                while ("0123456789.+-".indexOf((ua + "?").substring(pointer, pointer + 1)) >= 0) {
                                    pointer = pointer + 1;
                                }
                                ua = ua.substring(0, pointer);

                                if (!window.isNaN(ua)) {
                                    if (parseInt(ua) > 0) {
                                        info.versions.html = ua;
                                    }
                                    if (parseFloat(ua) >= 5) {
                                        info.versions.css = '3.x';
                                        info.versions.js = '5.x';
                                    }
                                }
                            }
                        };

                        AppInfoProvider.prototype.getVersionInfo = function (ident) {
                            try  {
                                if (typeof process !== 'undefined' && process.versions) {
                                    return process.versions[ident];
                                }
                            } catch (ex) {
                            }
                            return null;
                        };

                        AppInfoProvider.prototype.selectorExists = function (selector) {
                            return false;
                            //var ret = css($(selector));
                            //return ret;
                        };

                        AppInfoProvider.prototype.css = function (a) {
                            var sheets = document.styleSheets, o = [];
                            for (var i in sheets) {
                                var rules = sheets[i].rules || sheets[i].cssRules;
                                for (var r in rules) {
                                    if (a.is(rules[r].selectorText)) {
                                        o.push(rules[r].selectorText);
                                    }
                                }
                            }
                            return o;
                        };
                        return AppInfoProvider;
                    })();
                    providers.AppInfoProvider = AppInfoProvider;
                })(common.providers || (common.providers = {}));
                var providers = common.providers;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="../common/providers/AppInfoProvider.ts" />
angular.module('prototyped.about', [
    'prototyped.ng.runtime',
    'prototyped.ng.views',
    'prototyped.ng.styles'
]).config([
    'appStateProvider', function (appStateProvider) {
        // Define application state
        appStateProvider.when('/about', '/about/info').define('about', {
            url: '/about',
            priority: 1000,
            state: {
                url: '/about',
                abstract: true
            },
            menuitem: {
                label: 'About',
                state: 'about.info',
                icon: 'fa fa-info-circle'
            },
            cardview: {
                style: 'img-about',
                title: 'About this software',
                desc: 'Originally created for fast, rapid prototyping in AngularJS, quickly grew into something more...'
            },
            visible: function () {
                return appStateProvider.appConfig.options.showAboutPage;
            },
            children: []
        }).state('about.info', {
            url: '/info',
            views: {
                'left@': { templateUrl: 'modules/about/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/about/views/info.tpl.html',
                    controller: 'AboutInfoController'
                }
            }
        }).state('about.online', {
            url: '^/contact',
            views: {
                'left@': { templateUrl: 'modules/about/views/left.tpl.html' },
                'main@': { templateUrl: 'modules/about/views/contact.tpl.html' }
            }
        }).state('about.conection', {
            url: '/conection',
            views: {
                'left@': { templateUrl: 'modules/about/views/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/about/views/connections.tpl.html',
                    controller: 'AboutConnectionController',
                    controllerAs: 'connCtrl'
                }
            }
        });
    }]).controller('AboutInfoController', ['$scope', 'appInfo', proto.ng.modules.about.controllers.AboutInfoController]).controller('AboutConnectionController', ['$scope', '$location', 'appState', 'appInfo', 'navigationService', proto.ng.modules.about.controllers.AboutConnectionController]);
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                var AppConfig = (function () {
                    function AppConfig() {
                        this.modules = {};
                        this.options = new common.AppOptions();
                    }
                    return AppConfig;
                })();
                common.AppConfig = AppConfig;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (_ng) {
        (function (modules) {
            (function (common) {
                var AppInfo = (function () {
                    function AppInfo(codeName, userAgent) {
                        this.codeName = codeName;
                        this.userAgent = userAgent;
                        this.versions = {
                            ie: null,
                            html: null,
                            jqry: null,
                            css: null,
                            js: null,
                            ng: null,
                            nw: null,
                            njs: null,
                            v8: null,
                            openssl: null,
                            chromium: null
                        };
                        this.about = {
                            protocol: null,
                            browser: {},
                            server: {
                                url: null,
                                active: null
                            },
                            os: {},
                            hdd: { type: null }
                        };
                        this.detects = {
                            jqry: false,
                            less: false,
                            bootstrap: false,
                            ngAnimate: false,
                            ngUiRouter: false,
                            ngUiUtils: false,
                            ngUiBootstrap: false
                        };
                        this.css = {
                            boostrap2: null,
                            boostrap3: null
                        };
                    }
                    return AppInfo;
                })();
                common.AppInfo = AppInfo;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(_ng.modules || (_ng.modules = {}));
        var modules = _ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                var AppNode = (function () {
                    function AppNode() {
                        this.active = typeof require !== 'undefined';
                    }
                    Object.defineProperty(AppNode.prototype, "gui", {
                        get: function () {
                            return this.active ? this.ui() : null;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(AppNode.prototype, "window", {
                        get: function () {
                            return this.active ? this.win() : null;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    AppNode.prototype.ui = function () {
                        if (this.active) {
                            return require('nw.gui');
                        }
                        return null;
                    };

                    AppNode.prototype.win = function () {
                        if (this.gui) {
                            var win = this.gui.Window.get();
                            return win;
                        }
                        return null;
                    };

                    AppNode.prototype.reload = function () {
                        var win = this.window;
                        if (win) {
                            win.reloadIgnoringCache();
                        }
                    };

                    AppNode.prototype.close = function () {
                        var win = this.window;
                        if (win) {
                            win.close();
                        }
                    };

                    AppNode.prototype.debug = function () {
                        var win = this.window;
                        if (win.isDevToolsOpen()) {
                            win.closeDevTools();
                        } else {
                            win.showDevTools();
                        }
                    };

                    AppNode.prototype.toggleFullscreen = function () {
                        var win = this.window;
                        if (win) {
                            win.toggleFullscreen();
                        }
                    };

                    AppNode.prototype.kiosMode = function () {
                        var win = this.window;
                        if (win) {
                            win.toggleKioskMode();
                        }
                    };
                    return AppNode;
                })();
                common.AppNode = AppNode;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                var AppOptions = (function () {
                    function AppOptions() {
                        this.showAboutPage = true;
                        this.showDefaultItems = true;
                    }
                    return AppOptions;
                })();
                common.AppOptions = AppOptions;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (providers) {
                    var AppNodeProvider = (function () {
                        function AppNodeProvider() {
                            this.appNode = new common.AppNode();
                        }
                        AppNodeProvider.prototype.$get = function () {
                            return this.appNode;
                        };
                        return AppNodeProvider;
                    })();
                    providers.AppNodeProvider = AppNodeProvider;
                })(common.providers || (common.providers = {}));
                var providers = common.providers;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="providers/AppNodeProvider.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                var AppState = (function () {
                    function AppState($stateProvider, appNodeProvider, appConfig) {
                        this.$stateProvider = $stateProvider;
                        this.appNodeProvider = appNodeProvider;
                        this.appConfig = appConfig;
                        this.logs = [];
                        this.html5 = true;
                        this.title = appConfig.title || 'Prototyped';
                        this.version = appConfig.version || '1.0.0';
                        this.node = appNodeProvider.$get();
                        this.routers = [];
                        this.current = {
                            state: null
                        };
                    }
                    Object.defineProperty(AppState.prototype, "config", {
                        /*
                        public show: {
                        all: true,
                        log: false,
                        info: true,
                        warn: true,
                        error: true,
                        debug: false,
                        },
                        */
                        get: function () {
                            return this.appConfig;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    Object.defineProperty(AppState.prototype, "state", {
                        get: function () {
                            return this._state;
                        },
                        set: function (val) {
                            this._state = val;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    AppState.prototype.getIcon = function () {
                        var icon = (this.node.active) ? 'fa fa-desktop' : 'fa fa-cube';
                        var match = /\/!(\w+)!/i.exec(this.proxy || '');
                        if (match && match.length > 1) {
                            switch (match[1]) {
                                case 'test':
                                    return 'fa fa-flask glow-blue animate-glow';
                                case 'debug':
                                    return 'fa fa-bug glow-orange animate-glow';
                            }
                        }

                        if (this.current && this.current.state) {
                            var currentState = this.current.state.name;
                            this.routers.forEach(function (itm, i) {
                                if (itm.menuitem && itm.menuitem.state == currentState) {
                                    icon = itm.menuitem.icon;
                                }
                            });
                        }
                        return icon;
                    };

                    AppState.prototype.getColor = function () {
                        var logs = this.logs;
                        if (logs.some(function (val, i, array) {
                            return val.type == 'error';
                        })) {
                            return 'glow-red';
                        }
                        if (logs.some(function (val, i, array) {
                            return val.type == 'warn';
                        })) {
                            return 'glow-orange';
                        }
                        if (logs.some(function (val, i, array) {
                            return val.type == 'info';
                        })) {
                            return 'glow-blue';
                        }
                        if (this.node.active) {
                            return 'glow-green';
                        }
                        return '';
                    };

                    AppState.prototype.navigate = function (route) {
                        var hasState = route.name && route.state;
                        if (hasState && route.menuitem && route.menuitem.state) {
                            this.state.go(route.menuitem.state);
                        } else if (hasState && !route.state.abstract) {
                            this.state.go(route.name);
                        } else if (route.url) {
                            window.location.href = route.url;
                        }
                    };

                    AppState.prototype.updateUI = function (action) {
                        if (this._updateUI) {
                            this._updateUI(action);
                        } else {
                            try  {
                                if (action)
                                    action();
                            } catch (ex) {
                                throw ex;
                            }
                        }
                    };
                    AppState.prototype.setUpdateAction = function (eventWrapper) {
                        this._updateUI = eventWrapper;
                    };

                    AppState.prototype.proxyAvailable = function (ident) {
                        var loc = window.location;
                        if (loc.pathname == '/' && !loc.hash)
                            return false;
                        switch (ident) {
                            case 'debug':
                                return true;
                            case 'test':
                                return true;
                            default:
                                false;
                        }
                    };

                    AppState.prototype.proxyActive = function (ident) {
                        return this.proxy == '/!' + ident + '!';
                    };
                    AppState.prototype.setProxy = function (ident) {
                        var loc = window.location;
                        var match = /#\/!\w+!\//i.exec(loc.hash);
                        if (match) {
                            var sep = loc.href.indexOf('?') < 0 ? '?' : '';
                            var url = loc.protocol + '//' + loc.host + sep + '/#/!' + ident + '!' + (loc.pathname || '/') + loc.hash.substring(match[0].length);
                            console.log(' - Change Proxy: ', url);
                            window.location.href = url;
                        } else {
                            var url = loc.protocol + '//' + loc.host + '/#/!' + ident + '!' + (loc.pathname || '/');
                            console.log(' - Set Proxy: ', url);
                            window.location.href = url;
                        }
                    };

                    AppState.prototype.cancelProxy = function () {
                        var loc = window.location;
                        var match = /#\/!\w+!\//i.exec(loc.hash);
                        if (match) {
                            var url = loc.protocol + '//' + loc.host + (loc.pathname || '/') + loc.hash.substring(match[0].length);
                            console.log(' - Cancel Proxy: ', url);
                            window.location.href = url;
                        }
                    };
                    return AppState;
                })();
                common.AppState = AppState;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (controllers) {
                    var CardViewController = (function () {
                        function CardViewController(appState) {
                            this.appState = appState;
                            this._index = 0;
                        }
                        Object.defineProperty(CardViewController.prototype, "pages", {
                            get: function () {
                                return this.appState.routers;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        CardViewController.prototype.count = function () {
                            return this.pages.length;
                        };

                        CardViewController.prototype.isActive = function (index) {
                            return this._index === index;
                        };

                        CardViewController.prototype.showPrev = function () {
                            this._index = (this._index > 0) ? --this._index : this.count() - 1;
                        };

                        CardViewController.prototype.showNext = function () {
                            this._index = (this._index < this.count() - 1) ? ++this._index : 0;
                        };

                        CardViewController.prototype.showItem = function (index) {
                            this._index = index;
                        };
                        return CardViewController;
                    })();
                    controllers.CardViewController = CardViewController;
                })(common.controllers || (common.controllers = {}));
                var controllers = common.controllers;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../../imports.d.ts" />
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function AppCleanDirective($window, $route, $state, appState) {
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
                                    if (appState.node.active) {
                                        console.debug(' - Reload Node Webkit...');
                                        appState.node.reload();
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
                                appState.logs = [];
                                console.clear();
                            });
                            scope.$on('$destroy', function () {
                                $(elem).off('click');
                                keyEvent.off('keyup keydown');
                            });
                        };
                    }
                    directives.AppCleanDirective = AppCleanDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function AppCloseDirective(appNode) {
                        return function (scope, elem, attrs) {
                            // Only enable the button in a NodeJS context (extended functionality)
                            $(elem).css('display', appNode.active ? '' : 'none');
                            $(elem).click(function () {
                                appNode.close();
                            });
                        };
                    }
                    directives.AppCloseDirective = AppCloseDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function AppDebugDirective(appNode) {
                        return function (scope, elem, attrs) {
                            // Only enable the button in a NodeJS context (extended functionality)
                            $(elem).css('display', appNode.active ? '' : 'none');
                            $(elem).click(function () {
                                appNode.debug();
                            });
                        };
                    }
                    directives.AppDebugDirective = AppDebugDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function AppFullScreenDirective(appNode) {
                        return function (scope, elem, attrs) {
                            // Only enable the button in a NodeJS context (extended functionality)
                            $(elem).css('display', appNode.active ? '' : 'none');
                            $(elem).click(function () {
                                appNode.toggleFullscreen();
                            });
                        };
                    }
                    directives.AppFullScreenDirective = AppFullScreenDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function AppKioskDirective(appNode) {
                        return function (scope, elem, attrs) {
                            // Only enable the button in a NodeJS context (extended functionality)
                            $(elem).css('display', appNode.active ? '' : 'none');
                            $(elem).click(function () {
                                appNode.kiosMode();
                            });
                        };
                    }
                    directives.AppKioskDirective = AppKioskDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function AppVersionDirective(appState) {
                        function getVersionInfo(ident) {
                            try  {
                                if (typeof process !== 'undefined' && process.versions) {
                                    return process.versions[ident];
                                }
                            } catch (ex) {
                            }
                            return null;
                        }

                        return function (scope, elm, attrs) {
                            var targ = attrs['appVersion'];
                            var val = null;
                            if (!targ) {
                                val = appState.version;
                            } else
                                switch (targ) {
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

                                        break;
                                }
                            if (!val && attrs['defaultText']) {
                                val = attrs['defaultText'];
                            }
                            if (val) {
                                $(elm).text(val);
                            }
                        };
                    }
                    directives.AppVersionDirective = AppVersionDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function DomReplaceDirective() {
                        return {
                            restrict: 'A',
                            require: 'ngInclude',
                            link: function (scope, el, attrs) {
                                el.replaceWith(el.children());
                            }
                        };
                    }
                    directives.DomReplaceDirective = DomReplaceDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function EatClickIfDirective($parse, $rootScope) {
                        return {
                            priority: 100,
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
                                    post: function () {
                                    }
                                };
                            }
                        };
                    }
                    directives.EatClickIfDirective = EatClickIfDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function ResxImportDirective($templateCache, $document) {
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
                                    pre: function (scope, element) {
                                    },
                                    post: function (scope, element) {
                                    }
                                };
                            }
                        };
                    }
                    directives.ResxImportDirective = ResxImportDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function ResxIncludeDirective($templateCache) {
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
                                    pre: function (scope, element) {
                                    },
                                    post: function (scope, element) {
                                    }
                                };
                            }
                        };
                    }
                    directives.ResxIncludeDirective = ResxIncludeDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function ToHtmlDirective($sce, $filter) {
                        function getHtml(obj) {
                            try  {
                                return 'toHtml:\'pre\' - ' + $filter('toXml')(obj, 'pre');
                            } catch (ex) {
                                return 'toHtml:error - ' + ex.message;
                            }
                        }
                        return {
                            restrict: 'EA',
                            scope: {
                                toHtml: '&'
                            },
                            transclude: false,
                            controller: function ($scope, $sce) {
                                var val = $scope.toHtml();
                                var html = getHtml(val);
                                $scope.myHtml = $sce.trustAsHtml(html);
                            },
                            template: '<div ng-bind-html="myHtml"></div>'
                        };
                    }
                    directives.ToHtmlDirective = ToHtmlDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (directives) {
                    function TreeViewDirective($timeout) {
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
                    }
                    directives.TreeViewDirective = TreeViewDirective;
                })(common.directives || (common.directives = {}));
                var directives = common.directives;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function FromNowFilter($filter) {
                        return function (dateString, format) {
                            try  {
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
                    }
                    filters.FromNowFilter = FromNowFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function InterpolateFilter(appState) {
                        return function (text) {
                            return String(text).replace(/\%VERSION\%/mg, appState.version);
                        };
                    }
                    filters.InterpolateFilter = InterpolateFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function IsArrayFilter() {
                        return function (input) {
                            return angular.isArray(input);
                        };
                    }
                    filters.IsArrayFilter = IsArrayFilter;

                    function IsNotArrayFilter() {
                        return function (input) {
                            return angular.isArray(input);
                        };
                    }
                    filters.IsNotArrayFilter = IsNotArrayFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function ListReverseFilter() {
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
                    }
                    filters.ListReverseFilter = ListReverseFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function ParseBytesFilter() {
                        return function (bytesDesc, precision) {
                            var match = /(\d+) (\w+)/i.exec(bytesDesc);
                            if (match && (match.length > 2)) {
                                var bytes = match[1];
                                var floatVal = parseFloat(bytes);
                                if (isNaN(floatVal) || !isFinite(floatVal))
                                    return '[?]';
                                if (typeof precision === 'undefined')
                                    precision = 1;
                                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
                                var number = Math.floor(Math.log(floatVal) / Math.log(1024));
                                var pow = -1;
                                units.forEach(function (itm, i) {
                                    if (itm && itm.toLowerCase().indexOf(match[2].toLowerCase()) >= 0)
                                        pow = i;
                                });
                                if (pow > 0) {
                                    var ret = (floatVal * Math.pow(1024, pow)).toFixed(precision);
                                    return ret;
                                }
                            }
                            return bytesDesc;
                        };
                    }
                    filters.ParseBytesFilter = ParseBytesFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function ToByteFilter() {
                        return function (bytes, precision) {
                            if (isNaN(parseFloat(bytes)) || !isFinite(bytes))
                                return '-';
                            if (typeof precision === 'undefined')
                                precision = 1;
                            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
                            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
                        };
                    }
                    filters.ToByteFilter = ToByteFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function ToXmlFilter($parse, $rootScope) {
                        function toXmlString(name, input, expanded, childExpanded) {
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
                        };
                    }
                    filters.ToXmlFilter = ToXmlFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function TrustedUrlFilter($sce) {
                        return function (url) {
                            return $sce.trustAsResourceUrl(url);
                        };
                    }
                    filters.TrustedUrlFilter = TrustedUrlFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (filters) {
                    function TypeCountFilter() {
                        return function (input, type) {
                            var count = 0;
                            if (!input)
                                return null;
                            if (input.length > 0) {
                                input.forEach(function (itm) {
                                    if (!itm)
                                        return;
                                    if (!itm.type)
                                        return;
                                    if (itm.type == type)
                                        count++;
                                });
                            }
                            return count;
                        };
                    }
                    filters.TypeCountFilter = TypeCountFilter;
                })(common.filters || (common.filters = {}));
                var filters = common.filters;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (providers) {
                    var AppConfigLoader = (function () {
                        function AppConfigLoader() {
                        }
                        AppConfigLoader.prototype.init = function (opts) {
                            var configUrl = opts.path;
                            var ngTargetApp = opts.name;
                            var elem = opts.elem || document.body;
                            var cfgModule = angular.module('prototyped.ng.config');
                            var oldConfig = angular.injector(['prototyped.ng.config']).get('appConfig');
                            if (opts.opts) {
                                angular.extend(oldConfig.options, opts.opts);
                            }
                            if (configUrl) {
                                var $http = angular.injector(['ng']).get('$http');
                                $http({
                                    method: 'GET',
                                    url: configUrl
                                }).success(function (data, status, headers, config) {
                                    console.debug('Configuring ' + ngTargetApp + '...');
                                    angular.extend(oldConfig, {
                                        version: data.version || oldConfig.version
                                    });
                                    cfgModule.constant('appConfig', oldConfig);
                                    angular.bootstrap(elem, [ngTargetApp]);
                                }).error(function (ex) {
                                    console.debug('Starting ' + ngTargetApp + ' with default config.');
                                    angular.bootstrap(elem, [ngTargetApp]);
                                });
                            } else {
                                console.debug('Starting app ' + ngTargetApp + '...');
                                angular.bootstrap(elem, [ngTargetApp]);
                            }
                            return this;
                        };
                        return AppConfigLoader;
                    })();
                    providers.AppConfigLoader = AppConfigLoader;

                    var AppConfigProvider = (function () {
                        function AppConfigProvider(appConfig) {
                            this.appConfig = appConfig;
                        }
                        Object.defineProperty(AppConfigProvider.prototype, "current", {
                            get: function () {
                                return this.appConfig;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        AppConfigProvider.prototype.$get = function () {
                            return this.appConfig;
                        };

                        AppConfigProvider.prototype.config = function (ident, options) {
                            var target = (ident in this.current) ? this.current[ident] : {};
                            angular.extend(target, options);
                            this.current[ident] = target;
                            return this;
                        };

                        AppConfigProvider.prototype.getPersisted = function (cname) {
                            var name = cname + '=';
                            var ca = document.cookie.split(';');
                            for (var i = 0; i < ca.length; i++) {
                                var c = ca[i];
                                while (c.charAt(0) == ' ')
                                    c = c.substring(1);
                                if (c.indexOf(name) == 0)
                                    return c.substring(name.length, c.length);
                            }
                            return '';
                        };

                        AppConfigProvider.prototype.setPersisted = function (cname, cvalue, exdays) {
                            var d = new Date();
                            d.setTime(d.getTime() + ((exdays || 7) * 24 * 60 * 60 * 1000));
                            var expires = "expires=" + d.toUTCString();
                            document.cookie = cname + "=" + cvalue + "; " + expires;
                        };
                        return AppConfigProvider;
                    })();
                    providers.AppConfigProvider = AppConfigProvider;
                })(common.providers || (common.providers = {}));
                var providers = common.providers;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (common) {
                (function (providers) {
                    var AppStateProvider = (function () {
                        function AppStateProvider($stateProvider, $locationProvider, $urlRouterProvider, appConfigProvider, appNodeProvider) {
                            this.$stateProvider = $stateProvider;
                            this.$locationProvider = $locationProvider;
                            this.$urlRouterProvider = $urlRouterProvider;
                            this.appConfigProvider = appConfigProvider;
                            this.appNodeProvider = appNodeProvider;
                            var appConfig = appConfigProvider.$get();
                            this.appState = new common.AppState($stateProvider, appNodeProvider, appConfig);
                            this.init();
                        }
                        Object.defineProperty(AppStateProvider.prototype, "appConfig", {
                            get: function () {
                                return this.appConfigProvider.current;
                            },
                            enumerable: true,
                            configurable: true
                        });

                        AppStateProvider.prototype.init = function () {
                            var _this = this;
                            this.appState.debug = false;
                            try  {
                                // Try and figure out router mode from the initial url
                                var pageLocation = typeof window !== 'undefined' ? window.location.href : '';
                                if (pageLocation.indexOf('#') >= 0) {
                                    var routePrefix = '';
                                    var routeProxies = [
                                        '/!test!',
                                        '/!debug!'
                                    ];

                                    // Check for specific routing prefixes
                                    routeProxies.forEach(function (name) {
                                        if (pageLocation.indexOf('#' + name) >= 0) {
                                            routePrefix = name;
                                            return;
                                        }
                                    });

                                    // Override the default behaviour (only if required)
                                    if (routePrefix) {
                                        this.$locationProvider.hashPrefix(routePrefix);
                                    }

                                    this.appState.proxy = routePrefix;
                                    this.appState.html5 = !routePrefix;
                                    this.appState.debug = /debug/i.test(routePrefix);

                                    $(document.body).toggleClass('debug', this.appState.debug);
                                    $(document.body).toggleClass('tests', /test/i.test(routePrefix));

                                    // Show a hint message to the  user
                                    var proxyName = this.appState.proxy;
                                    if (proxyName) {
                                        var checkName = /\/!(\w+)!/.exec(proxyName);
                                        if (checkName)
                                            proxyName = checkName[1];

                                        console.debug(' - Proxy Active: ' + proxyName);

                                        var css = 'alert alert-info';
                                        switch (proxyName) {
                                            case 'debug':
                                                css = 'alert alert-warning';
                                                break;
                                            case 'test':
                                                css = 'alert alert-info';
                                                break;
                                        }

                                        var div = $('<div draggable="true" class="top-hint"></div>');
                                        if (div) {
                                            var text = $('<span>Note: Proxy router <b>' + proxyName + '</b> is active.</span>');
                                            var icon = $('<i class="' + this.appState.getIcon() + '" style="margin-right:4px;"></i>');
                                            var link = $('<a href="" class="pull-right glyphicon glyphicon-remove" style="text-decoration: none; padding: 3px;"></a>');
                                            var span = $('<span class="tab non-dragable ' + css + '"></span>');
                                            link.click(function () {
                                                _this.appState.cancelProxy();
                                            });
                                            span.append(link);
                                            span.append(icon);
                                            span.append(text);
                                            div.append(span);
                                        }
                                        if (div.draggable) {
                                            div.draggable({ axis: "x" });
                                        }
                                        $(document.body).append(div);
                                    }
                                }

                                // Configure the pretty urls for HTML5 mode
                                this.$locationProvider.html5Mode(this.appState.html5);
                            } catch (ex) {
                                throw ex;
                            }
                        };

                        AppStateProvider.prototype.$get = function () {
                            return this.appState;
                        };

                        AppStateProvider.prototype.when = function (srcUrl, dstUrl) {
                            this.$urlRouterProvider.when(srcUrl, dstUrl);
                            return this;
                        };

                        AppStateProvider.prototype.otherwise = function (dstUrl) {
                            this.$urlRouterProvider.otherwise(dstUrl);
                            return this;
                        };

                        AppStateProvider.prototype.config = function (ident, options) {
                            this.appConfigProvider.config(ident, options);
                            return this;
                        };

                        AppStateProvider.prototype.state = function (ident, options) {
                            this.$stateProvider.state(ident, options);
                            return this;
                        };

                        AppStateProvider.prototype.define = function (name, value) {
                            this.appState.routers.push(value);
                            if (!value.name)
                                value.name = name;
                            if (value.state && value.name) {
                                this.state(name, value.state);
                            }
                            return this;
                        };
                        return AppStateProvider;
                    })();
                    providers.AppStateProvider = AppStateProvider;
                })(common.providers || (common.providers = {}));
                var providers = common.providers;
            })(modules.common || (modules.common = {}));
            var common = modules.common;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../imports.d.ts" />
// Constant object with default values
angular.module('prototyped.ng.config', []).constant('appDefaultConfig', new proto.ng.modules.common.AppConfig()).constant('appConfigLoader', new proto.ng.modules.common.providers.AppConfigLoader()).provider('appConfig', ['appDefaultConfig', proto.ng.modules.common.providers.AppConfigProvider]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (commands) {
                var ConsoleController = (function () {
                    function ConsoleController($scope, $log) {
                        this.$scope = $scope;
                        this.$log = $log;
                        this._proxyList = [];
                        try  {
                            // Set the scope vars
                            $scope.myConsole = this;
                            $scope.lines = [];

                            // Create the list proxies
                            this._currentProxy = new BrowserConsole();
                            this._proxyList.push(this._currentProxy);

                            // Get the required libraries
                            if (typeof require !== 'undefined') {
                                var proc = require('child_process');
                                if (!$.isEmptyObject(proc)) {
                                    this._currentProxy = new ProcessConsole(proc);
                                    this._proxyList.push(this._currentProxy);
                                }
                            }
                        } catch (ex) {
                            // Could not load required libraries
                            console.error(' - Warning: Console app failed to load required libraries.');
                        } finally {
                            // Initialise the controller
                            this.init();
                        }
                    }
                    ConsoleController.prototype.init = function () {
                        try  {
                            // Check the command line status and give user some feedback
                            if (this._currentProxy) {
                                this.success('Command line ready and active.');
                            } else {
                                this.warning('Cannot access the command line from the browser.');
                            }
                        } catch (ex) {
                            console.error(ex);
                        }
                    };

                    ConsoleController.prototype.clear = function () {
                        // Clear cache
                        this.$scope.lines = [];

                        // Clear via proxy
                        if (this._currentProxy) {
                            this._currentProxy.clear();
                        }
                    };

                    ConsoleController.prototype.getProxyName = function () {
                        return (this._currentProxy) ? this._currentProxy.ProxyName : '';
                    };
                    ConsoleController.prototype.getProxies = function () {
                        return this._proxyList;
                    };
                    ConsoleController.prototype.setProxy = function (name) {
                        console.info(' - Switching Proxy: ' + name);
                        for (var i = 0; i < this._proxyList.length; i++) {
                            var itm = this._proxyList[i];
                            if (itm.ProxyName == name) {
                                this._currentProxy = itm;
                                break;
                            }
                        }

                        // Refresh UI if needed
                        if (!this.$scope.$$phase)
                            this.$scope.$apply();

                        return this._currentProxy;
                    };

                    ConsoleController.prototype.command = function (text) {
                        var _this = this;
                        // Try and run the command
                        this.info('' + text);
                        this.$scope.txtInput = '';

                        // Check if proxy exists
                        if (this._currentProxy) {
                            // Check for 'clear screen' command
                            if (text == 'cls')
                                return this.clear();

                            // Run the command via proxy
                            this._currentProxy.command(text, function (msg, tp) {
                                switch (tp) {
                                    case 'debug':
                                        _this.debug(msg);
                                        break;
                                    case 'info':
                                        _this.info(msg);
                                        break;
                                    case 'warn':
                                        _this.warning(msg);
                                        break;
                                    case 'succcess':
                                        _this.success(msg);
                                        break;
                                    case 'error':
                                        _this.error(msg);
                                        break;
                                    default:
                                        _this.debug(msg);
                                        break;
                                }

                                // Refresh UI if needed
                                if (!_this.$scope.$$phase)
                                    _this.$scope.$apply();
                            });
                        } else {
                            this.error('Command line is not available...');
                        }
                    };

                    ConsoleController.prototype.debug = function (msg) {
                        this.$scope.lines.push({
                            time: Date.now(),
                            text: msg,
                            type: 'debug'
                        });
                    };

                    ConsoleController.prototype.info = function (msg) {
                        this.$log.info(msg);
                        this.$scope.lines.push({
                            time: Date.now(),
                            text: msg,
                            type: 'info'
                        });
                    };

                    ConsoleController.prototype.warning = function (msg) {
                        this.$log.warn(msg);
                        this.$scope.lines.push({
                            time: Date.now(),
                            text: msg,
                            type: 'warning'
                        });
                    };

                    ConsoleController.prototype.success = function (msg) {
                        this.$log.info(msg);
                        this.$scope.lines.push({
                            time: Date.now(),
                            text: msg,
                            type: 'success'
                        });
                    };

                    ConsoleController.prototype.error = function (msg) {
                        this.$log.error(msg);
                        this.$scope.lines.push({
                            time: Date.now(),
                            text: msg,
                            type: 'error'
                        });
                    };
                    return ConsoleController;
                })();
                commands.ConsoleController = ConsoleController;

                var BrowserConsole = (function () {
                    function BrowserConsole() {
                        this.ProxyName = 'Browser';
                    }
                    BrowserConsole.prototype.command = function (text, callback) {
                        try  {
                            var result = eval(text);
                            if (callback && result) {
                                callback(result, 'info');
                            }
                            console.info(result);
                        } catch (ex) {
                            callback(ex, 'error');
                            console.error(ex);
                        }
                    };

                    BrowserConsole.prototype.clear = function () {
                        console.clear();
                    };
                    BrowserConsole.prototype.debug = function (msg) {
                        console.debug(msg);
                    };
                    BrowserConsole.prototype.info = function (msg) {
                        console.info(msg);
                    };
                    BrowserConsole.prototype.warning = function (msg) {
                        console.warn(msg);
                    };
                    BrowserConsole.prototype.success = function (msg) {
                        console.info(msg);
                    };
                    BrowserConsole.prototype.error = function (msg) {
                        console.error(msg);
                    };
                    return BrowserConsole;
                })();
                commands.BrowserConsole = BrowserConsole;

                var ProcessConsole = (function () {
                    function ProcessConsole(_proc) {
                        this._proc = _proc;
                        this.ProxyName = 'System';
                    }
                    ProcessConsole.prototype.clear = function () {
                    };

                    ProcessConsole.prototype.command = function (text, callback) {
                        // Call the command line from a child process
                        var proc = eval('process');
                        var ls = this._proc.exec(text, function (error, stdout, stderr) {
                            if (error) {
                                console.groupCollapsed('Command Error: ' + text);
                                console.error(error.stack);
                                console.info(' - Signal received: ' + error.signal);
                                console.info(' - Error code: ' + error.code);
                                console.groupEnd();
                            }
                            if (stdout) {
                                callback('' + stdout, 'info');
                            }
                            if (stderr) {
                                callback('' + stderr, 'error');
                            }
                        }).on('exit', function (code) {
                            //callback(' - Process returned: ' + code, 'debug');
                        });
                    };
                    return ProcessConsole;
                })();
                commands.ProcessConsole = ProcessConsole;
            })(modules.commands || (modules.commands = {}));
            var commands = modules.commands;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/ConsoleController.ts"/>
angular.module('prototyped.console', []).config([
    'appStateProvider', function (appStateProvider) {
        // Define module state
        appStateProvider.state('proto.console', {
            url: '^/console',
            views: {
                'main@': {
                    templateUrl: 'modules/console/views/main.tpl.html',
                    controller: 'proto.ng.modules.commands.ConsoleController'
                }
            }
        }).state('proto.logs', {
            url: '/logs',
            views: {
                //'left@': { templateUrl: 'views/common/components/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/console/views/logs.tpl.html'
                }
            }
        });
    }]).controller('proto.ng.modules.commands.ConsoleController', [
    '$scope',
    '$log',
    proto.ng.modules.commands.ConsoleController
]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (editor) {
                var EditorController = (function () {
                    function EditorController($scope, $timeout) {
                        this.$scope = $scope;
                        this.$timeout = $timeout;
                        this.isActive = false;
                        this.FileLocation = '';
                        this.LastChanged = null;
                        this.LastOnSaved = null;
                        this.$scope.myWriter = this;
                        try  {
                            // Load file system
                            this._path = require('path');
                            this._fs = require('fs');

                            // Try  and load the node webkit
                            var nwGui = 'nw.gui';
                            this._gui = require(nwGui);
                        } catch (ex) {
                            console.warn(' - [ Editor ] Warning: Could not load all required modules');
                        }
                    }
                    Object.defineProperty(EditorController.prototype, "FileContents", {
                        get: function () {
                            return this._buffer;
                        },
                        set: function (buffer) {
                            this._buffer = buffer;
                            this.LastChanged = Date.now();
                        },
                        enumerable: true,
                        configurable: true
                    });

                    Object.defineProperty(EditorController.prototype, "HasChanges", {
                        get: function () {
                            return this.LastChanged != null && this.LastChanged > this.LastOnSaved;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(EditorController.prototype, "HasFileSys", {
                        get: function () {
                            return !$.isEmptyObject(this._gui);
                        },
                        enumerable: true,
                        configurable: true
                    });

                    EditorController.prototype.init = function () {
                        this.isActive = true;
                    };

                    EditorController.prototype.openFile = function () {
                        var _this = this;
                        if (this.checkUnsaved())
                            return;

                        if (!$.isEmptyObject(this._gui) && !$.isEmptyObject(this._fs)) {
                            var chooser = $('#fileDialog');
                            chooser.change(function (evt) {
                                var filePath = chooser.val();
                                if (filePath) {
                                    // Try and read the file
                                    _this._fs.readFile(filePath, 'UTF-8', function (err, data) {
                                        if (err) {
                                            throw new Error(err);
                                        } else {
                                            _this.setText(data);
                                            _this.FileLocation = filePath;
                                            _this.LastChanged = null;
                                            _this.LastOnSaved = null;
                                        }
                                        _this.$scope.$apply();
                                    });
                                }
                            });
                            chooser.trigger('click');
                        } else {
                            console.warn(' - [ Editor ] Warning: Shell not available.');
                        }
                    };

                    EditorController.prototype.openFileLocation = function () {
                        if (this._gui) {
                            this._gui.Shell.openItem(this.FileLocation);
                        } else {
                            console.warn(' - [ Editor ] Warning: Shell not available.');
                        }
                    };

                    EditorController.prototype.newFile = function () {
                        if (this.checkUnsaved())
                            return;

                        // Clear prev. states
                        this.FileLocation = null;
                        this.LastChanged = null;
                        this.LastOnSaved = null;

                        // Set some intial text
                        this.setText('Enter some text');
                        this.LastChanged = Date.now();

                        // Do post-new operations
                        this.$timeout(function () {
                            // Select file contents
                            var elem = $('#FileContents');
                            if (elem) {
                                elem.select();
                            }
                        });
                    };

                    EditorController.prototype.saveFile = function (filePath) {
                        var _this = this;
                        if (!filePath)
                            filePath = this.FileLocation;
                        if (!filePath)
                            return this.saveFileAs();
                        if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                            var output = this._buffer;
                            this._fs.writeFile(filePath, output, 'UTF-8', function (err) {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    // File has been saved
                                    _this.FileLocation = filePath;
                                    _this.LastOnSaved = Date.now();
                                }
                                _this.$scope.$apply();
                            });
                        } else {
                            console.warn(' - [ Editor ] Warning: File system not available.');
                        }
                    };

                    EditorController.prototype.saveFileAs = function () {
                        var _this = this;
                        if (!$.isEmptyObject(this._gui)) {
                            // Get the file name
                            var filePath = this.FileLocation || 'Untitled.txt';
                            var chooser = $('#saveDialog');
                            chooser.change(function (evt) {
                                var filePath = chooser.val();
                                if (filePath) {
                                    // Save file in specified location
                                    _this.saveFile(filePath);
                                }
                            });
                            chooser.trigger('click');
                        } else {
                            console.warn(' - [ Editor ] Warning: Shell not available.');
                        }
                    };

                    EditorController.prototype.setText = function (value) {
                        this.FileContents = value;

                        if (!this._textArea) {
                            var myTextArea = $('#FileContents');
                            if (myTextArea.length > 0) {
                                this._textArea = CodeMirror.fromTextArea(myTextArea[0], {
                                    //mode: "javascript",
                                    autoClearEmptyLines: true,
                                    lineNumbers: true,
                                    indentUnit: 4
                                });
                            }
                            this._textArea.setValue(value);
                        } else {
                            this._textArea.setValue(value);
                        }
                        /*
                        var totalLines = this._textArea.lineCount();
                        if (totalLines) {
                        this._textArea.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
                        }
                        */
                    };

                    EditorController.prototype.test = function () {
                        throw new Error('Lala');
                        try  {
                            var dir = './';
                            var log = "Test.log";
                            if (!$.isEmptyObject(this._fs) && !$.isEmptyObject(this._path)) {
                                var target = this._path.resolve(dir, log);
                                this._fs.writeFile(log, "Hey there!", function (err) {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        var nwGui = 'nw.gui';
                                        var myGui = require(nwGui);
                                        if (!$.isEmptyObject(myGui)) {
                                            myGui.Shell.openItem(target);
                                        } else {
                                            throw new Error('Cannot open the item: ' + target);
                                        }
                                    }
                                });
                            } else {
                                console.warn(' - Warning: File system not available...');
                            }
                        } catch (ex) {
                            console.error(ex);
                        }
                    };

                    EditorController.prototype.checkUnsaved = function (msg) {
                        var msgCheck = msg || 'There are unsaved changes.\r\nAre you sure you want to continue?';
                        var hasCheck = this.FileContents != null && this.HasChanges;
                        return (hasCheck && confirm(msgCheck) == false);
                    };
                    return EditorController;
                })();
                editor.EditorController = EditorController;
            })(modules.editor || (modules.editor = {}));
            var editor = modules.editor;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="controllers/EditorController.ts"/>
angular.module('prototyped.editor', [
    'ui.router'
]).config([
    '$stateProvider', function ($stateProvider) {
        // Define the UI states
        $stateProvider.state('proto.editor', {
            url: '^/editor',
            views: {
                //'left@': { templateUrl: 'views/common/components/left.tpl.html' },
                'main@': {
                    templateUrl: 'modules/editor/views/main.tpl.html',
                    controller: 'proto.ng.modules.editor.EditorController'
                }
            }
        });
    }]).controller('proto.ng.modules.editor.EditorController', [
    '$scope',
    '$timeout',
    proto.ng.modules.editor.EditorController
]);
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (explorer) {
                function AddressBarDirective() {
                    return {
                        restrict: 'EA',
                        scope: {
                            target: '=protoAddressBar'
                        },
                        transclude: false,
                        templateUrl: 'modules/explore/views/addressbar.tpl.html',
                        controller: 'AddressBarController',
                        controllerAs: 'addrBar'
                    };
                }
                explorer.AddressBarDirective = AddressBarDirective;

                var AddressBarController = (function () {
                    function AddressBarController($rootScope, $scope, $q) {
                        var _this = this;
                        this.$rootScope = $rootScope;
                        this.$scope = $scope;
                        this.$q = $q;
                        this.history = [];
                        $scope.busy = true;
                        try  {
                            // Initialise the address bar
                            var elem = $('#addressbar');
                            if (elem) {
                                this.init(elem);
                                this.$rootScope.$on('event:folder-path:changed', function (event, folder) {
                                    if (folder != _this.$scope.dir_path) {
                                        _this.$scope.dir_path = folder;
                                        _this.navigate(folder);
                                    }
                                });
                            } else {
                                throw new Error('Element with id "addressbar" not found...');
                            }
                        } catch (ex) {
                            // Initialisation failed
                            console.warn(ex);
                        }
                        $scope.busy = false;
                    }
                    AddressBarController.prototype.init = function (element) {
                        // Set the target HTML element
                        this.element = element;

                        // Generate the current folder parts
                        this.generateOutput('./');
                    };

                    AddressBarController.prototype.openFolder = function (path) {
                        try  {
                            var nwGui = 'nw.gui';
                            var gui = require(nwGui);
                            if (!$.isEmptyObject(gui)) {
                                console.debug(' - Opening Folder: ' + path);
                                gui.Shell.openItem(path + '/');
                            }
                        } catch (ex) {
                            console.warn(ex);
                        }
                        this.generateOutput(path);
                    };

                    AddressBarController.prototype.navigate = function (path) {
                        this.generateOutput(path);
                    };

                    AddressBarController.prototype.select = function (file) {
                        console.info(' - select: ', file);
                        try  {
                            var req = 'nw.gui';
                            var gui = require(req);
                            gui.Shell.openItem(file);
                        } catch (ex) {
                            console.error(ex);
                        }
                    };

                    AddressBarController.prototype.back = function () {
                        var len = this.history ? this.history.length : -1;
                        if (len > 1) {
                            var last = this.history[len - 2];
                            this.history = this.history.splice(0, len - 2);
                            this.generateOutput(last);
                        }
                    };

                    AddressBarController.prototype.hasHistory = function () {
                        var len = this.history ? this.history.length : -1;
                        return (len > 1);
                    };

                    AddressBarController.prototype.generateOutput = function (dir_path) {
                        // Set the current dir path
                        this.$scope.dir_path = dir_path;
                        this.$scope.dir_parts = this.generatePaths(dir_path);
                        this.history.push(dir_path);

                        // Breadcast event that path has changed
                        this.$rootScope.$broadcast('event:folder-path:changed', this.$scope.dir_path);
                    };

                    AddressBarController.prototype.generatePaths = function (dir_path) {
                        if (typeof require === 'undefined')
                            return;
                        try  {
                            // Get dependecies
                            var path = require('path');

                            // Update current path
                            this.$scope.dir_path = dir_path = path.resolve(dir_path);

                            // Try and normalize the folder path
                            var curr = path.normalize(dir_path);
                            if (curr) {
                                // Split path into separate elements
                                var sequence = curr.split(path.sep);
                                var result = [];

                                var i = 0;
                                for (; i < sequence.length; ++i) {
                                    result.push({
                                        name: sequence[i],
                                        path: sequence.slice(0, 1 + i).join(path.sep)
                                    });
                                }

                                // Add root for unix
                                if (sequence[0] == '' && process.platform != 'win32') {
                                    result[0] = {
                                        name: 'root',
                                        path: '/'
                                    };
                                }

                                // Return thepath sequences
                                return { sequence: result };
                            }
                        } catch (ex) {
                            console.error(ex);
                        }
                    };
                    return AddressBarController;
                })();
                explorer.AddressBarController = AddressBarController;
            })(modules.explorer || (modules.explorer = {}));
            var explorer = modules.explorer;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
///<reference path="../../common/services/NavigationService.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (explorer) {
                var ExplorerLeftController = (function () {
                    function ExplorerLeftController($rootScope, $scope, navigation) {
                        this.$rootScope = $rootScope;
                        this.$scope = $scope;
                        this.navigation = navigation;
                        $scope.navigation = navigation;
                    }
                    return ExplorerLeftController;
                })();
                explorer.ExplorerLeftController = ExplorerLeftController;
            })(modules.explorer || (modules.explorer = {}));
            var explorer = modules.explorer;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
///<reference path="../../common/services/NavigationService.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (explorer) {
                var ExplorerViewController = (function () {
                    function ExplorerViewController($rootScope, $scope, $q, navigation) {
                        this.$rootScope = $rootScope;
                        this.$scope = $scope;
                        this.$q = $q;
                        this.navigation = navigation;
                    }
                    return ExplorerViewController;
                })();
                explorer.ExplorerViewController = ExplorerViewController;
            })(modules.explorer || (modules.explorer = {}));
            var explorer = modules.explorer;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
///<reference path="../../common/services/NavigationService.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (explorer) {
                var ExternalLinksViewController = (function () {
                    function ExternalLinksViewController($rootScope, $sce, $q, navigation) {
                        this.$rootScope = $rootScope;
                        this.$sce = $sce;
                        this.$q = $q;
                        this.navigation = navigation;
                        this.init();
                    }
                    ExternalLinksViewController.prototype.init = function () {
                        var _this = this;
                        if (this.navigation.externalLinks) {
                            this.navigation.externalLinks.UpdateUI = function () {
                                _this.$rootScope.$applyAsync(function () {
                                });
                            };
                            this.navigation.externalLinks.OnSelect = function (node) {
                                _this.$rootScope.$applyAsync(function () {
                                    console.log(' - Loading: ' + node.data);
                                    _this.selected = node;
                                });
                            };
                        }
                        this.$sce.trustAsHtml($('#ExternalExplorerPanel')[0]);
                    };

                    ExternalLinksViewController.prototype.trustSrc = function (src) {
                        return this.$sce.trustAsResourceUrl(src);
                    };

                    ExternalLinksViewController.prototype.openExternal = function () {
                        if (this.selected) {
                            window.open(this.selected.data, this.selected.label);
                        }
                    };

                    ExternalLinksViewController.prototype.refreshExternal = function () {
                        var _this = this;
                        if (this.selected) {
                            $('#ExternalExplorerPanel').attr('src', function (i, val) {
                                return _this.trustSrc(val);
                            });
                        }
                    };
                    return ExternalLinksViewController;
                })();
                explorer.ExternalLinksViewController = ExternalLinksViewController;
            })(modules.explorer || (modules.explorer = {}));
            var explorer = modules.explorer;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
///<reference path="../../../imports.d.ts"/>
var proto;
(function (proto) {
    (function (ng) {
        (function (modules) {
            (function (explorer) {
                var FileBrowserViewController = (function () {
                    function FileBrowserViewController($rootScope, $scope, $q, navigation) {
                        var _this = this;
                        this.$rootScope = $rootScope;
                        this.$scope = $scope;
                        this.$q = $q;
                        this.navigation = navigation;
                        var dir = './';
                        try  {
                            // Hook up to the current scope
                            this.$scope.isBusy = true;

                            // Initialize the cotroller
                            this.init(dir);

                            // Hook event for when folder path changes
                            this.$rootScope.$on('event:folder-path:changed', function (event, folder) {
                                if (folder != _this.$scope.dir_path) {
                                    _this.$scope.dir_path = folder;
                                    _this.navigate(folder);
                                }
                            });
                        } catch (ex) {
                            console.warn(ex);
                        }
                    }
                    FileBrowserViewController.prototype.init = function (dir) {
                        var _this = this;
                        // Hook site navigation nodes
                        this.navigation.fileSystem.UpdateUI = function () {
                            _this.$rootScope.$applyAsync(function () {
                            });
                        };
                        this.navigation.fileSystem.OnSelect = function (node) {
                            var folder = node.data;
                            if (folder != _this.$scope.dir_path) {
                                _this.$scope.dir_path = folder;
                                _this.navigate(folder);
                            }
                        };

                        // Resolve the initial folder path
                        this.navigate(dir);
                    };

                    FileBrowserViewController.prototype.navigate = function (dir_path) {
                        var _this = this;
                        var deferred = this.$q.defer();
                        if (typeof require === 'undefined') {
                            deferred.reject(new Error('Required libraries not available.'));
                        } else {
                            try  {
                                // Set busy flag
                                this.$scope.isBusy = true;
                                this.$scope.error = null;

                                // Resolve the full path
                                var path = require('path');
                                dir_path = path.resolve(dir_path);

                                // Read the folder contents (async)
                                var fs = require('fs');
                                fs.readdir(dir_path, function (error, files) {
                                    if (error) {
                                        deferred.reject(error);
                                        return;
                                    }

                                    // Split and sort results
                                    var folders = [];
                                    var lsFiles = [];
                                    for (var i = 0; i < files.sort().length; ++i) {
                                        var targ = path.join(dir_path, files[i]);
                                        var stat = _this.mimeType(targ);
                                        if (stat.type == 'folder') {
                                            folders.push(stat);
                                        } else {
                                            lsFiles.push(stat);
                                        }
                                    }

                                    // Generate the contents
                                    var result = {
                                        path: dir_path,
                                        folders: folders,
                                        files: lsFiles
                                    };

                                    // Mark promise as resolved
                                    deferred.resolve(result);
                                });
                            } catch (ex) {
                                // Mark promise and rejected
                                deferred.reject(ex);
                            }
                        }

                        // Handle the result and error conditions
                        deferred.promise.then(function (result) {
                            // Clear busy flag
                            _this.$scope.isBusy = false;
                            _this.$scope.dir_path = result.path;
                            _this.$scope.files = result.files;
                            _this.$scope.folders = result.folders;

                            // Breadcast event that path has changed
                            _this.$rootScope.$broadcast('event:folder-path:changed', _this.$scope.dir_path);
                        }, function (error) {
                            // Clear busy flag
                            _this.$scope.isBusy = false;
                            _this.$scope.error = error;
                        });

                        return deferred.promise;
                    };

                    FileBrowserViewController.prototype.select = function (filePath) {
                        this.$scope.selected = filePath;
                    };

                    FileBrowserViewController.prototype.open = function (filePath) {
                        var req = 'nw.gui';
                        var gui = require(req);
                        if (gui)
                            gui.Shell.openItem(filePath);
                    };

                    FileBrowserViewController.prototype.mimeType = function (filepath) {
                        var map = {
                            'compressed': ['zip', 'rar', 'gz', '7z'],
                            'text': ['txt', 'md', ''],
                            'image': ['jpg', 'jpge', 'png', 'gif', 'bmp'],
                            'pdf': ['pdf'],
                            'css': ['css'],
                            'excel': ['csv', 'xls', 'xlsx'],
                            'html': ['html'],
                            'word': ['doc', 'docx'],
                            'powerpoint': ['ppt', 'pptx'],
                            'movie': ['mkv', 'avi', 'rmvb']
                        };
                        var cached = {};

                        var fs = require('fs');
                        var path = require('path');
                        var result = {
                            name: path.basename(filepath),
                            path: filepath,
                            type: null
                        };

                        try  {
                            var stat = fs.statSync(filepath);
                            if (stat.isDirectory()) {
                                result.type = 'folder';
                            } else {
                                var ext = path.extname(filepath).substr(1);
                                result.type = cached[ext];
                                if (!result.type) {
                                    for (var key in map) {
                                        var arr = map[key];
                                        if (arr.length > 0 && arr.indexOf(ext) >= 0) {
                                            cached[ext] = result.type = key;
                                            break;
                                        }
                                    }

                                    if (!result.type)
                                        result.type = 'blank';
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }

                        return result;
                    };
                    return FileBrowserViewController;
                })();
                explorer.FileBrowserViewController = FileBrowserViewController;
            })(modules.explorer || (modules.explorer = {}));
            var explorer = modules.explorer;
        })(ng.modules || (ng.modules = {}));
        var modules = ng.modules;
    })(proto.ng || (proto.ng = {}));
    var ng = proto.ng;
})(proto || (proto = {}));
/// <reference path="../../imports.d.ts" />
/// <reference path="../common/services/NavigationService.ts"/>
/// <reference path="controllers/ExplorerLeftController.ts" />
/// <reference path="controllers/ExplorerViewController.ts" />
angular.module('prototyped.explorer', [
    'prototyped.ng.runtime',
    'ui.router'
]).config([
    'appStateProvider', function (appStateProvider) {
        // Define application state
        appStateProvider.define('proto.explore', {
            url: '/explore',
            priority: 0,
            state: {
                url: '^/explore',
                views: {
                    'left@': {
                        templateUrl: 'modules/explore/views/left.tpl.html',
                        controller: 'ExplorerLeftController',
                        controllerAs: 'exploreLeftCtrl'
                    },
                    'main@': {
                        templateUrl: 'modules/explore/views/main.tpl.html',
                        controller: 'ExplorerViewController',
                        controllerAs: 'exploreCtrl'
                    }
                }
            },
            menuitem: {
                label: 'Explore',
                state: 'proto.explore',
                icon: 'fa fa-sitemap'
            },
            cardview: {
                style: 'img-explore',
                title: 'Explore Features & Options',
                desc: 'You can explore locally installed features and find your way around the site by clicking on this card...'
            },
            visible: function () {
                return appStateProvider.appConfig.options.showDefaultItems;
            }
        }).state('proto.browser', {
            url: '^/browser',
            views: {
                'left@': {
                    templateUrl: 'modules/explore/views/left.tpl.html',
                    controller: 'ExplorerLeftController',
                    controllerAs: 'exploreLeftCtrl'
                },
                'main@': {
                    templateUrl: 'modules/explore/views/browser.tpl.html',
                    controller: 'BrowserViewController',
                    controllerAs: 'ctrlExplorer'
                }
            }
        }).state('proto.links', {
            url: '^/externals',
            views: {
                'left@': {
                    templateUrl: 'modules/explore/views/left.tpl.html',
                    controller: 'ExplorerLeftController',
                    controllerAs: 'exploreLeftCtrl'
                },
                'main@': {
                    templateUrl: 'modules/explore/views/externals.tpl.html',
                    controller: 'ExternalLinksViewController',
                    controllerAs: 'linksCtrl'
                }
            }
        }).state('proto.routing', {
            url: '^/routing',
            views: {
                'left@': {
                    templateUrl: 'modules/explore/views/left.tpl.html',
                    controller: 'ExplorerLeftController',
                    controllerAs: 'exploreLeftCtrl'
                },
                'main@': {
                    templateUrl: 'modules/explore/views/main.tpl.html',
                    controller: 'ExplorerViewController',
                    controllerAs: 'exploreCtrl'
                }
            }
        });
    }]).config([
    '$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self'
        ]);

        $sceDelegateProvider.resourceUrlWhitelist(['**']);
    }]).service('navigationService', ['$state', 'appState', proto.ng.modules.common.services.NavigationService]).directive('protoAddressBar', ['$q', proto.ng.modules.explorer.AddressBarDirective]).controller('AddressBarController', ['$rootScope', '$scope', '$q', proto.ng.modules.explorer.AddressBarController]).controller('ExplorerLeftController', ['$rootScope', '$scope', 'navigationService', proto.ng.modules.explorer.ExplorerLeftController]).controller('ExplorerViewController', ['$rootScope', '$scope', '$q', 'navigationService', proto.ng.modules.explorer.ExplorerViewController]).controller('BrowserViewController', ['$rootScope', '$scope', '$q', 'navigationService', proto.ng.modules.explorer.FileBrowserViewController]).controller('ExternalLinksViewController', ['$rootScope', '$sce', '$q', 'navigationService', proto.ng.modules.explorer.ExternalLinksViewController]);
/// <reference path="../imports.d.ts" />
/// <reference path="../modules/config.ng.ts" />
/// <reference path="../modules/about/module.ng.ts" />
// Define main module with all dependencies
angular.module('prototyped.ng', [
    'prototyped.ng.runtime',
    'prototyped.ng.config',
    'prototyped.ng.views',
    'prototyped.ng.styles',
    'ngRoute',
    'ui.router',
    'prototyped.explorer',
    'prototyped.console',
    'prototyped.editor',
    'prototyped.about'
]).config([
    'appStateProvider', function (appStateProvider) {
        // Configure module state
        appStateProvider.config('prototyped.ng', {
            active: true
        }).when('/proto', '/proto/explore').when('/sandbox', '/samples').when('/imports', '/edge').state('proto', {
            url: '/proto',
            abstract: true
        }).state('default', {
            url: '/',
            views: {
                'main@': {
                    templateUrl: 'views/default.tpl.html',
                    controller: 'CardViewController',
                    controllerAs: 'cardView'
                }
            }
        });
    }]).controller('CardViewController', ['appState', proto.ng.modules.common.controllers.CardViewController]).directive('appClean', ['$window', '$route', '$state', 'appState', proto.ng.modules.common.directives.AppCleanDirective]).directive('appClose', ['appNode', proto.ng.modules.common.directives.AppCloseDirective]).directive('appDebug', ['appNode', proto.ng.modules.common.directives.AppDebugDirective]).directive('appKiosk', ['appNode', proto.ng.modules.common.directives.AppKioskDirective]).directive('appFullscreen', ['appNode', proto.ng.modules.common.directives.AppFullScreenDirective]).directive('appVersion', ['appState', proto.ng.modules.common.directives.AppVersionDirective]).directive('eatClickIf', ['$parse', '$rootScope', proto.ng.modules.common.directives.EatClickIfDirective]).directive('toHtml', ['$sce', '$filter', proto.ng.modules.common.directives.ToHtmlDirective]).directive('domReplace', [proto.ng.modules.common.directives.DomReplaceDirective]).directive('resxInclude', ['$templateCache', proto.ng.modules.common.directives.ResxIncludeDirective]).directive('resxImport', ['$templateCache', '$document', proto.ng.modules.common.directives.ResxImportDirective]).directive('abnTree', ['$timeout', proto.ng.modules.common.directives.TreeViewDirective]).filter('toXml', [proto.ng.modules.common.filters.ToXmlFilter]).filter('interpolate', ['appState', proto.ng.modules.common.filters.InterpolateFilter]).filter('fromNow', ['$filter', proto.ng.modules.common.filters.FromNowFilter]).filter('isArray', [proto.ng.modules.common.filters.IsArrayFilter]).filter('isNotArray', [proto.ng.modules.common.filters.IsNotArrayFilter]).filter('typeCount', [proto.ng.modules.common.filters.TypeCountFilter]).filter('listReverse', [proto.ng.modules.common.filters.ListReverseFilter]).filter('toBytes', [proto.ng.modules.common.filters.ToByteFilter]).filter('parseBytes', [proto.ng.modules.common.filters.ParseBytesFilter]).filter('trustedUrl', ['$sce', proto.ng.modules.common.filters.TrustedUrlFilter]).run([
    '$rootScope', '$state', 'appConfig', 'appState', function ($rootScope, $state, appConfig, appState) {
        // Extend root scope with (global) contexts
        angular.extend($rootScope, {
            appConfig: appConfig,
            appState: appState,
            appNode: appState.node,
            startAt: Date.now(),
            state: $state
        });

        // Link the current state instance
        appState.state = $state;

        // Watch for navigation changes
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (toState) {
                appState.current.state = toState;
            }
        });

        console.debug(' - Current Config: ', appConfig);
    }]);
/// <reference path="../imports.d.ts" />
/// <reference path="config.ng.ts" />
// Define common runtime modules (shared)
angular.module('prototyped.ng.runtime', [
    'prototyped.ng.config',
    'ui.router'
]).provider('appNode', [
    proto.ng.modules.common.providers.AppNodeProvider
]).provider('appState', [
    '$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    'appConfigProvider',
    'appNodeProvider',
    proto.ng.modules.common.providers.AppStateProvider
]).provider('appInfo', [
    'appStateProvider',
    proto.ng.modules.common.providers.AppInfoProvider
]).run([
    '$rootScope', 'appState', function ($rootScope, appState) {
        appState.setUpdateAction(function (action) {
            $rootScope.$applyAsync(action);
        });
    }]);
/// <reference path="../../imports.d.ts" />
angular.module('prototyped.sandbox', [
    'prototyped.ng.runtime'
]).directive('dockedContainer', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: false,
        templateUrl: 'views/common/docked/container.tpl.html'
    };
}).directive('dockedIcon', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: true,
        templateUrl: 'views/common/docked/icon.tpl.html'
    };
}).directive('dockedTop', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: true,
        templateUrl: 'views/common/docked/top.tpl.html'
    };
}).directive('dockedTopLeft', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: true,
        templateUrl: 'views/common/docked/topLeft.tpl.html'
    };
}).directive('dockedTopRight', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: true,
        templateUrl: 'views/common/docked/topRight.tpl.html'
    };
}).directive('dockedLeftNav', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: true,
        templateUrl: 'views/common/docked/left.tpl.html'
    };
}).directive('dockedMain', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: false,
        templateUrl: 'views/common/docked/main.tpl.html'
    };
}).directive('dockedFooter', function () {
    return {
        restrict: 'AEM',
        replace: true,
        transclude: true,
        templateUrl: 'views/common/docked/footer.tpl.html'
    };
});
;angular.module('prototyped.ng.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('modules/about/views/connections.tpl.html',
    '<div ng:cloak style="width: 100%"><style resx:import=assets/css/images.min.css></style><style>.results {\n' +
    '            display: block;\n' +
    '            width: 100%;\n' +
    '        }\n' +
    '\n' +
    '            .results .icon {\n' +
    '                margin: 0 8px;\n' +
    '                font-size: 128px;\n' +
    '                width: 128px !important;\n' +
    '                height: 128px !important;\n' +
    '                position: relative;\n' +
    '                flex-grow: 0;\n' +
    '                flex-shrink: 0;\n' +
    '            }\n' +
    '\n' +
    '                .results .icon .sub-icon {\n' +
    '                    font-size: 64px !important;\n' +
    '                    width: 64px !important;\n' +
    '                    height: 64px !important;\n' +
    '                    position: absolute;\n' +
    '                    right: 0;\n' +
    '                    top: 0;\n' +
    '                    margin-top: 100px;\n' +
    '                }\n' +
    '\n' +
    '                    .results .icon .sub-icon.success {\n' +
    '                        color: #080;\n' +
    '                    }\n' +
    '\n' +
    '                    .results .icon .sub-icon.error {\n' +
    '                        color: #D00;\n' +
    '                    }\n' +
    '\n' +
    '                    .results .icon .sub-icon.warning {\n' +
    '                        color: #0094ff;\n' +
    '                    }\n' +
    '\n' +
    '                    .results .icon .sub-icon.busy {\n' +
    '                        color: #0094ff;\n' +
    '                    }\n' +
    '\n' +
    '            .results h4 {\n' +
    '                text-wrap: avoid;\n' +
    '                overflow: hidden;\n' +
    '                white-space: nowrap;\n' +
    '                text-overflow: ellipsis;\n' +
    '            }\n' +
    '\n' +
    '                .results h4 a {\n' +
    '                    color: black;\n' +
    '                }\n' +
    '\n' +
    '            .results .ctrl-sm {\n' +
    '                font-size: larger;\n' +
    '                margin-left: 8px;\n' +
    '                color: black;\n' +
    '            }\n' +
    '\n' +
    '        .info-row {\n' +
    '            display: flex;\n' +
    '        }\n' +
    '\n' +
    '        .info-row-links {\n' +
    '            color: silver;\n' +
    '        }\n' +
    '\n' +
    '            .info-row-links a {\n' +
    '                color: #4a4a4a;\n' +
    '                margin-left: 8px;\n' +
    '            }\n' +
    '\n' +
    '                .info-row-links a:hover {\n' +
    '                    color: #000000;\n' +
    '                }\n' +
    '\n' +
    '        .info-col-primary {\n' +
    '            flex-grow: 1;\n' +
    '            flex-shrink: 1;\n' +
    '        }\n' +
    '\n' +
    '        .info-col-secondary {\n' +
    '            flex-grow: 0;\n' +
    '            flex-shrink: 0;\n' +
    '        }\n' +
    '\n' +
    '        .iframe-body {\n' +
    '            margin: 0;\n' +
    '            padding: 0;\n' +
    '        }\n' +
    '\n' +
    '            .iframe-body iframe {\n' +
    '                margin: 0;\n' +
    '                padding: 0;\n' +
    '            }\n' +
    '\n' +
    '        .tree-item a {\n' +
    '            color: #4a4a4a !important;\n' +
    '        }\n' +
    '\n' +
    '        .tree-item.online a .fa {\n' +
    '            color: #00b500 !important;\n' +
    '            text-shadow: 0 0 2px #00b500;\n' +
    '        }\n' +
    '\n' +
    '        .tree-item.offline a .fa {\n' +
    '            color: #D00 !important;\n' +
    '            text-shadow: 0 0 2px #D00;\n' +
    '        }\n' +
    '\n' +
    '        .tree-item.warning a .fa {\n' +
    '            color: #ff8d00 !important;\n' +
    '            text-shadow: 0 0 2px #ff8d00;\n' +
    '        }\n' +
    '\n' +
    '        .nav-pills > li.active > a, .nav-pills > li.active > a:focus, .nav-pills > li.active > a:hover {\n' +
    '            background-color: #d8e1e8!important;\n' +
    '            border-color: #337ab7!important;\n' +
    '        }</style><div class="info-overview results"><div class=row style="width: 100%"><div class=col-md-2><h5><i class="fa fa-gear"></i> My Client <small><span ng-if=true class=ng-cloak><b app:version ng-class="{ \'text-success glow-green\': appInfo.version }">loading...</b></span> <span ng-if=false><b class="text-danger glow-red"><i class="glyphicon glyphicon-remove"></i> Offline</b></span></small></h5><div ng:if=true><a class="panel-icon-lg img-terminal"><div ng:if="info.about.browser.name == \'Chrome\'" class="panel-icon-inner img-chrome"></div><div ng:if="info.about.browser.name == \'Chromium\'" class="panel-icon-inner img-chromium"></div><div ng:if="info.about.browser.name == \'Firefox\'" class="panel-icon-inner img-firefox"></div><div ng:if="info.about.browser.name == \'Internet Explorer\'" class="panel-icon-inner img-iexplore"></div><div ng:if="info.about.browser.name == \'Opera\'" class="panel-icon-inner img-opera"></div><div ng:if="info.about.browser.name == \'Safari\'" class="panel-icon-inner img-safari"></div><div ng:if="info.about.browser.name == \'SeaMonkey\'" class="panel-icon-inner img-seamonkey"></div><div ng:if="info.about.browser.name == \'Spartan\'" class="panel-icon-inner img-spartan"></div><div ng:if="info.about.os.name == \'Windows\'" class="panel-icon-overlay img-windows"></div><div ng:if="info.about.os.name == \'MacOS\'" class="panel-icon-overlay img-mac-os"></div><div ng:if="info.about.os.name == \'Apple\'" class="panel-icon-overlay img-apple"></div><div ng:if="info.about.os.name == \'UNIX\'" class="panel-icon-overlay img-unix"></div><div ng:if="info.about.os.name == \'Linux\'" class="panel-icon-overlay img-linux"></div><div ng:if="info.about.os.name == \'Ubuntu\'" class="panel-icon-overlay img-ubuntu"></div></a><p class=panel-label title="{{ info.about.os.name }} @ {{ info.about.os.version.alias }}">Host System: <b ng:if=info.about.os.name>{{ info.about.os.name }}</b> <em ng:if=!info.about.os.name>checking...</em> <span ng:if=info.about.os.version.alias>@ {{ info.about.os.version.alias }}</span></p><p class=panel-label title="{{ info.about.browser.name }} @ {{ info.about.browser.version.major }}.{{ info.about.browser.version.minor }}{{ info.about.browser.version.build ? \'.\' + info.about.browser.version.build : \'\' }}">User Agent: <b ng:if=info.about.browser.name>{{ info.about.browser.name }}</b> <em ng:if=!info.about.browser.name>detecting...</em> <span ng:if=info.about.browser.version>@ {{ info.about.browser.version.major }}.{{ info.about.browser.version.minor }}{{ info.about.browser.version.build ? \'.\' + info.about.browser.version.build : \'\' }}</span></p></div><div ng-switch=info.about.hdd.type class=panel-icon-lg><a ng-switch-default class="panel-icon-lg inactive-gray img-drive"></a> <a ng-switch-when=true class="panel-icon-lg img-drive-default"></a> <a ng-switch-when=onl class="panel-icon-lg img-drive-onl"></a> <a ng-switch-when=usb class="panel-icon-lg img-drive-usb"></a> <a ng-switch-when=ssd class="panel-icon-lg img-drive-ssd"></a> <a ng-switch-when=web class="panel-icon-lg img-drive-web"></a> <a ng-switch-when=mac class="panel-icon-lg img-drive-mac"></a> <a ng-switch-when=warn class="panel-icon-lg img-drive-warn"></a> <a ng-switch-when=hist class="panel-icon-lg img-drive-hist"></a> <a ng-switch-when=wifi class="panel-icon-lg img-drive-wifi"></a><div ng:if=info.about.webdb.active class="panel-icon-inset-bl img-webdb"></div></div><p ng:if=info.about.webdb.active class="panel-label ellipsis">Local databsse is <b class=glow-green>Online</b></p><p ng:if=!info.about.webdb.active class="panel-label text-muted ellipsis"><em>No local storage found</em></p><p ng:if=!info.about.webdb.active class="panel-label text-muted"><div class=progress ng-style="{ height: \'10px\' }" title="{{(100 * progA) + \'%\'}} ( {{info.about.webdb.used}} / {{info.about.webdb.size}} )"><div ng:init="progA = (info.about.webdb.size > 0) ? (info.about.webdb.used||0)/info.about.webdb.size : 0" class=progress-bar ng-class="\'progress-bar-info\'" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"></div></div></p></div><div class=col-md-8 ng-init="tabOverviewMain = 0" ng-switch=tabOverviewMain><h5><i class="fa fa-globe"></i> <span>Connection Details</span> <small class=pull-right><a class=ctrl-sm ng-click="connCtrl.state.editMode = true" href=""><i class="glyphicon glyphicon-pencil"></i></a></small> <small><span ng-if=!info.about.server><em class=text-muted>checking...</em></span> <span ng-if="info.about.server.active === false"><b class="text-danger glow-red">Offline</b>, faulty or disconnected.</span> <span ng-if="info.about.server.active && appState.node.active">Connected via <b class="text-warning glow-orange">web client</b>.</span> <span ng-if="info.about.server.active && !appState.node.active"><b class="text-success glow-green">Online</b> and fully operational.</span></small></h5><div><div ng-show=!connCtrl.state.editMode><div ng-if=connCtrl.state.location><p class=info-row><div class="info-col-primary pull-left">Location: <a target=_blank ng-href={{connCtrl.state.location}}>{{ connCtrl.state.location }}</a><br class="clearfix"></div><div class="info-col-secondary pull-right"></div><br class="clearfix"></p><p class=info-row><div class="info-col-primary pull-left" ng-if=connCtrl.result><div class=info-col-ellipse>Latency: {{ connCtrl.result.received - connCtrl.result.sent }}ms <span ng-if=connCtrl.latency.desc ng-class=connCtrl.latency.style>(<em>{{ connCtrl.latency.desc }}</em>)</span></div></div><div class="info-col-primary pull-left" ng-if=!connCtrl.result><em>Checking...</em></div><div class="info-col-secondary pull-right"><span ng-if="connCtrl.status.code >= 0" class="pull-right label" ng-class=connCtrl.status.style title="Status: {{ connCtrl.status.desc }}, Code: {{ connCtrl.status.code }}">{{ connCtrl.status.desc }}: {{ connCtrl.status.code }}</span></div><br class="clearfix"></p><p class=info-row><div class="info-col-primary pull-left">Protocol: <span class="btn-group btn-group-xs" role=group aria-label=...><button type=button ng-disabled=connCtrl.state.requireHttps class="btn btn-default" ng-click="connCtrl.setProtocol(\'http\')" ng-class="connCtrl.state.requireHttps ? \'disabled\' : connCtrl.getProtocolStyle(\'http\', \'btn-warning\')"><i class=glyphicon ng-class="connCtrl.getStatusIcon(\'glyphicon-eye-open\')" ng-if="connCtrl.state.location.indexOf(\'http://\') == 0"></i> HTTP</button> <button type=button class="btn btn-default" ng-click="connCtrl.setProtocol(\'https\')" ng-class="connCtrl.getProtocolStyle(\'https\')"><i class=glyphicon ng-class="connCtrl.getStatusIcon(\'glyphicon-eye-close\')" ng-if="connCtrl.state.location.indexOf(\'https://\') == 0"></i> HTTPS</button></span></div><div class="info-col-secondary pull-right"><span class="btn-group btn-group-xs" role=group><a ng-if=connCtrl.result.info class="btn btn-default" href="" ng-click="connCtrl.state.activeTab = (connCtrl.state.activeTab == \'result\') ? null : \'result\'" ng-class="{\'btn-info\':(connCtrl.state.activeTab == \'result\'), \'btn-default\':(connCtrl.state.activeTab != \'result\')}"><i class="glyphicon glyphicon-file"></i> View Result</a> <a ng-if=connCtrl.state.location class=btn href="" ng-click="connCtrl.state.activeTab = (connCtrl.state.activeTab == \'preview\') ? null : \'preview\'" ng-class="{\'btn-info\':(connCtrl.state.activeTab == \'preview\'), \'btn-default\':(connCtrl.state.activeTab != \'preview\')}"><i class=glyphicon ng-class="{\'glyphicon-eye-close\':connCtrl.state.showPreview, \'glyphicon-eye-open\':!connCtrl.state.showPreview}"></i> {{ connCtrl.state.showPreview ? \'Hide\' : \'Show\' }} Preview</a></span></div><br class="clearfix"></p></div><br></div><form ng-if=connCtrl.state.editMode><div class=form-group><h4 class=control-label for=txtTarget>Enter the website URL to connect to:</h4><input class=form-control id=txtTarget ng-model=connCtrl.state.location></div><div class=form-group><div class=checkbox><label><input type=checkbox ng-model=connCtrl.state.requireHttps> Require secure connection</label></div><div class=checkbox ng-class="\'disabled text-muted\'" ng-if=connCtrl.state.requireHttps><label><input type=checkbox ng-model=connCtrl.state.requireCert ng-disabled=true> Requires Client Certificate</label></div></div><div class=form-group ng-show=connCtrl.state.requireCert><label for=exampleInputFile>Select Client Certificate:</label><input type=file id=exampleInputFile><p class=help-block>This must be a valid client certificate.</p></div><button type=submit class="btn btn-primary" ng-click=connCtrl.submitForm()>Update</button></form></div><div ng-show=!connCtrl.state.activeTab><table class=table width=100%><thead><th style="width: auto; overflow-x: hidden">Description</th><th style="width: 64px; text-align: right">Actions</th><th style="width: 80px; text-align: center">Status</th></thead><tbody><tr ng-if=!connCtrl.domains><td colspan=4><em>Nothing to show yet. Fetch some data first...</em></td></tr><tr ng-repeat="domain in connCtrl.domains"><td class=ellipsis><abn:tree tree-data=[domain] icon-leaf="fa fa-dot-circle-o" icon-expand="fa fa-globe" icon-collapse="fa fa-globe" expand-level=0></abn:tree></td><td style="text-align: right"><a href="" ng-click=domain.refresh()><i class="fa fa-refresh inactive-gray"></i></a></td><td style="width: 80px; text-align: center"><div class="label label-default" ng-class="{ \'label-success\':domain.status==\'Online\', \'label-danger\':domain.status==\'Offline\', \'label-danger\':domain.status==\'Not Found\' }">{{ domain.status || \'Not Set\' }}</div></td></tr></tbody></table></div><div ng-show="connCtrl.state.activeTab == \'preview\'" class="panel panel-default"><div class=panel-heading><b class=panel-title><i class="glyphicon glyphicon-globe"></i> <a target=_blank href="{{ connCtrl.state.location }}">{{ connCtrl.state.location }}</a></b></div><div class="panel-body info-row iframe-body" style="min-height: 480px"><iframe class=info-col-primary ng-src="{{ connCtrl.state.location }}" frameborder=0>IFrame not available</iframe></div></div><div ng-show="connCtrl.state.activeTab == \'result\'" class=source><tabset><tab heading="Last Result" disabled><pre>{{ connCtrl.result.info }}</pre></tab><tab heading=Browser disabled><pre>{{ info.about.browser }}</pre></tab><tab heading=Server disabled><pre>{{ info.about.server }}</pre></tab><tab heading=WebDB disabled><pre>{{ info.about.webdb }}</pre></tab><tab heading=OS disabled><pre>{{ info.about.os }}</pre></tab><tab heading=Storage disabled><pre>{{ info.about.hdd }}</pre></tab></tabset></div></div><div class=col-md-2><h5><i class="fa fa-gear"></i> Web Server <small><span class=ng-cloak><b ng-class="{ \'text-success glow-green\': info.about.server.active, \'text-danger glow-red\': info.about.server.active == false }" app:version=server default-text="{{ info.about.server.active ? (info.about.server.active ? \'Online\' : \'Offline\') : \'n.a.\' }}">requesting...</b></span></small></h5><div ng:if=info.about.server.local><a class="panel-icon-lg img-server-local"></a></div><div ng:if=!info.about.server.local ng-class="{ \'inactive-gray\': true || info.versions.jqry }"><a class="panel-icon-lg img-server"><div ng:if="info.about.server.type == \'iis\'" class="panel-icon-inset img-iis"></div><div ng:if="info.about.server.type == \'node\'" class="panel-icon-inset img-node"></div><div ng:if="info.about.server.type == \'apache\'" class="panel-icon-inset img-apache"></div><div ng:if="info.about.server.name == \'Windows\'" class="panel-icon-overlay img-windows"></div><div ng:if="info.about.server.name == \'MacOS\'" class="panel-icon-overlay img-mac-os"></div><div ng:if="info.about.server.name == \'Apple\'" class="panel-icon-overlay img-apple"></div><div ng:if="info.about.server.name == \'UNIX\'" class="panel-icon-overlay img-unix"></div><div ng:if="info.about.server.name == \'Linux\'" class="panel-icon-overlay img-linux"></div></a><div ng:if=info.about.sql class="panel-icon-lg img-sqldb"></div></div><p><div class="alert alert-warning" ng-if="connCtrl.result.valid && connCtrl.state.protocol == \'http\'"><i class="glyphicon glyphicon-eye-open"></i> <b>Warning:</b><br>The web connection <b class=text-danger>is not secure</b>, use <a href="" ng-click="connCtrl.setProtocol(\'https\')">HTTPS</a>.</div><div class="alert alert-success" ng-if="connCtrl.result.valid && connCtrl.state.protocol == \'https\'"><i class="glyphicon glyphicon-ok"></i> <b>Validated:</b><br>The web connection looks secure.</div><div class="alert alert-danger" ng-if="!connCtrl.result.valid && connCtrl.result.error && connCtrl.result.error != \'error\'"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Failed:</b><br>{{ connCtrl.result.error }}</div><div class="alert alert-danger" ng-if="!connCtrl.result.valid && !(connCtrl.result.error && connCtrl.result.error != \'error\')"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Offline:</b><br>Connection could not be established.</div></p></div></div></div></div>');
  $templateCache.put('modules/about/views/contact.tpl.html',
    '<div style="width: 100%"><h4>About <small>Contact Us Online</small></h4><hr><div><i class="fa fa-home"></i> Visit our home page - <a href=http://www.prototyped.info>www.prototyped.info</a></div><hr></div>');
  $templateCache.put('modules/about/views/info.tpl.html',
    '<div id=about-info class=container style="width: 100%"><style resx:import=assets/css/images.min.css></style><div class=row><div class="col-lg-8 col-md-12 info-overview"><h4>About this application</h4><hr>...<hr></div><div class="col-lg-4 hidden-md" ng:init="info.showUnavailable = false"><h4>Inspirations <small>come from great ideas</small></h4><hr><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.ng }" ng:hide="!info.showUnavailable && !info.versions.ng"><a class=app-info-icon target=_blank href="https://angularjs.org/"><div ng:if=true class="img-clipper img-angular"></div></a><div class=app-info-info><h5>Angular JS <small><span ng:if=info.versions.ng>@ v{{info.versions.ng}}</span> <span ng:if=!info.versions.ng><em>not found</em></span></small></h5><p ng:if=!info.versions.ng class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href="https://angularjs.org//">angularjs.org</a> for more info.</p><p ng:if=info.detects.ngUiUtils class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Utils found.</p><p ng:if=info.detects.ngUiRouter class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Router found.</p><p ng:if=info.detects.ngUiBootstrap class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Bootrap found.</p><p ng:if=info.detects.ngAnimate class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular Animations active.</p></div></div><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.nw }" ng:hide="!info.showUnavailable && !info.versions.nw"><a class=app-info-icon target=_blank href="http://nwjs.io/"><div ng:if=true class="img-clipper img-nodewebkit"></div></a><div class=app-info-info><h5>Node Webkit <small><span ng:if=info.versions.nw>@ v{{info.versions.nw}}</span> <span ng:if=!info.versions.nw><em>not available</em></span></small></h5><p ng:if=!info.versions.nw class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href="http://nwjs.io/">nwjs.io</a> for more info.</p><p ng:if=info.versions.nw class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are connected to node webkit.</p><p ng:if=info.versions.chromium class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running Chromium @ {{ info.versions.chromium }}.</p></div></div><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.njs }" ng:hide="!info.showUnavailable && !info.versions.njs"><a class=app-info-icon target=_blank href=http://www.nodejs.org><div ng:if=true class="img-clipper img-nodejs"></div></a><div class=app-info-info><h5>Node JS <small><span ng:if=info.versions.njs>@ v{{info.versions.njs}}</span> <span ng:if=!info.versions.njs><em>not available</em></span></small></h5><p ng:if=!info.versions.njs class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href=http://www.nodejs.org>NodeJS.org</a> for more info.</p><p ng:if=info.versions.njs class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are inside a node js runtime.</p><p ng:if=info.versions.v8 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running V8 @ {{ info.versions.v8 }}.</p><p ng:if=info.versions.openssl class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running OpenSSL @ {{ info.versions.openssl }}.</p></div></div><div class="app-aside-collapser centered" ng-if=!appState.node.active><a href="" ng:show=!info.showUnavailable ng-click="info.showUnavailable = !info.showUnavailable">Show More</a> <a href="" ng:show=info.showUnavailable ng-click="info.showUnavailable = !info.showUnavailable">Hide Inactive</a></div><hr><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.html }"><div class=app-info-icon><div ng:if="info.about.browser.name != \'Internet Explorer\'" class="img-clipper img-html5"></div><div ng:if="info.about.browser.name == \'Internet Explorer\'" class="img-clipper img-html5-ie"></div></div><div class=app-info-info><h5>HTML Rendering Mode <small><span ng-if=info.versions.html>@ v{{ info.versions.html }}</span> <span ng-if=!info.versions.html><em>unknown</em></span></small></h5><p ng:if="info.versions.html >= \'5.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running a modern browser.</p><p ng:if="info.versions.html < \'5.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> Your browser is out of date. Try upgrading.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.js }"><div class=app-info-icon><div ng:if=!info.versions.v8 class="img-clipper img-js-default"></div><div ng:if=info.versions.v8 class="img-clipper img-js-v8"></div></div><div class=app-info-info><h5>Javascript Engine<small><span ng:if=info.versions.js>@ v{{ info.versions.js }}</span> <span ng:if=!info.versions.js><em>not found</em></span></small></h5><p ng:if="info.versions.js >= \'5.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You have a modern javascript engine.</p><p ng:if="info.versions.js < \'5.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> Javascript is out of date or unavailable.</p><p ng:if=info.versions.v8 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Javascript V8 engine, build v{{info.versions.v8}}.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.css }"><div class=app-info-icon><div ng:if=true class="img-clipper img-css3"></div></div><div class=app-info-info><h5>Cascading Styles <small><span ng:if=info.versions.css>@ v{{ info.versions.css }}</span> <span ng:if=!info.versions.css><em class=text-muted>not found</em></span></small></h5><p ng:if="info.versions.css >= \'3.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>You have an up-to-date style engine.</span></p><p ng:if="info.versions.css < \'3.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <span>CSS out of date. Styling might be broken.</span></p><p ng:if=info.css.boostrap2 class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <span>Bootstrap 2 is depricated. Upgrade to 3.x.</span></p><p ng:if=info.css.boostrap3 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>Bootstrap and/or UI componets found.</span></p><p ng:if=info.detects.less class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>Support for LESS has been detected.</span></p><p ng:if=info.detects.bootstrap class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Bootstrap and/or UI Componets found.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.jqry }"><div class=app-info-icon><div ng:if=true class="img-clipper img-jquery"></div></div><div class=app-info-info><h5>jQuery <small><span ng:if=info.versions.jqry>@ v{{ info.versions.jqry }}</span> <span ng:if=!info.versions.jqry><em>not found</em></span></small></h5><p ng:if=info.versions.jqry class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> jQuery or jqLite is loaded.</p><p ng:if="info.versions.jqry < \'1.10\'" class=text-danger><i class="glyphicon glyphicon-warning-sign glow-orange"></i> jQuery is out of date!</p></div></div><hr></div></div></div>');
  $templateCache.put('modules/about/views/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.info><i class="fa fa-info-circle"></i>&nbsp; About this app</a></li><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.conection><i class="fa fa-plug"></i>&nbsp; Check Connectivity</a></li><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.online><i class="fa fa-globe"></i>&nbsp; Visit us online</a></li></ul>');
  $templateCache.put('modules/console/views/logs.tpl.html',
    '<div class=container style=width:100%><span class=pull-right style="padding: 3px"><a href="" ng-click="">Refresh</a> | <a href="" ng-click="appState.logs = []">Clear</a></span><h5>Event Logs</h5><table class="table table-hover table-condensed"><thead><tr><th style="width: 80px">Time</th><th style="width: 64px">Type</th><th>Description</th></tr></thead><tbody><tr ng-if=!appState.logs.length><td colspan=3><em>No events have been logged...</em></td></tr><tr ng-repeat="row in appState.logs" ng-class="{ \'text-info inactive-gray\':row.type==\'debug\', \'text-info\':row.type==\'info\', \'text-warning glow-orange\':row.type==\'warn\', \'text-danger glow-red\':row.type==\'error\' }"><td>{{ row.time | date:\'hh:mm:ss\' }}</td><td>{{ row.type }}</td><td class=ellipsis style="width: auto; overflow: hidden; white-space: pre">{{ row.desc }}</td></tr></tbody></table></div>');
  $templateCache.put('modules/console/views/main.tpl.html',
    '<div class=console><style>.contents {\n' +
    '            padding: 0 !important;\n' +
    '            margin: 0 !important;\n' +
    '        }\n' +
    '\n' +
    '        .console {\n' +
    '            display: flex;\n' +
    '            flex-direction: column;\n' +
    '            width: 100%;\n' +
    '        }\n' +
    '\n' +
    '        .cmd-output {\n' +
    '            width: 100%;\n' +
    '            padding: 6px;\n' +
    '        }</style><div class="cmd-output dock-fill"><div class=cmd-line ng-repeat="ln in lines"><span class=text-{{ln.type}}><i class=glyphicon title="{{ln.time | date:\'hh:mm:ss\'}}" ng-class="{ \'glyphicon-chevron-right\':ln.type==\'info\', \'glyphicon-ok-sign\':ln.type==\'success\', \'glyphicon-warning-sign\':ln.type==\'warning\', \'glyphicon-exclamation-sign\':ln.type==\'error\' }"></i> <span class=cmd-text>{{ln.text}}</span></span></div></div><div class="btn-group btn-group-xs" style="position: absolute; bottom: 0; left: 0; right: 0"><div class="btn-group btn-group-xs pull-left dropup"><a href="" class="btn btn-primary dropdown-toggle" data-toggle=dropdown><i class="glyphicon glyphicon-chevron-right"></i> {{ myConsole.getProxyName() }}</a><ul class="dropdown-menu dropup" role=menu><li ng-repeat="itm in myConsole.getProxies()"><a href="" ng-click=myConsole.setProxy(itm.ProxyName)>Switch to {{ itm.ProxyName }}</a></li></ul></div><div class="input-group input-group-xs"><input id=txtInput tabindex=1 class=form-control ng-model=txtInput ng-keypress="($event.which === 13)?myConsole.command(txtInput):0" placeholder="Enter Command Here"> <a href="" class="input-group-addon btn btn-default" ng-click=myConsole.clear()><i class="glyphicon glyphicon-trash"></i></a></div></div></div>');
  $templateCache.put('modules/editor/views/main.tpl.html',
    '<div class=text-editor ng-init=myWriter.init()><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/codemirror.min.js></script><link href=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/codemirror.min.css rel=stylesheet><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/xml/xml.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/css/css.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/javascript/javascript.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/htmlmixed/htmlmixed.min.js></script><style>.contents {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '        }</style><style resx:import=modules/editor/styles/css/editor.min.css></style><div class="btn-group btn-group-sm dock-tight"><a href="" class="btn btn-default pull-left" ng-click=myWriter.newFile()><i class="glyphicon glyphicon-file"></i></a> <a href="" class="btn btn-default pull-left" ng-click=myWriter.openFile() ng-disabled=!myWriter.HasFileSys><i class="glyphicon glyphicon-folder-open"></i></a><div class="btn-group btn-group-sm pull-right"><a href="" ng-disabled=!myWriter.FileLocation class="btn btn-default dropdown-toggle" data-toggle=dropdown><i class="glyphicon glyphicon-save"></i> <span class=caret></span></a><ul class=dropdown-menu role=menu><li ng-class="{\'disabled\': !myWriter.HasFileSys || !myWriter.FileContents}"><a href="" ng-click=myWriter.saveFileAs()><i class="glyphicon glyphicon-floppy-disk"></i> Save file as...</a></li><li ng-class="{\'disabled\': !myWriter.HasFileSys || !myWriter.FileLocation}"><a href="" ng-click=myWriter.openFileLocation() ng-disabled="!myWriter.HasFileSys || !myWriter.FileLocation"><i class="glyphicon glyphicon-save"></i>Open file...</a></li></ul></div><a href="" class="btn btn-default pull-right" ng-click=myWriter.saveFile() ng-disabled="!(myWriter.HasFileSys && myWriter.HasChanges)"><i class="glyphicon glyphicon-floppy-disk"></i></a><div class="input-group input-group-sm"><label for=txtFileName class=input-group-addon>File:</label><input id=txtFileName class="cmd-input form-control" tabindex=1 value={{myWriter.FileLocation}} placeholder="{{ myWriter.FileLocation || \'Create new or open existing...\' }}" ng-readonly="true"></div></div><textarea id=FileContents class=text-area ng-disabled="myWriter.FileContents == null" ng-model=myWriter.FileContents></textarea><input style=display:none id=fileDialog type=file accept=".txt,.json"> <input style=display:none id=saveDialog type=file accept=.txt nwsaveas></div>');
  $templateCache.put('modules/explore/views/addressbar.tpl.html',
    '<div class="view-toolbar btn-group btn-group-sm"><style>#addressbar {\n' +
    '            background: none;\n' +
    '            padding: 0;\n' +
    '            margin: 0;\n' +
    '        }\n' +
    '\n' +
    '            #addressbar li {\n' +
    '                padding: 0;\n' +
    '                margin: 0;\n' +
    '            }</style><a href="" class="btn btn-default pull-right" ng-click=addrBar.openFolder(dir_path) ng-disabled=!dir_parts><i class="glyphicon glyphicon-folder-open"></i></a> <a href="" ng-click=addrBar.back() class="btn btn-default pull-right" ng-disabled=!addrBar.hasHistory()><i class="glyphicon glyphicon-chevron-left"></i></a><div class="input-group input-group-sm"><label class=input-group-addon>Path:</label><div class="form-control nav-address-bar"><ul id=addressbar class=breadcrumb ng-show=dir_parts><li ng-repeat="itm in dir_parts.sequence" data-path={{itm.path}}><a href="" ng-click=addrBar.navigate(itm.path)>{{itm.name}}</a></li></ul><div class=text-error style="padding-left: 8px" ng-show=!dir_parts><i class="glyphicon glyphicon-bullhorn"></i> No access to local file system.</div></div></div></div>');
  $templateCache.put('modules/explore/views/browser.tpl.html',
    '<div style="width: 100%" ng:cloak><style>.ui-view-main {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '        }\n' +
    '\n' +
    '        .ui-view-left {\n' +
    '            margin-right: 0 !important;\n' +
    '        }\n' +
    '\n' +
    '        .view-selector {\n' +
    '            padding: 3px;\n' +
    '            margin-right: 8px;\n' +
    '        }\n' +
    '\n' +
    '            .view-selector a {\n' +
    '                color: #808080;\n' +
    '                text-decoration: none;\n' +
    '            }</style><div proto:address-bar style="position: relative"></div><div style="padding: 8px 16px"><div id=fileExplorer ng-class=viewMode.view><div class=loader ng-show=isBusy><br><em style="padding: 24px">Loading...</em></div><div ng-show="!isBusy && appNode.active"><div class=folder-contents ng-if="!folders.length && !files.length"><em>No files or folders were found...</em></div><div class=folder-contents><div class="view-selector pull-right" ng-init="viewMode = { desc:\'Default View\', css:\'fa fa-th\', view: \'view-med\' }"><div class="input-group pull-left"><a href="" class=dropdown-toggle data-toggle=dropdown aria-expanded=false><i ng-class=viewMode.css></i> {{ viewMode.desc || \'Default View\' }} <span class=caret></span></a><ul class="pull-right dropdown-menu" role=menu><li><a href="" ng-click="viewMode = { desc:\'Large Icons\', css:\'fa fa-th-large\', view: \'view-large\' }"><i class="fa fa-th-large"></i> Large Icons</a></li><li><a href="" ng-click="viewMode = { desc:\'Medium Icons\', css:\'fa fa-th\', view: \'view-med\' }"><i class="fa fa-th"></i> Medium Icons</a></li><li><a href="" ng-click="viewMode = { desc:\'Details View\', css:\'fa fa-list\', view: \'view-details\' }"><i class="fa fa-list"></i> Details View</a></li><li class=divider></li><li><a href="" ng-click="viewMode = { desc:\'Default View\', css:\'fa fa-th\', view: \'view-med\' }">Use Default</a></li></ul></div></div><h5 ng-if=folders.length>File Folders</h5><div id=files class=files ng-if=folders.length><a href="" class="file centered" ng-click=ctrlExplorer.navigate(itm.path) ng-repeat="itm in folders"><div class=icon><i class="glyphicon glyphicon-folder-open" style="font-size: 32px"></i></div><div class="name ellipsis">{{ itm.name }}</div></a></div><br style="clear:both"><br style="clear:both"><h5 ng-if=files.length>Application Files</h5><div id=files class=files ng-if=files.length><a href="" class="file centered" ng-repeat="itm in files" ng-class="{ \'focus\' : (selected == itm.path)}" ng-click=ctrlExplorer.select(itm.path) ng-dblclick=ctrlExplorer.open(itm.path)><div class=icon ng-switch=itm.type><i ng-switch-default class="fa fa-file-o" style="font-size: 32px"></i> <i ng-switch-when=blank class="fa fa-file-o" style="font-size: 32px"></i> <i ng-switch-when=text class="fa fa-file-text-o" style="font-size: 32px"></i> <i ng-switch-when=image class="fa fa-file-image-o" style="font-size: 32px"></i> <i ng-switch-when=pdf class="fa fa-file-pdf-o" style="font-size: 32px"></i> <i ng-switch-when=css class="fa fa-file-code-o" style="font-size: 32px"></i> <i ng-switch-when=html class="fa fa-file-code-o" style="font-size: 32px"></i> <i ng-switch-when=word class="fa fa-file-word-o" style="font-size: 32px"></i> <i ng-switch-when=powerpoint class="fa fa-file-powerpoint-o" style="font-size: 32px"></i> <i ng-switch-when=movie class="fa fa-file-movie-o" style="font-size: 32px"></i> <i ng-switch-when=excel class="fa fa-file-excel-o" style="font-size: 32px"></i> <i ng-switch-when=compressed class="fa fa-file-archive-o" style="font-size: 32px"></i></div><div class="name ellipsis">{{ itm.name }}</div></a></div></div></div><div ng-show="!isBusy && !appNode.active" class=ng-cloak><br><h5><i class="glyphicon glyphicon-warning-sign"></i> Warning <small>All features not available</small></h5><div class="alert alert-warning"><p><b>Please Note:</b> You are running this from a browser window.</p><p>For security reasons, web browsers do not have permission to use the local file system, or other advanced operating system features.</p><p>To use this application with full functionality, you need an elevated runtime (<a href=/about/info>see this how to</a>).</p></div></div></div></div></div>');
  $templateCache.put('modules/explore/views/externals.tpl.html',
    '<div class=external-links style="width: 100%"><style>.ui-view-main {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '            position: relative;\n' +
    '        }\n' +
    '\n' +
    '        .ui-view-left {\n' +
    '            margin-right: 0 !important;\n' +
    '        }\n' +
    '\n' +
    '        .external-links {\n' +
    '            margin:0;\n' +
    '            left:0;\n' +
    '            right:0;\n' +
    '            bottom:0;\n' +
    '            top:0;\n' +
    '            display:flex;\n' +
    '            position: absolute;\n' +
    '            flex-direction:column;\n' +
    '        }\n' +
    '        .external-iframe {\n' +
    '            margin:0;\n' +
    '            width: 100%; \n' +
    '            flex-grow: 1;\n' +
    '            flex-shrink: 0;\n' +
    '        }</style><div class="btn-group btn-group-sm dock-tight"><div class="input-group input-group-sm"><label for=txtFileName class=input-group-addon><i class="fa fa-globe"></i></label><input id=txtExternalUrl class="cmd-input form-control" tabindex=1 value="{{ linksCtrl.selected.data }}" placeholder="Location not set..." ng-readonly="true || !linksCtrl.selected.data" ng-changed="alert(this)"> <a href="" class="btn btn-default input-group-addon" ng-click=linksCtrl.refreshExternal() ng-disabled=!linksCtrl.selected><i class="fa fa-refresh"></i></a> <a href="" class="btn btn-default input-group-addon" ng-click=linksCtrl.openExternal() ng-disabled=!linksCtrl.selected><i class="fa fa-external-link"></i></a></div></div><iframe id=ExternalExplorerPanel frameborder=0 class=external-iframe ng-if=linksCtrl.selected onerror=console.error(event) ng-src="{{ linksCtrl.selected.data | trustedUrl }}">IFrame not available</iframe></div>');
  $templateCache.put('modules/explore/views/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a ui:sref=proto.explore><i class="fa fa-arrow-circle-left"></i>&nbsp; Site Map Explorer</a></li><li class=list-group-item style="padding: 6px 0" ng-if="state.current.name == \'proto.explore\'"><abn:tree tree-data=navigation.siteExplorer.children icon-leaf="fa fa-file-o" icon-expand="fa fa-plus" icon-collapse="fa fa-minus" expand-level=2></abn:tree></li><li class=list-group-item ui:sref-active=active ng-if=navigation.externalLinks><a ui:sref=proto.links><i class="fa fa-globe"></i>&nbsp; External Links</a></li><li class=list-group-item style="padding: 6px 0; overflow-x:hidden" ng-if="navigation.externalLinks && state.current.name == \'proto.links\'"><abn:tree tree-data=navigation.externalLinks.children icon-leaf="fa fa-globe" icon-expand="fa fa-plus" icon-collapse="fa fa-minus" expand-level=2></abn:tree></li><li class=list-group-item ui:sref-active=active ng-if=navigation.fileSystem><a ui:sref=proto.browser><i class="fa fa-hdd-o"></i>&nbsp; File System Browser</a></li><li class=list-group-item style="padding: 6px 0" ng-if="navigation.fileSystem && state.current.name == \'proto.browser\'"><style resx:import=assets/css/images.min.css></style><div class=info-overview ng-if=!appNode.active><div class=panel-icon-lg><div class="img-drive-warn inactive-gray" style="height: 128px; width: 128px"></div></div></div><div ng-if="appNode.active && navigation.fileSystem"><abn:tree tree-data=navigation.fileSystem.children icon-leaf="fa fa-folder" icon-expand="fa fa-folder" icon-collapse="fa fa-folder-open" expand-level=2></abn:tree></div></li><li class=list-group-item ui:sref-active=active ng-if=navigation.clientStates><a ui:sref=proto.routing><i class="fa fa-tasks"></i>&nbsp; UI State &amp; Routing</a></li><li class=list-group-item style="padding: 6px 0" ng-if="navigation.clientStates && state.current.name == \'proto.routing\'"><abn:tree tree-data=navigation.clientStates icon-leaf="fa fa-cog" icon-expand="fa fa-plus" icon-collapse="fa fa-minus" expand-level=2></abn:tree></li></ul>');
  $templateCache.put('modules/explore/views/main.tpl.html',
    '<div class=contents style="width: 100%"><h5>Explorer</h5><div class=thumbnail ng-if=exploreCtrl.selected><br><br><div class=row><div class=col-md-9><form class=form-horizontal><div class=form-group><label for=inputState class="col-sm-2 control-label">State</label><div class=col-sm-10><input class=form-control id=inputState placeholder=empty ng-model=exploreCtrl.selected.name readonly></div></div><div class=form-group><label for=inputPath class="col-sm-2 control-label">Path</label><div class=col-sm-10><input class=form-control id=inputPath placeholder="not set" ng-model=exploreCtrl.selected.url readonly></div></div><div class=form-group><div class="col-sm-offset-2 col-sm-10"><div class=checkbox><label><input type=checkbox ng-model=exploreCtrl.selected.abstract> Abstract</label></div></div></div><div class=form-group ng-if=exploreCtrl.selected.name><div class="col-sm-offset-2 col-sm-10"><a class="btn btn-default" ng-class="{ \'btn-primary\': !exploreCtrl.selected.abstract }" ui-sref="{{ exploreCtrl.selected.name }}" ng-disabled=exploreCtrl.selected.abstract>Got to page</a></div></div></form></div><div class=col-md-3>{{ exploreCtrl.selection.views }}</div></div></div></div>');
  $templateCache.put('views/common/components/contents.tpl.html',
    '<div id=contents class=contents><div id=left class="ui-view-left ng-cloak" ui:view=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div><div id=main class=ui-view-main ui:view=main><em class=inactive-fill-text ng:if=false><i class="fa fa-spinner fa-spin"></i> Loading...</em> <b class="inactive-fill-text ng-cloak" ng:if="!(state.current.views[\'main\'] || state.current.views[\'main@\'])"><i class="fa fa-exclamation-triangle faa-flash glow-orange"></i> Page not found</b></div></div>');
  $templateCache.put('views/common/components/footer.tpl.html',
    '<div class=footer><span class=pull-left><label class="log-group ng-cloak" ng:show="appState.logs | typeCount:\'error\'"><i class="glyphicon glyphicon-exclamation-sign glow-red"></i> <a ui:sref=proto.logs class=ng-cloak>Errors ({{ appState.logs | typeCount:\'error\' }})</a></label><label class="log-group ng-cloak" ng:show="appState.logs | typeCount:\'warn\'"><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <a ui:sref=proto.logs class=ng-cloak>Warnings ({{ appState.logs | typeCount:\'warn\' }})</a></label></span> <span ng:if=false><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></span> <span ng:if=true class=ng-cloak>Client Version: <span app:version><em>Loading...</em></span> |</span> <span ui:view=foot>Powered by <a href="https://angularjs.org/">AngularJS</a> <span ng:if=appState.node.active class=ng-cloak>&amp; <a href=https://github.com/rogerwang/node-webkit>Node Webkit</a></span></span> <span ng:if=startAt class=ng-cloak>| Started {{ startAt | fromNow }}</span></div>');
  $templateCache.put('views/common/components/left.tpl.html',
    '<div id=left ui:view=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div>');
  $templateCache.put('views/common/components/menu.tpl.html',
    '<div id=menu class=dragable><div ui:view=menu><ul class="nav navbar-nav"><li ui:sref-active=open><a ui:sref=default>Default</a></li><li ui:sref-active=open ng:repeat="route in appState.routers | orderBy:\'(priority || 1)\'" ng:if="route.menuitem && (!route.visible || route.visible())"><a ng:if=route.menuitem.state ui:sref="{{ route.menuitem.state }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a> <a ng:if=!route.menuitem.state ng:href="{{ route.url }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a></li></ul></div></div>');
  $templateCache.put('views/common/docked/container.tpl.html',
    '<div><div class=anim-fade docked:top></div><div docked:icon></div><div class="anim-fade view-panel" docked:left:nav>Left Navigation</div><div class="anim-fade view-panel" docked:container></div><div class=anim-fade docked:footer>Footer</div></div>');
  $templateCache.put('views/common/docked/footer.tpl.html',
    '<div class="anim-fade bottom-spacer"><div class="mask noselect"></div><div class="view-panel bottom-container" ng:transclude></div></div>');
  $templateCache.put('views/common/docked/icon.tpl.html',
    '<div class=top-spacer><div class="mask noselect anim-fade"></div><span class=anim-slide><a href="" ng-click="docker.enabled = !docker.enabled"><i class=fa ng:class="appState.getIcon() + \' \' + appState.getColor()" style="font-size: x-large"></i></a></span></div>');
  $templateCache.put('views/common/docked/left.tpl.html',
    '<div id=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']" class="anim-fade view-panel vertical-spacer right ui-view-left ng-cloak"><div class="mask noselect"></div><div class=left-container ui:view=left></div></div>');
  $templateCache.put('views/common/docked/main.tpl.html',
    '<div id=main ui:view=main class="anim-fade view-panel main-contents ui-view-main" ng:class="{ \'expanded\': !(state.current.views[\'left\'] || state.current.views[\'left@\']) }"><em class=inactive-fill-text ng:if=false><i class="fa fa-spinner fa-spin"></i> Loading...</em> <b class="inactive-fill-text ng-cloak" ng:if="!(state.current.views[\'main\'] || state.current.views[\'main@\'])"><i class="fa fa-exclamation-triangle faa-flash glow-orange"></i> Page not found</b></div>');
  $templateCache.put('views/common/docked/top.tpl.html',
    '<div class="anim-fade top-menu dragable"><div class=view-panel docked:top:left><div><div ui:view=menu><ul class="nav navbar-nav non-dragable pull-right"><li ui:sref-active=hidden><a ui:sref=default><i class="fa fa-chevron-left"></i></a></li><li ui:sref-active=open ng:repeat="route in appState.routers | orderBy:\'(priority || 1)\'" ng:if="route.menuitem && (!route.visible || route.visible())"><a ng:if=route.menuitem.state ui:sref="{{ route.menuitem.state }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a> <a ng:if=!route.menuitem.state ng:href="{{ route.url }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a></li></ul></div></div></div><div class=view-panel docked:top:right><ul class="nav navbar-nav non-dragable pull-left"><li ui:sref-active=open class=disabled><a ui:sref=settings ng:disabled><i class="fa fa-cogs"></i> Settings</a></li><li ui:sref-active=open ng-class="{ \'disabled\': !appState.proxyAvailable(\'test\')}"><a href="" ng:click="appState.setProxy(\'test\')" ng:class="{ \'glow-blue glow-animated\':appState.proxyActive(\'test\') }" ng:disabled="!appState.proxyAvailable(\'test\')"><i class="fa fa-flask"></i> Testing</a></li><li ui:sref-active=open ng-class="{ \'disabled\': !appState.proxyAvailable(\'debug\')}"><a href="" ng:click="appState.setProxy(\'debug\')" ng:class="{ \'glow-orange glow-animated\':appState.proxyActive(\'debug\') }" ng:disabled="!appState.proxyAvailable(\'debug\')"><i class="fa fa-bug"></i> Debugger</a></li></ul><ul class="nav navbar-nav non-dragable pull-right toolbar-ctrls hidden-xs"><li class=ng-cloak><a app:clean href=""><i class="glyphicon glyphicon-refresh"></i></a></li><li class=ng-cloak><a app:debug href=""><i class="glyphicon glyphicon-wrench"></i></a></li><li class=ng-cloak><a app:kiosk href=""><i class="glyphicon glyphicon-fullscreen"></i></a></li><li class=ng-cloak id=btnCloseWindow><a app:close href=""><i class="glyphicon glyphicon-remove"></i></a></li></ul></div></div>');
  $templateCache.put('views/common/docked/topLeft.tpl.html',
    '<div class="top-div view-toolbar left" ng:transclude></div>');
  $templateCache.put('views/common/docked/topRight.tpl.html',
    '<div class="top-div view-toolbar right" ng:transclude></div>');
  $templateCache.put('views/common/sandbox/contents.tpl.html',
    '<div class=main-view-area><div dom:replace ng:include="\'views/common/components/contents.tpl.html\'"></div></div>');
  $templateCache.put('views/common/sandbox/footer.tpl.html',
    '<div class=bottom-spacer><div class=mask></div><div style="padding: 6px; text-align:center; z-index: 1000"><div dom:replace ng:include="\'views/common/components/footer.tpl.html\'"></div></div></div>');
  $templateCache.put('views/common/sandbox/menu.tpl.html',
    '<div class="top-menu dragable"><div class="top-div pull-left" style="padding-right: 32px"><div><div ui:view=menu><ul class="nav navbar-nav non-dragable pull-right"><li ui:sref-active=hidden><a ui:sref=default><i class="fa fa-chevron-left"></i></a></li><li ui:sref-active=open ng:repeat="route in appState.routers | orderBy:\'(priority || 1)\'" ng:if="route.menuitem && (!route.visible || route.visible())"><a ng:if=route.menuitem.state ui:sref="{{ route.menuitem.state }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a> <a ng:if=!route.menuitem.state ng:href="{{ route.url }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a></li></ul></div></div></div><div class="top-div pull-right" style="padding-left: 32px"><ul class="nav navbar-nav non-dragable pull-left"><li ui:sref-active=open class=disabled><a ui:sref=settings ng:disabled><i class="fa fa-cogs"></i> Settings</a></li><li ui:sref-active=open ng-class="{ \'disabled\': !appState.proxyAvailable(\'test\')}"><a href="" ng:click="appState.setProxy(\'test\')" ng:class="{ \'glow-blue glow-animated\':appState.proxyActive(\'test\') }" ng:disabled="!appState.proxyAvailable(\'test\')"><i class="fa fa-flask"></i> Testing</a></li><li ui:sref-active=open ng-class="{ \'disabled\': !appState.proxyAvailable(\'debug\')}"><a href="" ng:click="appState.setProxy(\'debug\')" ng:class="{ \'glow-orange glow-animated\':appState.proxyActive(\'debug\') }" ng:disabled="!appState.proxyAvailable(\'debug\')"><i class="fa fa-bug"></i> Debugger</a></li></ul><ul class="nav navbar-nav non-dragable pull-right toolbar-ctrls hidden-xs"><li class=ng-cloak><a app:clean href=""><i class="glyphicon glyphicon-refresh"></i></a></li><li class=ng-cloak><a app:debug href=""><i class="glyphicon glyphicon-wrench"></i></a></li><li class=ng-cloak><a app:kiosk href=""><i class="glyphicon glyphicon-fullscreen"></i></a></li><li class=ng-cloak id=btnCloseWindow><a app:close href=""><i class="glyphicon glyphicon-remove"></i></a></li></ul></div></div><div class=top-spacer><div class=mask></div><a class=top-spacer-icon href=""><i class="fa fa-2x" ng:class="appState.getIcon() + \' \' + appState.getColor()"></i></a></div>');
  $templateCache.put('views/default.tpl.html',
    '<div id=cardViewer class="docked float-left card-view card-view-x"><style resx:import=assets/css/prototyped.min.css></style><style>.contents {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '            background: #E0E0E0!important;\n' +
    '            -webkit-user-select: none;\n' +
    '        }</style><div class="slider docked"><a class="arrow prev" href="" ng-show=false ng-click=cardView.showPrev()><i class="glyphicon glyphicon-chevron-left"></i></a> <a class="arrow next" href="" ng-show=false ng-click=cardView.showNext()><i class="glyphicon glyphicon-chevron-right"></i></a><div class=boxed><a class="card fixed-width slide" href="" ng-click=appState.navigate(route) ng-if="route.cardview && (!route.visible || route.visible())" ng-class="{ \'inactive-gray-25\': route.cardview.ready === false }" ng-repeat="route in cardView.pages | orderBy:\'(priority || 1)\'" ng-class="{ \'active\': cardView.isActive($index) }" ng-swipe-right=cardView.showPrev() ng-swipe-left=cardView.showNext()><div class=card-image ng-class=route.cardview.style><div class=banner></div><h2>{{route.cardview.title}}</h2></div><p>{{route.cardview.desc}}</p></a></div><ul class="small-only slider-nav"><li ng-repeat="page in cardView.pages" ng-class="{\'active\':isActive($index)}"><a href="" ng-click=cardView.showItem($index); title={{page.title}}><i class="glyphicon glyphicon-file"></i></a></li></ul></div></div>');
}]);
;angular.module('prototyped.ng.styles', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('assets/css/animate.min.css',
    "@charset \"UTF-8\";/*!\n" +
    "Animate.css - http://daneden.me/animate\n" +
    "Licensed under the MIT license - http://opensource.org/licenses/MIT\n" +
    "\n" +
    "Copyright (c) 2015 Daniel Eden\n" +
    "*/.animated{-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}.animated.infinite{-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}.animated.hinge{-webkit-animation-duration:2s;animation-duration:2s}.animated.bounceIn,.animated.bounceOut,.animated.flipOutX,.animated.flipOutY{-webkit-animation-duration:.75s;animation-duration:.75s}@-webkit-keyframes bounce{0%,100%,20%,53%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}40%,43%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-30px,0);transform:translate3d(0,-30px,0)}70%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-15px,0);transform:translate3d(0,-15px,0)}90%{-webkit-transform:translate3d(0,-4px,0);transform:translate3d(0,-4px,0)}}@keyframes bounce{0%,100%,20%,53%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}40%,43%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-30px,0);transform:translate3d(0,-30px,0)}70%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-15px,0);transform:translate3d(0,-15px,0)}90%{-webkit-transform:translate3d(0,-4px,0);transform:translate3d(0,-4px,0)}}.bounce{-webkit-animation-name:bounce;animation-name:bounce;-webkit-transform-origin:center bottom;transform-origin:center bottom}@-webkit-keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}.flash{-webkit-animation-name:flash;animation-name:flash}@-webkit-keyframes pulse{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}50%{-webkit-transform:scale3d(1.05,1.05,1.05);transform:scale3d(1.05,1.05,1.05)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes pulse{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}50%{-webkit-transform:scale3d(1.05,1.05,1.05);transform:scale3d(1.05,1.05,1.05)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.pulse{-webkit-animation-name:pulse;animation-name:pulse}@-webkit-keyframes rubberBand{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}30%{-webkit-transform:scale3d(1.25,.75,1);transform:scale3d(1.25,.75,1)}40%{-webkit-transform:scale3d(0.75,1.25,1);transform:scale3d(0.75,1.25,1)}50%{-webkit-transform:scale3d(1.15,.85,1);transform:scale3d(1.15,.85,1)}65%{-webkit-transform:scale3d(.95,1.05,1);transform:scale3d(.95,1.05,1)}75%{-webkit-transform:scale3d(1.05,.95,1);transform:scale3d(1.05,.95,1)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes rubberBand{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}30%{-webkit-transform:scale3d(1.25,.75,1);transform:scale3d(1.25,.75,1)}40%{-webkit-transform:scale3d(0.75,1.25,1);transform:scale3d(0.75,1.25,1)}50%{-webkit-transform:scale3d(1.15,.85,1);transform:scale3d(1.15,.85,1)}65%{-webkit-transform:scale3d(.95,1.05,1);transform:scale3d(.95,1.05,1)}75%{-webkit-transform:scale3d(1.05,.95,1);transform:scale3d(1.05,.95,1)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.rubberBand{-webkit-animation-name:rubberBand;animation-name:rubberBand}@-webkit-keyframes shake{0%,100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}20%,40%,60%,80%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}}@keyframes shake{0%,100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}20%,40%,60%,80%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}}.shake{-webkit-animation-name:shake;animation-name:shake}@-webkit-keyframes swing{20%{-webkit-transform:rotate3d(0,0,1,15deg);transform:rotate3d(0,0,1,15deg)}40%{-webkit-transform:rotate3d(0,0,1,-10deg);transform:rotate3d(0,0,1,-10deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}100%{-webkit-transform:rotate3d(0,0,1,0deg);transform:rotate3d(0,0,1,0deg)}}@keyframes swing{20%{-webkit-transform:rotate3d(0,0,1,15deg);transform:rotate3d(0,0,1,15deg)}40%{-webkit-transform:rotate3d(0,0,1,-10deg);transform:rotate3d(0,0,1,-10deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}100%{-webkit-transform:rotate3d(0,0,1,0deg);transform:rotate3d(0,0,1,0deg)}}.swing{-webkit-transform-origin:top center;transform-origin:top center;-webkit-animation-name:swing;animation-name:swing}@-webkit-keyframes tada{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}10%,20%{-webkit-transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg);transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes tada{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}10%,20%{-webkit-transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg);transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.tada{-webkit-animation-name:tada;animation-name:tada}@-webkit-keyframes wobble{0%{-webkit-transform:none;transform:none}15%{-webkit-transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg);transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{-webkit-transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg);transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{-webkit-transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg);transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{-webkit-transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg);transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{-webkit-transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg);transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}100%{-webkit-transform:none;transform:none}}@keyframes wobble{0%{-webkit-transform:none;transform:none}15%{-webkit-transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg);transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{-webkit-transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg);transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{-webkit-transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg);transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{-webkit-transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg);transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{-webkit-transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg);transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}100%{-webkit-transform:none;transform:none}}.wobble{-webkit-animation-name:wobble;animation-name:wobble}@-webkit-keyframes jello{11.1%{-webkit-transform:none;transform:none}22.2%{-webkit-transform:skewX(-12.5deg) skewY(-12.5deg);transform:skewX(-12.5deg) skewY(-12.5deg)}33.3%{-webkit-transform:skewX(6.25deg) skewY(6.25deg);transform:skewX(6.25deg) skewY(6.25deg)}44.4%{-webkit-transform:skewX(-3.125deg) skewY(-3.125deg);transform:skewX(-3.125deg) skewY(-3.125deg)}55.5%{-webkit-transform:skewX(1.5625deg) skewY(1.5625deg);transform:skewX(1.5625deg) skewY(1.5625deg)}66.6%{-webkit-transform:skewX(-.78125deg) skewY(-.78125deg);transform:skewX(-.78125deg) skewY(-.78125deg)}77.7%{-webkit-transform:skewX(0.390625deg) skewY(0.390625deg);transform:skewX(0.390625deg) skewY(0.390625deg)}88.8%{-webkit-transform:skewX(-.1953125deg) skewY(-.1953125deg);transform:skewX(-.1953125deg) skewY(-.1953125deg)}100%{-webkit-transform:none;transform:none}}@keyframes jello{11.1%{-webkit-transform:none;transform:none}22.2%{-webkit-transform:skewX(-12.5deg) skewY(-12.5deg);transform:skewX(-12.5deg) skewY(-12.5deg)}33.3%{-webkit-transform:skewX(6.25deg) skewY(6.25deg);transform:skewX(6.25deg) skewY(6.25deg)}44.4%{-webkit-transform:skewX(-3.125deg) skewY(-3.125deg);transform:skewX(-3.125deg) skewY(-3.125deg)}55.5%{-webkit-transform:skewX(1.5625deg) skewY(1.5625deg);transform:skewX(1.5625deg) skewY(1.5625deg)}66.6%{-webkit-transform:skewX(-.78125deg) skewY(-.78125deg);transform:skewX(-.78125deg) skewY(-.78125deg)}77.7%{-webkit-transform:skewX(0.390625deg) skewY(0.390625deg);transform:skewX(0.390625deg) skewY(0.390625deg)}88.8%{-webkit-transform:skewX(-.1953125deg) skewY(-.1953125deg);transform:skewX(-.1953125deg) skewY(-.1953125deg)}100%{-webkit-transform:none;transform:none}}.jello{-webkit-animation-name:jello;animation-name:jello;-webkit-transform-origin:center;transform-origin:center}@-webkit-keyframes bounceIn{0%,100%,20%,40%,60%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}20%{-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}40%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}60%{opacity:1;-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}80%{-webkit-transform:scale3d(.97,.97,.97);transform:scale3d(.97,.97,.97)}100%{opacity:1;-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes bounceIn{0%,100%,20%,40%,60%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}20%{-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}40%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}60%{opacity:1;-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}80%{-webkit-transform:scale3d(.97,.97,.97);transform:scale3d(.97,.97,.97)}100%{opacity:1;-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.bounceIn{-webkit-animation-name:bounceIn;animation-name:bounceIn}@-webkit-keyframes bounceInDown{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,-3000px,0);transform:translate3d(0,-3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,25px,0);transform:translate3d(0,25px,0)}75%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}90%{-webkit-transform:translate3d(0,5px,0);transform:translate3d(0,5px,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInDown{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,-3000px,0);transform:translate3d(0,-3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,25px,0);transform:translate3d(0,25px,0)}75%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}90%{-webkit-transform:translate3d(0,5px,0);transform:translate3d(0,5px,0)}100%{-webkit-transform:none;transform:none}}.bounceInDown{-webkit-animation-name:bounceInDown;animation-name:bounceInDown}@-webkit-keyframes bounceInLeft{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(-3000px,0,0);transform:translate3d(-3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(25px,0,0);transform:translate3d(25px,0,0)}75%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}90%{-webkit-transform:translate3d(5px,0,0);transform:translate3d(5px,0,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInLeft{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(-3000px,0,0);transform:translate3d(-3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(25px,0,0);transform:translate3d(25px,0,0)}75%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}90%{-webkit-transform:translate3d(5px,0,0);transform:translate3d(5px,0,0)}100%{-webkit-transform:none;transform:none}}.bounceInLeft{-webkit-animation-name:bounceInLeft;animation-name:bounceInLeft}@-webkit-keyframes bounceInRight{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(3000px,0,0);transform:translate3d(3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(-25px,0,0);transform:translate3d(-25px,0,0)}75%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}90%{-webkit-transform:translate3d(-5px,0,0);transform:translate3d(-5px,0,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInRight{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(3000px,0,0);transform:translate3d(3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(-25px,0,0);transform:translate3d(-25px,0,0)}75%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}90%{-webkit-transform:translate3d(-5px,0,0);transform:translate3d(-5px,0,0)}100%{-webkit-transform:none;transform:none}}.bounceInRight{-webkit-animation-name:bounceInRight;animation-name:bounceInRight}@-webkit-keyframes bounceInUp{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,3000px,0);transform:translate3d(0,3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}75%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}90%{-webkit-transform:translate3d(0,-5px,0);transform:translate3d(0,-5px,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes bounceInUp{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,3000px,0);transform:translate3d(0,3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}75%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}90%{-webkit-transform:translate3d(0,-5px,0);transform:translate3d(0,-5px,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.bounceInUp{-webkit-animation-name:bounceInUp;animation-name:bounceInUp}@-webkit-keyframes bounceOut{20%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}}@keyframes bounceOut{20%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}}.bounceOut{-webkit-animation-name:bounceOut;animation-name:bounceOut}@-webkit-keyframes bounceOutDown{20%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}@keyframes bounceOutDown{20%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}.bounceOutDown{-webkit-animation-name:bounceOutDown;animation-name:bounceOutDown}@-webkit-keyframes bounceOutLeft{20%{opacity:1;-webkit-transform:translate3d(20px,0,0);transform:translate3d(20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}@keyframes bounceOutLeft{20%{opacity:1;-webkit-transform:translate3d(20px,0,0);transform:translate3d(20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}.bounceOutLeft{-webkit-animation-name:bounceOutLeft;animation-name:bounceOutLeft}@-webkit-keyframes bounceOutRight{20%{opacity:1;-webkit-transform:translate3d(-20px,0,0);transform:translate3d(-20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}@keyframes bounceOutRight{20%{opacity:1;-webkit-transform:translate3d(-20px,0,0);transform:translate3d(-20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}.bounceOutRight{-webkit-animation-name:bounceOutRight;animation-name:bounceOutRight}@-webkit-keyframes bounceOutUp{20%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,20px,0);transform:translate3d(0,20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}@keyframes bounceOutUp{20%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,20px,0);transform:translate3d(0,20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}.bounceOutUp{-webkit-animation-name:bounceOutUp;animation-name:bounceOutUp}@-webkit-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}.fadeIn{-webkit-animation-name:fadeIn;animation-name:fadeIn}@-webkit-keyframes fadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDown{-webkit-animation-name:fadeInDown;animation-name:fadeInDown}@-webkit-keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDownBig{-webkit-animation-name:fadeInDownBig;animation-name:fadeInDownBig}@-webkit-keyframes fadeInLeft{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInLeft{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInLeft{-webkit-animation-name:fadeInLeft;animation-name:fadeInLeft}@-webkit-keyframes fadeInLeftBig{0%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInLeftBig{0%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInLeftBig{-webkit-animation-name:fadeInLeftBig;animation-name:fadeInLeftBig}@-webkit-keyframes fadeInRight{0%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInRight{0%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInRight{-webkit-animation-name:fadeInRight;animation-name:fadeInRight}@-webkit-keyframes fadeInRightBig{0%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInRightBig{0%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInRightBig{-webkit-animation-name:fadeInRightBig;animation-name:fadeInRightBig}@-webkit-keyframes fadeInUp{0%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInUp{0%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInUp{-webkit-animation-name:fadeInUp;animation-name:fadeInUp}@-webkit-keyframes fadeInUpBig{0%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInUpBig{0%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInUpBig{-webkit-animation-name:fadeInUpBig;animation-name:fadeInUpBig}@-webkit-keyframes fadeOut{0%{opacity:1}100%{opacity:0}}@keyframes fadeOut{0%{opacity:1}100%{opacity:0}}.fadeOut{-webkit-animation-name:fadeOut;animation-name:fadeOut}@-webkit-keyframes fadeOutDown{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}@keyframes fadeOutDown{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}.fadeOutDown{-webkit-animation-name:fadeOutDown;animation-name:fadeOutDown}@-webkit-keyframes fadeOutDownBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}@keyframes fadeOutDownBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}.fadeOutDownBig{-webkit-animation-name:fadeOutDownBig;animation-name:fadeOutDownBig}@-webkit-keyframes fadeOutLeft{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}@keyframes fadeOutLeft{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}.fadeOutLeft{-webkit-animation-name:fadeOutLeft;animation-name:fadeOutLeft}@-webkit-keyframes fadeOutLeftBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}@keyframes fadeOutLeftBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}.fadeOutLeftBig{-webkit-animation-name:fadeOutLeftBig;animation-name:fadeOutLeftBig}@-webkit-keyframes fadeOutRight{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}@keyframes fadeOutRight{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}.fadeOutRight{-webkit-animation-name:fadeOutRight;animation-name:fadeOutRight}@-webkit-keyframes fadeOutRightBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}@keyframes fadeOutRightBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}.fadeOutRightBig{-webkit-animation-name:fadeOutRightBig;animation-name:fadeOutRightBig}@-webkit-keyframes fadeOutUp{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes fadeOutUp{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.fadeOutUp{-webkit-animation-name:fadeOutUp;animation-name:fadeOutUp}@-webkit-keyframes fadeOutUpBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}@keyframes fadeOutUpBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}.fadeOutUpBig{-webkit-animation-name:fadeOutUpBig;animation-name:fadeOutUpBig}@-webkit-keyframes flip{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-360deg);transform:perspective(400px) rotate3d(0,1,0,-360deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}40%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}50%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}80%{-webkit-transform:perspective(400px) scale3d(.95,.95,.95);transform:perspective(400px) scale3d(.95,.95,.95);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}100%{-webkit-transform:perspective(400px);transform:perspective(400px);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}}@keyframes flip{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-360deg);transform:perspective(400px) rotate3d(0,1,0,-360deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}40%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}50%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}80%{-webkit-transform:perspective(400px) scale3d(.95,.95,.95);transform:perspective(400px) scale3d(.95,.95,.95);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}100%{-webkit-transform:perspective(400px);transform:perspective(400px);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}}.animated.flip{-webkit-backface-visibility:visible;backface-visibility:visible;-webkit-animation-name:flip;animation-name:flip}@-webkit-keyframes flipInX{0%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(1,0,0,10deg);transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-5deg);transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}@keyframes flipInX{0%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(1,0,0,10deg);transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-5deg);transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}.flipInX{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipInX;animation-name:flipInX}@-webkit-keyframes flipInY{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-20deg);transform:perspective(400px) rotate3d(0,1,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(0,1,0,10deg);transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-5deg);transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}@keyframes flipInY{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-20deg);transform:perspective(400px) rotate3d(0,1,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(0,1,0,10deg);transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-5deg);transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}.flipInY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipInY;animation-name:flipInY}@-webkit-keyframes flipOutX{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}@keyframes flipOutX{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}.flipOutX{-webkit-animation-name:flipOutX;animation-name:flipOutX;-webkit-backface-visibility:visible!important;backface-visibility:visible!important}@-webkit-keyframes flipOutY{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-15deg);transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}@keyframes flipOutY{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-15deg);transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}.flipOutY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipOutY;animation-name:flipOutY}@-webkit-keyframes lightSpeedIn{0%{-webkit-transform:translate3d(100%,0,0) skewX(-30deg);transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{-webkit-transform:skewX(20deg);transform:skewX(20deg);opacity:1}80%{-webkit-transform:skewX(-5deg);transform:skewX(-5deg);opacity:1}100%{-webkit-transform:none;transform:none;opacity:1}}@keyframes lightSpeedIn{0%{-webkit-transform:translate3d(100%,0,0) skewX(-30deg);transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{-webkit-transform:skewX(20deg);transform:skewX(20deg);opacity:1}80%{-webkit-transform:skewX(-5deg);transform:skewX(-5deg);opacity:1}100%{-webkit-transform:none;transform:none;opacity:1}}.lightSpeedIn{-webkit-animation-name:lightSpeedIn;animation-name:lightSpeedIn;-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}@-webkit-keyframes lightSpeedOut{0%{opacity:1}100%{-webkit-transform:translate3d(100%,0,0) skewX(30deg);transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}@keyframes lightSpeedOut{0%{opacity:1}100%{-webkit-transform:translate3d(100%,0,0) skewX(30deg);transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}.lightSpeedOut{-webkit-animation-name:lightSpeedOut;animation-name:lightSpeedOut;-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}@-webkit-keyframes rotateIn{0%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,-200deg);transform:rotate3d(0,0,1,-200deg);opacity:0}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateIn{0%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,-200deg);transform:rotate3d(0,0,1,-200deg);opacity:0}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:none;transform:none;opacity:1}}.rotateIn{-webkit-animation-name:rotateIn;animation-name:rotateIn}@-webkit-keyframes rotateInDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInDownLeft{-webkit-animation-name:rotateInDownLeft;animation-name:rotateInDownLeft}@-webkit-keyframes rotateInDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInDownRight{-webkit-animation-name:rotateInDownRight;animation-name:rotateInDownRight}@-webkit-keyframes rotateInUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInUpLeft{-webkit-animation-name:rotateInUpLeft;animation-name:rotateInUpLeft}@-webkit-keyframes rotateInUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-90deg);transform:rotate3d(0,0,1,-90deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-90deg);transform:rotate3d(0,0,1,-90deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInUpRight{-webkit-animation-name:rotateInUpRight;animation-name:rotateInUpRight}@-webkit-keyframes rotateOut{0%{-webkit-transform-origin:center;transform-origin:center;opacity:1}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,200deg);transform:rotate3d(0,0,1,200deg);opacity:0}}@keyframes rotateOut{0%{-webkit-transform-origin:center;transform-origin:center;opacity:1}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,200deg);transform:rotate3d(0,0,1,200deg);opacity:0}}.rotateOut{-webkit-animation-name:rotateOut;animation-name:rotateOut}@-webkit-keyframes rotateOutDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}}@keyframes rotateOutDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}}.rotateOutDownLeft{-webkit-animation-name:rotateOutDownLeft;animation-name:rotateOutDownLeft}@-webkit-keyframes rotateOutDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes rotateOutDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}.rotateOutDownRight{-webkit-animation-name:rotateOutDownRight;animation-name:rotateOutDownRight}@-webkit-keyframes rotateOutUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes rotateOutUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}.rotateOutUpLeft{-webkit-animation-name:rotateOutUpLeft;animation-name:rotateOutUpLeft}@-webkit-keyframes rotateOutUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,90deg);transform:rotate3d(0,0,1,90deg);opacity:0}}@keyframes rotateOutUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,90deg);transform:rotate3d(0,0,1,90deg);opacity:0}}.rotateOutUpRight{-webkit-animation-name:rotateOutUpRight;animation-name:rotateOutUpRight}@-webkit-keyframes hinge{0%{-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}20%,60%{-webkit-transform:rotate3d(0,0,1,80deg);transform:rotate3d(0,0,1,80deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}40%,80%{-webkit-transform:rotate3d(0,0,1,60deg);transform:rotate3d(0,0,1,60deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out;opacity:1}100%{-webkit-transform:translate3d(0,700px,0);transform:translate3d(0,700px,0);opacity:0}}@keyframes hinge{0%{-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}20%,60%{-webkit-transform:rotate3d(0,0,1,80deg);transform:rotate3d(0,0,1,80deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}40%,80%{-webkit-transform:rotate3d(0,0,1,60deg);transform:rotate3d(0,0,1,60deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out;opacity:1}100%{-webkit-transform:translate3d(0,700px,0);transform:translate3d(0,700px,0);opacity:0}}.hinge{-webkit-animation-name:hinge;animation-name:hinge}@-webkit-keyframes rollIn{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg);transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes rollIn{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg);transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;-webkit-transform:none;transform:none}}.rollIn{-webkit-animation-name:rollIn;animation-name:rollIn}@-webkit-keyframes rollOut{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg);transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}@keyframes rollOut{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg);transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}.rollOut{-webkit-animation-name:rollOut;animation-name:rollOut}@-webkit-keyframes zoomIn{0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes zoomIn{0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}50%{opacity:1}}.zoomIn{-webkit-animation-name:zoomIn;animation-name:zoomIn}@-webkit-keyframes zoomInDown{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInDown{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInDown{-webkit-animation-name:zoomInDown;animation-name:zoomInDown}@-webkit-keyframes zoomInLeft{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(10px,0,0);transform:scale3d(.475,.475,.475) translate3d(10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInLeft{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(10px,0,0);transform:scale3d(.475,.475,.475) translate3d(10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInLeft{-webkit-animation-name:zoomInLeft;animation-name:zoomInLeft}@-webkit-keyframes zoomInRight{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInRight{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInRight{-webkit-animation-name:zoomInRight;animation-name:zoomInRight}@-webkit-keyframes zoomInUp{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInUp{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInUp{-webkit-animation-name:zoomInUp;animation-name:zoomInUp}@-webkit-keyframes zoomOut{0%{opacity:1}50%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}100%{opacity:0}}@keyframes zoomOut{0%{opacity:1}50%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}100%{opacity:0}}.zoomOut{-webkit-animation-name:zoomOut;animation-name:zoomOut}@-webkit-keyframes zoomOutDown{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomOutDown{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomOutDown{-webkit-animation-name:zoomOutDown;animation-name:zoomOutDown}@-webkit-keyframes zoomOutLeft{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(42px,0,0);transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(-2000px,0,0);transform:scale(.1) translate3d(-2000px,0,0);-webkit-transform-origin:left center;transform-origin:left center}}@keyframes zoomOutLeft{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(42px,0,0);transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(-2000px,0,0);transform:scale(.1) translate3d(-2000px,0,0);-webkit-transform-origin:left center;transform-origin:left center}}.zoomOutLeft{-webkit-animation-name:zoomOutLeft;animation-name:zoomOutLeft}@-webkit-keyframes zoomOutRight{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-42px,0,0);transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(2000px,0,0);transform:scale(.1) translate3d(2000px,0,0);-webkit-transform-origin:right center;transform-origin:right center}}@keyframes zoomOutRight{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-42px,0,0);transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(2000px,0,0);transform:scale(.1) translate3d(2000px,0,0);-webkit-transform-origin:right center;transform-origin:right center}}.zoomOutRight{-webkit-animation-name:zoomOutRight;animation-name:zoomOutRight}@-webkit-keyframes zoomOutUp{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomOutUp{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomOutUp{-webkit-animation-name:zoomOutUp;animation-name:zoomOutUp}@-webkit-keyframes slideInDown{0%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInDown{0%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInDown{-webkit-animation-name:slideInDown;animation-name:slideInDown}@-webkit-keyframes slideInLeft{0%{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInLeft{0%{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInLeft{-webkit-animation-name:slideInLeft;animation-name:slideInLeft}@-webkit-keyframes slideInRight{0%{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInRight{0%{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInRight{-webkit-animation-name:slideInRight;animation-name:slideInRight}@-webkit-keyframes slideInUp{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInUp{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInUp{-webkit-animation-name:slideInUp;animation-name:slideInUp}@-webkit-keyframes slideOutDown{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}@keyframes slideOutDown{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}.slideOutDown{-webkit-animation-name:slideOutDown;animation-name:slideOutDown}@-webkit-keyframes slideOutLeft{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}@keyframes slideOutLeft{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}.slideOutLeft{-webkit-animation-name:slideOutLeft;animation-name:slideOutLeft}@-webkit-keyframes slideOutRight{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}@keyframes slideOutRight{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}.slideOutRight{-webkit-animation-name:slideOutRight;animation-name:slideOutRight}@-webkit-keyframes slideOutUp{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes slideOutUp{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.slideOutUp{-webkit-animation-name:slideOutUp;animation-name:slideOutUp}"
  );


  $templateCache.put('assets/css/app.min.css',
    "body{display:flex;flex-direction:column}#menu{margin:6px;padding:3px;display:block}#menu ul{margin:0;padding:0}#menu ul li{margin:0;padding:0;display:inline;list-style:none}#menu ul li a{text-decoration:none}#contents{display:flex;flex-direction:row;min-height:520px}#left{margin:0;padding:3px;flex-grow:0;flex-shrink:0;flex-basis:210px}#main{margin:0;padding:3px;flex-grow:1;flex-shrink:1}#main h2{margin:0;padding:3px 0;font-size:18px;font-weight:700}#main h5{margin:0 0 6px;padding:3px;border-bottom:solid 1px #f2f2f2;font-weight:bolder}#main h5 small{text-wrap:avoid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#main hr{margin:8px 0}#main .centered{text-align:center}#footer{margin:6px;padding:3px;flex-grow:0;flex-shrink:0;flex-basis:24px;border:dotted 1px gray}"
  );


  $templateCache.put('assets/css/font-awesome-animation.min.css',
    "/*!\n" +
    " * font-awesome-animation - v0.0.7\n" +
    " * https://github.com/l-lin/font-awesome-animation\n" +
    " * License: MIT\n" +
    " */\n" +
    "\n" +
    "@-webkit-keyframes wrench{0%{-webkit-transform:rotate(-12deg);transform:rotate(-12deg)}8%{-webkit-transform:rotate(12deg);transform:rotate(12deg)}10%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}18%,20%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}28%,30%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}38%,40%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}48%,50%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}58%,60%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}68%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}75%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes wrench{0%{-webkit-transform:rotate(-12deg);-ms-transform:rotate(-12deg);transform:rotate(-12deg)}8%{-webkit-transform:rotate(12deg);-ms-transform:rotate(12deg);transform:rotate(12deg)}10%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}18%,20%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}28%,30%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}38%,40%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}48%,50%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}58%,60%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}68%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}75%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}}.faa-parent.animated-hover:hover>.faa-wrench,.faa-wrench.animated,.faa-wrench.animated-hover:hover{-webkit-animation:wrench 2.5s ease infinite;animation:wrench 2.5s ease infinite;transform-origin-x:90%;transform-origin-y:35%;transform-origin-z:initial}.faa-parent.animated-hover:hover>.faa-wrench.faa-fast,.faa-wrench.animated-hover.faa-fast:hover,.faa-wrench.animated.faa-fast{-webkit-animation:wrench 1.2s ease infinite;animation:wrench 1.2s ease infinite}.faa-parent.animated-hover:hover>.faa-wrench.faa-slow,.faa-wrench.animated-hover.faa-slow:hover,.faa-wrench.animated.faa-slow{-webkit-animation:wrench 3.7s ease infinite;animation:wrench 3.7s ease infinite}@-webkit-keyframes ring{0%{-webkit-transform:rotate(-15deg);transform:rotate(-15deg)}2%{-webkit-transform:rotate(15deg);transform:rotate(15deg)}4%{-webkit-transform:rotate(-18deg);transform:rotate(-18deg)}6%{-webkit-transform:rotate(18deg);transform:rotate(18deg)}8%{-webkit-transform:rotate(-22deg);transform:rotate(-22deg)}10%{-webkit-transform:rotate(22deg);transform:rotate(22deg)}12%{-webkit-transform:rotate(-18deg);transform:rotate(-18deg)}14%{-webkit-transform:rotate(18deg);transform:rotate(18deg)}16%{-webkit-transform:rotate(-12deg);transform:rotate(-12deg)}18%{-webkit-transform:rotate(12deg);transform:rotate(12deg)}20%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes ring{0%{-webkit-transform:rotate(-15deg);-ms-transform:rotate(-15deg);transform:rotate(-15deg)}2%{-webkit-transform:rotate(15deg);-ms-transform:rotate(15deg);transform:rotate(15deg)}4%{-webkit-transform:rotate(-18deg);-ms-transform:rotate(-18deg);transform:rotate(-18deg)}6%{-webkit-transform:rotate(18deg);-ms-transform:rotate(18deg);transform:rotate(18deg)}8%{-webkit-transform:rotate(-22deg);-ms-transform:rotate(-22deg);transform:rotate(-22deg)}10%{-webkit-transform:rotate(22deg);-ms-transform:rotate(22deg);transform:rotate(22deg)}12%{-webkit-transform:rotate(-18deg);-ms-transform:rotate(-18deg);transform:rotate(-18deg)}14%{-webkit-transform:rotate(18deg);-ms-transform:rotate(18deg);transform:rotate(18deg)}16%{-webkit-transform:rotate(-12deg);-ms-transform:rotate(-12deg);transform:rotate(-12deg)}18%{-webkit-transform:rotate(12deg);-ms-transform:rotate(12deg);transform:rotate(12deg)}20%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}}.faa-parent.animated-hover:hover>.faa-ring,.faa-ring.animated,.faa-ring.animated-hover:hover{-webkit-animation:ring 2s ease infinite;animation:ring 2s ease infinite;transform-origin-x:50%;transform-origin-y:0;transform-origin-z:initial}.faa-parent.animated-hover:hover>.faa-ring.faa-fast,.faa-ring.animated-hover.faa-fast:hover,.faa-ring.animated.faa-fast{-webkit-animation:ring 1s ease infinite;animation:ring 1s ease infinite}.faa-parent.animated-hover:hover>.faa-ring.faa-slow,.faa-ring.animated-hover.faa-slow:hover,.faa-ring.animated.faa-slow{-webkit-animation:ring 3s ease infinite;animation:ring 3s ease infinite}@-webkit-keyframes vertical{0%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}4%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}8%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}12%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}16%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}20%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}22%{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes vertical{0%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}4%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}8%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}12%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}16%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}20%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}22%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}}.faa-parent.animated-hover:hover>.faa-vertical,.faa-vertical.animated,.faa-vertical.animated-hover:hover{-webkit-animation:vertical 2s ease infinite;animation:vertical 2s ease infinite}.faa-parent.animated-hover:hover>.faa-vertical.faa-fast,.faa-vertical.animated-hover.faa-fast:hover,.faa-vertical.animated.faa-fast{-webkit-animation:vertical 1s ease infinite;animation:vertical 1s ease infinite}.faa-parent.animated-hover:hover>.faa-vertical.faa-slow,.faa-vertical.animated-hover.faa-slow:hover,.faa-vertical.animated.faa-slow{-webkit-animation:vertical 4s ease infinite;animation:vertical 4s ease infinite}@-webkit-keyframes horizontal{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}6%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}12%{-webkit-transform:translate(0,0);transform:translate(0,0)}18%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}24%{-webkit-transform:translate(0,0);transform:translate(0,0)}30%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}36%{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes horizontal{0%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}6%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}12%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}18%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}24%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}30%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}36%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}}.faa-horizontal.animated,.faa-horizontal.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-horizontal{-webkit-animation:horizontal 2s ease infinite;animation:horizontal 2s ease infinite}.faa-horizontal.animated-hover.faa-fast:hover,.faa-horizontal.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-horizontal.faa-fast{-webkit-animation:horizontal 1s ease infinite;animation:horizontal 1s ease infinite}.faa-horizontal.animated-hover.faa-slow:hover,.faa-horizontal.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-horizontal.faa-slow{-webkit-animation:horizontal 3s ease infinite;animation:horizontal 3s ease infinite}@-webkit-keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}.faa-flash.animated,.faa-flash.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-flash{-webkit-animation:flash 2s ease infinite;animation:flash 2s ease infinite}.faa-flash.animated-hover.faa-fast:hover,.faa-flash.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-flash.faa-fast{-webkit-animation:flash 1s ease infinite;animation:flash 1s ease infinite}.faa-flash.animated-hover.faa-slow:hover,.faa-flash.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-flash.faa-slow{-webkit-animation:flash 3s ease infinite;animation:flash 3s ease infinite}@-webkit-keyframes bounce{0%,10%,20%,50%,80%{-webkit-transform:translateY(0);transform:translateY(0)}40%,60%{-webkit-transform:translateY(-15px);transform:translateY(-15px)}}@keyframes bounce{0%,10%,20%,50%,80%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}40%,60%{-webkit-transform:translateY(-15px);-ms-transform:translateY(-15px);transform:translateY(-15px)}}.faa-bounce.animated,.faa-bounce.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-bounce{-webkit-animation:bounce 2s ease infinite;animation:bounce 2s ease infinite}.faa-bounce.animated-hover.faa-fast:hover,.faa-bounce.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-bounce.faa-fast{-webkit-animation:bounce 1s ease infinite;animation:bounce 1s ease infinite}.faa-bounce.animated-hover.faa-slow:hover,.faa-bounce.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-bounce.faa-slow{-webkit-animation:bounce 3s ease infinite;animation:bounce 3s ease infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);-ms-transform:rotate(359deg);transform:rotate(359deg)}}.faa-parent.animated-hover:hover>.faa-spin,.faa-spin.animated,.faa-spin.animated-hover:hover{-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}.faa-parent.animated-hover:hover>.faa-spin.faa-fast,.faa-spin.animated-hover.faa-fast:hover,.faa-spin.animated.faa-fast{-webkit-animation:spin .7s linear infinite;animation:spin .7s linear infinite}.faa-parent.animated-hover:hover>.faa-spin.faa-slow,.faa-spin.animated-hover.faa-slow:hover,.faa-spin.animated.faa-slow{-webkit-animation:spin 2.2s linear infinite;animation:spin 2.2s linear infinite}@-webkit-keyframes float{0%{-webkit-transform:translateY(0);transform:translateY(0)}50%{-webkit-transform:translateY(-6px);transform:translateY(-6px)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes float{0%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}50%{-webkit-transform:translateY(-6px);-ms-transform:translateY(-6px);transform:translateY(-6px)}100%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}}.faa-float.animated,.faa-float.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-float{-webkit-animation:float 2s linear infinite;animation:float 2s linear infinite}.faa-float.animated-hover.faa-fast:hover,.faa-float.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-float.faa-fast{-webkit-animation:float 1s linear infinite;animation:float 1s linear infinite}.faa-float.animated-hover.faa-slow:hover,.faa-float.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-float.faa-slow{-webkit-animation:float 3s linear infinite;animation:float 3s linear infinite}@-webkit-keyframes pulse{0%{-webkit-transform:scale(1.1);transform:scale(1.1)}50%{-webkit-transform:scale(0.8);transform:scale(0.8)}100%{-webkit-transform:scale(1.1);transform:scale(1.1)}}@keyframes pulse{0%{-webkit-transform:scale(1.1);-ms-transform:scale(1.1);transform:scale(1.1)}50%{-webkit-transform:scale(0.8);-ms-transform:scale(0.8);transform:scale(0.8)}100%{-webkit-transform:scale(1.1);-ms-transform:scale(1.1);transform:scale(1.1)}}.faa-parent.animated-hover:hover>.faa-pulse,.faa-pulse.animated,.faa-pulse.animated-hover:hover{-webkit-animation:pulse 2s linear infinite;animation:pulse 2s linear infinite}.faa-parent.animated-hover:hover>.faa-pulse.faa-fast,.faa-pulse.animated-hover.faa-fast:hover,.faa-pulse.animated.faa-fast{-webkit-animation:pulse 1s linear infinite;animation:pulse 1s linear infinite}.faa-parent.animated-hover:hover>.faa-pulse.faa-slow,.faa-pulse.animated-hover.faa-slow:hover,.faa-pulse.animated.faa-slow{-webkit-animation:pulse 3s linear infinite;animation:pulse 3s linear infinite}.faa-parent.animated-hover:hover>.faa-shake,.faa-shake.animated,.faa-shake.animated-hover:hover{-webkit-animation:wrench 2.5s ease infinite;animation:wrench 2.5s ease infinite}.faa-parent.animated-hover:hover>.faa-shake.faa-fast,.faa-shake.animated-hover.faa-fast:hover,.faa-shake.animated.faa-fast{-webkit-animation:wrench 1.2s ease infinite;animation:wrench 1.2s ease infinite}.faa-parent.animated-hover:hover>.faa-shake.faa-slow,.faa-shake.animated-hover.faa-slow:hover,.faa-shake.animated.faa-slow{-webkit-animation:wrench 3.7s ease infinite;animation:wrench 3.7s ease infinite}@-webkit-keyframes tada{0%{-webkit-transform:scale(1);transform:scale(1)}10%,20%{-webkit-transform:scale(.9) rotate(-8deg);transform:scale(.9) rotate(-8deg)}30%,50%,70%{-webkit-transform:scale(1.3) rotate(8deg);transform:scale(1.3) rotate(8deg)}40%,60%{-webkit-transform:scale(1.3) rotate(-8deg);transform:scale(1.3) rotate(-8deg)}80%{-webkit-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}}@keyframes tada{0%{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}10%,20%{-webkit-transform:scale(.9) rotate(-8deg);-ms-transform:scale(.9) rotate(-8deg);transform:scale(.9) rotate(-8deg)}30%,50%,70%{-webkit-transform:scale(1.3) rotate(8deg);-ms-transform:scale(1.3) rotate(8deg);transform:scale(1.3) rotate(8deg)}40%,60%{-webkit-transform:scale(1.3) rotate(-8deg);-ms-transform:scale(1.3) rotate(-8deg);transform:scale(1.3) rotate(-8deg)}80%{-webkit-transform:scale(1) rotate(0);-ms-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}}.faa-parent.animated-hover:hover>.faa-tada,.faa-tada.animated,.faa-tada.animated-hover:hover{-webkit-animation:tada 2s linear infinite;animation:tada 2s linear infinite}.faa-parent.animated-hover:hover>.faa-tada.faa-fast,.faa-tada.animated-hover.faa-fast:hover,.faa-tada.animated.faa-fast{-webkit-animation:tada 1s linear infinite;animation:tada 1s linear infinite}.faa-parent.animated-hover:hover>.faa-tada.faa-slow,.faa-tada.animated-hover.faa-slow:hover,.faa-tada.animated.faa-slow{-webkit-animation:tada 3s linear infinite;animation:tada 3s linear infinite}@-webkit-keyframes passing{0%{-webkit-transform:translateX(-50%);transform:translateX(-50%);opacity:0}50%{-webkit-transform:translateX(0%);transform:translateX(0%);opacity:1}100%{-webkit-transform:translateX(50%);transform:translateX(50%);opacity:0}}@keyframes passing{0%{-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%);opacity:0}50%{-webkit-transform:translateX(0%);-ms-transform:translateX(0%);transform:translateX(0%);opacity:1}100%{-webkit-transform:translateX(50%);-ms-transform:translateX(50%);transform:translateX(50%);opacity:0}}.faa-parent.animated-hover:hover>.faa-passing,.faa-passing.animated,.faa-passing.animated-hover:hover{-webkit-animation:passing 2s linear infinite;animation:passing 2s linear infinite}.faa-parent.animated-hover:hover>.faa-passing.faa-fast,.faa-passing.animated-hover.faa-fast:hover,.faa-passing.animated.faa-fast{-webkit-animation:passing 1s linear infinite;animation:passing 1s linear infinite}.faa-parent.animated-hover:hover>.faa-passing.faa-slow,.faa-passing.animated-hover.faa-slow:hover,.faa-passing.animated.faa-slow{-webkit-animation:passing 3s linear infinite;animation:passing 3s linear infinite}@-webkit-keyframes burst{0%{opacity:.6}50%{-webkit-transform:scale(1.8);transform:scale(1.8);opacity:0}100%{opacity:0}}@keyframes burst{0%{opacity:.6}50%{-webkit-transform:scale(1.8);-ms-transform:scale(1.8);transform:scale(1.8);opacity:0}100%{opacity:0}}.faa-burst.animated,.faa-burst.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-burst{-webkit-animation:burst 2s infinite linear;animation:burst 2s infinite linear}.faa-burst.animated-hover.faa-fast:hover,.faa-burst.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-burst.faa-fast{-webkit-animation:burst 1s infinite linear;animation:burst 1s infinite linear}.faa-burst.animated-hover.faa-slow:hover,.faa-burst.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-burst.faa-slow{-webkit-animation:burst 3s infinite linear;animation:burst 3s infinite linear}"
  );


  $templateCache.put('assets/css/images.min.css',
    "body .img-chrome{background-image:url(https://upload.wikimedia.org/wikipedia/commons/e/e2/Google_Chrome_icon_%282011%29.svg)}body .img-chromium{background-image:url(https://upload.wikimedia.org/wikipedia/commons/5/5f/Chromium_11_Logo.svg)}body .img-firefox{background-image:url(https://upload.wikimedia.org/wikipedia/en/e/e3/Firefox-logo.svg)}body .img-iexplore{background-image:url(https://upload.wikimedia.org/wikipedia/commons/2/2f/Internet_Explorer_10_logo.svg)}body .img-opera{background-image:url(https://upload.wikimedia.org/wikipedia/commons/d/d0/Opera_O.svg)}body .img-safari{background-image:url(https://upload.wikimedia.org/wikipedia/commons/e/ee/Compass_icon_matte.svg)}body .img-seamonkey{background-image:url(https://upload.wikimedia.org/wikipedia/commons/e/e8/SeaMonkey.svg)}body .img-spartan{background-image:url(https://upload.wikimedia.org/wikipedia/en/b/b8/MSUSpartans_Logo.svg)}body .img-windows{background-image:url(https://upload.wikimedia.org/wikipedia/en/1/14/Windows_logo_-_2006.svg)}body .img-mac-os{background-image:url(http://gfx.syscheck.melasweb.com/operating%20systems/Mac%20OS.png)}body .img-apple{background-image:url(http://www.journaldugeek.com/files/2011/04/apple-logo.png)}body .img-linux,body .img-unix{background-image:url(https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg)}body .img-ubuntu{background-image:url(https://design.ubuntu.com/wp-content/uploads/logo-ubuntu_cof-orange-hex.svg)}body .img-drive,body .img-drive-default{background-image:url(http://png-3.findicons.com/files/icons/749/slick_drives_remake/128/generic_slick_drives_remake_icon.png)}body .img-drive-onl{background-image:url(http://png-1.findicons.com/files/icons/749/slick_drives_remake/128/server_slick_drives_remake_icon.png)}body .img-drive-usb{background-image:url(http://png-5.findicons.com/files/icons/749/slick_drives_remake/128/usb_hd_slick_drives_remake_icon.png)}body .img-drive-ssd{background-image:url(http://png-2.findicons.com/files/icons/749/slick_drives_remake/128/ssd_slick_drives_remake_icon.png)}body .img-drive-web{background-image:url(http://png-1.findicons.com/files/icons/749/slick_drives_remake/128/idisk_slick_drives_remake_icon.png)}body .img-drive-mac{background-image:url(http://png-4.findicons.com/files/icons/749/slick_drives_remake/128/apple_slick_drives_remake_icon.png)}body .img-drive-warn{background-image:url(http://png-4.findicons.com/files/icons/749/slick_drives_remake/128/idisk_user_slick_drives_remake_icon.png)}body .img-drive-hist{background-image:url(http://png-5.findicons.com/files/icons/749/slick_drives_remake/128/time_machine_slick_drives_remake_icon.png)}body .img-drive-wifi{background-image:url(http://png-4.findicons.com/files/icons/749/slick_drives_remake/128/airport_disc_slick_drives_remake_icon.png)}body .img-webdb{background-image:url(http://png-5.findicons.com/files/icons/1035/human_o2/128/network_server_database.png)}body .img-server-local{background-image:url(http://png-4.findicons.com/files/icons/1406/g5_drives/128/g5_network_volume_1.png)}body .img-server{background-image:url(http://png-1.findicons.com/files/icons/719/crystal_clear_actions/128/server_256.png)}body .img-sqldb{background-image:url(http://png-5.findicons.com/files/icons/1035/human_o2/128/network_server_database.png)}body .img-iis{background-image:url(https://downloads.chef.io/assets/images/downloads/logos/windows-84b9c41f.svg)}body .img-node{background-image:url(https://cdn.rawgit.com/ferventcoder/chocolatey-packages/master/icons/nodejs.png)}body .img-apache{background-image:url(http://www.iconattitude.com/icons/open_icon_library/apps/png/256/apache.png)}body .img-angular{background-image:url(http://svgporn.com/angular-icon.svg)}body .img-nodewebkit{background-image:url(http://oldgeeksguide.github.io/presentations/html5devconf2013/icon-node-webkit.png)}body .img-nodejs{background-image:url(https://cdn.rawgit.com/ferventcoder/chocolatey-packages/master/icons/nodejs.png)}body .img-html5,body .img-html5-ie{background-image:url(http://www.w3.org/html/logo/downloads/HTML5_Logo.svg)}body .img-js-default,body .img-js-v8{background-image:url(https://upload.wikimedia.org/wikipedia/commons/b/b6/Badge_js-strict.svg)}body .img-css3{background-image:url(http://ohdoylerules.com/content/images/css3.svg)}body .img-jquery{background-image:url(http://www.ocpf.us/images/jquery-logo.png)}body .img-terminal{background-image:url(http://png-4.findicons.com/files/icons/2212/carpelinx/128/server.png)}"
  );


  $templateCache.put('assets/css/prototyped.min.css',
    "body .glow-green{color:#00b500!important;text-shadow:0 0 2px #00b500}body .glow-red{color:#D00!important;text-shadow:0 0 2px #D00}body .glow-orange{color:#ff8d00!important;text-shadow:0 0 2px #ff8d00}body .glow-blue{color:#0094ff!important;text-shadow:0 0 2px #0094ff}body .input-group-xs>.form-control,body .input-group-xs>.input-group-addon,body .input-group-xs>.input-group-btn>.btn{height:22px;padding:1px 5px;font-size:12px;line-height:1.5}body .docked{flex-grow:1;flex-shrink:1;display:flex;overflow:auto}body .dock-tight{flex-grow:0;flex-shrink:0}body .dock-fill{flex-grow:1;flex-shrink:1}body .ellipsis{text-wrap:avoid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}body .dragable{-webkit-app-region:drag;-webkit-user-select:none}body .non-dragable{-webkit-app-region:no-drag;-webkit-user-select:auto}body .inactive-gray{opacity:.5;filter:alpha(opacity=50);filter:grayscale(100%) opacity(0.5);-webkit-filter:grayscale(100%) opacity(0.5);-moz-filter:alpha(opacity=50);-o-filter:alpha(opacity=50)}body .inactive-gray:hover{opacity:.75!important;filter:alpha(opacity=75)!important;filter:grayscale(100%) opacity(0.75)!important;-webkit-filter:grayscale(100%) opacity(0.75);-moz-filter:alpha(opacity=75)!important;-o-filter:alpha(opacity=75)!important}body .inactive-gray-75{opacity:.75;filter:alpha(opacity=75);filter:grayscale(100%) opacity(0.75);-webkit-filter:grayscale(100%) opacity(0.75);-moz-filter:alpha(opacity=75);-o-filter:alpha(opacity=75)}body .inactive-gray-75:hover{opacity:.75!important;filter:alpha(opacity=75)!important;filter:grayscale(100%) opacity(0.75)!important;-webkit-filter:grayscale(100%) opacity(0.75);-moz-filter:alpha(opacity=75)!important;-o-filter:alpha(opacity=75)!important}body .inactive-gray-25{opacity:.25;filter:alpha(opacity=25);filter:grayscale(100%) opacity(0.25);-webkit-filter:grayscale(100%) opacity(0.25);-moz-filter:alpha(opacity=25);-o-filter:alpha(opacity=25)}body .inactive-gray-25:hover{opacity:.75!important;filter:alpha(opacity=75)!important;filter:grayscale(100%) opacity(0.75)!important;-webkit-filter:grayscale(100%) opacity(0.75);-moz-filter:alpha(opacity=75)!important;-o-filter:alpha(opacity=75)!important}body .inactive-gray-10{opacity:.1;filter:alpha(opacity=10);filter:grayscale(100%) opacity(0.1);-webkit-filter:grayscale(100%) opacity(0.1);-moz-filter:alpha(opacity=10);-o-filter:alpha(opacity=10)}body .inactive-gray-10:hover{opacity:.75!important;filter:alpha(opacity=75)!important;filter:grayscale(100%) opacity(0.75)!important;-webkit-filter:grayscale(100%) opacity(0.75);-moz-filter:alpha(opacity=75)!important;-o-filter:alpha(opacity=75)!important}body .inactive-ctrl{opacity:.65;filter:alpha(opacity=65);filter:grayscale(100%) opacity(0.65);-webkit-filter:grayscale(100%) opacity(0.65);-moz-filter:alpha(opacity=65);-o-filter:alpha(opacity=65)}body .inactive-fill-text{width:100%;height:100%;display:block;padding:64px 0;font-size:14px;text-align:center;color:rgba(128,128,128,.75)}body .text-hudge{font-size:xx-large}body [draggable=true]{cursor:move}body .top-hint{text-align:center}body .top-hint .tab{top:0;width:320px;height:24px;padding:2px 6px;margin-left:-160px;z-index:4000;text-wrap:avoid;border-top:none;position:absolute;border-radius:0 0 10px 10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}body .top-hint a{color:#000}body .results{min-width:480px;display:flex}body .results .icon{margin:0 8px;font-size:128px;width:128px!important;height:128px!important;position:relative;flex-grow:0;flex-shrink:0}body .results .icon .sub-icon{font-size:64px!important;width:64px!important;height:64px!important;position:absolute;right:0;top:0;margin-top:100px}body .results .info{margin:0 16px;min-height:128px;min-width:300px;display:inline-block;flex-grow:1;flex-shrink:1}body .results .info h4{text-wrap:avoid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}body .results .info h4 a{color:#000}body .info-row{display:flex}body .info-row-links{color:silver}body .info-row-links a{color:#4a4a4a;margin-left:8px}body .info-row-links a:hover{color:#000}body .info-col-primary{flex-grow:1;flex-shrink:1}body .info-col-secondary{flex-grow:0;flex-shrink:0}body .info-overview{vertical-align:top}body .info-overview .panel-icon-lg{width:128px;height:128px;padding:0;margin:0 auto 10px;display:block;position:relative;background-repeat:no-repeat;background-size:auto 128px;background-position:top center}body .info-overview .panel-icon-lg .panel-icon-inner{width:92px;height:92px;margin:6px auto;background-repeat:no-repeat;background-size:auto 86px;background-position:center center}body .info-overview .panel-icon-lg .panel-icon-overlay{right:0;bottom:0;width:48px;height:48px;position:absolute;background-repeat:no-repeat;background-size:auto 48px;background-position:top center}body .info-overview .panel-icon-lg .panel-icon-inset{width:40px;height:40px;margin:0;left:24px;bottom:0;position:absolute;background-repeat:no-repeat;background-size:auto 40px;background-position:center center}body .info-overview .panel-icon-lg .panel-icon-inset-bl{margin:0;position:absolute;background-repeat:no-repeat;background-position:center center;width:64px;height:64px;left:10px;bottom:10px;background-size:auto 64px}body .info-overview .panel-label{margin:6px auto;text-align:center;text-wrap:avoid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}body .info-tabs .trim-top{padding:10px;border-top:none;min-height:380px;border-top-left-radius:0;border-top-right-radius:0}body .img-clipper{width:48px;height:48px;padding:0;margin:3px auto;text-align:center;background-repeat:no-repeat;background-size:auto 48px;background-position:top center}body .app-info-aside{display:flex;margin-bottom:12px}body .app-info-aside .app-info-icon{flex-grow:0;flex-shrink:0;flex-basis:64px;vertical-align:top}body .app-info-aside .app-info-info{flex-grow:1;flex-shrink:1;text-align:left;vertical-align:top}body .app-info-aside .app-info-info p{text-wrap:avoid;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}body .app-info-aside.info-disabled .app-info-icon{opacity:.5;filter:alpha(opacity=50);filter:grayscale(100%) opacity(0.5);-webkit-filter:grayscale(100%) opacity(0.5);-moz-filter:alpha(opacity=50);-o-filter:alpha(opacity=50)}body .app-info-aside.info-disabled .app-info-icon:hover{opacity:.75!important;filter:alpha(opacity=75)!important;filter:grayscale(100%) opacity(0.75)!important;-webkit-filter:grayscale(100%) opacity(0.75);-moz-filter:alpha(opacity=75)!important;-o-filter:alpha(opacity=75)!important}body .app-aside-collapser a{margin:0;padding:0;display:block;color:silver;text-decoration:none}body .app-aside-collapser a:hover{color:gray}body .iframe-body,body .iframe-body iframe{margin:0;padding:0}body .alertify-hidden{display:none}body .console .cmd-output{padding:3px;font-family:Courier New,Courier,monospace;color:gray}body .console .cmd-line{padding:0;margin:0}body .console .cmd-time{color:silver}body .console .cmd-text{white-space:pre}@media screen and (max-width:640px) and (max-height:480px){body .console .cmd-output{padding:4px;font-size:10.4px}}body .card-view{margin:0 auto;padding:0;color:#333;height:100%;overflow:auto}body .card-view.float-left .card{float:left}body .card-view .multi-column{columns:300px 3;-webkit-columns:300px 3}body .card-view a{color:#4c4c4c;text-decoration:none}body .card-view .boxed{margin:0 auto 36px;max-width:1056px;display:inline-block}body .card-view .card{width:320px;height:200px;padding:0;margin:15px 15px 0;overflow:hidden;background:#fff;background:#ededed;background:-moz-linear-gradient(top,#ededed 0,#f6f6f6 45%,#fff 61%,#fff 61%);background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,#ededed),color-stop(45%,#f6f6f6),color-stop(61%,#fff),color-stop(61%,#fff));background:-webkit-linear-gradient(top,#ededed 0,#f6f6f6 45%,#fff 61%,#fff 61%);background:-o-linear-gradient(top,#ededed 0,#f6f6f6 45%,#fff 61%,#fff 61%);background:-ms-linear-gradient(top,#ededed 0,#f6f6f6 45%,#fff 61%,#fff 61%);background:linear-gradient(to bottom,#ededed 0,#f6f6f6 45%,#fff 61%,#fff 61%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#ffffff', GradientType=0);border:1px solid #AAA;border-bottom:3px solid #BBB}body .card-view .card:hover{-webkit-box-shadow:0 0 10px 1px rgba(128,128,128,.75);-moz-box-shadow:0 0 10px 1px rgba(128,128,128,.75);box-shadow:0 0 10px 1px rgba(128,128,128,.75)}body .card-view .card p{background:#fff;margin:0;padding:10px}body .card-view .card-image{width:100%;height:140px;padding:0;margin:0;position:relative;overflow:hidden;background-position:center;background-repeat:no-repeat}body .card-view .card-image .banner{height:50px;width:50px;top:0;right:0;background-position:top right;background-repeat:no-repeat;position:absolute}body .card-view .card-image h1,body .card-view .card-image h2,body .card-view .card-image h3,body .card-view .card-image h4,body .card-view .card-image h5,body .card-view .card-image h6{position:absolute;bottom:0;left:0;width:100%;color:#fff;background:rgba(0,0,0,.65);margin:0;padding:6px 12px!important;border:none}body .card-view .small-only{display:none!important}body .card-view .leftColumn,body .card-view .rightColumn{display:inline-block;width:49%;vertical-align:top}body .card-view .column{display:inline-block;vertical-align:top}body .card-view .arrow{top:50%;width:50px;bottom:0;margin:auto 0;outline:medium none;position:absolute;font-size:40px;cursor:pointer;z-index:5}body .card-view .arrow i{top:-25px}body .card-view .arrow.prev{left:0;opacity:.2}body .card-view .arrow.prev:hover{opacity:1}body .card-view .arrow.next{right:0;opacity:.2;text-align:right}body .card-view .arrow.next:hover{opacity:1}body .card-view .img-default{background:#b3bead;background:-moz-linear-gradient(top,#fcfff4 0,#dfe5d7 40%,#b3bead 100%);background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,#fcfff4),color-stop(40%,#dfe5d7),color-stop(100%,#b3bead));background:-webkit-linear-gradient(top,#fcfff4 0,#dfe5d7 40%,#b3bead 100%);background:-o-linear-gradient(top,#fcfff4 0,#dfe5d7 40%,#b3bead 100%);background:-ms-linear-gradient(top,#fcfff4 0,#dfe5d7 40%,#b3bead 100%);background:linear-gradient(to bottom,#fcfff4 0,#dfe5d7 40%,#b3bead 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fcfff4', endColorstr='#b3bead', GradientType=0)}body .card-view .img-explore{background-position:top left;background-image:url(https://farm6.staticflickr.com/5250/5279251697_3ab802e3ef.jpg)}body .card-view .img-editor{background-image:url(http://f.fastcompany.net/multisite_files/fastcompany/inline/2013/10/3020994-inline-d3-data-viz001.jpg);background-size:320px auto}body .card-view .img-console{background-image:url(http://shumakovich.com/uploads/useruploads/images/programming_256x256.png);background-size:auto auto;background-position:top}body .card-view .img-about{background-image:url(https://farm9.staticflickr.com/8282/7807659570_f5ba8dfc63.jpg);background-size:420px auto;background-position:center}body .card-view .img-sandbox{background-image:url(http://8020.photos.jpgmag.com/1727832_147374_5c80086d33_p.jpg);background-size:360px auto;background-position:top center}body .card-view .slider-nav{bottom:0;display:block;height:48px;left:0;margin:0 auto;padding:1em 0 .8em;position:absolute;right:0;text-align:center;width:100%;z-index:5}body .card-view .slider-nav li{margin:3px;padding:1px 3px;cursor:pointer;position:relative;display:inline-block;border:1px dotted #E0E0E0;background-color:rgba(255,255,255,.25)}body .card-view .slider-nav li a{color:rgba(128,128,128,.75)}body .card-view .slider-nav li.active{border:solid 1px #BBB;background-color:rgba(128,128,128,.25)}body .card-view .slider-nav li.active a{color:#000}body .card-view .slider{-webkit-perspective:1000px;-moz-perspective:1000px;-ms-perspective:1000px;-o-perspective:1000px;perspective:1000px;-webkit-transform-style:preserve-3d;-moz-transform-style:preserve-3d;-ms-transform-style:preserve-3d;-o-transform-style:preserve-3d;transform-style:preserve-3d}body .card-view .slide{-webkit-transition:1s linear all;-moz-transition:1s linear all;-o-transition:1s linear all;transition:1s linear all;opacity:1}body .card-view .slide.ng-hide-add{opacity:1}body .card-view .slide.ng-hide-add.ng-hide-add-active,body .card-view .slide.ng-hide-remove{opacity:0}body .card-view .slide.ng-hide-remove.ng-hide-remove-active{opacity:1}body .footer .log-group{padding:1px 6px}body.debug .ng-scope{-webkit-box-shadow:inset 0 0 3px 0 rgba(252,162,0,.25);-moz-box-shadow:inset 0 0 3px 0 rgba(252,162,0,.25);box-shadow:inset 0 0 3px 0 rgba(252,162,0,.25)}body.debug .ng-scope:hover{-webkit-box-shadow:inset 0 0 5px 0 rgba(252,162,0,.75);-moz-box-shadow:inset 0 0 5px 0 rgba(252,162,0,.75);box-shadow:inset 0 0 5px 0 rgba(252,162,0,.75);outline:solid 1px rgba(252,162,0,.75)}body.tests .ng-scope{-webkit-box-shadow:inset 0 0 3px 0 rgba(0,84,252,.25);-moz-box-shadow:inset 0 0 3px 0 rgba(0,84,252,.25);box-shadow:inset 0 0 3px 0 rgba(0,84,252,.25)}body.tests .ng-scope:hover{-webkit-box-shadow:inset 0 0 5px 0 rgba(0,84,252,.75);-moz-box-shadow:inset 0 0 5px 0 rgba(0,84,252,.75);box-shadow:inset 0 0 5px 0 rgba(0,84,252,.75);outline:solid 1px rgba(0,84,252,.75)}@media screen and (min-width:741px) and (max-width:1024px){#cardViewer .boxed{max-width:740px!important}}@media screen and (max-width:740px){#cardViewer .boxed{max-width:350px!important}#cardViewer .small-only{display:block!important}#cardViewer .card-view{height:100%;overflow:auto}#cardViewer .card-view .card{display:none}#cardViewer .card-view .card.active{display:block}}#fileExplorer{-webkit-user-select:none}#fileExplorer .folder-contents{padding:16px 8px;clear:both}#fileExplorer .file{color:#000;text-decoration:none}#fileExplorer .name{margin-top:6px;font-size:11px}#fileExplorer .files{padding:0;margin:0}#fileExplorer .file{float:left;padding:2px;margin:2px;width:64px;display:inline-block;text-align:center;vertical-align:top}#fileExplorer .file.focus{background-color:#08C;-webkit-border-radius:4px}#fileExplorer .file .name{width:64px;padding:3px;display:inline-block;word-wrap:break-word}#fileExplorer .file.focus .name{color:#fff}#fileExplorer .file .icon{margin:0 auto;padding:6px 0;width:48px}#fileExplorer .file .icon img{width:48px;height:auto}#fileExplorer .file.focus .icon{-webkit-filter:invert(20%)}#fileExplorer .view-large{display:block}#fileExplorer .view-large .files{padding:0;margin:0}#fileExplorer .view-large .file{float:left;padding:0;margin:2px;width:100px;display:inline-block;text-align:center;vertical-align:top}#fileExplorer .view-large .file.focus{background-color:#08C;-webkit-border-radius:4px}#fileExplorer .view-large .file .name{width:100px;word-wrap:break-word}#fileExplorer .view-large .file.focus .name{color:#fff}#fileExplorer .view-large .file .icon{margin:0 auto;width:60px}#fileExplorer .view-large .file .icon img{width:60px;height:auto}#fileExplorer .view-large .file.focus .icon{-webkit-filter:invert(20%)}#fileExplorer .view-med .files{padding:0;margin:0}#fileExplorer .view-med .file{float:left;padding:2px;margin:2px;width:64px;display:inline-block;text-align:center;vertical-align:top}#fileExplorer .view-med .file.focus{background-color:#08C;-webkit-border-radius:4px}#fileExplorer .view-med .file .name{width:64px;padding:3px;display:inline-block;word-wrap:break-word}#fileExplorer .view-med .file.focus .name{color:#fff}#fileExplorer .view-med .file .icon{margin:0 auto;padding:6px 0;width:48px}#fileExplorer .view-med .file .icon img{width:48px;height:auto}#fileExplorer .view-med .file.focus .icon{-webkit-filter:invert(20%)}#fileExplorer .view-details{display:block}#fileExplorer .view-details .files{padding:0;margin:0}#fileExplorer .view-details .file{padding:0;margin:2px;float:none;display:block;width:100%;text-align:left}#fileExplorer .view-details .file.focus{-webkit-border-radius:0}#fileExplorer .view-details .file .name{padding:3px;display:inline;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}#fileExplorer .view-details .file .icon{margin:0;width:24px;display:inline}#fileExplorer .view-details .file .icon img{width:24px;height:auto}@media screen and (max-width:640px) and (max-height:480px){#fileExplorer{display:block}#fileExplorer .files{padding:0;margin:0}#fileExplorer .file{padding:0;margin:2px;float:none;display:block;width:100%;text-align:left}#fileExplorer .file.focus{-webkit-border-radius:0}#fileExplorer .file .name{padding:3px;display:inline;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}#fileExplorer .file .icon{margin:0;width:24px;display:inline}#fileExplorer .file .icon img{width:24px;height:auto}#fileExplorer .name{padding:3px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}}@media screen and (min-width:1024px) and (min-height:480px){#fileExplorer{display:block}#fileExplorer .files{padding:0;margin:0}#fileExplorer .file{float:left;padding:0;margin:2px;width:100px;display:inline-block;text-align:center;vertical-align:top}#fileExplorer .file.focus{background-color:#08C;-webkit-border-radius:4px}#fileExplorer .file .name{width:100px;word-wrap:break-word}#fileExplorer .file.focus .name{color:#fff}#fileExplorer .file .icon{margin:0 auto;width:60px}#fileExplorer .file .icon img{width:60px;height:auto}#fileExplorer .file.focus .icon{-webkit-filter:invert(20%)}}.abn-tree-animate-enter,li.abn-tree-row.ng-enter{transition:200ms linear all;position:relative;display:block;opacity:0;max-height:0}.abn-tree-animate-enter.abn-tree-animate-enter-active,li.abn-tree-row.ng-enter-active{opacity:1;max-height:30px}.abn-tree-animate-leave,li.abn-tree-row.ng-leave{transition:200ms linear all;position:relative;display:block;height:30px;max-height:30px;opacity:1}.abn-tree-animate-leave.abn-tree-animate-leave-active,li.abn-tree-row.ng-leave-active{height:0;max-height:0;opacity:0}ul.abn-tree li.abn-tree-row{padding:0;margin:0}ul.abn-tree li.abn-tree-row a{padding:3px 10px}ul.abn-tree i.indented{padding:2px 6px}.abn-tree{cursor:pointer}ul.nav.abn-tree .level-1 .indented{position:relative;left:0}ul.nav.abn-tree .level-2 .indented{position:relative;left:16px}ul.nav.abn-tree .level-3 .indented{position:relative;left:40px}ul.nav.abn-tree .level-4 .indented{position:relative;left:60px}ul.nav.abn-tree .level-5 .indented{position:relative;left:80px}ul.nav.abn-tree .level-6 .indented{position:relative;left:100px}ul.nav.nav-list.abn-tree .level-7 .indented{position:relative;left:120px}ul.nav.nav-list.abn-tree .level-8 .indented{position:relative;left:140px}ul.nav.nav-list.abn-tree .level-9 .indented{position:relative;left:160px}"
  );


  $templateCache.put('assets/css/sandbox.min.css',
    "@charset \"UTF-8\";/*!\n" +
    "Animate.css - http://daneden.me/animate\n" +
    "Licensed under the MIT license - http://opensource.org/licenses/MIT\n" +
    "\n" +
    "Copyright (c) 2015 Daniel Eden\n" +
    "*/.animated{-webkit-animation-duration:1s;animation-duration:1s;-webkit-animation-fill-mode:both;animation-fill-mode:both}.animated.infinite{-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}.animated.hinge{-webkit-animation-duration:2s;animation-duration:2s}.animated.bounceIn,.animated.bounceOut,.animated.flipOutX,.animated.flipOutY{-webkit-animation-duration:.75s;animation-duration:.75s}@-webkit-keyframes bounce{0%,100%,20%,53%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}40%,43%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-30px,0);transform:translate3d(0,-30px,0)}70%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-15px,0);transform:translate3d(0,-15px,0)}90%{-webkit-transform:translate3d(0,-4px,0);transform:translate3d(0,-4px,0)}}@keyframes bounce{0%,100%,20%,53%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}40%,43%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-30px,0);transform:translate3d(0,-30px,0)}70%{-webkit-animation-timing-function:cubic-bezier(0.755,.050,.855,.060);animation-timing-function:cubic-bezier(0.755,.050,.855,.060);-webkit-transform:translate3d(0,-15px,0);transform:translate3d(0,-15px,0)}90%{-webkit-transform:translate3d(0,-4px,0);transform:translate3d(0,-4px,0)}}.bounce{-webkit-animation-name:bounce;animation-name:bounce;-webkit-transform-origin:center bottom;transform-origin:center bottom}@-webkit-keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}.flash{-webkit-animation-name:flash;animation-name:flash}@-webkit-keyframes pulse{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}50%{-webkit-transform:scale3d(1.05,1.05,1.05);transform:scale3d(1.05,1.05,1.05)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes pulse{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}50%{-webkit-transform:scale3d(1.05,1.05,1.05);transform:scale3d(1.05,1.05,1.05)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.pulse{-webkit-animation-name:pulse;animation-name:pulse}@-webkit-keyframes rubberBand{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}30%{-webkit-transform:scale3d(1.25,.75,1);transform:scale3d(1.25,.75,1)}40%{-webkit-transform:scale3d(0.75,1.25,1);transform:scale3d(0.75,1.25,1)}50%{-webkit-transform:scale3d(1.15,.85,1);transform:scale3d(1.15,.85,1)}65%{-webkit-transform:scale3d(.95,1.05,1);transform:scale3d(.95,1.05,1)}75%{-webkit-transform:scale3d(1.05,.95,1);transform:scale3d(1.05,.95,1)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes rubberBand{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}30%{-webkit-transform:scale3d(1.25,.75,1);transform:scale3d(1.25,.75,1)}40%{-webkit-transform:scale3d(0.75,1.25,1);transform:scale3d(0.75,1.25,1)}50%{-webkit-transform:scale3d(1.15,.85,1);transform:scale3d(1.15,.85,1)}65%{-webkit-transform:scale3d(.95,1.05,1);transform:scale3d(.95,1.05,1)}75%{-webkit-transform:scale3d(1.05,.95,1);transform:scale3d(1.05,.95,1)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.rubberBand{-webkit-animation-name:rubberBand;animation-name:rubberBand}@-webkit-keyframes shake{0%,100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}20%,40%,60%,80%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}}@keyframes shake{0%,100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}10%,30%,50%,70%,90%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}20%,40%,60%,80%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}}.shake{-webkit-animation-name:shake;animation-name:shake}@-webkit-keyframes swing{20%{-webkit-transform:rotate3d(0,0,1,15deg);transform:rotate3d(0,0,1,15deg)}40%{-webkit-transform:rotate3d(0,0,1,-10deg);transform:rotate3d(0,0,1,-10deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}100%{-webkit-transform:rotate3d(0,0,1,0deg);transform:rotate3d(0,0,1,0deg)}}@keyframes swing{20%{-webkit-transform:rotate3d(0,0,1,15deg);transform:rotate3d(0,0,1,15deg)}40%{-webkit-transform:rotate3d(0,0,1,-10deg);transform:rotate3d(0,0,1,-10deg)}60%{-webkit-transform:rotate3d(0,0,1,5deg);transform:rotate3d(0,0,1,5deg)}80%{-webkit-transform:rotate3d(0,0,1,-5deg);transform:rotate3d(0,0,1,-5deg)}100%{-webkit-transform:rotate3d(0,0,1,0deg);transform:rotate3d(0,0,1,0deg)}}.swing{-webkit-transform-origin:top center;transform-origin:top center;-webkit-animation-name:swing;animation-name:swing}@-webkit-keyframes tada{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}10%,20%{-webkit-transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg);transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes tada{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}10%,20%{-webkit-transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg);transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{-webkit-transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg);transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.tada{-webkit-animation-name:tada;animation-name:tada}@-webkit-keyframes wobble{0%{-webkit-transform:none;transform:none}15%{-webkit-transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg);transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{-webkit-transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg);transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{-webkit-transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg);transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{-webkit-transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg);transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{-webkit-transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg);transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}100%{-webkit-transform:none;transform:none}}@keyframes wobble{0%{-webkit-transform:none;transform:none}15%{-webkit-transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg);transform:translate3d(-25%,0,0) rotate3d(0,0,1,-5deg)}30%{-webkit-transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg);transform:translate3d(20%,0,0) rotate3d(0,0,1,3deg)}45%{-webkit-transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg);transform:translate3d(-15%,0,0) rotate3d(0,0,1,-3deg)}60%{-webkit-transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg);transform:translate3d(10%,0,0) rotate3d(0,0,1,2deg)}75%{-webkit-transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg);transform:translate3d(-5%,0,0) rotate3d(0,0,1,-1deg)}100%{-webkit-transform:none;transform:none}}.wobble{-webkit-animation-name:wobble;animation-name:wobble}@-webkit-keyframes jello{11.1%{-webkit-transform:none;transform:none}22.2%{-webkit-transform:skewX(-12.5deg) skewY(-12.5deg);transform:skewX(-12.5deg) skewY(-12.5deg)}33.3%{-webkit-transform:skewX(6.25deg) skewY(6.25deg);transform:skewX(6.25deg) skewY(6.25deg)}44.4%{-webkit-transform:skewX(-3.125deg) skewY(-3.125deg);transform:skewX(-3.125deg) skewY(-3.125deg)}55.5%{-webkit-transform:skewX(1.5625deg) skewY(1.5625deg);transform:skewX(1.5625deg) skewY(1.5625deg)}66.6%{-webkit-transform:skewX(-.78125deg) skewY(-.78125deg);transform:skewX(-.78125deg) skewY(-.78125deg)}77.7%{-webkit-transform:skewX(0.390625deg) skewY(0.390625deg);transform:skewX(0.390625deg) skewY(0.390625deg)}88.8%{-webkit-transform:skewX(-.1953125deg) skewY(-.1953125deg);transform:skewX(-.1953125deg) skewY(-.1953125deg)}100%{-webkit-transform:none;transform:none}}@keyframes jello{11.1%{-webkit-transform:none;transform:none}22.2%{-webkit-transform:skewX(-12.5deg) skewY(-12.5deg);transform:skewX(-12.5deg) skewY(-12.5deg)}33.3%{-webkit-transform:skewX(6.25deg) skewY(6.25deg);transform:skewX(6.25deg) skewY(6.25deg)}44.4%{-webkit-transform:skewX(-3.125deg) skewY(-3.125deg);transform:skewX(-3.125deg) skewY(-3.125deg)}55.5%{-webkit-transform:skewX(1.5625deg) skewY(1.5625deg);transform:skewX(1.5625deg) skewY(1.5625deg)}66.6%{-webkit-transform:skewX(-.78125deg) skewY(-.78125deg);transform:skewX(-.78125deg) skewY(-.78125deg)}77.7%{-webkit-transform:skewX(0.390625deg) skewY(0.390625deg);transform:skewX(0.390625deg) skewY(0.390625deg)}88.8%{-webkit-transform:skewX(-.1953125deg) skewY(-.1953125deg);transform:skewX(-.1953125deg) skewY(-.1953125deg)}100%{-webkit-transform:none;transform:none}}.jello{-webkit-animation-name:jello;animation-name:jello;-webkit-transform-origin:center;transform-origin:center}@-webkit-keyframes bounceIn{0%,100%,20%,40%,60%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}20%{-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}40%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}60%{opacity:1;-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}80%{-webkit-transform:scale3d(.97,.97,.97);transform:scale3d(.97,.97,.97)}100%{opacity:1;-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}@keyframes bounceIn{0%,100%,20%,40%,60%,80%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}20%{-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}40%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}60%{opacity:1;-webkit-transform:scale3d(1.03,1.03,1.03);transform:scale3d(1.03,1.03,1.03)}80%{-webkit-transform:scale3d(.97,.97,.97);transform:scale3d(.97,.97,.97)}100%{opacity:1;-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1)}}.bounceIn{-webkit-animation-name:bounceIn;animation-name:bounceIn}@-webkit-keyframes bounceInDown{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,-3000px,0);transform:translate3d(0,-3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,25px,0);transform:translate3d(0,25px,0)}75%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}90%{-webkit-transform:translate3d(0,5px,0);transform:translate3d(0,5px,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInDown{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,-3000px,0);transform:translate3d(0,-3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,25px,0);transform:translate3d(0,25px,0)}75%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}90%{-webkit-transform:translate3d(0,5px,0);transform:translate3d(0,5px,0)}100%{-webkit-transform:none;transform:none}}.bounceInDown{-webkit-animation-name:bounceInDown;animation-name:bounceInDown}@-webkit-keyframes bounceInLeft{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(-3000px,0,0);transform:translate3d(-3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(25px,0,0);transform:translate3d(25px,0,0)}75%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}90%{-webkit-transform:translate3d(5px,0,0);transform:translate3d(5px,0,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInLeft{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(-3000px,0,0);transform:translate3d(-3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(25px,0,0);transform:translate3d(25px,0,0)}75%{-webkit-transform:translate3d(-10px,0,0);transform:translate3d(-10px,0,0)}90%{-webkit-transform:translate3d(5px,0,0);transform:translate3d(5px,0,0)}100%{-webkit-transform:none;transform:none}}.bounceInLeft{-webkit-animation-name:bounceInLeft;animation-name:bounceInLeft}@-webkit-keyframes bounceInRight{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(3000px,0,0);transform:translate3d(3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(-25px,0,0);transform:translate3d(-25px,0,0)}75%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}90%{-webkit-transform:translate3d(-5px,0,0);transform:translate3d(-5px,0,0)}100%{-webkit-transform:none;transform:none}}@keyframes bounceInRight{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(3000px,0,0);transform:translate3d(3000px,0,0)}60%{opacity:1;-webkit-transform:translate3d(-25px,0,0);transform:translate3d(-25px,0,0)}75%{-webkit-transform:translate3d(10px,0,0);transform:translate3d(10px,0,0)}90%{-webkit-transform:translate3d(-5px,0,0);transform:translate3d(-5px,0,0)}100%{-webkit-transform:none;transform:none}}.bounceInRight{-webkit-animation-name:bounceInRight;animation-name:bounceInRight}@-webkit-keyframes bounceInUp{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,3000px,0);transform:translate3d(0,3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}75%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}90%{-webkit-transform:translate3d(0,-5px,0);transform:translate3d(0,-5px,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes bounceInUp{0%,100%,60%,75%,90%{-webkit-animation-timing-function:cubic-bezier(0.215,.61,.355,1);animation-timing-function:cubic-bezier(0.215,.61,.355,1)}0%{opacity:0;-webkit-transform:translate3d(0,3000px,0);transform:translate3d(0,3000px,0)}60%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}75%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}90%{-webkit-transform:translate3d(0,-5px,0);transform:translate3d(0,-5px,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.bounceInUp{-webkit-animation-name:bounceInUp;animation-name:bounceInUp}@-webkit-keyframes bounceOut{20%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}}@keyframes bounceOut{20%{-webkit-transform:scale3d(.9,.9,.9);transform:scale3d(.9,.9,.9)}50%,55%{opacity:1;-webkit-transform:scale3d(1.1,1.1,1.1);transform:scale3d(1.1,1.1,1.1)}100%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}}.bounceOut{-webkit-animation-name:bounceOut;animation-name:bounceOut}@-webkit-keyframes bounceOutDown{20%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}@keyframes bounceOutDown{20%{-webkit-transform:translate3d(0,10px,0);transform:translate3d(0,10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}.bounceOutDown{-webkit-animation-name:bounceOutDown;animation-name:bounceOutDown}@-webkit-keyframes bounceOutLeft{20%{opacity:1;-webkit-transform:translate3d(20px,0,0);transform:translate3d(20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}@keyframes bounceOutLeft{20%{opacity:1;-webkit-transform:translate3d(20px,0,0);transform:translate3d(20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}.bounceOutLeft{-webkit-animation-name:bounceOutLeft;animation-name:bounceOutLeft}@-webkit-keyframes bounceOutRight{20%{opacity:1;-webkit-transform:translate3d(-20px,0,0);transform:translate3d(-20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}@keyframes bounceOutRight{20%{opacity:1;-webkit-transform:translate3d(-20px,0,0);transform:translate3d(-20px,0,0)}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}.bounceOutRight{-webkit-animation-name:bounceOutRight;animation-name:bounceOutRight}@-webkit-keyframes bounceOutUp{20%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,20px,0);transform:translate3d(0,20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}@keyframes bounceOutUp{20%{-webkit-transform:translate3d(0,-10px,0);transform:translate3d(0,-10px,0)}40%,45%{opacity:1;-webkit-transform:translate3d(0,20px,0);transform:translate3d(0,20px,0)}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}.bounceOutUp{-webkit-animation-name:bounceOutUp;animation-name:bounceOutUp}@-webkit-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}.fadeIn{-webkit-animation-name:fadeIn;animation-name:fadeIn}@-webkit-keyframes fadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDown{0%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDown{-webkit-animation-name:fadeInDown;animation-name:fadeInDown}@-webkit-keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInDownBig{0%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInDownBig{-webkit-animation-name:fadeInDownBig;animation-name:fadeInDownBig}@-webkit-keyframes fadeInLeft{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInLeft{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInLeft{-webkit-animation-name:fadeInLeft;animation-name:fadeInLeft}@-webkit-keyframes fadeInLeftBig{0%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInLeftBig{0%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInLeftBig{-webkit-animation-name:fadeInLeftBig;animation-name:fadeInLeftBig}@-webkit-keyframes fadeInRight{0%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInRight{0%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInRight{-webkit-animation-name:fadeInRight;animation-name:fadeInRight}@-webkit-keyframes fadeInRightBig{0%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInRightBig{0%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInRightBig{-webkit-animation-name:fadeInRightBig;animation-name:fadeInRightBig}@-webkit-keyframes fadeInUp{0%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInUp{0%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInUp{-webkit-animation-name:fadeInUp;animation-name:fadeInUp}@-webkit-keyframes fadeInUpBig{0%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes fadeInUpBig{0%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}100%{opacity:1;-webkit-transform:none;transform:none}}.fadeInUpBig{-webkit-animation-name:fadeInUpBig;animation-name:fadeInUpBig}@-webkit-keyframes fadeOut{0%{opacity:1}100%{opacity:0}}@keyframes fadeOut{0%{opacity:1}100%{opacity:0}}.fadeOut{-webkit-animation-name:fadeOut;animation-name:fadeOut}@-webkit-keyframes fadeOutDown{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}@keyframes fadeOutDown{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}.fadeOutDown{-webkit-animation-name:fadeOutDown;animation-name:fadeOutDown}@-webkit-keyframes fadeOutDownBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}@keyframes fadeOutDownBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,2000px,0);transform:translate3d(0,2000px,0)}}.fadeOutDownBig{-webkit-animation-name:fadeOutDownBig;animation-name:fadeOutDownBig}@-webkit-keyframes fadeOutLeft{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}@keyframes fadeOutLeft{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}.fadeOutLeft{-webkit-animation-name:fadeOutLeft;animation-name:fadeOutLeft}@-webkit-keyframes fadeOutLeftBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}@keyframes fadeOutLeftBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(-2000px,0,0);transform:translate3d(-2000px,0,0)}}.fadeOutLeftBig{-webkit-animation-name:fadeOutLeftBig;animation-name:fadeOutLeftBig}@-webkit-keyframes fadeOutRight{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}@keyframes fadeOutRight{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}.fadeOutRight{-webkit-animation-name:fadeOutRight;animation-name:fadeOutRight}@-webkit-keyframes fadeOutRightBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}@keyframes fadeOutRightBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(2000px,0,0);transform:translate3d(2000px,0,0)}}.fadeOutRightBig{-webkit-animation-name:fadeOutRightBig;animation-name:fadeOutRightBig}@-webkit-keyframes fadeOutUp{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes fadeOutUp{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.fadeOutUp{-webkit-animation-name:fadeOutUp;animation-name:fadeOutUp}@-webkit-keyframes fadeOutUpBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}@keyframes fadeOutUpBig{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(0,-2000px,0);transform:translate3d(0,-2000px,0)}}.fadeOutUpBig{-webkit-animation-name:fadeOutUpBig;animation-name:fadeOutUpBig}@-webkit-keyframes flip{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-360deg);transform:perspective(400px) rotate3d(0,1,0,-360deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}40%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}50%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}80%{-webkit-transform:perspective(400px) scale3d(.95,.95,.95);transform:perspective(400px) scale3d(.95,.95,.95);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}100%{-webkit-transform:perspective(400px);transform:perspective(400px);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}}@keyframes flip{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-360deg);transform:perspective(400px) rotate3d(0,1,0,-360deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}40%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-190deg);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}50%{-webkit-transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);transform:perspective(400px) translate3d(0,0,150px) rotate3d(0,1,0,-170deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}80%{-webkit-transform:perspective(400px) scale3d(.95,.95,.95);transform:perspective(400px) scale3d(.95,.95,.95);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}100%{-webkit-transform:perspective(400px);transform:perspective(400px);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}}.animated.flip{-webkit-backface-visibility:visible;backface-visibility:visible;-webkit-animation-name:flip;animation-name:flip}@-webkit-keyframes flipInX{0%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(1,0,0,10deg);transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-5deg);transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}@keyframes flipInX{0%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(1,0,0,10deg);transform:perspective(400px) rotate3d(1,0,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-5deg);transform:perspective(400px) rotate3d(1,0,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}.flipInX{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipInX;animation-name:flipInX}@-webkit-keyframes flipInY{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-20deg);transform:perspective(400px) rotate3d(0,1,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(0,1,0,10deg);transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-5deg);transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}@keyframes flipInY{0%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;opacity:0}40%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-20deg);transform:perspective(400px) rotate3d(0,1,0,-20deg);-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}60%{-webkit-transform:perspective(400px) rotate3d(0,1,0,10deg);transform:perspective(400px) rotate3d(0,1,0,10deg);opacity:1}80%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-5deg);transform:perspective(400px) rotate3d(0,1,0,-5deg)}100%{-webkit-transform:perspective(400px);transform:perspective(400px)}}.flipInY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipInY;animation-name:flipInY}@-webkit-keyframes flipOutX{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}@keyframes flipOutX{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(1,0,0,-20deg);transform:perspective(400px) rotate3d(1,0,0,-20deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(1,0,0,90deg);transform:perspective(400px) rotate3d(1,0,0,90deg);opacity:0}}.flipOutX{-webkit-animation-name:flipOutX;animation-name:flipOutX;-webkit-backface-visibility:visible!important;backface-visibility:visible!important}@-webkit-keyframes flipOutY{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-15deg);transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}@keyframes flipOutY{0%{-webkit-transform:perspective(400px);transform:perspective(400px)}30%{-webkit-transform:perspective(400px) rotate3d(0,1,0,-15deg);transform:perspective(400px) rotate3d(0,1,0,-15deg);opacity:1}100%{-webkit-transform:perspective(400px) rotate3d(0,1,0,90deg);transform:perspective(400px) rotate3d(0,1,0,90deg);opacity:0}}.flipOutY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;-webkit-animation-name:flipOutY;animation-name:flipOutY}@-webkit-keyframes lightSpeedIn{0%{-webkit-transform:translate3d(100%,0,0) skewX(-30deg);transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{-webkit-transform:skewX(20deg);transform:skewX(20deg);opacity:1}80%{-webkit-transform:skewX(-5deg);transform:skewX(-5deg);opacity:1}100%{-webkit-transform:none;transform:none;opacity:1}}@keyframes lightSpeedIn{0%{-webkit-transform:translate3d(100%,0,0) skewX(-30deg);transform:translate3d(100%,0,0) skewX(-30deg);opacity:0}60%{-webkit-transform:skewX(20deg);transform:skewX(20deg);opacity:1}80%{-webkit-transform:skewX(-5deg);transform:skewX(-5deg);opacity:1}100%{-webkit-transform:none;transform:none;opacity:1}}.lightSpeedIn{-webkit-animation-name:lightSpeedIn;animation-name:lightSpeedIn;-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}@-webkit-keyframes lightSpeedOut{0%{opacity:1}100%{-webkit-transform:translate3d(100%,0,0) skewX(30deg);transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}@keyframes lightSpeedOut{0%{opacity:1}100%{-webkit-transform:translate3d(100%,0,0) skewX(30deg);transform:translate3d(100%,0,0) skewX(30deg);opacity:0}}.lightSpeedOut{-webkit-animation-name:lightSpeedOut;animation-name:lightSpeedOut;-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in}@-webkit-keyframes rotateIn{0%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,-200deg);transform:rotate3d(0,0,1,-200deg);opacity:0}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateIn{0%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,-200deg);transform:rotate3d(0,0,1,-200deg);opacity:0}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:none;transform:none;opacity:1}}.rotateIn{-webkit-animation-name:rotateIn;animation-name:rotateIn}@-webkit-keyframes rotateInDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInDownLeft{-webkit-animation-name:rotateInDownLeft;animation-name:rotateInDownLeft}@-webkit-keyframes rotateInDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInDownRight{-webkit-animation-name:rotateInDownRight;animation-name:rotateInDownRight}@-webkit-keyframes rotateInUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInUpLeft{-webkit-animation-name:rotateInUpLeft;animation-name:rotateInUpLeft}@-webkit-keyframes rotateInUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-90deg);transform:rotate3d(0,0,1,-90deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}@keyframes rotateInUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-90deg);transform:rotate3d(0,0,1,-90deg);opacity:0}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:none;transform:none;opacity:1}}.rotateInUpRight{-webkit-animation-name:rotateInUpRight;animation-name:rotateInUpRight}@-webkit-keyframes rotateOut{0%{-webkit-transform-origin:center;transform-origin:center;opacity:1}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,200deg);transform:rotate3d(0,0,1,200deg);opacity:0}}@keyframes rotateOut{0%{-webkit-transform-origin:center;transform-origin:center;opacity:1}100%{-webkit-transform-origin:center;transform-origin:center;-webkit-transform:rotate3d(0,0,1,200deg);transform:rotate3d(0,0,1,200deg);opacity:0}}.rotateOut{-webkit-animation-name:rotateOut;animation-name:rotateOut}@-webkit-keyframes rotateOutDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}}@keyframes rotateOutDownLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,45deg);transform:rotate3d(0,0,1,45deg);opacity:0}}.rotateOutDownLeft{-webkit-animation-name:rotateOutDownLeft;animation-name:rotateOutDownLeft}@-webkit-keyframes rotateOutDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes rotateOutDownRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}.rotateOutDownRight{-webkit-animation-name:rotateOutDownRight;animation-name:rotateOutDownRight}@-webkit-keyframes rotateOutUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}@keyframes rotateOutUpLeft{0%{-webkit-transform-origin:left bottom;transform-origin:left bottom;opacity:1}100%{-webkit-transform-origin:left bottom;transform-origin:left bottom;-webkit-transform:rotate3d(0,0,1,-45deg);transform:rotate3d(0,0,1,-45deg);opacity:0}}.rotateOutUpLeft{-webkit-animation-name:rotateOutUpLeft;animation-name:rotateOutUpLeft}@-webkit-keyframes rotateOutUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,90deg);transform:rotate3d(0,0,1,90deg);opacity:0}}@keyframes rotateOutUpRight{0%{-webkit-transform-origin:right bottom;transform-origin:right bottom;opacity:1}100%{-webkit-transform-origin:right bottom;transform-origin:right bottom;-webkit-transform:rotate3d(0,0,1,90deg);transform:rotate3d(0,0,1,90deg);opacity:0}}.rotateOutUpRight{-webkit-animation-name:rotateOutUpRight;animation-name:rotateOutUpRight}@-webkit-keyframes hinge{0%{-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}20%,60%{-webkit-transform:rotate3d(0,0,1,80deg);transform:rotate3d(0,0,1,80deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}40%,80%{-webkit-transform:rotate3d(0,0,1,60deg);transform:rotate3d(0,0,1,60deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out;opacity:1}100%{-webkit-transform:translate3d(0,700px,0);transform:translate3d(0,700px,0);opacity:0}}@keyframes hinge{0%{-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}20%,60%{-webkit-transform:rotate3d(0,0,1,80deg);transform:rotate3d(0,0,1,80deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}40%,80%{-webkit-transform:rotate3d(0,0,1,60deg);transform:rotate3d(0,0,1,60deg);-webkit-transform-origin:top left;transform-origin:top left;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out;opacity:1}100%{-webkit-transform:translate3d(0,700px,0);transform:translate3d(0,700px,0);opacity:0}}.hinge{-webkit-animation-name:hinge;animation-name:hinge}@-webkit-keyframes rollIn{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg);transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;-webkit-transform:none;transform:none}}@keyframes rollIn{0%{opacity:0;-webkit-transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg);transform:translate3d(-100%,0,0) rotate3d(0,0,1,-120deg)}100%{opacity:1;-webkit-transform:none;transform:none}}.rollIn{-webkit-animation-name:rollIn;animation-name:rollIn}@-webkit-keyframes rollOut{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg);transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}@keyframes rollOut{0%{opacity:1}100%{opacity:0;-webkit-transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg);transform:translate3d(100%,0,0) rotate3d(0,0,1,120deg)}}.rollOut{-webkit-animation-name:rollOut;animation-name:rollOut}@-webkit-keyframes zoomIn{0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes zoomIn{0%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}50%{opacity:1}}.zoomIn{-webkit-animation-name:zoomIn;animation-name:zoomIn}@-webkit-keyframes zoomInDown{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInDown{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInDown{-webkit-animation-name:zoomInDown;animation-name:zoomInDown}@-webkit-keyframes zoomInLeft{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(10px,0,0);transform:scale3d(.475,.475,.475) translate3d(10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInLeft{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(-1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(10px,0,0);transform:scale3d(.475,.475,.475) translate3d(10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInLeft{-webkit-animation-name:zoomInLeft;animation-name:zoomInLeft}@-webkit-keyframes zoomInRight{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInRight{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);transform:scale3d(.1,.1,.1) translate3d(1000px,0,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);transform:scale3d(.475,.475,.475) translate3d(-10px,0,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInRight{-webkit-animation-name:zoomInRight;animation-name:zoomInRight}@-webkit-keyframes zoomInUp{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomInUp{0%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);transform:scale3d(.1,.1,.1) translate3d(0,1000px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}60%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomInUp{-webkit-animation-name:zoomInUp;animation-name:zoomInUp}@-webkit-keyframes zoomOut{0%{opacity:1}50%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}100%{opacity:0}}@keyframes zoomOut{0%{opacity:1}50%{opacity:0;-webkit-transform:scale3d(.3,.3,.3);transform:scale3d(.3,.3,.3)}100%{opacity:0}}.zoomOut{-webkit-animation-name:zoomOut;animation-name:zoomOut}@-webkit-keyframes zoomOutDown{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomOutDown{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);transform:scale3d(.475,.475,.475) translate3d(0,-60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomOutDown{-webkit-animation-name:zoomOutDown;animation-name:zoomOutDown}@-webkit-keyframes zoomOutLeft{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(42px,0,0);transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(-2000px,0,0);transform:scale(.1) translate3d(-2000px,0,0);-webkit-transform-origin:left center;transform-origin:left center}}@keyframes zoomOutLeft{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(42px,0,0);transform:scale3d(.475,.475,.475) translate3d(42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(-2000px,0,0);transform:scale(.1) translate3d(-2000px,0,0);-webkit-transform-origin:left center;transform-origin:left center}}.zoomOutLeft{-webkit-animation-name:zoomOutLeft;animation-name:zoomOutLeft}@-webkit-keyframes zoomOutRight{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-42px,0,0);transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(2000px,0,0);transform:scale(.1) translate3d(2000px,0,0);-webkit-transform-origin:right center;transform-origin:right center}}@keyframes zoomOutRight{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(-42px,0,0);transform:scale3d(.475,.475,.475) translate3d(-42px,0,0)}100%{opacity:0;-webkit-transform:scale(.1) translate3d(2000px,0,0);transform:scale(.1) translate3d(2000px,0,0);-webkit-transform-origin:right center;transform-origin:right center}}.zoomOutRight{-webkit-animation-name:zoomOutRight;animation-name:zoomOutRight}@-webkit-keyframes zoomOutUp{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}@keyframes zoomOutUp{40%{opacity:1;-webkit-transform:scale3d(.475,.475,.475) translate3d(0,60px,0);transform:scale3d(.475,.475,.475) translate3d(0,60px,0);-webkit-animation-timing-function:cubic-bezier(0.55,.055,.675,.19);animation-timing-function:cubic-bezier(0.55,.055,.675,.19)}100%{opacity:0;-webkit-transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);transform:scale3d(.1,.1,.1) translate3d(0,-2000px,0);-webkit-transform-origin:center bottom;transform-origin:center bottom;-webkit-animation-timing-function:cubic-bezier(0.175,.885,.32,1);animation-timing-function:cubic-bezier(0.175,.885,.32,1)}}.zoomOutUp{-webkit-animation-name:zoomOutUp;animation-name:zoomOutUp}@-webkit-keyframes slideInDown{0%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInDown{0%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInDown{-webkit-animation-name:slideInDown;animation-name:slideInDown}@-webkit-keyframes slideInLeft{0%{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInLeft{0%{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInLeft{-webkit-animation-name:slideInLeft;animation-name:slideInLeft}@-webkit-keyframes slideInRight{0%{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInRight{0%{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInRight{-webkit-animation-name:slideInRight;animation-name:slideInRight}@-webkit-keyframes slideInUp{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes slideInUp{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);visibility:visible}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.slideInUp{-webkit-animation-name:slideInUp;animation-name:slideInUp}@-webkit-keyframes slideOutDown{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}@keyframes slideOutDown{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}}.slideOutDown{-webkit-animation-name:slideOutDown;animation-name:slideOutDown}@-webkit-keyframes slideOutLeft{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}@keyframes slideOutLeft{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}}.slideOutLeft{-webkit-animation-name:slideOutLeft;animation-name:slideOutLeft}@-webkit-keyframes slideOutRight{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}@keyframes slideOutRight{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}}.slideOutRight{-webkit-animation-name:slideOutRight;animation-name:slideOutRight}@-webkit-keyframes slideOutUp{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes slideOutUp{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{visibility:hidden;-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.slideOutUp{-webkit-animation-name:slideOutUp;animation-name:slideOutUp}/*!\n" +
    " * font-awesome-animation - v0.0.7\n" +
    " * https://github.com/l-lin/font-awesome-animation\n" +
    " * License: MIT\n" +
    " */@-webkit-keyframes wrench{0%{-webkit-transform:rotate(-12deg);transform:rotate(-12deg)}8%{-webkit-transform:rotate(12deg);transform:rotate(12deg)}10%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}18%,20%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}28%,30%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}38%,40%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}48%,50%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}58%,60%{-webkit-transform:rotate(-24deg);transform:rotate(-24deg)}68%{-webkit-transform:rotate(24deg);transform:rotate(24deg)}75%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes wrench{0%{-webkit-transform:rotate(-12deg);-ms-transform:rotate(-12deg);transform:rotate(-12deg)}8%{-webkit-transform:rotate(12deg);-ms-transform:rotate(12deg);transform:rotate(12deg)}10%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}18%,20%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}28%,30%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}38%,40%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}48%,50%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}58%,60%{-webkit-transform:rotate(-24deg);-ms-transform:rotate(-24deg);transform:rotate(-24deg)}68%{-webkit-transform:rotate(24deg);-ms-transform:rotate(24deg);transform:rotate(24deg)}75%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}}.faa-parent.animated-hover:hover>.faa-wrench,.faa-wrench.animated,.faa-wrench.animated-hover:hover{-webkit-animation:wrench 2.5s ease infinite;animation:wrench 2.5s ease infinite;transform-origin-x:90%;transform-origin-y:35%;transform-origin-z:initial}.faa-parent.animated-hover:hover>.faa-wrench.faa-fast,.faa-wrench.animated-hover.faa-fast:hover,.faa-wrench.animated.faa-fast{-webkit-animation:wrench 1.2s ease infinite;animation:wrench 1.2s ease infinite}.faa-parent.animated-hover:hover>.faa-wrench.faa-slow,.faa-wrench.animated-hover.faa-slow:hover,.faa-wrench.animated.faa-slow{-webkit-animation:wrench 3.7s ease infinite;animation:wrench 3.7s ease infinite}@-webkit-keyframes ring{0%{-webkit-transform:rotate(-15deg);transform:rotate(-15deg)}2%{-webkit-transform:rotate(15deg);transform:rotate(15deg)}4%{-webkit-transform:rotate(-18deg);transform:rotate(-18deg)}6%{-webkit-transform:rotate(18deg);transform:rotate(18deg)}8%{-webkit-transform:rotate(-22deg);transform:rotate(-22deg)}10%{-webkit-transform:rotate(22deg);transform:rotate(22deg)}12%{-webkit-transform:rotate(-18deg);transform:rotate(-18deg)}14%{-webkit-transform:rotate(18deg);transform:rotate(18deg)}16%{-webkit-transform:rotate(-12deg);transform:rotate(-12deg)}18%{-webkit-transform:rotate(12deg);transform:rotate(12deg)}20%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}}@keyframes ring{0%{-webkit-transform:rotate(-15deg);-ms-transform:rotate(-15deg);transform:rotate(-15deg)}2%{-webkit-transform:rotate(15deg);-ms-transform:rotate(15deg);transform:rotate(15deg)}4%{-webkit-transform:rotate(-18deg);-ms-transform:rotate(-18deg);transform:rotate(-18deg)}6%{-webkit-transform:rotate(18deg);-ms-transform:rotate(18deg);transform:rotate(18deg)}8%{-webkit-transform:rotate(-22deg);-ms-transform:rotate(-22deg);transform:rotate(-22deg)}10%{-webkit-transform:rotate(22deg);-ms-transform:rotate(22deg);transform:rotate(22deg)}12%{-webkit-transform:rotate(-18deg);-ms-transform:rotate(-18deg);transform:rotate(-18deg)}14%{-webkit-transform:rotate(18deg);-ms-transform:rotate(18deg);transform:rotate(18deg)}16%{-webkit-transform:rotate(-12deg);-ms-transform:rotate(-12deg);transform:rotate(-12deg)}18%{-webkit-transform:rotate(12deg);-ms-transform:rotate(12deg);transform:rotate(12deg)}20%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}}.faa-parent.animated-hover:hover>.faa-ring,.faa-ring.animated,.faa-ring.animated-hover:hover{-webkit-animation:ring 2s ease infinite;animation:ring 2s ease infinite;transform-origin-x:50%;transform-origin-y:0;transform-origin-z:initial}.faa-parent.animated-hover:hover>.faa-ring.faa-fast,.faa-ring.animated-hover.faa-fast:hover,.faa-ring.animated.faa-fast{-webkit-animation:ring 1s ease infinite;animation:ring 1s ease infinite}.faa-parent.animated-hover:hover>.faa-ring.faa-slow,.faa-ring.animated-hover.faa-slow:hover,.faa-ring.animated.faa-slow{-webkit-animation:ring 3s ease infinite;animation:ring 3s ease infinite}@-webkit-keyframes vertical{0%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}4%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}8%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}12%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}16%{-webkit-transform:translate(0,-3px);transform:translate(0,-3px)}20%{-webkit-transform:translate(0,3px);transform:translate(0,3px)}22%{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes vertical{0%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}4%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}8%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}12%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}16%{-webkit-transform:translate(0,-3px);-ms-transform:translate(0,-3px);transform:translate(0,-3px)}20%{-webkit-transform:translate(0,3px);-ms-transform:translate(0,3px);transform:translate(0,3px)}22%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}}.faa-parent.animated-hover:hover>.faa-vertical,.faa-vertical.animated,.faa-vertical.animated-hover:hover{-webkit-animation:vertical 2s ease infinite;animation:vertical 2s ease infinite}.faa-parent.animated-hover:hover>.faa-vertical.faa-fast,.faa-vertical.animated-hover.faa-fast:hover,.faa-vertical.animated.faa-fast{-webkit-animation:vertical 1s ease infinite;animation:vertical 1s ease infinite}.faa-parent.animated-hover:hover>.faa-vertical.faa-slow,.faa-vertical.animated-hover.faa-slow:hover,.faa-vertical.animated.faa-slow{-webkit-animation:vertical 4s ease infinite;animation:vertical 4s ease infinite}@-webkit-keyframes horizontal{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}6%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}12%{-webkit-transform:translate(0,0);transform:translate(0,0)}18%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}24%{-webkit-transform:translate(0,0);transform:translate(0,0)}30%{-webkit-transform:translate(5px,0);transform:translate(5px,0)}36%{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes horizontal{0%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}6%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}12%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}18%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}24%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}30%{-webkit-transform:translate(5px,0);-ms-transform:translate(5px,0);transform:translate(5px,0)}36%{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}}.faa-horizontal.animated,.faa-horizontal.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-horizontal{-webkit-animation:horizontal 2s ease infinite;animation:horizontal 2s ease infinite}.faa-horizontal.animated-hover.faa-fast:hover,.faa-horizontal.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-horizontal.faa-fast{-webkit-animation:horizontal 1s ease infinite;animation:horizontal 1s ease infinite}.faa-horizontal.animated-hover.faa-slow:hover,.faa-horizontal.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-horizontal.faa-slow{-webkit-animation:horizontal 3s ease infinite;animation:horizontal 3s ease infinite}@-webkit-keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,100%,50%{opacity:1}25%,75%{opacity:0}}.faa-flash.animated,.faa-flash.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-flash{-webkit-animation:flash 2s ease infinite;animation:flash 2s ease infinite}.faa-flash.animated-hover.faa-fast:hover,.faa-flash.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-flash.faa-fast{-webkit-animation:flash 1s ease infinite;animation:flash 1s ease infinite}.faa-flash.animated-hover.faa-slow:hover,.faa-flash.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-flash.faa-slow{-webkit-animation:flash 3s ease infinite;animation:flash 3s ease infinite}@-webkit-keyframes bounce{0%,10%,20%,50%,80%{-webkit-transform:translateY(0);transform:translateY(0)}40%,60%{-webkit-transform:translateY(-15px);transform:translateY(-15px)}}@keyframes bounce{0%,10%,20%,50%,80%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}40%,60%{-webkit-transform:translateY(-15px);-ms-transform:translateY(-15px);transform:translateY(-15px)}}.faa-bounce.animated,.faa-bounce.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-bounce{-webkit-animation:bounce 2s ease infinite;animation:bounce 2s ease infinite}.faa-bounce.animated-hover.faa-fast:hover,.faa-bounce.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-bounce.faa-fast{-webkit-animation:bounce 1s ease infinite;animation:bounce 1s ease infinite}.faa-bounce.animated-hover.faa-slow:hover,.faa-bounce.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-bounce.faa-slow{-webkit-animation:bounce 3s ease infinite;animation:bounce 3s ease infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);-ms-transform:rotate(359deg);transform:rotate(359deg)}}.faa-parent.animated-hover:hover>.faa-spin,.faa-spin.animated,.faa-spin.animated-hover:hover{-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}.faa-parent.animated-hover:hover>.faa-spin.faa-fast,.faa-spin.animated-hover.faa-fast:hover,.faa-spin.animated.faa-fast{-webkit-animation:spin .7s linear infinite;animation:spin .7s linear infinite}.faa-parent.animated-hover:hover>.faa-spin.faa-slow,.faa-spin.animated-hover.faa-slow:hover,.faa-spin.animated.faa-slow{-webkit-animation:spin 2.2s linear infinite;animation:spin 2.2s linear infinite}@-webkit-keyframes float{0%{-webkit-transform:translateY(0);transform:translateY(0)}50%{-webkit-transform:translateY(-6px);transform:translateY(-6px)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes float{0%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}50%{-webkit-transform:translateY(-6px);-ms-transform:translateY(-6px);transform:translateY(-6px)}100%{-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}}.faa-float.animated,.faa-float.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-float{-webkit-animation:float 2s linear infinite;animation:float 2s linear infinite}.faa-float.animated-hover.faa-fast:hover,.faa-float.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-float.faa-fast{-webkit-animation:float 1s linear infinite;animation:float 1s linear infinite}.faa-float.animated-hover.faa-slow:hover,.faa-float.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-float.faa-slow{-webkit-animation:float 3s linear infinite;animation:float 3s linear infinite}@-webkit-keyframes pulse{0%{-webkit-transform:scale(1.1);transform:scale(1.1)}50%{-webkit-transform:scale(0.8);transform:scale(0.8)}100%{-webkit-transform:scale(1.1);transform:scale(1.1)}}@keyframes pulse{0%{-webkit-transform:scale(1.1);-ms-transform:scale(1.1);transform:scale(1.1)}50%{-webkit-transform:scale(0.8);-ms-transform:scale(0.8);transform:scale(0.8)}100%{-webkit-transform:scale(1.1);-ms-transform:scale(1.1);transform:scale(1.1)}}.faa-parent.animated-hover:hover>.faa-pulse,.faa-pulse.animated,.faa-pulse.animated-hover:hover{-webkit-animation:pulse 2s linear infinite;animation:pulse 2s linear infinite}.faa-parent.animated-hover:hover>.faa-pulse.faa-fast,.faa-pulse.animated-hover.faa-fast:hover,.faa-pulse.animated.faa-fast{-webkit-animation:pulse 1s linear infinite;animation:pulse 1s linear infinite}.faa-parent.animated-hover:hover>.faa-pulse.faa-slow,.faa-pulse.animated-hover.faa-slow:hover,.faa-pulse.animated.faa-slow{-webkit-animation:pulse 3s linear infinite;animation:pulse 3s linear infinite}.faa-parent.animated-hover:hover>.faa-shake,.faa-shake.animated,.faa-shake.animated-hover:hover{-webkit-animation:wrench 2.5s ease infinite;animation:wrench 2.5s ease infinite}.faa-parent.animated-hover:hover>.faa-shake.faa-fast,.faa-shake.animated-hover.faa-fast:hover,.faa-shake.animated.faa-fast{-webkit-animation:wrench 1.2s ease infinite;animation:wrench 1.2s ease infinite}.faa-parent.animated-hover:hover>.faa-shake.faa-slow,.faa-shake.animated-hover.faa-slow:hover,.faa-shake.animated.faa-slow{-webkit-animation:wrench 3.7s ease infinite;animation:wrench 3.7s ease infinite}@-webkit-keyframes tada{0%{-webkit-transform:scale(1);transform:scale(1)}10%,20%{-webkit-transform:scale(.9) rotate(-8deg);transform:scale(.9) rotate(-8deg)}30%,50%,70%{-webkit-transform:scale(1.3) rotate(8deg);transform:scale(1.3) rotate(8deg)}40%,60%{-webkit-transform:scale(1.3) rotate(-8deg);transform:scale(1.3) rotate(-8deg)}80%{-webkit-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}}@keyframes tada{0%{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}10%,20%{-webkit-transform:scale(.9) rotate(-8deg);-ms-transform:scale(.9) rotate(-8deg);transform:scale(.9) rotate(-8deg)}30%,50%,70%{-webkit-transform:scale(1.3) rotate(8deg);-ms-transform:scale(1.3) rotate(8deg);transform:scale(1.3) rotate(8deg)}40%,60%{-webkit-transform:scale(1.3) rotate(-8deg);-ms-transform:scale(1.3) rotate(-8deg);transform:scale(1.3) rotate(-8deg)}80%{-webkit-transform:scale(1) rotate(0);-ms-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}}.faa-parent.animated-hover:hover>.faa-tada,.faa-tada.animated,.faa-tada.animated-hover:hover{-webkit-animation:tada 2s linear infinite;animation:tada 2s linear infinite}.faa-parent.animated-hover:hover>.faa-tada.faa-fast,.faa-tada.animated-hover.faa-fast:hover,.faa-tada.animated.faa-fast{-webkit-animation:tada 1s linear infinite;animation:tada 1s linear infinite}.faa-parent.animated-hover:hover>.faa-tada.faa-slow,.faa-tada.animated-hover.faa-slow:hover,.faa-tada.animated.faa-slow{-webkit-animation:tada 3s linear infinite;animation:tada 3s linear infinite}@-webkit-keyframes passing{0%{-webkit-transform:translateX(-50%);transform:translateX(-50%);opacity:0}50%{-webkit-transform:translateX(0%);transform:translateX(0%);opacity:1}100%{-webkit-transform:translateX(50%);transform:translateX(50%);opacity:0}}@keyframes passing{0%{-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%);opacity:0}50%{-webkit-transform:translateX(0%);-ms-transform:translateX(0%);transform:translateX(0%);opacity:1}100%{-webkit-transform:translateX(50%);-ms-transform:translateX(50%);transform:translateX(50%);opacity:0}}.faa-parent.animated-hover:hover>.faa-passing,.faa-passing.animated,.faa-passing.animated-hover:hover{-webkit-animation:passing 2s linear infinite;animation:passing 2s linear infinite}.faa-parent.animated-hover:hover>.faa-passing.faa-fast,.faa-passing.animated-hover.faa-fast:hover,.faa-passing.animated.faa-fast{-webkit-animation:passing 1s linear infinite;animation:passing 1s linear infinite}.faa-parent.animated-hover:hover>.faa-passing.faa-slow,.faa-passing.animated-hover.faa-slow:hover,.faa-passing.animated.faa-slow{-webkit-animation:passing 3s linear infinite;animation:passing 3s linear infinite}@-webkit-keyframes burst{0%{opacity:.6}50%{-webkit-transform:scale(1.8);transform:scale(1.8);opacity:0}100%{opacity:0}}@keyframes burst{0%{opacity:.6}50%{-webkit-transform:scale(1.8);-ms-transform:scale(1.8);transform:scale(1.8);opacity:0}100%{opacity:0}}.faa-burst.animated,.faa-burst.animated-hover:hover,.faa-parent.animated-hover:hover>.faa-burst{-webkit-animation:burst 2s infinite linear;animation:burst 2s infinite linear}.faa-burst.animated-hover.faa-fast:hover,.faa-burst.animated.faa-fast,.faa-parent.animated-hover:hover>.faa-burst.faa-fast{-webkit-animation:burst 1s infinite linear;animation:burst 1s infinite linear}.faa-burst.animated-hover.faa-slow:hover,.faa-burst.animated.faa-slow,.faa-parent.animated-hover:hover>.faa-burst.faa-slow{-webkit-animation:burst 3s infinite linear;animation:burst 3s infinite linear}body{overflow:hidden;background:linear-gradient(to bottom,rgba(255,255,255,.95)0,rgba(255,255,255,.95)100%),url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIHpvb21BbmRQYW49ImRpc2FibGUiPjxkZWZzIGlkPSJzdmdFZGl0b3JEZWZzIj48cG9seWdvbiBpZD0ic3ZnRWRpdG9yUG9seWdvbkRlZnMiIHN0cm9rZT0iYmxhY2siIGZpbGw9ImtoYWtpIiBzdHlsZT0idmVjdG9yLWVmZmVjdDogbm9uLXNjYWxpbmctc3Ryb2tlOyBzdHJva2Utd2lkdGg6IDFweDsiLz48L2RlZnM+PHJlY3QgaWQ9InN2Z0VkaXRvckJhY2tncm91bmQiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgc3R5bGU9ImZpbGw6IG5vbmU7IHN0cm9rZTogbm9uZTsiLz48cmVjdCB4PSIwIiB5PSIwIiBpZD0iZTFfcmVjdGFuZ2xlIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOiAxcHg7IHZlY3Rvci1lZmZlY3Q6IG5vbi1zY2FsaW5nLXN0cm9rZTsiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iZ3JheSIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgc3R5bGU9InN0cm9rZS13aWR0aDogMXB4OyB2ZWN0b3ItZWZmZWN0OiBub24tc2NhbGluZy1zdHJva2U7IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImdyYXkiIGlkPSJlMl9yZWN0YW5nbGUiLz48L3N2Zz4=) repeat 0 0}body .noselect{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}body .view-panel{color:silver;background-color:rgba(255,255,255,.95)}body .view-toolbar{width:50%;height:32px;padding:0 32px;box-sizing:border-box;background-color:#fff}body .view-toolbar.left{text-align:right;float:left}body .view-toolbar.right{text-align:left;float:right}body .top-menu{top:0;left:0;right:0;position:absolute;max-height:32px;overflow:hidden;background-color:#FFF;z-index:2100000300}body .top-menu a{padding:6px 12px;color:#000}body .top-menu .top-div{width:50%;margin:0}body .top-menu .top-div .nav.navbar-nav{float:right}body .top-spacer{width:100%;margin:32px auto 0;position:absolute;z-index:2100000400}body .top-spacer .mask{overflow:hidden;height:8px}body .top-spacer .mask:after{content:'';display:block;margin:-25px auto 0;width:50%;height:25px;border-radius:10.42px;box-shadow:0 0 8px #000}body .top-spacer span{width:50px;height:50px;position:absolute;bottom:100%;margin-bottom:-25px;left:50%;margin-left:-25px;border-radius:100%;box-shadow:0 2px 4px #999;background:#fff;z-index:2100000500;pointer-events:auto}body .top-spacer span i{top:4px;bottom:4px;left:4px;right:4px;position:absolute;border-radius:100%;border:1px dashed #aaa;text-align:center;line-height:40px;font-style:normal;color:#999;z-index:2100000500}body .top-hint{font-size:12px;text-align:left!important}body .top-hint .tab{margin-left:16px!important}body .ui-view-left{margin-top:0!important;padding-top:0!important;z-index:2100000300}body .ui-view-left .list-group-item.active,body .ui-view-left .nav-pills>li.active>a,body .ui-view-left .nav-pills>li.active>a:focus,body .ui-view-left .nav-pills>li.active>a:hover{color:#000!important;background-color:#d8e1e8!important;border-radius:0!important}body .ui-view-main{overflow:auto}body .vertical-spacer{width:200px;left:0;top:32px;bottom:24px;position:absolute;display:block;overflow:auto;background-color:#fff}body .vertical-spacer .mask{overflow:hidden;width:20px;height:100%}body .vertical-spacer.left .mask:after{content:'';display:block;margin-left:-20px;width:20px;height:100%;border-radius:.1px;box-shadow:0 0 8px #000}body .vertical-spacer.right .mask{right:0;position:absolute}body .vertical-spacer.right .mask:before{content:'';display:block;margin-left:20px;width:20px;height:100%;border-radius:120px;box-shadow:0 0 6px #000}body .vertical-spacer .left-container{padding:3px}body .main-contents{top:32px;left:200px;right:0;bottom:24px;padding:3px;position:absolute;overflow:auto;z-index:2100000100}body .main-contents.expanded{left:0}body .bottom-spacer{bottom:0;margin:0;padding:0;font-size:10px;color:gray;width:100%;height:24px;position:absolute;z-index:2100000400}body .bottom-spacer .mask{margin:0 auto;overflow:hidden;height:6px;width:100%;position:absolute}body .bottom-spacer .mask:after{content:'';display:block;margin:-24px auto 0;width:50%;height:24px;border-radius:10.42px;box-shadow:0 0 8px #000}body .bottom-spacer .bottom-container{height:24px;padding:6px;text-align:center;vertical-align:middle}body .docked-container{margin:0;padding:0;color:#333;font-size:11px;font-family:Verdana,Geneva,Tahoma,sans-serif!important;text-align:left;line-height:1.42857143;left:0;right:0;top:0;bottom:0;position:absolute;outline:solid 1px gray;z-index:2100000000}body .docked-container .anim-slide{left:32px!important}body .docked-container .anim-fade{opacity:0}body .docked-full.docked-container{pointer-events:auto}body .docked-full .anim-fade{opacity:0;-webkit-animation:fade-in .5s forwards;animation:fade-in .5s forwards}@-webkit-keyframes fade-in{100%{opacity:1}}@keyframes fade-in{100%{opacity:1}}body .docked-full .anim-slide{left:32px!important;opacity:.5;-webkit-animation:slider-in .5s forwards;animation:slider-in .5s forwards}body .docked-full .anim-slide:hover{opacity:1}@-webkit-keyframes slider-in{100%{left:50%;opacity:1}}@keyframes slider-in{100%{left:50%;opacity:1}}body .docked-left.docked-container{pointer-events:none}body .docked-left .anim-fade{opacity:1;-webkit-animation:fade-out .5s forwards;animation:fade-out .5s forwards}@-webkit-keyframes fade-out{100%{opacity:0}}@keyframes fade-out{100%{opacity:0}}body .docked-left .anim-slide{animation:slider-out .5s forwards;-webkit-animation:slider-out .5s forwards;left:50%!important;opacity:.5}body .docked-left .anim-slide:hover{opacity:1!important}@-webkit-keyframes slider-out{100%{left:32px!important;opacity:.85}}@keyframes slider-out{100%{left:32px!important;opacity:.85}}"
  );


  $templateCache.put('modules/editor/styles/css/editor.min.css',
    ".contents.docked{padding:0!important;margin:0!important}.text-editor{width:100%;height:100%;position:relative}.text-area{width:100%;height:100%;padding:6px;max-height:420px;position:relative}.CodeMirror{border:1px solid #eee;min-height:640px;height:100%}"
  );
}]);