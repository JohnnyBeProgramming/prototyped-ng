angular.module('prototyped.ng.extended.views', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('views/extended/index.tpl.html',
    '<div class=container><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.core.css"><link rel=stylesheet resx:import="https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.default.min.css"><script resx:import=https://cdnjs.cloudflare.com/ajax/libs/alertify.js/0.3.11/alertify.min.js></script><h4>Extenders and Runtime Modifiers <small>Detect modules and check for extenders</small></h4><div ng:cloak><div ng:if=cmd.busy><em><i class="fa fa-spinner fa-spin"></i> Loading...</em></div><div ng:if=!cmd.busy><h5>Select the modules you would like to extend:</h5><p><a class="btn btn-primary" onclick="OpenDialog(\'This is a test!\')">Test Alertify</a></p></div></div><script>function OpenDialog(message) {\n' +
    '            console.debug(message, alertify);\n' +
    '            alertify.alert(message);\n' +
    '\n' +
    '        }</script></div>');
  $templateCache.put('views/extended/left.tpl.html',
    '<ul class=list-group><li class=list-group-item ui:sref-active=active><a app:nav-link ui:sref=proto.cmd><i class=fa ng-class="{ \'fa-refresh glow-blue\': cmd.busy, \'fa-desktop glow-green\': !cmd.busy && appState.node.active, \'fa-warning glow-orange\': !cmd.busy && !appState.node.active }"></i>&nbsp; Find All Extenders</a></li></ul>');
}]);
