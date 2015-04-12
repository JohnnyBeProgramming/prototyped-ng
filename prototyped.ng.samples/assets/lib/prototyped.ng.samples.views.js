angular.module('prototyped.ng.samples.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('samples/compression/main.tpl.html',
    '<div id=CompressionView class=container style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a class="btn btn-default" href="" ng-click=compression.clearResult() ng-if=compression.ready>Cancel</a> <a class="btn btn-default" ng-class="{ \'btn-primary\': !compression.ready && compression.text.length }" href="" ng-click=compression.compressText(compression.text) ng-disabled=!compression.text.length>Compress Text</a> <a id=runAsScript ng-disabled=!compression.ready class="btn btn-default" ng-class="{ \'btn-primary\': compression.ready }">Run As Script</a></span><h4>Dynamic Compression <small>Encode strings and urls into more compact forms.</small></h4><hr><div><div class=row><div class=col-md-6><div class="btn-group pull-right"><select ng-model=compression.sampleUrl ng-disabled=compression.busy><option value="">- Custom Text -</option><option value=assets/lib/screen.js>JavaScript #1</option><option value=assets/lib/prototyped.ng.js>JavaScript #2</option><option value=assets/css/app.min.css>CSS Styles #1</option><option value=assets/css/prototyped.min.css>CSS Styles #2</option></select></div><h5>Enter text to compress: <small ng-if=compression.text.length>{{ compression.text.length | toBytes }}, uncompressed</small></h5></div><div class=col-md-6><span class=pull-right>Use Compression:<select ng-model=compression.target ng-disabled=compression.busy><option value="">default</option><option value=lzw>lzw</option><option value=scsu>scsu</option><option value=html>html</option><option value=base64>base64</option></select></span><h5>Compressed Text: <small ng-if=compression.result.length>{{ compression.result.length | toBytes }}</small> <small ng-if="!compression.busy && compression.result.length">, {{ compression.getPercentage() | number:2 }}% reduction</small></h5></div></div><div class=row ng-if=compression.busy><div class=col-md-12><div class="active progress progress-striped"><div ng:init="progA = 1.0" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 class=progress-bar ng-class="\'progress-bar-info\'" ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"><span>Busy...</span></div></div></div></div><div class=row ng-if="!compression.busy && !compression.text.length"><div class=col-md-12><div class=progress><div style="text-align: center"><em>Enter some text to start...</em></div></div></div></div><div class=row ng-if="!compression.busy && compression.text.length && (compression.result.length < compression.text.length)"><div class=col-md-12><div class="progress progress-striped"><div class=progress-bar ng-class="\'progress-bar-primary\'" ng:init="progA = (compression.result.length / compression.text.length)" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"><span ng-if="progA > 0">{{ (100 * progA) | number:2 }}%</span></div></div></div></div><div class=row ng-if="!compression.busy && compression.text.length && compression.result.length > compression.text.length"><div class=col-md-12><div class="progress progress-striped"><div class=progress-bar ng-class="\'progress-bar-warning\'" ng:init="progA = 1.0 * compression.text.length / compression.result.length" role=progressbar aria-valuenow="{{ progA }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progA) + \'%\'}" aria-valuetext="{{ (100.0 * progA) + \' %\' }}%"><span ng-if="progA > 0">{{ (compression.text.length) | toBytes }}, 100%</span></div><div class=progress-bar ng-class="\'progress-bar-danger\'" ng:init="progB = 1.0 - compression.text.length / compression.result.length" role=progressbar aria-valuenow="{{ progB }}" aria-valuemin=0 aria-valuemax=100 ng-style="{width: (100 * progB) + \'%\'}" aria-valuetext="{{ (100.0 * progB) + \' %\' }}%"><span ng-if="progB > 0">{{ (compression.result.length - compression.text.length) | toBytes }}, {{ 100.0 * (compression.result.length - compression.text.length) / (1.0 * compression.text.length) | number:2 }}%</span></div></div></div></div><div class=row><div class=col-md-6><textarea ng-model=compression.text ng-disabled="compression.busy || compression.result" style="width: 100%; min-height: 480px" placeholder="Enter some text here..."></textarea></div><div class=col-md-6><textarea ng-model=compression.result ng-disabled="compression.busy || !compression.result" style="width: 100%; min-height: 480px" readonly></textarea></div></div></div><hr><div ng:if=compression.error class="alert alert-danger"><b>Error:</b> {{ compression.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/decorators/dialogs/interceptor.tpl.html',
    '<div class=modal-body style="min-height: 180px; padding: 6px"><ul class="nav nav-tabs"><li role=presentation ng-class="{ \'active\' : (modalAction == \'req\') }"><a href="" ng-click="modalAction = \'req\'">Request Details</a></li><li role=presentation ng-class="{ \'active\' : (modalAction == \'resp\') }"><a href="" ng-click="modalAction = \'resp\'">Return Result</a></li></ul><div class=thumbnail style="border-top: none; margin-bottom: 0; border-top-left-radius: 0; border-top-right-radius: 0"><form ng-switch=modalAction style="margin-top: 6px"><div ng-if=statusMsg class="alert alert-warning" style="padding: 8px; margin: 0">{{ statusMsg }}</div><div ng-switch-default class=docked><em class=text-muted style="padding: 6px; margin: 50px auto">Select an action to start with...</em></div><div ng-switch-when=req><h5>Request Details <small>More about the source</small></h5><p>...</p></div><div ng-switch-when=resp><h5>Result Returned <small ng-if=!status class="text-danger pull-right"><i class="fa fa-close"></i> Rejected</small> <small ng-if=status class="text-success pull-right"><i class="fa fa-check"></i> Responded</small></h5><div class="input-group input-group-sm"><span class=input-group-addon id=sizing-addon3>Type</span> <input class=form-control ng-value=getType() ng-readonly=true placeholder=undefined aria-describedby=sizing-addon3> <span class=input-group-btn><button type=button ng-disabled=true class="btn btn-default dropdown-toggle" data-toggle=dropdown aria-expanded=false>Edit <span class=caret></span></button><ul class="dropdown-menu dropdown-menu-right" role=menu><li><a href=#>Accepted Reply</a></li><li><a href=#>Rejection Reason</a></li><li class=divider></li><li><a href=#>Reset to Defaults</a></li></ul></span></div><textarea ng-class="{ \'alert alert-danger\':!getStatus(), \'alert alert-success\':getStatus() }" ng-readonly=true ng-bind=getBody() style="width: 100%; min-height: 160px; margin:0"></textarea><div class=input-group><div ng-click=setToggle(!allowEmpty) style="padding-left: 8px"><i class=fa ng-class="{ \'fa-check\':allowEmpty, \'fa-close\':!allowEmpty }"></i> <span>Allow empty value as return value</span></div></div></div></form></div></div><div class=modal-footer><button id=btnCancel ng-disabled="!allowEmpty && !rejectValue" class="btn btn-danger pull-left" ng-click=cancel()>Reject Action</button> <button id=btnUpdate ng-disabled="!allowEmpty && !promisedValue" class="btn btn-success pull-right" ng-click=ok()>Complete Action</button></div>');
  $templateCache.put('samples/decorators/main.tpl.html',
    '<div id=DecoratorView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=decorators.busy ng-click=decorators.apply() class=btn ng-class="{ \'btn-primary\': !decorators.isPatched(), \'btn-success\': decorators.isPatched() }">{{ decorators.isPatched() ? \'Application Patched!\' : \'Apply Monkey Patches\' }}</a></span><h4>Patching Services <small>Monkey patching the normal behaviour of your application.</small></h4><hr><p>By making use of angular\'s <a href=https://docs.angularjs.org/api/auto/service/$provide>$provide decorators</a>, we patch the <a href=https://docs.angularjs.org/api/ng/service/$q>$q service</a> to intercept any promised actions and take over the reply mechanism.</p><p>After the initial investigation, it quickly became clear there are just way too many promises to intercept and keep track of, many of them in the angular framework itself. A mechanism was required to identify (and filter out) the promises we were looking for.</p><p>With no <em>real</em> unique identifiers to work with, stack traces are used for tracking identity. In javascript, stack traces are ugly, and not always helpful, but with a little bit of regular expressions, enough sensible info can be extracted to get a picture of <em>where</em> the actions originate from. And this opens up a whole new world of oppertunities...</p><p>- This sample was inspired by <a target=_blank href=http://www.bennadel.com/blog/2775-monkey-patching-the-q-service-using-provide-decorator-in-angularjs.htm>this awesome blog post</a>. :)<br>- The idea to use stack traces was inspired from <a target=_blank href=http://www.codeovertones.com/2011/08/how-to-print-stack-trace-anywhere-in.html>this awesome blog post</a>.</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-success\': (decorators.lastStatus && decorators.lastResult), \'btn-danger\': (!decorators.lastStatus && decorators.lastResult.message) }" href="" ng-click=decorators.runPromiseAction()>Run Promised Action</a> <a class="btn btn-default" ng-class="{ \'btn-warning\':decorators.isPatched(), \'btn-success\': decorators.fcallState == \'Resolved\', \'btn-danger\': decorators.fcallState == \'Rejected\' }" href="" ng-click=decorators.fcall() ng-disabled=!decorators.isPatched()>Call Marshalled Function</a></p><hr><div ng:if=decorators.error class="alert alert-danger"><b>Error:</b> {{ decorators.error.message || \'Something went wrong.\' }}</div><div ng:if=!decorators.error><div class="alert alert-success" ng-if="decorators.lastStatus === true"><b>Accepted:</b> {{ decorators.lastResult || \'No additional information specified.\' }}</div><div class="alert alert-danger" ng-if="decorators.lastStatus === false"><b>Rejected:</b> {{ (decorators.lastResult.message || decorators.lastResult) || \'No additional information specified.\' }}</div></div></div></div></div>');
  $templateCache.put('samples/errorHandlers/main.tpl.html',
    '<div ng:cloak class=container style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link rel=stylesheet resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.core.css"><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.default.min.css"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js></script><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input type=checkbox ng:show="sampleErrors.result !== null" ng:model=appConfig.errorHandlers.enabled bs:switch switch:size=mini switch:inverse=true></span><h4>Exception Handling <small>Error reporting and client-side exception handling</small></h4><hr><div class=row><div class=col-md-3><div><h5>Throw Exceptions</h5><ul class=list-group><li class=list-group-item><a href="" ng-click=sampleErrors.throwManagedException()><i class="fa fa-cubes"></i>&nbsp; Catch Managed Error</a></li><li class=list-group-item><a href="" ng-click=sampleErrors.throwAjaxException()><i class="fa fa-cubes"></i>&nbsp; Create Ajax Error</a></li><li class=list-group-item><a href="" ng-click=sampleErrors.throwAngularException()><i class="fa fa-cubes"></i>&nbsp; AngularJS Error</a></li><li class=list-group-item><a href="" ng-click=sampleErrors.throwTimeoutException()><i class="fa fa-cubes"></i>&nbsp; Timeout Error</a></li><li class=list-group-item><a href="" onclick=sampleError.dontExist++><i class="fa fa-cogs"></i>&nbsp; Unhandled Exception</a></li></ul></div></div><div class=ellipsis style="overflow: hidden" ng-class="{ \'col-md-6\':appConfig.errorHandlers.enabled, \'col-md-9\': !appConfig.errorHandlers.enabled }"><div><span class=pull-right style="padding: 3px"><a href="" ng-click="">Refresh</a> | <a href="" ng-click="appStatus.logs = []">Clear</a></span><h5>Event Logs</h5><table class="table table-hover table-condensed"><thead><tr><th style="width: 80px">Time</th><th style="width: 64px">Type</th><th>Description</th></tr></thead><tbody><tr ng-if=!appStatus.logs.length><td colspan=3><em>No events have been logged...</em></td></tr><tr ng-repeat="row in appStatus.logs" ng-class="{ \'text-info inactive-gray\':row.type==\'debug\', \'text-info\':row.type==\'info\', \'text-warning glow-orange\':row.type==\'warn\', \'text-danger glow-red\':row.type==\'error\' }"><td>{{ row.time | date:\'hh:mm:ss\' }}</td><td>{{ row.type }}</td><td class=ellipsis style="width: auto; overflow: hidden">{{ row.desc }}</td></tr></tbody></table></div><div ng-if=!appStatus.logs.length><h5>Inspired by these blogs:</h5><ul class="alert alert-info" style="list-style: none"><li><a target=_blank href=http://www.davecap.com/post/46522098029/using-sentry-raven-js-with-angularjs-to-catch><i class="fa fa-external-link-square"></i> http://www.davecap.com</a></li><li><a target=_blank href=http://bahmutov.calepin.co/catch-all-errors-in-angular-app.html><i class="fa fa-external-link-square"></i> http://bahmutov.calepin.co</a></li><li><a target=_blank href=http://davidwalsh.name/track-errors-google-analytics><i class="fa fa-external-link-square"></i> http://davidwalsh.name</a></li></ul></div></div><div ng-class="{ \'col-md-3\':appConfig.errorHandlers.enabled, \'hide\': !appConfig.errorHandlers.enabled }"><div><h5>Exception Handlers</h5><form class=thumbnail><div style="padding: 0 8px"><div class=checkbox ng:class="{ \'inactive-gray\': !handler.enabled && handler.locked }" ng:repeat="handler in sampleErrors.errorHandlers"><label><input type=checkbox ng-disabled=handler.locked ng-checked=handler.enabled ng-click=sampleErrors.checkChanged(handler)> <span ng-if=!handler.busy><strong ng:if=handler.enabled>{{ handler.label }}</strong> <span ng:if=!handler.enabled>{{ handler.label }}</span></span> <span ng-if=handler.busy><i class="fa fa-spinner fa-spin"></i> <em>Loading third-party scripts...</em></span></label></div></div></form></div><div ng:if="sampleErrors.google.isEnabled && !sampleErrors.google.handler.busy"><span class=pull-right style="padding: 3px"><b ng:if=sampleErrors.google.isOnline class=glow-green>Online</b> <b ng:if=!sampleErrors.google.isOnline class=glow-red>Offline</b></span><h5>Google Analytics</h5><div style="padding: 0 8px"><div ng-show=sampleErrors.google.isOnline><a href="" class=pull-right ng:click="sampleErrors.google.isOnline = false;"><i class="glyphicon glyphicon-remove"></i></a><div class=ellipsis><b>Public Key:</b> <a class=inactive-text>{{ sampleErrors.google.config.publicKey }}</a></div></div><form class=form-inline role=form ng-show=!sampleErrors.google.isOnline><div class=form-group><label for=sentryKey>Google API key (required)</label><div class=input-group><input class="form-control input-sm" id=googleKey ng:model=sampleErrors.google.config.publicKey placeholder=UA-XXXX-Y><div class=input-group-btn><a class="btn btn-sm btn-default" ng-class="{ \'btn-danger\': sampleErrors.google.lastError, \'btn-primary\': sampleErrors.google.config.publicKey, \'btn-default\': !sampleErrors.google.config.publicKey }" ng-disabled=!sampleErrors.google.config.publicKey ng-click=sampleErrors.google.connect(sampleErrors.google.config.publicKey)>Set</a></div></div></div></form><br><div class="alert alert-danger" ng-if="!sampleErrors.google.isOnline && sampleErrors.google.lastError">{{ sampleErrors.google.lastError.message }}</div></div></div><div ng:if="sampleErrors.raven.isEnabled && !sampleErrors.raven.handler.busy"><span class=pull-right style="padding: 3px"><b ng:if=sampleErrors.raven.isOnline class=glow-green>Online</b> <b ng:if=!sampleErrors.raven.isOnline class=glow-red>Offline</b></span><h5>Sentry and RavenJS</h5><div style="padding: 0 8px"><div ng-show=sampleErrors.raven.isOnline><a href="" class=pull-right ng:click="sampleErrors.raven.isOnline = false;"><i class="glyphicon glyphicon-remove"></i></a><div class=ellipsis><b>Public Key:</b> <a ng-href="{{ sampleErrors.raven.config.publicKey }}" target=_blank class=inactive-text>{{ sampleErrors.raven.config.publicKey }}</a></div></div><form class=form-inline role=form ng-show=!sampleErrors.raven.isOnline><div class=form-group><label for=sentryKey>Sentry public key (required)</label><div class=input-group><input class="form-control input-sm" id=sentryKey ng:model=sampleErrors.raven.config.publicKey placeholder="https://<-key->@app.getsentry.com/12345"><div class=input-group-btn><a class="btn btn-sm btn-default" ng-class="{ \'btn-danger\': sampleErrors.raven.lastError, \'btn-primary\': sampleErrors.raven.config.publicKey, \'btn-default\': !sampleErrors.raven.config.publicKey }" ng-disabled=!sampleErrors.raven.config.publicKey ng-click=sampleErrors.raven.connect(sampleErrors.raven.config.publicKey)>Set</a></div></div></div></form><br><div class="alert alert-danger" ng-if="!sampleErrors.raven.isOnline && sampleErrors.raven.lastError">{{ sampleErrors.raven.lastError.message }}</div><div class="alert alert-info" ng-if="!sampleErrors.raven.isOnline && !sampleErrors.raven.lastError"><a target=_blank href="https://www.getsentry.com/welcome/">Sentry</a> is a third party online service used to track errors. <a target=_blank href="http://raven-js.readthedocs.org/en/latest/">RavenJS</a> is used on the client-side to catch and send events on to Sentry.</div></div></div></div></div></div></div></div>');
  $templateCache.put('samples/interceptors/main.tpl.html',
    '<div id=InterceptorView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=interceptors.busy ng-click=interceptors.apply() class=btn ng-class="{ \'btn-primary\': !interceptors.isPatched(), \'btn-success\': interceptors.isPatched() }">{{ interceptors.isPatched() ? \'Interceptors Active\' : \'Enable Interceptors\' }}</a></span><h4>HTTP Interceptors <small>Register and utilise Angular\'s interceptors.</small></h4><hr><p>...</p><hr><p><a class="btn btn-default" ng-class="{ \'btn-warning\': interceptors.isPatched(), \'btn-success\': interceptors.fcallState == \'Resolved\', \'btn-danger\': interceptors.fcallState == \'Rejected\' }" href="" ng-click=interceptors.triggerBadRequest() ng-disabled=!interceptors.isPatched()>Create Bad Request</a></p><hr><div ng:if=interceptors.error class="alert alert-danger"><b>Error:</b> {{ interceptors.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=samples.info><i class=fa ng-class="{ \'fa-refresh glow-blue animate-glow\': samples.busy, \'fa-cubes glow-green\': !samples.busy, \'fa-warning glow-red animate-glow\': samples.error }"></i>&nbsp; Samples Home Page</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.notifications><i class="fa fa-comment"></i> Web Notifications</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.errors><i class="fa fa-life-ring"></i> Exception Handlers</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.compression><i class="fa fa-file-archive-o"></i> Dynamic Encoders</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.sampleData><i class="fa fa-gears"></i> Online Sample Data</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.interceptors><i class="fa fa-crosshairs"></i> HTTP Interceptors</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.decorators><i class="fa fa-plug"></i> Service Decorators</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.location><i class="fa fa-crosshairs"></i> Geo Location Tracking</a></li><li class=list-group-item ui:sref-active=active ng-class="{ \'disabled\': false }"><a app:nav-link ui:sref=samples.styles3d><i class="fa fa-codepen"></i> Exploring Styles 3D</a></li></ul>');
  $templateCache.put('samples/location/views/aside.tpl.html',
    '<ul class="nav nav-list ng-cloak"><li><h5>Current Location</h5><div class=thumbnail><div class="row nav-label"><span class=col-sm-3>Status</span> <b class=col-sm-9 ng-class="{\'text-success\' : position.coords, \'text-inactive\' : client || position.isBusy, \'text-error\':position.failed, \'text-danger\' : !client && !position.coords && !position.failed && !position.isBusy }"><i class=glyphicon ng-class="{\'glyphicon-ok\' : position.coords, \'glyphicon-refresh\' : position.isBusy, \'glyphicon-exclamation-sign\' : !position.coords && !position.isBusy }"></i> {{ geoCtrl.getStatus() }}</b></div><div class="row nav-label" ng-show=position.coords><span class=col-sm-3>Long</span> <b class=col-sm-9>{{ position.coords.longitude | longitude }}</b></div><div class="row nav-label" ng-show=position.coords><span class=col-sm-3>Latt</span> <b class=col-sm-9>{{ position.coords.latitude | latitude }}</b></div><div class="row nav-label" ng-show=position.coords.accuracy><span class=col-sm-3>Accuracy</span> <b class=col-sm-9>{{ position.coords.accuracy | formatted:\'{0} meters\' || \'n.a.\' }}</b></div></div></li><li ng-if=geoCtrl.hasSamples()><h5>Popular Locations</h5><div class=thumbnail><div ng-repeat="loc in geoCtrl.getSamples()"><a href="" ng-click=geoCtrl.setGeoPoint(loc)><i class="glyphicon glyphicon-screenshot"></i> <span class=nav-label>{{ loc.Label }}</span></a></div></div></li><li ng-show="(client || position)"><h5>Additional Info</h5><div class=thumbnail><div class="row nav-label" ng-show=client.country><div class=col-sm-3>Country</div><b class="col-sm-9 ellipse">{{ client.country }}</b></div><div class="row nav-label" ng-show=client.city><div class=col-sm-3>City</div><b class="col-sm-9 ellipse">{{ client.city }}</b></div><div class="row nav-label" ng-show=client.ip><div class=col-sm-3>TCP/IP</div><b class="col-sm-9 ellipse">{{ client.ip }}</b></div><div class="row nav-label" ng-show=position.timestamp><span class=col-sm-3>Updated</span> <b class="col-sm-9 ellipse">{{ position.timestamp | date:\'HH:mm a Z\' || \'n.a.\' }}</b></div><div class="row nav-label" ng-show=position.coords.speed><span class=col-sm-3>Speed</span> <b class="col-sm-9 ellipse">{{ position.coords.speed | formatted:\'{0} m/s\' }}</b></div><div class="row nav-label" ng-show=position.coords.altitude><span class=col-sm-3>Altitude</span> <b class="col-sm-9 ellipse">{{ position.coords.altitude | formatted:\'{0} meters\' }}</b></div><div class="row nav-label" ng-show=position.coords.heading><span class=col-sm-3>Heading</span> <b class="col-sm-9 ellipse">{{ position.coords.heading | formatted:\'{0}°\' }}</b></div></div></li></ul>');
  $templateCache.put('samples/location/views/main.tpl.html',
    '<div style="width: 100%"><div class=row><div class="col-lg-9 col-md-12 info-overview"><h5 class=page-header style="margin: 0">Geo Location <small>Find your current position on the globe.</small></h5><div ng-include="\'samples/location/views/status.tpl.html\'"></div><div id=map-canvas class="panel-contents dock-vert" style="min-height: 520px" ng-hide=isActive><div class=docked style="min-width: 640px; min-height: 480px">...</div></div></div><div class="col-lg-3 hidden-md"><div ng-include="\'samples/location/views/aside.tpl.html\'"></div></div></div></div>');
  $templateCache.put('samples/location/views/status.tpl.html',
    '<div class=alert role=alert style="margin: 0; padding: 3px; border-radius:0" ng-class="{ \'alert-danger\':position.failed, \'alert-info\': position.isBusy, \'alert-success\': position.coords, \'alert-warning\': !position }" ng-show=!geoCtrl.hideStatus><a href="" style="color: #000; text-decoration: none" class=pull-right data-dismiss=alert><i class="glyphicon glyphicon-remove" aria-hidden=true></i></a> <a href="" style="color: #000; text-decoration: none" ng-click=geoCtrl.getPosition()><i class=glyphicon ng-class="{ \'glyphicon-eye-close\':position.failed, \'glyphicon-refresh\': position.isBusy, \'glyphicon-ok\': position.coords, \'glyphicon-eye-open\': !position }"></i> <span ng-if="!position && !client">Locating your current position...</span> <span ng-if="!position.failed && !position.coords && !position.isBusy && client"><b>Please Note:</b> Tracking you (passively) via your IP address. <em>Click here for a more accurate position.</em></span> <span ng-if="!position.failed && !position.coords && position.isBusy"><b>Requesting:</b> Please accept or discard the request for your current location...</span> <span ng-if=position.failed><b>Warning:</b> You declined to share your location info, passively tracking your IP address...</span> <span ng-if=position.coords><b>Success:</b> Current position found via browser. Processing info...</span></a></div>');
  $templateCache.put('samples/main.tpl.html',
    '<div class=container><div class=row><div class=col-md-12><h4>Prototyped Sample Code <small>Beware, code monkeys at play... ;)</small></h4><hr><p ui:view=body>.....</p><hr></div></div></div>');
  $templateCache.put('samples/notifications/main.tpl.html',
    '<div id=NotificationView style="width: 100%"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min.js></script><link rel=stylesheet resx:import=https://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/css/bootstrap3/bootstrap-switch.min.css><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.core.css"><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.default.min.css"><div class=row><div class=col-md-12><span class="pull-right ng-cloak" style="padding: 6px"><input type=checkbox ng:show="notify.ready !== null" ng:model=notify.enabled bs:switch switch:size=mini switch:inverse=true></span><h4>{{ notify.isPatched() ? \'Desktop\' : \'Browser\' }} Notifications <small>Various mechanisms of user notification in HTML5.</small></h4><hr><p ng-show="notify.ready === null"><em><i class="fa fa-spinner fa-spin"></i> <b>Requesting Access:</b> Desktop notifications...</em> <span><a href="" ng-click="notify.ready = false">cancel</a></span></p><div ng-show="notify.ready !== null" class=row><div class=col-md-3><div><h5>Notification Types</h5><div class=thumbnail><div style="padding: 0 8px"><div class=radio ng-class="{ \'inactive-gray\': !method.enabled() }" ng-repeat="method in methods"><label><input type=radio name=optionsMethods id=option_method_{{method.name}} value="{{ method.name }}" ng-disabled=!method.enabled() ng-click="notify.current = method" ng-checked="notify.current.name == method.name"> <span ng-if="(notify.current.name != method.name)">{{ method.label }}</span> <strong ng-if="(notify.current.name == method.name)">{{ method.label }}</strong></label></div></div></div></div><div ng-show="notify.current.name == \'notify\'"><h5>Message Styling</h5><form class=thumbnail><div class=form-group><label for=exampleIcon>Icon File</label><input type=file id=exampleIcon><p class=help-block>Image to display with message.</p></div></form></div></div><div ng-class="{ \'col-md-6\':notify.enabled, \'col-md-9\': !notify.enabled }"><h5>Create a new message</h5><form class=thumbnail ng-disabled=notify.ready ng-init="msgOpts = { title: \'Web Notification\', body: \'This is a test message.\'}"><div style="padding: 8px"><div class=form-group><label for=exampleTitle>Message Title</label><input class=form-control id=exampleTitle placeholder="Enter title" ng-model=msgOpts.title></div><div class=form-group><label for=exampleMessage>Message Body Text</label><textarea class=form-control rows=5 class=form-control id=exampleMessage ng-model=msgOpts.body placeholder="Enter body text"></textarea></div><span class=pull-right ng-show="notify.current.name != \'alert\'" style="margin: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.showResult }"><label><input type=checkbox ng-model=notify.showResult> Show Result</label></div></span> <span class=pull-right ng-show="notify.current.name != \'alert\'" style="margin: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.sameDialog }"><label><input type=checkbox ng-model=notify.sameDialog> Recycle Dialog</label></div></span> <button type=submit class="btn btn-default" ng-class="{ \'btn-success\': notify.isPatched(), \'btn-primary\': notify.ready !== null && !notify.isPatched() }" ng-click="notify.current.action(msgOpts.title, msgOpts.body, msgOpts)">Create Message</button></div></form></div><div ng-class="{ \'col-md-3\':notify.enabled, \'hide\': !notify.enabled }"><div><h5>Notification Extenders</h5><form class=thumbnail><div style="padding: 0 8px"><div class=checkbox ng-class="{ \'inactive-gray\': !notify.enabled }"><label><input type=checkbox ng-model=notify.enabled> Desktop Notifications</label></div><div class=checkbox ng-class="{ \'inactive-gray\': !notify.options.alertify.enabled }"><label><input type=checkbox ng-checked=notify.options.alertify.enabled ng-click=notify.hookAlertify()> <span ng-if=!notify.options.alertify.busy>Extend with <a target=_blank href="http://fabien-d.github.io/alertify.js/">AlertifyJS</a></span> <span ng-if=notify.options.alertify.busy><i class="fa fa-spinner fa-spin"></i> <em>Loading third-party scripts...</em></span></label></div></div></form></div><div ng-show=notify.enabled><h5>System Notifications Active</h5><div class="alert alert-success"><b>Note:</b> All notifications get redirected to your OS notification system.</div></div></div></div><div ng:if=notify.error class="alert alert-danger"><b>Error:</b> {{ notify.error.message || \'Something went wrong.\' }}</div></div></div></div>');
  $templateCache.put('samples/sampleData/main.tpl.html',
    '<div id=SampleDataView style="width: 100%"><div class=row><div class=col-md-12><span class=pull-right><a href="" ng-disabled=sampleData.busy ng-click=sampleData.test() class="btn btn-primary">Fetch Sample Data</a></span><h4>Online Sample Data <small>Directly from the cloud! Supplied by this awesome API: <a href="http://www.filltext.com/" target=_blank>http://www.filltext.com/</a></small></h4><hr><div ng:if=sampleData.error class="alert alert-danger"><b>Error:</b> {{ sampleData.error.message || \'Something went wrong. :(\' }}</div><div class=row><div class=col-md-3><h5>Define Fields <small>( {{ sampleData.args.length }} defined )</small> <small class=pull-right><a href="" ng-click="sampleData.args.push({ id: \'myField\', val: \'\'})"><i class="fa fa-plus"></i></a></small></h5><div class=thumbnail><div style="display: flex; width: auto; padding: 3px" ng-repeat="arg in sampleData.args"><span style="flex-basis: 20px; flex-grow:0; flex-shrink:0"><input checked type=checkbox ng-click="sampleData.args.splice(sampleData.args.indexOf(arg), 1)" aria-label=...></span><div style="flex-basis: 64px; flex-grow:0; flex-shrink:0"><input style="width: 100%" aria-label=... ng-model=arg.id></div><div style="flex-grow:1; flex-shrink:1"><input style="width: 100%" aria-label=... ng-model=arg.val></div></div></div></div><div class=col-md-9><h5>Results View <small ng:if=sampleData.resp.length>( {{ sampleData.resp.length }} total )</small></h5><table class=table><thead><tr><th ng-repeat="arg in sampleData.args">{{ arg.id }}</th></tr></thead><tbody><tr ng-if=!sampleData.resp><td colspan="{{ sampleData.args.length }}"><em>Nothing to show yet. Fetch some data first...</em></td></tr><tr ng-repeat="row in sampleData.resp"><td ng-repeat="arg in sampleData.args">{{ row[arg.id] }}</td></tr></tbody></table></div></div></div></div></div>');
  $templateCache.put('samples/styles3d/main.tpl.html',
    '<div id=mainview style="width: 100%"><div>Inspired by this post: <a href=http://www.dhteumeuleu.com/apparently-transparent/source>http://www.dhteumeuleu.com/apparently-transparent/source</a></div><div id=screen><div id=scene><div class="f sky" data-transform="rotateX(-90deg) translateZ(-300px)"></div><div class=wall data-transform=translateZ(-500px)></div><div class=wall data-transform="rotateY(-90deg) translateZ(-500px)"></div><div class=wall data-transform="rotateY(90deg) translateZ(-500px)"></div><div class=wall data-transform="rotateY(180deg) translateZ(-500px)"></div><iframe class="f bottom" data-transform="rotateX(90deg) translateZ(-300px)" src=//www.prototyped.info style="background-image: none"></iframe></div></div></div><style>html {\n' +
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
    '        background-image: url(http://www.mergedmv.com/wp-content/uploads/2015/02/black-brick-wall-background.jpg);\n' +
    '        transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) translateZ(-500px);\n' +
    '        -webkit-transform: perspective(499.99999496775px) rotateX(0deg) rotateY(0deg) translateX(-1.53080851434101e-14px) translateY(0px) translateZ(251.000002516125px) translateZ(-500px);        \n' +
    '    }\n' +
    '\n' +
    '    #mainview {\n' +
    '        width: 100%;\n' +
    '        height: 100%;\n' +
    '        min-height: 600px;\n' +
    '        position: relative;\n' +
    '        display: flex;\n' +
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
