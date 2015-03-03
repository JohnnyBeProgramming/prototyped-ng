angular.module('prototyped.ng.samples.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('samples/compression/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><span class=pull-right><a class="btn btn-default" href="" ng-click=compression.clearResult() ng-if=compression.ready>Cancel</a> <a class="btn btn-default" ng-class="{ \'btn-primary\': !compression.ready && compression.text.length }" href="" ng-click=compression.compressText(compression.text) ng-disabled=!compression.text.length>Compress Text</a> <a id=runAsScript ng-disabled=!compression.ready class="btn btn-default" ng-class="{ \'btn-primary\': compression.ready }">Run As Script</a></span><h4>Dynamic Compression <small>Encode strings and urls into more compact forms.</small></h4><hr><div class=row><div class=col-md-6><div class="btn-group pull-right"><button class="btn btn-default btn-xs dropdown-toggle" type=button data-toggle=dropdown aria-expanded=false>Samples <span class=caret></span></button><ul class=dropdown-menu role=menu><li><a href="" ng-click="compression.getSampleText(\'assets/lib/sp.js\')">JavaScript #1</a></li><li><a href="" ng-click="compression.getSampleText(\'assets/lib/test.js\')">JavaScript #2</a></li><li><a href="" ng-click="compression.getSampleText(\'assets/css/test.css\')">CSS Styles #1</a></li><li><a href="" ng-click="compression.getSampleText(\'assets/css/test.min.css\')">CSS Styles #2</a></li></ul></div><h5>Enter text to compress: <small ng-if=compression.text.length>{{ compression.text.length | toBytes }}, uncompressed</small></h5><textarea ng-model=compression.text ng-disabled=compression.result style="width: 100%; min-height: 480px" placeholder="Enter some text here..."></textarea></div><div class=col-md-6><span class=pull-right><select ng-model=compression.target><option value="">- Use Default Encoder -</option><option value=lzw>Use LZW Compression</option><option value=scsu>Use SCSU Compression</option></select></span><h5>Compressed Text: <small ng-if=compression.result.length>{{ compression.result.length | toBytes }}, {{ compression.getPercentage() | number:2 }}% reduction</small></h5><textarea ng-model=compression.result ng-disabled=!compression.result style="width: 100%; min-height: 480px" readonly></textarea></div></div><hr><div ng:if=compression.error class="alert alert-danger"><b>Error:</b> {{ compression.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/decorators/dialogs/interceptor.tpl.html',
    '<div class=modal-body style="min-height: 180px; padding: 6px"><ul class="nav nav-tabs"><li role=presentation ng-class="{ \'active\' : (modalAction == \'req\') }"><a href="" ng-click="modalAction = \'req\'">Request Details</a></li><li role=presentation ng-class="{ \'active\' : (modalAction == \'resp\') }"><a href="" ng-click="modalAction = \'resp\'">Return Result</a></li></ul><div class=thumbnail style="border-top: none; margin-bottom: 0; border-top-left-radius: 0; border-top-right-radius: 0"><form ng-switch=modalAction style="margin-top: 6px"><div ng-if=statusMsg class="alert alert-warning" style="padding: 8px; margin: 0">{{ statusMsg }}</div><div ng-switch-default class=docked><em class=text-muted style="padding: 6px; margin: 50px auto">Select an action to start with...</em></div><div ng-switch-when=req><h5>Request Details <small>More about the source</small></h5><p>...</p></div><div ng-switch-when=resp><h5>Result Returned <small ng-if=!status class="text-danger pull-right"><i class="fa fa-close"></i> Rejected</small> <small ng-if=status class="text-success pull-right"><i class="fa fa-check"></i> Responded</small></h5><div class="input-group input-group-sm"><span class=input-group-addon id=sizing-addon3>Type</span> <input class=form-control ng-value=getType() ng-readonly=true placeholder=undefined aria-describedby=sizing-addon3> <span class=input-group-btn><button type=button ng-disabled=true class="btn btn-default dropdown-toggle" data-toggle=dropdown aria-expanded=false>Edit <span class=caret></span></button><ul class="dropdown-menu dropdown-menu-right" role=menu><li><a href=#>Accepted Reply</a></li><li><a href=#>Rejection Reason</a></li><li class=divider></li><li><a href=#>Reset to Defaults</a></li></ul></span></div><textarea ng-class="{ \'alert alert-danger\':!getStatus(), \'alert alert-success\':getStatus() }" ng-readonly=true ng-bind=getBody() style="width: 100%; min-height: 160px; margin:0"></textarea><div class=input-group><div ng-click=setToggle(!allowEmpty) style="padding-left: 8px"><i class=fa ng-class="{ \'fa-check\':allowEmpty, \'fa-close\':!allowEmpty }"></i> <span>Allow empty value as return value</span></div></div></div></form></div></div><div class=modal-footer><button id=btnCancel ng-disabled="!allowEmpty && !rejectValue" class="btn btn-danger pull-left" ng-click=cancel()>Reject Action</button> <button id=btnUpdate ng-disabled="!allowEmpty && !promisedValue" class="btn btn-success pull-right" ng-click=ok()>Complete Action</button></div>');
  $templateCache.put('samples/decorators/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=decorators.busy ng-click=decorators.apply() class=btn ng-class="{ \'btn-primary\': !decorators.isPatched(), \'btn-success\': decorators.isPatched() }">{{ decorators.isPatched() ? \'Application Patched!\' : \'Apply Monkey Patches\' }}</a></span><h4>Patching Services <small>Monkey patching the normal behaviour of your application.</small></h4><hr><p>By making use of angular\'s <a href=https://docs.angularjs.org/api/auto/service/$provide>$provide decorators</a>, we patch the <a href=https://docs.angularjs.org/api/ng/service/$q>$q service</a> to intercept any promised actions and take over the reply mechanism.</p><p>After the initial investigation, it quickly became clear there are just way too many promises to intercept and keep track of, many of them in the angular framework itself. A mechanism was required to identify (and filter out) the promises we were looking for.</p><p>With no <em>real</em> unique identifiers to work with, stack traces are used for tracking identity. In javascript, stack traces are ugly, and not always helpful, but with a little bit of regular expressions, enough sensible info can be extracted to get a picture of <em>where</em> the actions originate from. And this opens up a whole new world of oppertunities...</p><p>- This sample was inspired by <a target=_blank href=http://www.bennadel.com/blog/2775-monkey-patching-the-q-service-using-provide-decorator-in-angularjs.htm>this awesome blog post</a>. :)<br>- The idea to use stack traces was inspired from <a target=_blank href=http://www.codeovertones.com/2011/08/how-to-print-stack-trace-anywhere-in.html>this awesome blog post</a>.</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-success\': (decorators.lastStatus && decorators.lastResult), \'btn-danger\': (!decorators.lastStatus && decorators.lastResult.message) }" href="" ng-click=decorators.runPromiseAction()>Run Promised Action</a> <a class="btn btn-default" ng-class="{ \'btn-warning\':decorators.isPatched(), \'btn-success\': decorators.fcallState == \'Resolved\', \'btn-danger\': decorators.fcallState == \'Rejected\' }" href="" ng-click=decorators.fcall() ng-disabled=!decorators.isPatched()>Call Marshalled Function</a></p><hr><div ng:if=decorators.error class="alert alert-danger"><b>Error:</b> {{ decorators.error.message || \'Something went wrong.\' }}</div><div ng:if=!decorators.error><div class="alert alert-success" ng-if="decorators.lastStatus === true"><b>Accepted:</b> {{ decorators.lastResult || \'No additional information specified.\' }}</div><div class="alert alert-danger" ng-if="decorators.lastStatus === false"><b>Rejected:</b> {{ (decorators.lastResult.message || decorators.lastResult) || \'No additional information specified.\' }}</div></div></div></div></div>');
  $templateCache.put('samples/errorHandlers/main.tpl.html',
    '<div ng:cloak><div class=results ng-init=detect()><div class="icon pull-left left"><i class="glyphicon glyphicon-bell" ng-class="{\'text-muted\':!state.cfgRaven.isOnline}"></i> <i class="sub-icon glyphicon" ng-class=getStatusIcon()></i></div><div class="info pull-left"><div><div class=pull-right><a class=ctrl-sm ng-click="state.editMode = true" href=""><i class="glyphicon glyphicon-pencil"></i></a></div><h4><a target=_blank href="https://www.getsentry.com/welcome/">Sentry</a> and <a target=_blank href="http://raven-js.readthedocs.org/en/latest/">Raven-js</a> <small>Client Error and Exception Handling</small></h4></div><div class=input-group><span class=input-group-addon>Sentry Key:</span> <input class=form-control aria-label=... ng-disabled=state.cfgRaven.isOnline ng-model=state.cfgRaven.publicKey placeholder="https://&lt;- your-api-key-here -&gt;@app.getsentry.com/12345"><label class=input-group-addon><input type=checkbox aria-label=... ng-disabled=!state.cfgRaven.publicKey ng-model=state.cfgRaven.isEnabled> Enabled</label><div class=input-group-btn><a class=btn ng-class="{ \'btn-primary\': state.cfgRaven.publicKey, \'btn-default\': !state.cfgRaven.publicKey }" ng-show=!state.cfgRaven.isOnline ng-disabled=!state.cfgRaven.publicKey ng-click=submitForm()>Set Public Key</a> <a class="btn btn-success" target=_blank ng-show=state.cfgRaven.isOnline ng-href="{{ state.cfgRaven.publicKey }}" ng-disabled=!state.cfgRaven.publicKey>Open Dashboard</a> <a class="btn btn-default" title=Disconnect ng-disabled=!state.cfgRaven.isOnline ng-click=disconnect()><i class="glyphicon glyphicon-remove"></i></a></div></div><hr><div><div class=info-row><div class=btn-group role=group aria-label=...><input type=button class=btn value="Managed Error" ng-class="getButtonStyle(\'managed\')" ng-click="throwManagedException()"> <input type=button class=btn value="AngularJS Error" ng-class="getButtonStyle(\'angular\')" ng-click="throwAngularException()"><div class=btn-group><button type=button class=btn ng-class="getButtonStyle(\'ajax\')" ng-click=throwAjaxException()>Ajax Error (HTTP)</button> <button type=button class="btn dropdown-toggle" data-toggle=dropdown aria-expanded=false ng-class="getButtonStyle(\'ajax\')"><span class=caret></span></button><ul class=dropdown-menu role=menu><li><a href="" ng-click=state.ajaxCfg.select(state.ajaxCfg.errHttp)>{{ state.ajaxCfg.getDesc(state.ajaxCfg.errHttp) }}</a></li><li><a href="" ng-click=state.ajaxCfg.select(state.ajaxCfg.errSuccess)>{{ state.ajaxCfg.getDesc(state.ajaxCfg.errSuccess) }}</a></li><li><a href="" ng-click=state.ajaxCfg.select(state.ajaxCfg.errFailed)>{{ state.ajaxCfg.getDesc(state.ajaxCfg.errFailed) }}</a></li></ul></div><input type=button class=btn value="Timeout Error" ng-class="getButtonStyle(\'timeout\')" ng-click="throwTimeoutException()"> <input type=button class=btn value="Unhandled Exception" ng-class="getButtonStyle(\'unhandled\')" onclick="sampleError.dont.exist++"></div><br class="clearfix"></div><div ng-if="result != null"><p><div class="alert alert-danger" ng-if="!result.valid && result.error && result.error != \'error\'"><i class="glyphicon glyphicon-exclamation-sign"></i> <b>Failed:</b> {{ result.error }}</div></p></div></div><pre>{{ status.logs | listReverse }}</pre></div></div><div ng-if="state.activeTab == \'result\'" class=source><span class=pull-right><a class="btn btn-sm btn-primary" ng-click="state.activeTab = null">Close</a></span> <samp><pre>{{ result.info }}</pre></samp></div></div>');
  $templateCache.put('samples/interceptors/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=interceptors.busy ng-click=interceptors.apply() class=btn ng-class="{ \'btn-primary\': !interceptors.isPatched(), \'btn-success\': interceptors.isPatched() }">{{ interceptors.isPatched() ? \'Interceptors Active\' : \'Enable Interceptors\' }}</a></span><h4>HTTP Interceptors <small>Register and utilise Angular\'s interceptors.</small></h4><hr><p>...</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-warning\': interceptors.isPatched(), \'btn-success\': interceptors.fcallState == \'Resolved\', \'btn-danger\': interceptors.fcallState == \'Rejected\' }" href="" ng-click=interceptors.triggerBadRequest() ng-disabled=!interceptors.isPatched()>Create Bad Request</a></p><hr><div ng:if=interceptors.error class="alert alert-danger"><b>Error:</b> {{ interceptors.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=samples.info><i class=fa ng-class="{ \'fa-refresh glow-blue animate-glow\': samples.busy, \'fa-cubes glow-green\': !samples.busy, \'fa-warning glow-red animate-glow\': samples.error }"></i>&nbsp; Samples Home Page</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.errors><i class="fa fa-life-ring"></i> Exception Handlers</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.sampleData><i class="fa fa-gears"></i> Online Sample Data</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.notifications><i class="fa fa-comment"></i> Web Notifications</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.interceptors><i class="fa fa-crosshairs"></i> HTTP Interceptors</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.decorators><i class="fa fa-plug"></i> Service Decorators</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.compression><i class="fa fa-file-archive-o"></i> Dynamic Compression</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.styles3d><i class="fa fa-codepen"></i> Exploring Styles 3D</a></li></ul>');
  $templateCache.put('samples/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><h4>Prototyped Samples <small>Beware, code monkeys at play... ;)</small></h4><hr><p ui:view=body>.....</p><hr></div></div></div>');
  $templateCache.put('samples/notifications/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=notifications.busy ng-click=notifications.apply() class=btn ng-class="{ \'btn-primary\': !notifications.isPatched(), \'btn-success\': notifications.isPatched() }">{{ notifications.isPatched() ? \'Notifications Active\' : \'Enable Notifications\' }}</a></span><h4>Web Notifications <small>Desktop notifications from the web with HTML5.</small></h4><hr><p>...</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-primary\': notifications.isPatched() }" href="" ng-click=notifications.triggerNotification() ng-disabled=!notifications.isPatched()>Create new message</a></p><hr><div ng:if=notifications.error class="alert alert-danger"><b>Error:</b> {{ notifications.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/sampleData/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=sampleData.busy ng-click=sampleData.test() class="btn btn-primary">Fetch Sample Data</a></span><h4>Online Sample Data <small>Directly from the cloud! Supplied by this awesome API: <a href="http://www.filltext.com/" target=_blank>http://www.filltext.com/</a></small></h4><hr><div ng:if=sampleData.error class="alert alert-danger"><b>Error:</b> {{ sampleData.error.message || \'Something went wrong. :(\' }}</div><div class=row><div class=col-md-3><h5>Define Fields <small>( {{ sampleData.args.length }} defined )</small> <small class=pull-right><a href="" ng-click="sampleData.args.push({ id: \'myField\', val: \'\'})"><i class="fa fa-plus"></i></a></small></h5><div class=thumbnail><div style="display: flex; width: auto; padding: 3px" ng-repeat="arg in sampleData.args"><span style="flex-basis: 20px; flex-grow:0; flex-shrink:0"><input checked type=checkbox ng-click="sampleData.args.splice(sampleData.args.indexOf(arg), 1)" aria-label=...></span><div style="flex-basis: 64px; flex-grow:0; flex-shrink:0"><input style="width: 100%" aria-label=... ng-model=arg.id></div><div style="flex-grow:1; flex-shrink:1"><input style="width: 100%" aria-label=... ng-model=arg.val></div></div></div></div><div class=col-md-9><h5>Results View <small ng:if=sampleData.resp.length>( {{ sampleData.resp.length }} total )</small></h5><table class=table><thead><tr><th ng-repeat="arg in sampleData.args">{{ arg.id }}</th></tr></thead><tbody><tr ng-if=!sampleData.resp><td colspan="{{ sampleData.args.length }}"><em>Nothing to show yet. Fetch some data first...</em></td></tr><tr ng-repeat="row in sampleData.resp"><td ng-repeat="arg in sampleData.args">{{ row[arg.id] }}</td></tr></tbody></table></div></div></div></div></div>');
  $templateCache.put('samples/styles3d/main.tpl.html',
    '<div id=mainview><div>Inspired by this post: <a href=http://www.dhteumeuleu.com/apparently-transparent/source>http://www.dhteumeuleu.com/apparently-transparent/source</a></div><div id=screen><div id=scene><div class="f sky" data-transform="rotateX(-90deg) translateZ(-300px)"></div><div class=wall data-transform=translateZ(-500px)></div><div class=wall data-transform="rotateY(-90deg) translateZ(-500px)"></div><div class=wall data-transform="rotateY(90deg) translateZ(-500px)"></div><div class=wall data-transform="rotateY(180deg) translateZ(-500px)"></div><div class="f bottom" data-transform="rotateX(90deg) translateZ(-300px)"></div></div></div></div><style>html {\n' +
    '        -ms-touch-action: none;\n' +
    '        -ms-content-zooming: none;\n' +
    '    }\n' +
    '\n' +
    '    .sky {\n' +
    '        width: 1000px;\n' +
    '        height: 1000px;\n' +
    '        visibility: visible;\n' +
    '        background-image: url(http://thegirlbythesea.com/wp-content/uploads/2010/03/prairie-sky-2.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(-90deg) translateZ(-300px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(-90deg) translateZ(-300px);\n' +
    '    }\n' +
    '\n' +
    '    .bottom {\n' +
    '        width: 1000px;\n' +
    '        height: 1000px;\n' +
    '        visibility: visible;\n' +
    '        background-image: url(http://www.momorialcards.com/images/light_textured_backround.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(90deg) translateZ(-300px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) rotateX(90deg) translateZ(-300px);\n' +
    '    }\n' +
    '\n' +
    '    .wall {\n' +
    '        width: 1000px;\n' +
    '        height: 600px;\n' +
    '        visibility: visible;\n' +
    '        background-image: url(http://www.myownspace.co.za/pix/Backgrounds/3d-black-cubes-backgrounds-wallpapers1.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) translateZ(-500px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) translateZ(-500px);        \n' +
    '    }\n' +
    '\n' +
    '    #mainview {\n' +
    '        top: -8px;\n' +
    '        left: -8px;\n' +
    '        width: 100%;\n' +
    '        height: 100%;\n' +
    '        position: relative;\n' +
    '    }\n' +
    '\n' +
    '    #screen {\n' +
    '        position: absolute;\n' +
    '        left: 0;\n' +
    '        top: 0;\n' +
    '        right: 0;\n' +
    '        bottom: 0;\n' +
    '        cursor: pointer;\n' +
    '        background: #000;\n' +
    '        user-select: none;\n' +
    '        overflow: hidden;\n' +
    '    }\n' +
    '\n' +
    '    #scene {\n' +
    '        position: absolute;\n' +
    '        top: 50%;\n' +
    '        left: 50%;\n' +
    '        width: 0;\n' +
    '        height: 0;\n' +
    '        transform: translateZ(1000px);\n' +
    '        -webkit-transform: translateZ(1000px);\n' +
    '    }\n' +
    '\n' +
    '        #scene [data-transform] {\n' +
    '            position: absolute;\n' +
    '            visibility: hidden;\n' +
    '            margin: -300px -500px;\n' +
    '            backface-visibility: hidden;\n' +
    '            -webkit-backface-visibility: hidden;\n' +
    '            image-rendering: optimizeSpeed;\n' +
    '            image-rendering: -moz-crisp-edges;\n' +
    '            image-rendering: -o-crisp-edges;\n' +
    '            image-rendering: -webkit-optimize-contrast;\n' +
    '            image-rendering: optimize-contrast;\n' +
    '            -ms-interpolation-mode: nearest-neighbor;\n' +
    '        }\n' +
    '\n' +
    '        #scene .f {\n' +
    '            margin: -500px -500px;\n' +
    '        }\n' +
    '\n' +
    '        #scene .s {\n' +
    '            width: 252px;\n' +
    '            height: 600px;\n' +
    '            margin: -300px -126px;\n' +
    '        }</style>');
}]);
