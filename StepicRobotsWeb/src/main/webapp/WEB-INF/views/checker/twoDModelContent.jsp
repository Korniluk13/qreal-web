<div id="twoDModelContent" class="row unselectable" ng-controller="TwoDModelEngineFacadeImpl">
    <div id="twoDModel_stage" task="${taskId}">
    </div>
    <div id="twoDModelSpinner" class="centerSpinner">
    </div>
    <div id="infoAlert" class="alert fade in">
        <a href="" class="close" aria-label="close">&times;</a>
    </div>

    <button id="menu_button" type="button" class="btn btn-default" ng-click="vm.showDisplay()">
        <span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>
    </button>

    <img id="controller" src="/StepicRobotsWeb/images/2dmodel/trikKit/controller.png"/>

    <span id="port_M1" class="port_name">M1</span>
    <span id="port_M2" class="port_name">M2</span>
    <span id="port_M3" class="port_name">M3</span>
    <span id="port_M4" class="port_name">M4</span>

    <span id="close_display" class="glyphicon glyphicon-remove-circle" aria-hidden="true" ng-click="vm.closeDisplay()"></span>
    <canvas id="display" width="218" height="274"></canvas>
    <div id="led"></div>

    <button id="stop_button" class="btn btn-danger btn-lg" type="button" ng-click="vm.stopPlay()">Stop
    </button>
</div>