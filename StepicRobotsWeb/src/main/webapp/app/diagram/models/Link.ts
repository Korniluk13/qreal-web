class Link implements DiagramElement {
    private logicalId: string;
    private jointObject: joint.dia.Link;
    private properties: PropertiesMap = {};
    private type = "Link";

    constructor(jointObject: joint.dia.Link, properties?: PropertiesMap) {
        this.logicalId = UIDGenerator.generate();
        this.jointObject = jointObject;

        if (properties) {
            this.properties = properties;
        }
        else {
            this.properties["Guard"] = new Property("Guard", "", "dropdown");
        }
    }

    getLogicalId(): string {
        return this.logicalId;
    }

    getJointObject() {
        return this.jointObject;
    }

    getType(): string {
        return this.type;
    }

    getProperties(): PropertiesMap {
        return this.properties;
    }

    setProperty(name:string, property: Property): void {
        this.properties[name] = property;
    }
}