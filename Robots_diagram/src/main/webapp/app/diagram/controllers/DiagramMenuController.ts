class DiagramMenuController {
    private diagramController;
    private currentFolderId: string;
    private user: string;
    private currentDiagramName: string;
    private currentDiagramFolderId: string;
    private canBeDeleted: boolean;
    private pathToFolder;

    constructor($scope) {
        this.diagramController = $scope.vm;
        this.currentDiagramFolderId = "";
        this.currentDiagramName = "";
        this.canBeDeleted = false;

        var menuController = this;
        $.ajax({
            type: 'POST',
            url: 'getUser',
            dataType: 'text',
            success: function (response) {
                menuController.user = response;
                menuController.currentFolderId = menuController.user + "root_0";
                menuController.pathToFolder = [];
            },
            error: function (response, status, error) {
                console.log("error: " + status + " " + error);
            }
        });

        $.ajax({
            type: 'POST',
            url: 'createFolder',
            dataType: 'text',
            contentType: 'application/json',
            data: (ExportManager.exportFolderToJSON(this.currentFolderId, "root", "")),
            success: function () {
                console.log("OK");
            },
            error: function (response, status, error) {
                console.log("error: " + status + " " + error);
            }
        });

        $(document).ready(function() {
            $('.modal-footer button').click(function() {
                menuController.currentFolderId = menuController.user + "root_0";
                menuController.pathToFolder = [];
            });
            $('#saveAfterCreate').click(function () {
                menuController.canBeDeleted = true;
                menuController.saveCurrentDiagram();
            });
        });
    }

    private clearAll(): void {
        this.diagramController.clearScene();
        this.canBeDeleted = false;
        this.currentDiagramName = "";
        this.currentDiagramFolderId = "";
    }

    private saveDiagram(diagramName: string): void {
        var menuController = this;
        this.currentDiagramName = diagramName;
        this.currentDiagramFolderId = this.currentFolderId;
        $.ajax({
            type: 'POST',
            url: 'saveDiagram',
            dataType: 'text',
            contentType: 'application/json',
            data: (ExportManager.exportDiagramStateToJSON(diagramName, this.currentFolderId,
                this.diagramController.nodesMap, this.diagramController.linksMap)),
            success: function () {
                menuController.currentFolderId = menuController.user + "root_0";
                menuController.pathToFolder = [];
                menuController.pathToFolder = [menuController.currentFolderId];
                $('#diagrams').modal('hide');

                if (menuController.canBeDeleted) {
                    menuController.clearAll();
                }
            },
            error: function (response) {
                menuController.writeWarning(response.responseText, '.savingMenu');
                $('.savingMenu input:text').val('');
            }
        });
    }

    private saveCurrentDiagram(): void {
        var controller = this;
        if (this.currentDiagramName === "") {
            $('#diagrams').modal('show');
            this.saveDiagramAs();
        }
        else {
            $.ajax({
                type: 'POST',
                url: 'rewriteDiagram',
                dataType: 'text',
                contentType: 'application/json',
                data: (ExportManager.exportDiagramStateToJSON(this.currentDiagramName, this.currentDiagramFolderId,
                    this.diagramController.nodesMap, this.diagramController.linksMap)),
                success: function (response) {
                    console.log(response);
                    if (controller.canBeDeleted) {
                        controller.clearAll();
                    }
                },
                error: function (response, status, error) {
                    console.log("error: " + status + " " + error);
                }
            });
        }
    }

    private openDiagram(diagramName: string): void {
        var menuController = this;
        this.currentDiagramName = diagramName;
        this.currentDiagramFolderId = this.currentFolderId;
        this.currentFolderId = this.user + "root_0";
        this.pathToFolder = [];
        $.ajax({
            type: 'POST',
            url: 'openDiagram',
            dataType: 'json',
            contentType: 'application/json',
            data: (ExportManager.exportDiagramRequestToJSON(diagramName, this.currentDiagramFolderId)),
            success: function (response) {
                menuController.diagramController.clearScene();
                ImportManager.import(response, menuController.diagramController.graph, menuController.diagramController.nodesMap,
                    menuController.diagramController.linksMap, menuController.diagramController.nodeTypesMap);
            },
            error: function (response, status, error) {
                if (status === "parsererror") {
                    alert("Diagram with this name does not exist");
                }
                console.log("error: " + status + " " + error);
            }
        });
    }

    private createNewDiagram(): void {
        var controller = this;
        $('#confirmNew').modal('show');
    }

    private openFolderWindow(): void {
        this.showFolderMenu();
        this.showFolderTable(this.currentFolderId);
        this.clearSavingMenu();
    }

    private saveDiagramAs(): void {
        this.showFolderMenu();
        this.showFolderTable(this.currentFolderId);
        this.showSavingMenu();
    }

    private showFolderMenu(): void {
        this.clearFolderMenu();
        var menuController = this;
        $('.folderMenu').append("<i id='levelUp'><span class='glyphicon glyphicon-arrow-left'></span></i>");
        $('.folderMenu #levelUp').click(function() {
            menuController.levelUpFolder();
        });

        $('.folderMenu').append("<i id='creatingMenu'><span class='glyphicon glyphicon-plus'></span></i>");
        $('.folderMenu #creatingMenu').click(function() {
            menuController.showCreatingMenu();
        });
    }

    private showCreatingMenu() {
        var menuController = this;
        this.clearFolderMenu();
        $('.folderMenu').append(
            "<input type='text'>" +
            "<i id='creating'><span class='glyphicon glyphicon-ok' aria-hidden='true'></span></i>" +
            "<i id='cancelCreating'><span class='glyphicon glyphicon-remove'></span></i>");

        $('.folderMenu #creating').click(function() {
            menuController.clearWarning('.folderMenu p');
            menuController.createFolder();
        });

        $('.folderMenu #cancelCreating').click(function() {
            menuController.showFolderMenu();
        });
    }

    private showSavingMenu(): void {
        this.clearSavingMenu();
        var menuController = this;

        $('.savingMenu').append("<b>Input diagram name</b><input type:text>");
        $('#diagrams .modal-footer').prepend("<button id='saving' type='button' class='btn btn-success'>Save</button>");

        $('#saving').click(function() {
            menuController.clearWarning('.savingMenu p');
            var name: string = $('.savingMenu input:text').val();
            if (name === "") {
                menuController.writeWarning("Empty name", '.savingMenu');
            }
            else{
                menuController.saveDiagram(name);
            }
        });
    }

    private writeWarning(message : string, place : string) : void {
        $(place).append("<p class='warningMessage'>" + message + "</p>");
    }

    private clearSavingMenu(): void {
        $('.savingMenu').empty();
        $('.modal-footer #saving').remove();
    }

    private clearFolderMenu(): void {
        $('.folderMenu').empty();
    }

    private clearFolderTable(): void {
        $('.folderTable li').remove();
    }

    private clearWarning(place : string): void {
        $(place).remove();
    }

    private showFolderTable(openingFolderId: string): void {
        this.clearFolderTable();
        this.currentFolderId = openingFolderId;
        var menuController = this;
        $.ajax({
            type: 'POST',
            url: 'getFolderNames',
            dataType: 'json',
            contentType: 'application/json',
            data: (JSON.stringify({name: this.currentFolderId})),
            success: function (response) {
                $.each(response, function (i) {
                    $('.folderView ul').prepend("<li class='folders'><span class='glyphicon glyphicon-folder-open' aria-hidden='true'></span>" +
                        "<span class='glyphicon-class'>" + response[i] + "</span></li>");
                });
                $('.folderTable .folders').click(function () {
                    var folderId: string = menuController.user + $(this).text() + "_" + menuController.pathToFolder.length;
                    menuController.pathToFolder.push(menuController.currentFolderId);
                    menuController.showFolderTable(folderId);
                });
            },
            error: function (response, status, error) {
                console.log("error: " + status + " " + error);
            }
        });
        $.ajax({
            type: 'POST',
            url: 'getDiagramNames',
            dataType: 'json',
            contentType: 'application/json',
            data: (JSON.stringify({name: this.currentFolderId})),
            success: function(response) {
                $.each(response, function (i) {
                    $('.folderView ul').append("<li class='diagrams'><span class='glyphicon glyphicon-file' aria-hidden='true'></span>" +
                        "<span class='glyphicon-class'>" + response[i] + "</span></li>");
                });
                $('.folderTable .diagrams').click(function () {
                    menuController.openDiagram($(this).text());
                    $('#diagrams').modal('hide');
                });
            },
            error: function (response, status, error) {
                console.log("error: " + status + " " + error);
            }
        });
    }

    private levelUpFolder(): void {
        if (this.pathToFolder.length > 0) {
            var parentFolder: string = this.pathToFolder.pop();
            this.showFolderTable(parentFolder);
        }
    }

    private createFolder() : void {
        var name: string = $('.folderMenu input:text').val();
        var menuController = this;
        var newFolderLevel: number = this.pathToFolder.length;
        var folderId: string = this.user + name + "_" + newFolderLevel;
        if (name === "") {
            this.writeWarning("Empty name", '.folderMenu');
        }
        else {
            $.ajax({
                type: 'POST',
                url: 'createFolder',
                dataType: 'text',
                contentType: 'application/json',
                data: (ExportManager.exportFolderToJSON(folderId, name, this.currentFolderId)),
                success: function () {
                    menuController.showFolderMenu();
                    menuController.showFolderTable(menuController.currentFolderId);
                },
                error: function (response) {
                    menuController.writeWarning(response.responseText, '.folderMenu');
                    $('.folderMenu input:text').val('');;
                }
            });
        }
    }
}

