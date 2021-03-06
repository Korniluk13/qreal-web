import mWidgetTypes = module("designer/widgets/WidgetTypes")

export class ElementPreferences {
    public static FillParent = 0;
    public static WrapContent = -1;
    private width;
    private widgetType = mWidgetTypes.WidgetTypes.Unknown;
    get Width() {
        return this.width;
    }
    set Width(width: number) {
        this.width = width;
    }
    private height;
    get Height() {
        return this.height;
    }
    set Height(height: number) {
        this.height = height;
    }
    private id: number;
    get Id() {
        return this.id;
    }
    set Id(id: number) {
        this.id = id;
    }
    get WidgetType() {
        return this.widgetType;
    }
    set WidgetType(widgetType) {
        this.widgetType = widgetType;
    }
}