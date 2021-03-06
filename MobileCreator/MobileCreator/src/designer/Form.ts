/// <reference path="../../lib/jquerymobile.d.ts" />
/// <reference path="../../lib/jquery.d.ts" />

import mElement = module("designer/widgets/Element");
import mFormTrigger = module("designer/logic/FormTrigger")

export class Form {
    private formName: string;
    private domElement: JQuery;
    private content: mElement.Element[];
    private formDomElement: JQuery;
    private triggers: mFormTrigger.FormTrigger[];

    get FormName() {
        return this.formName;
    }

    set FormName(formName: string) {
        this.formName = formName;
        this.formDomElement.attr("id", this.formName);
    }

    get Triggers() {
        return this.triggers;
    }

    get Content() {
        return this.content;
    }

    set Content(content: mElement.Element[]) {
        this.content = content;
    }

    public addElement(element: mElement.Element) {
        this.content.push(element);
        this.formDomElement.append(element.DomElement);
    }

    public delElement(element: mElement.Element) {
        var id = element.Preferences.Id;
        var positionToDel = -1;
        for (var i = 0; i < this.content.length; i++) {
            if (this.content[i].Preferences.Id == id) {
                positionToDel = i;
                break;
            }
        }
        if (positionToDel != -1) {
            this.content.splice(positionToDel, 1);
        }
    }

    public show() {
        this.formDomElement.show();
        for (var i = 0; i < this.content.length; i++) {
            this.content[i].init();
        }
    }

    public hide() {
        this.formDomElement.hide();
    }

    public updateTriggers() {
        for (var i = 0; i < this.triggers.length; i++) {
            this.triggers[i].FormId = this.formName;
        }
    }

    public getTriggerNames() {
        var res = [];
        for (var i = 0; i < this.triggers.length; i++) {
            res.push(this.triggers[i].TriggerName);
        }
        return res;
    }

    public toXML() {
        var xml = "<form form_name=\"" + this.formName + "\">\n";
        this.content.forEach(function (element: mElement.Element) { xml += element.toXML() } );
        xml += "</form>\n";
        return xml;
    }

    constructor(formName: string, domElement: JQuery) {
        this.triggers = [];
        this.triggers.push(new mFormTrigger.FormTrigger(formName, "onShow"));
        this.triggers.push(new mFormTrigger.FormTrigger(formName, "onTimer"));
        this.triggers.push(new mFormTrigger.FormTrigger(formName, "onLoginResponse"));
        this.triggers.push(new mFormTrigger.FormTrigger(formName, "onPatientsResponse"));
        this.content = [];
        this.formName = formName;
        this.domElement = domElement;
        this.formDomElement = $("<div id=\"" + this.formName + "\"></div>");
        this.formDomElement.addClass("screen");
        this.domElement.append(this.formDomElement);
    }


}