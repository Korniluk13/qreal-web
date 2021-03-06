import mLog = module("utils/log/Log");
import mControl = module("emulator/model/ui/Control");
import mControlPanel = module("emulator/model/ui/ControlPanel");
import mPage = module("emulator/model/Page");
import mEmulator = module("emulator/model/Emulator");
import mTrigger = module("emulator/model/logic/Trigger");

export class NavigationManager {
    private static logger = new mLog.Logger("NavigationManager");
    private idPreffix = "PageId_";

    private pageStack: string[] = [];
    private pages: mPage.Page[] = [];
    private currentPage: mPage.Page;

    get CurrentPage(): mPage.Page {
        return this.currentPage;
    }

    constructor() {
        NavigationManager.logger.log("in constructor");
    }

    public addPage(page: mPage.Page) {
        this.pages[this.idPreffix + page.Name] = page;
    }

    public showPage(pageName: string) {
        NavigationManager.logger.log("showPage "+pageName);
        var page:mPage.Page = this.pages[this.idPreffix + pageName];
        this.pageStack.push(this.idPreffix + pageName);       
        if (this.currentPage) {
            this.currentPage.onHide();
        }
        mEmulator.Emulator.instance.showPage(page.Root);
        this.currentPage = page;
        page.onShow();
    }

    public findControlById(id: string): mControl.Control {
        var control: mControl.Control;
        var root = this.currentPage;
        return this.getControlById(root.Root, id);
    }

    private getControlById(root: mControl.Control, id: string): mControl.Control {
        if (!root) {
            return undefined;
        }
        if (root.Tag.Id == id) {
            return root;
        }
        if (root instanceof mControlPanel.ControlPanel) {
            var childrens = (<mControlPanel.ControlPanel>root).Childrens;
            
            for (var i = 0; i < childrens.length; i++) {
                var control = this.getControlById(childrens[i], id);
                if (control) {
                    return control;
                }
            };
        }
        return undefined;
    }

    public back() {
        var length = this.pageStack.length;
        if (length > 1) {
            this.pageStack.splice(length - 1, 1);
            var pageId = this.pageStack[this.pageStack.length - 1];
            if (this.currentPage) {
                this.currentPage.onHide();
            }
            this.currentPage = this.pages[pageId];
            mEmulator.Emulator.instance.showPage(this.pages[pageId].Root);
            this.currentPage.onShow();
        }
    }

    public clear() {
        this.pageStack = [];
        this.pages = [];
        if (this.currentPage) {
            this.currentPage.onHide();
        }
        this.currentPage = undefined;
    }
}