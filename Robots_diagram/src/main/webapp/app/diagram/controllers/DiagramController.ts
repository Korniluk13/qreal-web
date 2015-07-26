class DiagramController {
    public graph: joint.dia.Graph = new joint.dia.Graph;
    private paper: DiagramPaper = new DiagramPaper(this, this.graph);
    public nodeTypesMap: NodeTypesMap = {};
    public nodesMap = {};
    public linksMap = {};
    private currentElement: DiagramElement;
    private isPaletteLoaded = false;
    private mouseupEvent;

    private diagramPaper : HTMLDivElement;
    private flagDraw : boolean = false;
    private pointsList : utils.PairArray = [];
    private timer;
    private currentTime;
    private date : Date = new Date();
    private data : Gesture[];
    private flagAdd : boolean;
    private menuController: DiagramMenuManager;

    constructor($scope, $compile) {

        var controller: DiagramController = this;
        $scope.vm = controller;
        PaletteLoader.loadElementsFromXml(this, "configs/elements.xml", $scope, $compile);

        DropdownListManager.addDropdownList("Link", "Guard", ["", "false", "iteration", "true"]);

        this.loadGestures();
        this.flagDraw = false;

        this.initPointerdownListener();
        this.initDeleteListener();
        this.initCustomContextMenu();
        this.menuController = new DiagramMenuManager($scope);

        $scope.$on("interpret", function(event, timeline) {
            console.log(InterpretManager.interpret(controller.graph, controller.nodesMap, controller.linksMap, timeline));
        });
    }

    initPalette() {
        this.setInputStringListener();
        this.setCheckboxListener();
        this.setDropdownListener();
        this.setSpinnerListener();
        this.initDragAndDrop();
        this.makeUnselectable(document.getElementById("diagramContent"));
        this.isPaletteLoaded = true;
    }

    setNodeTypesMap(nodeTypesMap: NodeTypesMap): void {
        this.nodeTypesMap = nodeTypesMap;
    }

    openTwoDModel(): void {
        $("#diagramContent").hide();
        $("#twoDModelContent").show();
    }

    createDefaultNode(type: string, x: number, y: number, properties: PropertiesMap,
                              imagePath: string, id?: string): DefaultDiagramNode {
        var node: DefaultDiagramNode = new DefaultDiagramNode(type, x, y, properties, imagePath, id);
        this.nodesMap[node.getJointObject().id] = node;
        this.graph.addCell(node.getJointObject());
        return node;
    }

    createNode(type: string, x: number, y: number): void {
        var image: string = this.nodeTypesMap[type].image;

        var typeProperties: PropertiesMap = this.nodeTypesMap[type].properties;

        var nodeProperties: PropertiesMap = {};
        for (var property in typeProperties) {
            nodeProperties[property] = new Property(typeProperties[property].value,
                typeProperties[property].type);
        }

        var leftElementPos: number = x - $(this.diagramPaper).offset().left + $(this.diagramPaper).scrollLeft();
        var topElementPos: number = y - $(this.diagramPaper).offset().top + $(this.diagramPaper).scrollTop();
        var gridSize: number = this.paper.getGridSizeValue();
        leftElementPos -= leftElementPos % gridSize;
        topElementPos -= topElementPos % gridSize;
        var node = this.createDefaultNode(type, leftElementPos, topElementPos, nodeProperties, image);
        this.currentElement = node;
        this.setNodeProperties(node);
    }

    private removeCurrentElement(): void {
        var controller = this;
        if (this.currentElement) {
            var node = this.nodesMap[this.currentElement.getJointObject().id];
            if (node) {
                var links = this.graph.getConnectedLinks(node.getJointObject(), { inbound: true, outbound: true });

                links.forEach(function (link) {
                    delete controller.linksMap[link.id];
                });

                delete this.nodesMap[this.currentElement.getJointObject().id];
            } else {
                var link = this.linksMap[this.currentElement.getJointObject().id];
                if (link) {
                    delete this.linksMap[this.currentElement.getJointObject().id];
                }
            }
            this.currentElement.getJointObject().remove();
            $(".property").remove();
            this.currentElement = undefined;
        }
    }

    private initDragAndDrop(): void {
        var controller: DiagramController = this;
        $(".tree_element").draggable({
            helper: function () {
                var clone =  $(this).find('.elementImg').clone();
                clone.css('position','fixed');
                clone.css('z-index', '1000');
                return clone;
            },
            revert:"invalid"
        });

        $("#diagram_paper").droppable({
            drop: function(event, ui) {
                var topElementPos: number = ui.offset.top - $(this).offset().top + $(this).scrollTop();
                var leftElementPos: number = ui.offset.left - $(this).offset().left + $(this).scrollLeft();
                var gridSize: number = controller.paper.getGridSizeValue();
                topElementPos -= topElementPos % gridSize;
                leftElementPos -= leftElementPos % gridSize;
                var type: string = $(ui.draggable.context).text();
                var image: string = controller.nodeTypesMap[type].image;
                var typeProperties: PropertiesMap = controller.nodeTypesMap[type].properties;

                var nodeProperties: PropertiesMap = {};
                for (var property in typeProperties) {
                    nodeProperties[property] = new Property(typeProperties[property].value,
                        typeProperties[property].type);
                }

                var node = controller.createDefaultNode(type, leftElementPos, topElementPos, nodeProperties, image);
                controller.currentElement = node;
                controller.setNodeProperties(node);
            }
        });
    }

    private initPointerdownListener(): void {
        var controller: DiagramController = this;
        this.paper.on('cell:pointerdown',
            function (cellView, event, x, y) {
                if (!($(event.target).parents(".custom-menu").length > 0)) {
                    $(".custom-menu").hide(100);
                }

                var node: DiagramNode = controller.nodesMap[cellView.model.id];
                if (node) {
                    controller.currentElement = node;
                    controller.setNodeProperties(node);
                } else {
                    var link: Link = controller.linksMap[cellView.model.id];
                    if (link) {
                        controller.currentElement = link;
                        controller.setNodeProperties(link);
                    } else {
                        controller.currentElement = undefined;
                    }
                }

                if (event.button == 2) {
                    console.log("right-click");
                    $(".custom-menu").finish().toggle(100).
                        css({
                            top: event.pageY + "px",
                            left: event.pageX + "px"
                        });
                }
            }
        );

        this.paper.on('blank:pointerdown',
            function (evt, x, y) {
                if (!($(event.target).parents(".custom-menu").length > 0)) {
                    $(".custom-menu").hide(100);
                }

                var n = controller.date.getTime();
                controller.currentTime = n;
                controller.flagAdd = false;
                clearTimeout(controller.timer);
                controller.flagDraw = true;

                $(".property").remove();
                controller.currentElement = undefined;
            }
        );

        this.diagramPaper = <HTMLDivElement> document.getElementById('diagram_paper');
        this.onMouseUp = <any>controller.onMouseUp.bind(this);
        document.addEventListener('mouseup', this.onMouseUp.bind(this));

        this.onMouseUp = <any>controller.onMouseMove.bind(this);
        this.diagramPaper.addEventListener('mousemove', this.onMouseMove.bind(this));

    }

    private smoothing(pair1 : utils.Pair, pair2 : utils.Pair, diff : number) {
        var a = 1;
        var c = 0.0275; // 'a' and 'c' are empirical constants
        var b = Math.exp(-c * diff);
        return new utils.Pair(pair2.first * b + (1 - b) * pair1.first
            , pair2.second + (1 - b) * pair1.second);
    }

    private onMouseMove(e)
    {
        if (this.flagDraw === false)
            return;

        var pair: utils.Pair = new utils.Pair(e.pageX, e.pageY);
        if (this.flagAdd) {

            var currentPair = this.pointsList[this.pointsList.length - 1];
            var n = this.date.getTime();
            var diff = n - this.currentTime;
            this.currentTime = n;
            pair = this.smoothing(currentPair, new utils.Pair(e.pageX, e.pageY), diff);

            $('#diagram_paper').line(currentPair.first, currentPair.second, pair.first, pair.second);
        }
        this.flagAdd = true;
        this.pointsList.push(pair);
    }

    private onMouseUp(e)
    {
        if (this.flagDraw === false)
            return;
        this.mouseupEvent = e;
        this.flagDraw = false;
        this.timer = setTimeout(() => this.finishDraw(), 1000);
    }

    private finishDraw()
    {
        if (this.flagDraw === true)
            return;
        var pencil = document.getElementsByClassName('pencil');
        for (var i = pencil.length; i > 0; i--) {
            pencil[i - 1].parentNode.removeChild(pencil[i - 1]);
        }
        var keyG = new KeyGiver(this);
        keyG.isGesture();
        this.pointsList = [];
    }

    private initCustomContextMenu(): void {
        var controller = this;
        $("#diagramContent").bind("contextmenu", function (event) {
            event.preventDefault();
        });

        $(".custom-menu li").click(function(){
            switch($(this).attr("data-action")) {
                case "delete":
                    controller.removeCurrentElement();
                    break;
            }

            $(".custom-menu").hide(100);
        });
    }

    private initDeleteListener(): void {
        var controller = this;
        var deleteKey: number = 46;
        $('html').keyup(function(e){
            if(e.keyCode == deleteKey) {
                controller.removeCurrentElement();
            }
        })
    }

    private setInputStringListener(): void {
        var controller: DiagramController = this;
        $(document).on('change', '.form-control', function () {
            var tr = $(this).closest('tr');
            var name = tr.find('td:first').html();
            var value = $(this).val();
            var property: Property = controller.currentElement.getProperties()[name];
            property.value = value;
            controller.currentElement.setProperty(name, property);
        });
    }

    private setCheckboxListener(): void {
        var controller: DiagramController = this;
        $(document).on('change', '.checkbox', function () {
            var tr = $(this).closest('tr');
            var name = tr.find('td:first').html();
            var label = tr.find('label');
            var value = label.contents().last()[0].textContent;
            if (value === "True") {
                value = "False";
                label.contents().last()[0].textContent = value;
            } else {
                value = "True";
                label.contents().last()[0].textContent = value;
            }
            var property: Property = controller.currentElement.getProperties()[name];
            property.value = value;
            controller.currentElement.setProperty(name, property);
        });
    }

    private setDropdownListener(): void {
        var controller: DiagramController = this;
        $(document).on('change', '.mydropdown', function () {
            var tr = $(this).closest('tr');
            var name = tr.find('td:first').html();
            var value = $(this).val();
            var property: Property = controller.currentElement.getProperties()[name];
            property.value = value;
            controller.currentElement.setProperty(name, property);
        });
    }

    private setSpinnerListener(): void {
        var controller: DiagramController = this;
        $(document).on('change', '.spinner', function () {
            var tr = $(this).closest('tr');
            var name = tr.find('td:first').html();
            var value = $(this).val();
            if (value !== "" && !isNaN(value)) {
                var property: Property = controller.currentElement.getProperties()[name];
                property.value = value;
                controller.currentElement.setProperty(name, property);
            }
        });
    }

    private setNodeProperties(element): void {
        var properties: PropertiesMap = element.getProperties();
        var content: string = '';
        for (var property in properties) {
            content += this.getPropertyHtml(element.getType(), property, properties[property]);
        }
        $('#property_table tbody').html(content);
    }

    private getPropertyHtml(typeName, propertyName: string, property: Property): string {
        return PropertyManager.getPropertyHtml(typeName, propertyName, property);
    }

    private addLink(linkId: string, linkObject: Link) {
        this.linksMap[linkId] = linkObject;
    }

    public clearScene(): void {
        this.graph.clear();
        this.nodesMap = {};
        this.linksMap = {};
        $(".property").remove();
        this.currentElement = undefined;
    }

    private makeUnselectable(element) {
        if (element.nodeType == 1) {
            element.setAttribute("unselectable", "on");
        }
        var child = element.firstChild;
        while (child) {
            this.makeUnselectable(child);
            child = child.nextSibling;
        }
    }

    // download file with gestures
    private downloadData(url, success) {
        var xhr = XmlHttpFactory.createXMLHTTPObject();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    success(xhr);
                }
            }
        }
        xhr.send();
    }

    private loadGestures() {
        var url = "resources/gestures.json";
        this.downloadData(url, this.processGestures.bind(this));
    }

    private processGestures(xhr) {
        var fileData = JSON.parse(xhr.responseText);
        this.data = [];
        for (var i = 0; i < fileData.length; i++)
            this.data[i] = new Gesture(<string> fileData[i].name, <string[]> fileData[i].key, <number> fileData[i].factor);
    }

    public getGestureList(): utils.PairArray {
        return this.pointsList;
    }

    public getGestureData(): Gesture[] {
        return this.data;
    }

    public getMouseupEvent() {
        return this.mouseupEvent;
    }
}