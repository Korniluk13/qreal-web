﻿import Log = require("src/util/log/Log");
import App = require("src/Application");
import Controller = require("src/designer/Designer");
import EventManager = require("src/util/events/EventManager");

class ToolsView {

    private log = new Log("ToolsView");

    private controls = [
        {
            id: 'Button',
            title: 'Button',
            tool: 'button'
        },
        {
            id: 'Input',
            title: 'Input',
            tool: 'input'
        },
        {
            id: 'Selection',
            title: 'Selection',
            tool: 'selection'
        },
        {
            id: 'Checkbox',
            title: 'Checkbox',
            tool: 'checkbox'
        },
        {
            id: 'Checkbox2',
            title: 'Checkbox2',
            tool: 'checkbox2'
        },
        {
            id: 'Header',
            title: 'Header',
            tool: 'header'
        },
        {
            id: 'Header2',
            title: 'Header2',
            tool: 'header2'
        },
        {
            id: 'Footer',
            title: 'Footer',
            tool: 'footer'
        },
        {
            id: 'Navbar',
            title: 'Navbar',
            tool: 'navbar'
        },
        {
            id: 'Grid',
            title: 'Grid',
            tool: 'grid'
        },
        {
            id: 'ControlGroup',
            title: 'Control group',
            tool: 'controlgroup'
        }
    ];

    constructor() {
    }

    public Init() {
        this.log.Debug("Init");
        //$('#toolTmpl').tmpl(this.controls).appendTo('#controls');

        var toolItems = $('.tool-item');

        toolItems.on('dragstart', event => this.OnDragStart(event));
        toolItems.on('drag', event => this.OnDrag(event));
        toolItems.on('dragend', () => this.OnDragend());

        var self = this;
        $('#pages .pages-list').on("selectableselected", (event, component?, ui?) => {
            self.log.Debug('selectableselected, event: ', { event: event, ui: ui });
            App.Instance.Device.ControlManager.SelectPage($(ui.selected).text())
        });


        $('#addPage').click(function (e) {
            //TODO: create normal dialog
            var pageName = prompt('New page', 'MyPage');
            if (pageName) {
                self.AddNewPage(pageName);
            }
        });

        var pageItem = $('#templatePageItem').tmpl({ name: 'Main Page' });
        pageItem.appendTo('#pages .pages-list');
        pageItem.select();
    }

    public OnDragStart(event) {
        this.log.Debug("OnDragStart: ");
        event.originalEvent.dataTransfer.setData("ControlId", $(event.target).closest('div').attr('id'));
    }

    public OnDrag(event) {
        //this.log.Debug("OnDrag: " + event);
    }

    public OnDragend() {
        this.log.Debug("OnDragend");
    }

    public AddNewPage(pageId: string) {
        this.log.Debug("PageName: " + pageId);
        var result = App.Instance.Device.ControlManager.CreatePage(pageId);
        if (result) {
            var pageItem = $('#templatePageItem').tmpl({ name: pageId });
            pageItem.appendTo('#pages .pages-list');
            pageItem.select();
        }

    }
}

export = ToolsView;