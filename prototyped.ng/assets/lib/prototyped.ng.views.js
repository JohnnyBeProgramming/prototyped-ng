angular.module('prototyped.ng.views', []).run(['$templateCache', function($templateCache) {
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
  $templateCache.put('modules/explore/views/layout.tpl.html',
    '<svg id=LayoutView class=region-overlay></svg>');
  $templateCache.put('modules/explore/views/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a ui:sref=proto.explore><i class="fa fa-arrow-circle-left"></i>&nbsp; Site Map Explorer</a></li><li class=list-group-item style="padding: 6px 0" ng-if="state.current.name == \'proto.explore\'"><abn:tree tree-data=navigation.siteExplorer.children icon-leaf="fa fa-file-o" icon-expand="fa fa-plus" icon-collapse="fa fa-minus" expand-level=2></abn:tree></li><li class=list-group-item ui:sref-active=active ng-if=navigation.externalLinks><a ui:sref=proto.links><i class="fa fa-globe"></i>&nbsp; External Links</a></li><li class=list-group-item style="padding: 6px 0; overflow-x:hidden" ng-if="navigation.externalLinks && state.current.name == \'proto.links\'"><abn:tree tree-data=navigation.externalLinks.children icon-leaf="fa fa-globe" icon-expand="fa fa-plus" icon-collapse="fa fa-minus" expand-level=2></abn:tree></li><li class=list-group-item ui:sref-active=active ng-if=navigation.fileSystem><a ui:sref=proto.browser><i class="fa fa-hdd-o"></i>&nbsp; File System Browser</a></li><li class=list-group-item style="padding: 6px 0" ng-if="navigation.fileSystem && state.current.name == \'proto.browser\'"><style resx:import=assets/css/images.min.css></style><div class=info-overview ng-if=!appNode.active><div class=panel-icon-lg><div class="img-drive-warn inactive-gray" style="height: 128px; width: 128px"></div></div></div><div ng-if="appNode.active && navigation.fileSystem"><abn:tree tree-data=navigation.fileSystem.children icon-leaf="fa fa-folder" icon-expand="fa fa-folder" icon-collapse="fa fa-folder-open" expand-level=2></abn:tree></div></li><li class=list-group-item ui:sref-active=active ng-if=navigation.clientStates><a ui:sref=proto.routing><i class="fa fa-tasks"></i>&nbsp; UI State &amp; Routing</a></li><li class=list-group-item style="padding: 6px 0" ng-if="navigation.clientStates && state.current.name == \'proto.routing\'"><abn:tree tree-data=navigation.clientStates icon-leaf="fa fa-cog" icon-expand="fa fa-plus" icon-collapse="fa fa-minus" expand-level=2></abn:tree></li></ul>');
  $templateCache.put('modules/explore/views/main.tpl.html',
    '<div class=inspection-view style="width: 100%"><style>.overlay-group {\n' +
    '            fill: rgba(255, 255, 255, 0.1);\n' +
    '            user-select: none;\n' +
    '        }\n' +
    '\n' +
    '        .contents-group {\n' +
    '        }\n' +
    '\n' +
    '        .ui-view-main {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '            position: relative;\n' +
    '        }\n' +
    '\n' +
    '        .ui-view-left {\n' +
    '            margin-right: 0 !important;\n' +
    '        }\n' +
    '\n' +
    '        .inspection-view {\n' +
    '            margin: 0;\n' +
    '            left: 0;\n' +
    '            right: 0;\n' +
    '            bottom: 0;\n' +
    '            top: 0;\n' +
    '            display: flex;\n' +
    '            position: absolute;\n' +
    '            flex-direction: column;\n' +
    '        }\n' +
    '\n' +
    '        .inspection-contents {\n' +
    '            margin: 0;\n' +
    '            width: 100%;\n' +
    '            flex-grow: 1;\n' +
    '            flex-shrink: 0;\n' +
    '        }\n' +
    '\n' +
    '        .region-overlay {\n' +
    '            fill: none;\n' +
    '            pointer-events: all;\n' +
    '        }\n' +
    '\n' +
    '        .outer-region {\n' +
    '            fill: rgba(190, 190, 190, 0.75);\n' +
    '            stroke: rgba(0, 0, 0, 0.75);\n' +
    '            stroke-width: 2;\n' +
    '        }\n' +
    '\n' +
    '        .window-region {\n' +
    '            fill: rgba(225, 225, 225, 0.50);\n' +
    '            stroke: rgba(0, 0, 0, 1);\n' +
    '            stroke-width: 2;\n' +
    '        }\n' +
    '\n' +
    '        .inner-region {\n' +
    '            fill: rgb(186, 186, 186);\n' +
    '            fill-opacity: 0.5;\n' +
    '            stroke: rgba(0, 0, 0, 0.35);\n' +
    '            stroke-width: 1;\n' +
    '        }\n' +
    '\n' +
    '            .inner-region.ng-elem {\n' +
    '                fill: rgb(118, 255, 85);\n' +
    '                stroke: rgba(48, 168, 0, 0.91);\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-dataz {\n' +
    '                fill: rgb(255, 0, 226);\n' +
    '                stroke: rgba(208, 0, 184, 0.71);\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-link {\n' +
    '                fill: rgb(0, 161, 255);\n' +
    '                stroke: rgba(0, 0, 0, 0.75);\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-form {\n' +
    '                fill: rgb(255, 250, 0);\n' +
    '                stroke: rgb(255, 187, 0);\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-label {\n' +
    '                fill: rgb(255, 187, 0);\n' +
    '                stroke: rgb(255, 216, 0);\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-input {\n' +
    '                fill: rgb(255, 187, 0);\n' +
    '                stroke: rgb(255, 106, 0);\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-button {\n' +
    '                fill: rgb(0, 107, 255);\n' +
    '                stroke: rgb(0, 18, 124);\n' +
    '                stroke-width: 2px;\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-submit {\n' +
    '            }\n' +
    '\n' +
    '            .inner-region.ng-reset {\n' +
    '            }\n' +
    '\n' +
    '            .inner-region:hover {\n' +
    '                stroke-width: 3px;\n' +
    '                fill-opacity: 0.95;\n' +
    '            }</style><page-layout-viewer class=inspection-contents></page-layout-viewer><span style="position: absolute; right: 8px; top: 8px"><div class="btn-group btn-group-xs" role=group aria-label=...><a href="" class="btn btn-default" ng-click=exploreCtrl.togglePerspective()>Show Perspective</a> <a href="" class="btn btn-default" ng-click=exploreCtrl.toggleDockedRegion()>Show Docked</a></div></span></div>');
  $templateCache.put('views/common/components/contents.tpl.html',
    '<div id=contents class=contents><div id=left class="ui-view-left ng-cloak" ui:view=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div><div id=main class=ui-view-main ui:view=main><em class=inactive-fill-text ng:if=false><i class="fa fa-spinner fa-spin"></i> Loading...</em> <b class="inactive-fill-text ng-cloak" ng:if="!(state.current.views[\'main\'] || state.current.views[\'main@\'])"><i class="fa fa-exclamation-triangle faa-flash glow-orange"></i> Page not found</b></div></div>');
  $templateCache.put('views/common/components/footer.tpl.html',
    '<div class=footer><span class=pull-left><label class="log-group ng-cloak" ng:show="appState.logs | typeCount:\'error\'"><i class="glyphicon glyphicon-exclamation-sign glow-red"></i> <a ui:sref=proto.logs class=ng-cloak>Errors ({{ appState.logs | typeCount:\'error\' }})</a></label><label class="log-group ng-cloak" ng:show="appState.logs | typeCount:\'warn\'"><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <a ui:sref=proto.logs class=ng-cloak>Warnings ({{ appState.logs | typeCount:\'warn\' }})</a></label></span> <span ng:if=false><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></span> <span ng:if=true class=ng-cloak>Client Version: <span app:version><em>Loading...</em></span> |</span> <span ui:view=foot>Powered by <a href="https://angularjs.org/">AngularJS</a> <span ng:if=appState.node.active class=ng-cloak>&amp; <a href=https://github.com/rogerwang/node-webkit>Node Webkit</a></span></span> <span ng:if=startAt class=ng-cloak>| Started {{ startAt | fromNow }}</span></div>');
  $templateCache.put('views/common/components/left.tpl.html',
    '<div id=left ui:view=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div>');
  $templateCache.put('views/common/components/menu.tpl.html',
    '<div id=menu class=dragable><div ui:view=menu><ul class="nav navbar-nav"><li ui:sref-active=open><a ui:sref=default>Default</a></li><li ui:sref-active=open ng:repeat="route in appState.routers | orderBy:\'(priority || 1)\'" ng:if="route.menuitem && (!route.visible || route.visible())"><a ng:if=route.menuitem.state ui:sref="{{ route.menuitem.state }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a> <a ng:if=!route.menuitem.state ng:href="{{ route.url }}"><i ng-if=route.menuitem.icon class={{route.menuitem.icon}}></i> {{ route.menuitem.label }}</a></li></ul></div></div>');
  $templateCache.put('views/common/docked/container.tpl.html',
    '<div><div class=anim-fade docked:top></div><div docked:icon></div><div class="anim-fade view-panel" docked:left:nav></div><div class="anim-fade view-panel" docked:container></div><div class=anim-fade docked:footer></div></div>');
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
