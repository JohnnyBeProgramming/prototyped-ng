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
                                    name: 'CSS3 Generator', url: 'http://css3generator.com/'
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
                        this.includeDefaultStyles = true;
                        this.includeSandboxStyles = false;
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

                    AppState.prototype.importStyle = function ($templateCache, url, parentElem) {
                        if (typeof parentElem === "undefined") { parentElem = null; }
                        var element = parentElem || document.head;
                        var checks = [
                            '[src="' + url + '"]',
                            '[href="' + url + '"]',
                            '[resx-src="' + url + '"]'
                        ];

                        var found = false;
                        checks.forEach(function (checkXPath) {
                            if ($(checkXPath).length > 0) {
                                found = true;
                            }
                        });

                        if (!found) {
                            console.debug(' - Attaching: ' + url);
                            var html = '<link resx-src="' + url + '" href="' + url + '" rel="stylesheet" type="text/css" />';
                            var cache = $templateCache.get(url);
                            if (cache != null) {
                                html = '<style resx-src="' + url + '">' + cache + '</style>';
                            }
                            $(element).append(html);
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
                                    var routePrefix = this.appState.hashPre || '';
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
                                        console.debug(' - Route Prefix:', routePrefix);
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
    '$rootScope', '$state', '$templateCache', 'appConfig', 'appState', function ($rootScope, $state, $templateCache, appConfig, appState) {
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

        if (appConfig.options.includeDefaultStyles) {
            appState.importStyle($templateCache, 'assets/css/app.min.css');
            appState.importStyle($templateCache, 'assets/css/prototyped.min.css');
        }
        if (appConfig.options.includeSandboxStyles) {
            appState.importStyle($templateCache, 'assets/css/sandbox.min.css');
        }
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
