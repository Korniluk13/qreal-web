import Log = require("src/util/log/Log");
import DialogHelper = require("src/util/DialogHelper");
import App = require("src/Application");
import EventManager = require("src/util/events/EventManager");
import ToolsView = require("src/designer/ToolsView");
import PropertiesView = require("src/designer/PropertiesView");
import ControlProperty = require("src/model/ControlProperty");

declare var bootbox;
declare var projectName;
declare var projectPackage;
declare var projectType;
declare var ace;

class Designer {

    private log = new Log("Designer");
    private dh: DialogHelper = new DialogHelper();

    private toolsView: ToolsView;
    private eventManager: EventManager;
    private propertiesView: PropertiesView;
    private code = {
        html: "",
        js: "",
        css: ""
    }

    constructor() {
        this.log.Debug("constructor");
        this.toolsView = new ToolsView();
        this.propertiesView = new PropertiesView();
        this.eventManager = new EventManager($('body'));
    }

    public Init(): void {
        this.log.Debug("Init");

        var self = this;

        this.toolsView.Init();
        this.propertiesView.Init();

        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/Chrome");
        editor.getSession().setMode("ace/mode/html");

        //TODO: switch type of app 
        if (projectType != "Android (PhoneGap)") {
            $('#generate-apk').on('click', function (e) {
                self.log.Debug("My project name: " + projectName);
                self.dh.ShowProgress("Generating apk...");
                var dataToSend = JSON.stringify({
                    project_name: projectName,
                    project_package: projectPackage
                }, null, 2);
                self.log.Debug("dataToSend:", dataToSend);
                $.ajax({
                    type: "POST",
                    url: "/Projects/BuildAndroidProject",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: dataToSend,
                    success: function (result) {
                        window.location.href = "/Projects/DownloadAndroidApk?projectName=" + projectName;
                        self.dh.HideProgress();
                    }
                });
            });
        } else {
            $('#generate-apk').on('click', function (e) {
                self.log.Debug("My project name: " + projectName);
                var appHtml = App.Instance.Device.ControlManager.GenerateAppHtml();
                self.dh.ShowProgress("Generating apk...");
                var dataToSend = JSON.stringify({
                    project_name: projectName,
                    appHtml: appHtml,
                    appJs: self.code.js,
                    appCss: self.code.css
                }, null, 2);
                self.log.Debug("dataToSend:", dataToSend);
                $.ajax({
                    type: "POST",
                    url: "/Projects/BuildProject",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: dataToSend,
                    success: function (result) {
                        window.location.href = "/Projects/DownloadApk?projectName=" + projectName;
                        self.dh.HideProgress();
                    }
                });
            });
        }


        $('#serialize').on('click', function (e) {
            //self.Download('app.json', App.Instance.Device.ControlManager.Serialize());
            self.Download('app.json', App.Instance.Device.ControlManager.Serialize2DiagramEditor());
        });

        $('#run').on('click', function (e) {
            var appHtml = self.FormatHtml(App.Instance.Device.ControlManager.GenerateAppHtml());
            var dataToSend = JSON.stringify({
                project_name: projectName,
                appHtml: appHtml,
                appJs: "",
                appCss: ""
            }, null, 4);
            $.ajax({
                type: "POST",
                url: "/Projects/EmulatorData",
                contentType: "application/json; charset=utf-8",
                dataType: "text",
                data: dataToSend,
                success: function (result) {
                    self.log.Debug('post result:', result);
                    // $('#emulatorIframe').modal();
                    // $('#emulatorIframe').find('iframe').attr('src', "/Projects/Emulator")
                    window.open("/Projects/Emulator", "_blank", "location=yes,height=480,width=320,scrollbars=yes,status=yes");
                }
            });
        });

        $('#code').on('click', e => {
            $('#codeEditor').modal();

            switch (editor.getSession().getMode().$id) {
                case "ace/mode/javascript":
                    self.code.js = editor.getValue();
                    break;
                case "ace/mode/css":
                    self.code.css = editor.getValue();
                    break;
                case "ace/mode/html":
                    self.code.html = editor.getValue();
                    break;
            }
        });

        $('#diagram').on('click', e => {
            $('#diagramEditor').modal();

            (<any>window).importJSON(App.Instance.Device.ControlManager.Serialize2DiagramEditor());
            //$.getJSON("/Content/diagram-editor-master/example1.txt").done(function (json) {
            //    
            //    (<any>window).importJSON(json);
            //});
        });

        $('#saveDiagram').on('click', e => {
            var result = (<any>window).exportJSON();
            console.log(result);
        });

        $('#codeEditor').on('show.bs.modal', function () {
            $('.modal-content .modal-body').css('height', $(window).height() * 0.8);
            $('#editor_pills li').removeClass('active');
            $('#editor_pills li').first().addClass('active');
            editor.getSession().setMode("ace/mode/html");
            self.code.html = self.FormatHtml(App.Instance.Device.ControlManager.GenerateAppHtml());
            editor.setValue(self.code.html);
        });

        $('#editor_pills a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
            switch ($(this).text()) {
                case "JavaScript":
                    editor.getSession().setMode("ace/mode/javascript");
                    editor.setValue(self.code.js);
                    break;
                case "CSS":
                    editor.getSession().setMode("ace/mode/css");
                    editor.setValue(self.code.css);
                    break;
                case "Html":
                    editor.getSession().setMode("ace/mode/html");
                    self.code.html = self.FormatHtml(App.Instance.Device.ControlManager.GenerateAppHtml());
                    editor.setValue(self.code.html);
                    break;
            }
        });

        $(document).ready(function () {
            /**
             * Maximize the real estate available to the portal contents
             */
            self.ResizeContent();
            $(window).resize(self.ResizeContent);

            //jQuery.get('/MobileAppTemplate/js/index.js', function (data) {
            //     //alert(data);
            //     self.code.js = data;
            // });
        });
    }

    private ResizeContent() {
        var propertyHeight = $(window).height() - 70;
        $(".properties-panel").height(propertyHeight);
        var controlsHeight = $(window).height() - 125;
        $(".dleft .panel").height(controlsHeight);
        $(".dcenter").height(propertyHeight + 20);
    }

    public Download(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    }

    public PostOpen(verb, url, data, target) {
        var form = document.createElement("form");
        form.action = url;
        form.method = verb;
        form.target = target || "_self";
        if (data) {
            for (var key in data) {
                var input = document.createElement("textarea");
                input.name = key;
                input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
                form.appendChild(input);
            }
        }
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    }

    private FormatHtml(html: string): string {
        return (<any>jQuery).htmlClean(html, {
            format: true
        });
    }

    public get EventManager(): EventManager {
        return this.eventManager;
    }

    public AddPage(pageName: string) {
        this.toolsView.AddNewPage(pageName);
    }

    public ShowProperty(data: ControlProperty.Property) {
        this.propertiesView.ShowProperty(data);
    }
}

export = Designer;