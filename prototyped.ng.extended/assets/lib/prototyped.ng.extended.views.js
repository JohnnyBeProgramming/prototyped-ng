angular.module('prototyped.ng.extended.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('views/extended/index.tpl.html',
    '<div class=container><h4>Extenders and Runtime Modifiers <small>Detect modules and check for extenders</small></h4><div ng:cloak><div ng:if=cmd.busy><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></div><div ng:if=!cmd.busy><h5>Select the modules you would like to extend:</h5><p>...</p></div></div></div>');
  $templateCache.put('views/extended/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=proto.cmd><i class=fa ng-class="{ \'fa-refresh glow-blue\': cmd.busy, \'fa-desktop glow-green\': !cmd.busy && appNode.active, \'fa-warning glow-orange\': !cmd.busy && !appNode.active }"></i>&nbsp; Find All Extenders</a></li></ul>');
}]);
