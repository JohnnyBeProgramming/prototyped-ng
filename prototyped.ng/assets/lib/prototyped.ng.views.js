angular.module('prototyped.ng.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('modules/console/views/main.tpl.html',
    '<div class=console><style>.contents.docked {\n' +
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
    '        }</style><div class="dock-tight btn-group btn-group-sm"><a href=./index.html class="btn btn-default pull-left"><i class="glyphicon glyphicon-chevron-left"></i></a><div class="btn-group btn-group-sm pull-right"><a href="" class="btn btn-default dropdown-toggle" data-toggle=dropdown><i class="glyphicon glyphicon-chevron-right"></i> <span class=caret></span></a><ul class=dropdown-menu role=menu><li ng-repeat="itm in myConsole.getProxies()"><a href="" ng-click=myConsole.setProxy(itm.ProxyName)>Switch to {{ itm.ProxyName }}</a></li></ul></div><a href="" class="btn btn-default pull-right" ng-click=myConsole.clear()><i class="glyphicon glyphicon-trash"></i></a><div class="input-group input-group-sm"><label for=txtInput class=input-group-addon>{{ myConsole.getProxyName() }}:</label><input id=txtInput class="cmd-input form-control" tabindex=1 ng-model=txtInput ng-keypress="($event.which === 13)?myConsole.command(txtInput):0" placeholder="Enter Command Here"></div></div><div class="cmd-output dock-fill"><div class=cmd-line ng-repeat="ln in lines"><span class=text-{{ln.type}}><i class=glyphicon title="{{ln.time | date:\'hh:mm:ss\'}}" ng-class="{ \'glyphicon-chevron-right\':ln.type==\'info\', \'glyphicon-ok-sign\':ln.type==\'success\', \'glyphicon-warning-sign\':ln.type==\'warning\', \'glyphicon-exclamation-sign\':ln.type==\'error\' }"></i> <span class=cmd-text>{{ln.text}}</span></span></div></div></div>');
  $templateCache.put('modules/editor/views/main.tpl.html',
    '<div class=text-editor ng-init=myWriter.init()><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/codemirror.min.js></script><link href=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/codemirror.min.css rel=stylesheet><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/xml/xml.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/css/css.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/javascript/javascript.min.js></script><script src=https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.1.0/mode/htmlmixed/htmlmixed.min.js></script><style resx:import=modules/editor/styles/css/editor.min.css></style><div class="btn-group btn-group-sm dock-tight"><a ng-href="/" ng-click="myWriter.checkUnsaved() && $event.preventDefault()" class="btn btn-default pull-left"><i class="glyphicon glyphicon-chevron-left"></i></a> <a href="" class="btn btn-default pull-left" ng-click=myWriter.newFile()><i class="glyphicon glyphicon-file"></i></a> <a href="" class="btn btn-default pull-left" ng-click=myWriter.openFile() ng-disabled=!myWriter.HasFileSys><i class="glyphicon glyphicon-folder-open"></i></a><div class="btn-group btn-group-sm pull-right"><a href="" ng-disabled=!myWriter.FileLocation class="btn btn-default dropdown-toggle" data-toggle=dropdown><i class="glyphicon glyphicon-save"></i> <span class=caret></span></a><ul class=dropdown-menu role=menu><li ng-class="{\'disabled\': !myWriter.HasFileSys || !myWriter.FileContents}"><a href="" ng-click=myWriter.saveFileAs()><i class="glyphicon glyphicon-floppy-disk"></i> Save file as...</a></li><li ng-class="{\'disabled\': !myWriter.HasFileSys || !myWriter.FileLocation}"><a href="" ng-click=myWriter.openFileLocation() ng-disabled="!myWriter.HasFileSys || !myWriter.FileLocation"><i class="glyphicon glyphicon-save"></i>Open file...</a></li></ul></div><a href="" class="btn btn-default pull-right" ng-click=myWriter.saveFile() ng-disabled="!(myWriter.HasFileSys && myWriter.HasChanges)"><i class="glyphicon glyphicon-floppy-disk"></i></a><div class="input-group input-group-sm"><label for=txtFileName class=input-group-addon>File:</label><input id=txtFileName class="cmd-input form-control" tabindex=1 value={{myWriter.FileLocation}} placeholder="{{ myWriter.FileLocation || \'Create new or open existing...\' }}" ng-readonly="true"></div></div><textarea id=FileContents class="text-area dock-fill" ng-disabled="myWriter.FileContents == null" ng-model=myWriter.FileContents></textarea><input style=display:none id=fileDialog type=file accept=".txt,.json"> <input style=display:none id=saveDialog type=file accept=.txt nwsaveas></div>');
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
  $templateCache.put('modules/explore/views/index.tpl.html',
    '<div style="width: 100%" ng:cloak><style>.view-selector {\n' +
    '            padding: 3px;\n' +
    '            margin-right: 8px;\n' +
    '        }\n' +
    '        .view-selector a {\n' +
    '            color: #808080;\n' +
    '            text-decoration: none;\n' +
    '        }</style><div class="view-selector pull-right" ng-init="viewMode = { desc:\'Default View\', css:\'fa fa-th\', view: \'view-med\' }"><div class="input-group pull-left"><a href="" class=dropdown-toggle data-toggle=dropdown aria-expanded=false><i ng-class=viewMode.css></i> {{ viewMode.desc || \'Default View\' }} <span class=caret></span></a><ul class="pull-right dropdown-menu" role=menu><li><a href="" ng-click="viewMode = { desc:\'Large Icons\', css:\'fa fa-th-large\', view: \'view-large\' }"><i class="fa fa-th-large"></i> Large Icons</a></li><li><a href="" ng-click="viewMode = { desc:\'Medium Icons\', css:\'fa fa-th\', view: \'view-med\' }"><i class="fa fa-th"></i> Medium Icons</a></li><li><a href="" ng-click="viewMode = { desc:\'Details View\', css:\'fa fa-list\', view: \'view-details\' }"><i class="fa fa-list"></i> Details View</a></li><li class=divider></li><li><a href="" ng-click="viewMode = { desc:\'Default View\', css:\'fa fa-th\', view: \'view-med\' }">Use Default</a></li></ul></div></div><h4>File Browser <small>Explore files and folders on your local system</small></h4><div id=fileExplorer ng-class=viewMode.view><div proto:address-bar></div><div class=loader ng-show=isBusy><br><em style="padding: 24px">Loading...</em></div><div ng-show="!isBusy && dir_path"><div class=folder-contents ng-if="!folders.length && !files.length"><em>No files or folders were found...</em></div><div class=folder-contents ng-if=folders.length><h5>File Folders</h5><div id=files class=files><a href="" class="file centered" ng-click=ctrlExplorer.navigate(itm.path) ng-repeat="itm in folders"><div class=icon><i class="glyphicon glyphicon-folder-open" style="font-size: 32px"></i></div><div class="name ellipsis">{{ itm.name }}</div></a></div></div><div class=folder-contents ng-if=files.length><h5>Application Files</h5><div id=files class=files><a href="" class="file centered" ng-repeat="itm in files" ng-class="{ \'focus\' : (selected == itm.path)}" ng-click=ctrlExplorer.select(itm.path) ng-dblclick=ctrlExplorer.open(itm.path)><div class=icon ng-switch=itm.type><i ng-switch-default class="fa fa-file-o" style="font-size: 32px"></i> <i ng-switch-when=blank class="fa fa-file-o" style="font-size: 32px"></i> <i ng-switch-when=text class="fa fa-file-text-o" style="font-size: 32px"></i> <i ng-switch-when=image class="fa fa-file-image-o" style="font-size: 32px"></i> <i ng-switch-when=pdf class="fa fa-file-pdf-o" style="font-size: 32px"></i> <i ng-switch-when=css class="fa fa-file-code-o" style="font-size: 32px"></i> <i ng-switch-when=html class="fa fa-file-code-o" style="font-size: 32px"></i> <i ng-switch-when=word class="fa fa-file-word-o" style="font-size: 32px"></i> <i ng-switch-when=powerpoint class="fa fa-file-powerpoint-o" style="font-size: 32px"></i> <i ng-switch-when=movie class="fa fa-file-movie-o" style="font-size: 32px"></i> <i ng-switch-when=excel class="fa fa-file-excel-o" style="font-size: 32px"></i> <i ng-switch-when=compressed class="fa fa-file-archive-o" style="font-size: 32px"></i></div><div class="name ellipsis">{{ itm.name }}</div></a></div></div></div><div ng-show="!isBusy && !dir_path"><br><h5><i class="glyphicon glyphicon-warning-sign"></i> Warning <small>All features not available</small></h5><div class="alert alert-warning"><p><b>Please Note:</b> You are running this from a browser window.</p><p>For security reasons, web browsers do not have permission to use the local file system, or other advanced operating system features.</p><p>To use this application with full functionality, you need an elevated runtime (<a href=/about/info>see this how to</a>).</p></div></div></div></div>');
  $templateCache.put('views/about/connections.tpl.html',
    '<div ng:cloak style="width: 100%"><div ng-if=!state.showRaw class=results ng-init=detect()><div class="icon pull-left left"><i class="glyphicon glyphicon-globe"></i> <i class="sub-icon glyphicon" ng-class=getStatusColor()></i></div><div class="info pull-left"><div><div class=pull-right><a class=ctrl-sm ng-click="state.editMode = true" href=""><i class="glyphicon glyphicon-pencil"></i></a></div><h4 ng-if=!state.editMode><a href="{{ state.location }}">{{ state.location }}</a></h4></div><div ng-if=!state.editMode><div ng-if=state.location><p class=info-row><div class="info-col-primary pull-left">Protocol: <span class="btn-group btn-group-xs" role=group aria-label=...><button type=button ng-disabled=state.requireHttps class="btn btn-default" ng-click="setProtocol(\'http\')" ng-class="state.requireHttps ? \'disabled\' : getProtocolStyle(\'http\', \'btn-warning\')"><i class=glyphicon ng-class="getStatusIcon(\'glyphicon-eye-open\')" ng-if="state.location.indexOf(\'http://\') == 0"></i> HTTP</button> <button type=button class="btn btn-default" ng-click="setProtocol(\'https\')" ng-class="getProtocolStyle(\'https\')"><i class=glyphicon ng-class="getStatusIcon(\'glyphicon-eye-close\')" ng-if="state.location.indexOf(\'https://\') == 0"></i> HTTPS</button></span></div><div class="info-col-secondary pull-right"><span class="btn-group btn-group-xs" role=group><a ng-if=result.info class="btn btn-default" href="" ng-click="state.activeTab = (state.activeTab == \'result\') ? null : \'result\'" ng-class="{\'btn-info\':(state.activeTab == \'result\'), \'btn-default\':(state.activeTab != \'result\')}"><i class="glyphicon glyphicon-file"></i> View Result</a> <a ng-if=state.location class=btn href="" ng-click="state.activeTab = (state.activeTab == \'preview\') ? null : \'preview\'" ng-class="{\'btn-info\':(state.activeTab == \'preview\'), \'btn-default\':(state.activeTab != \'preview\')}"><i class=glyphicon ng-class="{\'glyphicon-eye-close\':state.showPreview, \'glyphicon-eye-open\':!state.showPreview}"></i> {{ state.showPreview ? \'Hide\' : \'Show\' }} Preview</a></span></div><br class="clearfix"></p><p class=info-row><div class="info-col-primary pull-left" ng-if=result><div class=info-col-ellipse>Latency: {{ result.received - result.sent }}ms <span ng-if=latency.desc ng-class=latency.style>(<em>{{ latency.desc }}</em>)</span></div></div><div class="info-col-primary pull-left" ng-if=!result><em>Checking...</em></div><div class="info-col-secondary pull-right"><span ng-if="status.code >= 0" class="pull-right label" ng-class=status.style title="Status: {{ status.desc }}, Code: {{ status.code }}">{{ status.desc }}: {{ status.code }}</span></div><br class="clearfix"></p></div><div ng-if="result != null"><p><div class="alert alert-warning" ng-if="result.valid && state.protocol == \'http\'"><i class="glyphicon glyphicon-eye-open"></i> <b>Warning:</b> The web connection <b class=text-danger>is not secure</b>, use <a href="" ng-click="setProtocol(\'https\')">HTTPS</a>.</div><div class="alert alert-success" ng-if="result.valid && state.protocol == \'https\'"><i class="glyphicon glyphicon-ok"></i> <b>Validated:</b> The web connection looks secure.</div><div class="alert alert-danger" ng-if="!result.valid && result.error && result.error != \'error\'"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Failed:</b> {{ result.error }}</div><div class="alert alert-danger" ng-if="!result.valid && !(result.error && result.error != \'error\')"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Offline:</b> Connection could not be established.</div></p></div></div><form ng-if=state.editMode><div class=form-group><h4 class=control-label for=txtTarget>Enter the website URL to connect to:</h4><input class=form-control id=txtTarget ng-model=state.location></div><div class=form-group><div class=checkbox><label><input type=checkbox ng-model=state.requireHttps> Require secure connection</label></div><div class=checkbox ng-class="\'disabled text-muted\'" ng-if=state.requireHttps><label><input type=checkbox ng-model=state.requireCert ng-disabled=true> Requires Client Certificate</label></div></div><div class=form-group ng-show=state.requireCert><label for=exampleInputFile>Select Client Certificate:</label><input type=file id=exampleInputFile><p class=help-block>This must be a valid client certificate.</p></div><button type=submit class="btn btn-primary" ng-click=submitForm()>Update</button></form></div></div><div ng-if="state.activeTab == \'preview\'" class="panel panel-default"><div class=panel-heading><b class=panel-title><i class="glyphicon glyphicon-globe"></i> <a target=_blank href="{{ state.location }}">{{ state.location }}</a></b></div><div class="panel-body info-row iframe-body" style="min-height: 480px"><iframe class=info-col-primary ng-src="{{ state.location }}" frameborder=0>IFrame not available</iframe></div></div><div ng-if="state.activeTab == \'result\'" class=source><span class=pull-right><a class="btn btn-sm btn-primary" ng-click="state.activeTab = null">Close</a></span> <samp><pre>{{ result.info }}</pre></samp></div></div><style>.results {\n' +
    '        min-width: 480px;\n' +
    '        display: flex;\n' +
    '    }\n' +
    '\n' +
    '        .results .icon {\n' +
    '            margin: 0 8px;\n' +
    '            font-size: 128px;\n' +
    '            width: 128px !important;\n' +
    '            height: 128px !important;\n' +
    '            position: relative;\n' +
    '            flex-grow: 0;\n' +
    '            flex-shrink: 0;\n' +
    '        }\n' +
    '\n' +
    '            .results .icon .sub-icon {\n' +
    '                font-size: 64px !important;\n' +
    '                width: 64px !important;\n' +
    '                height: 64px !important;\n' +
    '                position: absolute;\n' +
    '                right: 0;\n' +
    '                top: 0;\n' +
    '                margin-top: 100px;\n' +
    '            }\n' +
    '\n' +
    '                .results .icon .sub-icon.success {\n' +
    '                    color: #080;\n' +
    '                }\n' +
    '\n' +
    '                .results .icon .sub-icon.error {\n' +
    '                    color: #D00;\n' +
    '                }\n' +
    '\n' +
    '                .results .icon .sub-icon.warning {\n' +
    '                    color: #0094ff;\n' +
    '                }\n' +
    '\n' +
    '                .results .icon .sub-icon.busy {\n' +
    '                    color: #0094ff;\n' +
    '                }\n' +
    '\n' +
    '        .results .info {\n' +
    '            margin: 0 16px;\n' +
    '            min-height: 128px;\n' +
    '            min-width: 300px;\n' +
    '            display: inline-block;\n' +
    '            flex-grow: 1;\n' +
    '            flex-shrink: 1;\n' +
    '        }\n' +
    '\n' +
    '            .results .info h4 {\n' +
    '                text-wrap: avoid;\n' +
    '                overflow: hidden;\n' +
    '                white-space: nowrap;\n' +
    '                text-overflow: ellipsis;\n' +
    '            }\n' +
    '\n' +
    '                .results .info h4 a {\n' +
    '                    color: black;\n' +
    '                }\n' +
    '\n' +
    '            .results .info .ctrl-sm {\n' +
    '                font-size: larger;\n' +
    '                margin-left: 8px;\n' +
    '                color: black;\n' +
    '            }\n' +
    '\n' +
    '    .info-row {\n' +
    '        display: flex;\n' +
    '    }\n' +
    '\n' +
    '    .info-row-links {\n' +
    '        color: silver;\n' +
    '    }\n' +
    '\n' +
    '        .info-row-links a {\n' +
    '            color: #4a4a4a;\n' +
    '            margin-left: 8px;\n' +
    '        }\n' +
    '\n' +
    '            .info-row-links a:hover {\n' +
    '                color: #000000;\n' +
    '            }\n' +
    '\n' +
    '    .info-col-primary {\n' +
    '        flex-grow: 1;\n' +
    '        flex-shrink: 1;\n' +
    '    }\n' +
    '\n' +
    '    .info-col-secondary {\n' +
    '        flex-grow: 0;\n' +
    '        flex-shrink: 0;\n' +
    '    }\n' +
    '\n' +
    '    .iframe-body {\n' +
    '        margin: 0;\n' +
    '        padding: 0;\n' +
    '    }\n' +
    '\n' +
    '        .iframe-body iframe {\n' +
    '            margin: 0;\n' +
    '            padding: 0;\n' +
    '        }</style>');
  $templateCache.put('views/about/contact.tpl.html',
    '<div style="width: 100%"><h4>About <small>Contact Us Online</small></h4><hr><div><i class="fa fa-home"></i> Visit our home page - <a href=http://www.prototyped.info>www.prototyped.info</a></div><hr></div>');
  $templateCache.put('views/about/info.tpl.html',
    '<div id=about-info style="width: 100%"><style resx:import=assets/css/images.min.css></style><div class=row><div class="col-lg-8 col-md-12 info-overview"><h4>About <small>your current status and application architecture</small></h4><hr><div class=row><div class="col-md-3 panel-left"><h5><i class="fa fa-gear"></i> My Client <small><span ng-if=true class=ng-cloak><b app:version ng-class="{ \'text-success glow-green\': appInfo.version }">loading...</b></span> <span ng-if=false><b class="text-danger glow-red"><i class="glyphicon glyphicon-remove"></i> Offline</b></span></small></h5><div ng:if=true><a class="panel-icon-lg img-terminal"><div ng:if="info.about.browser.name == \'Chrome\'" class="panel-icon-inner img-chrome"></div><div ng:if="info.about.browser.name == \'Chromium\'" class="panel-icon-inner img-chromium"></div><div ng:if="info.about.browser.name == \'Firefox\'" class="panel-icon-inner img-firefox"></div><div ng:if="info.about.browser.name == \'Internet Explorer\'" class="panel-icon-inner img-iexplore"></div><div ng:if="info.about.browser.name == \'Opera\'" class="panel-icon-inner img-opera"></div><div ng:if="info.about.browser.name == \'Safari\'" class="panel-icon-inner img-safari"></div><div ng:if="info.about.browser.name == \'SeaMonkey\'" class="panel-icon-inner img-seamonkey"></div><div ng:if="info.about.browser.name == \'Spartan\'" class="panel-icon-inner img-spartan"></div><div ng:if="info.about.os.name == \'Windows\'" class="panel-icon-overlay img-windows"></div><div ng:if="info.about.os.name == \'MacOS\'" class="panel-icon-overlay img-mac-os"></div><div ng:if="info.about.os.name == \'Apple\'" class="panel-icon-overlay img-apple"></div><div ng:if="info.about.os.name == \'UNIX\'" class="panel-icon-overlay img-unix"></div><div ng:if="info.about.os.name == \'Linux\'" class="panel-icon-overlay img-linux"></div><div ng:if="info.about.os.name == \'Ubuntu\'" class="panel-icon-overlay img-ubuntu"></div></a><p class=panel-label title="{{ info.about.os.name }} @ {{ info.about.os.version.alias }}">Host System: <b ng:if=info.about.os.name>{{ info.about.os.name }}</b> <em ng:if=!info.about.os.name>checking...</em> <span ng:if=info.about.os.version.alias>@ {{ info.about.os.version.alias }}</span></p><p class=panel-label title="{{ info.about.browser.name }} @ {{ info.about.browser.version.major }}.{{ info.about.browser.version.minor }}{{ info.about.browser.version.build ? \'.\' + info.about.browser.version.build : \'\' }}">User Agent: <b ng:if=info.about.browser.name>{{ info.about.browser.name }}</b> <em ng:if=!info.about.browser.name>detecting...</em> <span ng:if=info.about.browser.version>@ {{ info.about.browser.version.major }}.{{ info.about.browser.version.minor }}{{ info.about.browser.version.build ? \'.\' + info.about.browser.version.build : \'\' }}</span></p></div><div ng-switch=info.about.hdd.type class=panel-icon-lg><a ng-switch-default class="panel-icon-lg inactive-gray img-drive"></a> <a ng-switch-when=true class="panel-icon-lg img-drive-default"></a> <a ng-switch-when=onl class="panel-icon-lg img-drive-onl"></a> <a ng-switch-when=usb class="panel-icon-lg img-drive-usb"></a> <a ng-switch-when=ssd class="panel-icon-lg img-drive-ssd"></a> <a ng-switch-when=web class="panel-icon-lg img-drive-web"></a> <a ng-switch-when=mac class="panel-icon-lg img-drive-mac"></a> <a ng-switch-when=warn class="panel-icon-lg img-drive-warn"></a> <a ng-switch-when=hist class="panel-icon-lg img-drive-hist"></a> <a ng-switch-when=wifi class="panel-icon-lg img-drive-wifi"></a><div ng:if=info.about.webdb.active class="panel-icon-inset-bl img-webdb"></div></div><p ng:if=info.about.webdb.active class="panel-label ellipsis">Local databsse is <b class=glow-green>Online</b></p><p ng:if=!info.about.webdb.active class="panel-label text-muted ellipsis"><em>No local storage found</em></p><p ng:if=!info.about.webdb.active class="panel-label text-muted"><div class=progress ng-style="{ height: \'10px\' }" title="{{(100 * progA) + \'%\'}} ( {{info.about.webdb.used}} / {{info.about.webdb.size}} )"><div ng:init="progA = (info.about.webdb.size > 0) ? (info.about.webdb.used||0)/info.about.webdb.size : 0" class=progress-bar ng-class="\'progress-bar-info\'" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"></div></div></p></div><div ng-init="tabOverviewMain = 0" ng-switch=tabOverviewMain class="col-md-6 panel-mid"><h5><span ng-if="info.about.server.active == undefined">Checking...</span> <span ng-if="info.about.server.active != undefined">Current Status</span> <small><span ng-if=!info.about.server><em class=text-muted>checking...</em></span> <span ng-if="info.about.server.active === false"><b class="text-danger glow-red">Offline</b>, faulty or disconnected.</span> <span ng-if="info.about.server.active && appNode.active">Connected via <b class="text-warning glow-orange">web client</b>.</span> <span ng-if="info.about.server.active && !appNode.active"><b class="text-success glow-green">Online</b> and fully operational.</span></small></h5><p class=ellipsis ng:if=info.about.server.url>Server Url: <a target=_blank ng-class="{ \'glow-green\':appNode.active || info.about.protocol == \'https\', \'glow-blue\':!appNode.active && info.about.protocol == \'http\', \'glow-red\':info.about.protocol == \'file\' }" ng-href="{{ info.about.server.url }}">{{ info.about.server.url }}</a></p><p><a href="" ng-click="tabOverviewMain = 0">Summary</a> | <a href="" ng-click="tabOverviewMain = 1">Details</a></p><div><div ng-switch-default><em>Loading...</em></div><div ng-switch-when=0><p>...</p></div><div ng-switch-when=1><pre>OS: {{ info.about.os }}</pre><pre>Browser: {{ info.about.browser }}</pre><pre>Server: {{ info.about.server }}</pre><pre>WebDB: {{ info.about.webdb }}</pre><pre>HDD: {{ info.about.hdd }}</pre></div></div></div><div class="col-md-3 panel-right"><h5><i class="fa fa-gear"></i> Web Server <small><span class=ng-cloak><b ng-class="{ \'text-success glow-green\': info.about.server.active, \'text-danger glow-red\': info.about.server.active == false }" app:version=server default-text="{{ info.about.server.active ? (info.about.server.active ? \'Online\' : \'Offline\') : \'n.a.\' }}">requesting...</b></span></small></h5><div ng:if=info.about.server.local><a class="panel-icon-lg img-server-local"></a></div><div ng:if=!info.about.server.local ng-class="{ \'inactive-gray\': true || info.versions.jqry }"><a class="panel-icon-lg img-server"><div ng:if="info.about.server.type == \'iis\'" class="panel-icon-inset img-iis"></div><div ng:if="info.about.server.type == \'node\'" class="panel-icon-inset img-node"></div><div ng:if="info.about.server.type == \'apache\'" class="panel-icon-inset img-apache"></div><div ng:if="info.about.server.name == \'Windows\'" class="panel-icon-overlay img-windows"></div><div ng:if="info.about.server.name == \'MacOS\'" class="panel-icon-overlay img-mac-os"></div><div ng:if="info.about.server.name == \'Apple\'" class="panel-icon-overlay img-apple"></div><div ng:if="info.about.server.name == \'UNIX\'" class="panel-icon-overlay img-unix"></div><div ng:if="info.about.server.name == \'Linux\'" class="panel-icon-overlay img-linux"></div></a><div ng:if=info.about.sql class="panel-icon-lg img-sqldb"></div></div></div></div><hr></div><div class="col-lg-4 hidden-md" ng:init="info.showUnavailable = false"><h4>Inspirations <small>come from great ideas</small></h4><hr><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.ng }" ng:hide="!info.showUnavailable && !info.versions.ng"><a class=app-info-icon target=_blank href="https://angularjs.org/"><div ng:if=true class="img-clipper img-angular"></div></a><div class=app-info-info><h5>Angular JS <small><span ng:if=info.versions.ng>@ v{{info.versions.ng}}</span> <span ng:if=!info.versions.ng><em>not found</em></span></small></h5><p ng:if=!info.versions.ng class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href="https://angularjs.org//">angularjs.org</a> for more info.</p><p ng:if=info.detects.ngUiUtils class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Utils found.</p><p ng:if=info.detects.ngUiRouter class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Router found.</p><p ng:if=info.detects.ngUiBootstrap class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular UI Bootrap found.</p><p ng:if=info.detects.ngAnimate class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Angular Animations active.</p></div></div><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.nw }" ng:hide="!info.showUnavailable && !info.versions.nw"><a class=app-info-icon target=_blank href="http://nwjs.io/"><div ng:if=true class="img-clipper img-nodewebkit"></div></a><div class=app-info-info><h5>Node Webkit <small><span ng:if=info.versions.nw>@ v{{info.versions.nw}}</span> <span ng:if=!info.versions.nw><em>not available</em></span></small></h5><p ng:if=!info.versions.nw class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href="http://nwjs.io/">nwjs.io</a> for more info.</p><p ng:if=info.versions.nw class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are connected to node webkit.</p><p ng:if=info.versions.chromium class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running Chromium @ {{ info.versions.chromium }}.</p></div></div><div class="app-info-aside animate-show" ng:class="{ \'info-disabled\': !info.versions.njs }" ng:hide="!info.showUnavailable && !info.versions.njs"><a class=app-info-icon target=_blank href=http://www.nodejs.org><div ng:if=true class="img-clipper img-nodejs"></div></a><div class=app-info-info><h5>Node JS <small><span ng:if=info.versions.njs>@ v{{info.versions.njs}}</span> <span ng:if=!info.versions.njs><em>not available</em></span></small></h5><p ng:if=!info.versions.njs class=text-muted><i class="glyphicon glyphicon-info-sign glow-blue"></i> Check out <a target=_blank href=http://www.nodejs.org>NodeJS.org</a> for more info.</p><p ng:if=info.versions.njs class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are inside a node js runtime.</p><p ng:if=info.versions.v8 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running V8 @ {{ info.versions.v8 }}.</p><p ng:if=info.versions.openssl class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running OpenSSL @ {{ info.versions.openssl }}.</p></div></div><div class="app-aside-collapser centered" ng-if=!appNode.active><a href="" ng:show=!info.showUnavailable ng-click="info.showUnavailable = !info.showUnavailable">Show More</a> <a href="" ng:show=info.showUnavailable ng-click="info.showUnavailable = !info.showUnavailable">Hide Inactive</a></div><hr><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.html }"><div class=app-info-icon><div ng:if="info.about.browser.name != \'Internet Explorer\'" class="img-clipper img-html5"></div><div ng:if="info.about.browser.name == \'Internet Explorer\'" class="img-clipper img-html5-ie"></div></div><div class=app-info-info><h5>HTML Rendering Mode <small><span ng-if=info.versions.html>@ v{{ info.versions.html }}</span> <span ng-if=!info.versions.html><em>unknown</em></span></small></h5><p ng:if="info.versions.html >= \'5.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You are running a modern browser.</p><p ng:if="info.versions.html < \'5.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> Your browser is out of date. Try upgrading.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.js }"><div class=app-info-icon><div ng:if=!info.versions.v8 class="img-clipper img-js-default"></div><div ng:if=info.versions.v8 class="img-clipper img-js-v8"></div></div><div class=app-info-info><h5>Javascript Engine<small><span ng:if=info.versions.js>@ v{{ info.versions.js }}</span> <span ng:if=!info.versions.js><em>not found</em></span></small></h5><p ng:if="info.versions.js >= \'5.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> You have a modern javascript engine.</p><p ng:if="info.versions.js < \'5.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> Javascript is out of date or unavailable.</p><p ng:if=info.versions.v8 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Javascript V8 engine, build v{{info.versions.v8}}.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.css }"><div class=app-info-icon><div ng:if=true class="img-clipper img-css3"></div></div><div class=app-info-info><h5>Cascading Styles <small><span ng:if=info.versions.css>@ v{{ info.versions.css }}</span> <span ng:if=!info.versions.css><em class=text-muted>not found</em></span></small></h5><p ng:if="info.versions.css >= \'3.0\'" class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>You have an up-to-date style engine.</span></p><p ng:if="info.versions.css < \'3.0\'" class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <span>CSS out of date. Styling might be broken.</span></p><p ng:if=info.css.boostrap2 class=text-warning><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <span>Bootstrap 2 is depricated. Upgrade to 3.x.</span></p><p ng:if=info.css.boostrap3 class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>Bootstrap and/or UI componets found.</span></p><p ng:if=info.detects.less class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> <span>Support for LESS has been detected.</span></p><p ng:if=info.detects.bootstrap class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> Bootstrap and/or UI Componets found.</p></div></div><div class=app-info-aside ng-class="{ \'info-disabled\': !info.versions.jqry }"><div class=app-info-icon><div ng:if=true class="img-clipper img-jquery"></div></div><div class=app-info-info><h5>jQuery <small><span ng:if=info.versions.jqry>@ v{{ info.versions.jqry }}</span> <span ng:if=!info.versions.jqry><em>not found</em></span></small></h5><p ng:if=info.versions.jqry class=text-success><i class="glyphicon glyphicon-ok glow-green"></i> jQuery or jqLite is loaded.</p><p ng:if="info.versions.jqry < \'1.10\'" class=text-danger><i class="glyphicon glyphicon-warning-sign glow-orange"></i> jQuery is out of date!</p></div></div><hr></div></div></div>');
  $templateCache.put('views/about/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.info><i class="fa fa-info-circle"></i>&nbsp; About this app</a></li><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.online><i class="fa fa-globe"></i>&nbsp; Visit us online</a></li><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=about.conection><i class="fa fa-plug"></i>&nbsp; Check Connectivity</a></li></ul>');
  $templateCache.put('views/common/components/contents.tpl.html',
    '<div id=contents class=contents><div id=left ui:view=left xxx-ng:include=views/common/components/left.tpl.html ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div><div id=main ui:view=main xxx-ng:include=views/common/components/main.tpl.html><em>Main View</em></div></div>');
  $templateCache.put('views/common/components/footer.tpl.html',
    '<div class=footer><span class=pull-left><label ng:show="status.logs | typeCount:\'error\'" class=ng-cloak><i class="glyphicon glyphicon-exclamation-sign glow-red"></i> <a href="" class=ng-cloak>Errors ({{ status.logs | typeCount:\'error\' }})</a></label><label ng:show="status.logs | typeCount:\'warn\'" class=ng-cloak><i class="glyphicon glyphicon-warning-sign glow-orange"></i> <a href="" class=ng-cloak>Warnings ({{ status.logs | typeCount:\'warn\' }})</a></label></span> <span ng:if=false><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></span> <span ng:if=true class=ng-cloak>Client Version: <span app:version><em>Loading...</em></span> |</span> <span ui:view=foot>Powered by <a href="https://angularjs.org/">AngularJS</a> <span ng:if=appNode.active class=ng-cloak>&amp; <a href=https://github.com/rogerwang/node-webkit>Node Webkit</a></span></span> <span ng:if=startAt class=ng-cloak>| Started {{ startAt | fromNow }}</span></div>');
  $templateCache.put('views/common/components/left.tpl.html',
    '<div id=left ui:view=left ng:show="state.current.views[\'left\'] || state.current.views[\'left@\']"><em>Left View</em></div>');
  $templateCache.put('views/common/components/menu.tpl.html',
    '<div id=menu class=dragable><div ui:view=menu><ul class="nav navbar-nav"><li ui:sref-active=open><a ui:sref=default>Default</a></li><li ui:sref-active=open ng:repeat="route in appConfig.routers | orderBy:\'(priority || 1)\'" ng:if="route.menuitem && (!route.visible || route.visible())"><a ng:if=route.menuitem.state ui:sref="{{ route.menuitem.state }}">{{ route.menuitem.label }}</a> <a ng:if=!route.menuitem.state ng:href="{{ route.url }}">{{ route.menuitem.label }}</a></li></ul></div></div>');
  $templateCache.put('views/default.tpl.html',
    '<div id=cardViewer class="docked float-left card-view card-view-x"><style resx:import=assets/css/prototyped.min.css></style><style>.contents {\n' +
    '            margin: 0 !important;\n' +
    '            padding: 0 !important;\n' +
    '            background: #E0E0E0!important;\n' +
    '        }</style><div class="slider docked"><a class="arrow prev" href="" ng-show=false ng-click=showPrev()><i class="glyphicon glyphicon-chevron-left"></i></a> <a class="arrow next" href="" ng-show=false ng-click=showNext()><i class="glyphicon glyphicon-chevron-right"></i></a><div class=boxed><a class="card fixed-width slide" ng-class="{ \'inactive-gray-25\': route.cardview.ready === false }" ng-repeat="route in pages | orderBy:\'(priority || 1)\'" ng-if="route.cardview && (!route.visible || route.visible())" ng-href={{route.url}} ng-class="{ \'active\': isActive($index) }" ng-swipe-right=showPrev() ng-swipe-left=showNext()><div class=card-image ng-class=route.cardview.style><div class=banner></div><h2>{{route.cardview.title}}</h2></div><p>{{route.cardview.desc}}</p></a></div><ul class="small-only slider-nav"><li ng-repeat="page in pages" ng-class="{\'active\':isActive($index)}"><a href="" ng-click=showPhoto($index); title={{page.title}}><i class="glyphicon glyphicon-file"></i></a></li></ul></div></div>');
}]);
