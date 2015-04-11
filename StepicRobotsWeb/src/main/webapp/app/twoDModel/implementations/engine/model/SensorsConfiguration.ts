class SensorsConfiguration extends DevicesConfigurationProvider {
    private robotModel: RobotModel;
    private robotModelName: string;

    constructor(robotModel: RobotModel) {
        super();
        this.robotModel = robotModel;
        this.robotModelName = robotModel.info().getName();
    }

    private isSensorHaveView(sensorType: DeviceInfo): boolean {
        return sensorType.isA(TouchSensor)
            || sensorType.isA(ColorSensor)
            || sensorType.isA(LightSensor)
            || sensorType.isA(RangeSensor)
            || sensorType.isA(VectorSensor);
    }

    addSensor(portName: string, sensorType: DeviceInfo, position?: TwoDPosition, direction?: number): void {
        if (this.getCurrentConfiguration(this.robotModelName, portName)) {
            this.removeSensor(portName);
        }
        this.deviceConfigurationChanged(this.robotModel.info().getName(), portName, sensorType);
        if (this.isSensorHaveView(sensorType)) {
            this.robotModel.addSensorItem(portName, sensorType, position, direction);
        }
    }

    removeSensor(portName: string): void {
        var sensor = this.getCurrentConfiguration(this.robotModelName, portName);
        if (sensor) {
            if (this.isSensorHaveView(sensor)) {
                this.robotModel.removeSensorItem(portName);
            }
            this.deviceConfigurationChanged(this.robotModelName, portName, null);
        }
    }

    private parsePositionString(positionStr: string): TwoDPosition {
        var splittedStr = positionStr.split(":");
        var x = parseFloat(splittedStr[0]);
        var y = parseFloat(splittedStr[1]);
        return new TwoDPosition(x, y);
    }

    deserialize(xml, offsetX: number, offsetY: number): void {
        var sensors = xml.getElementsByTagName("sensor");
        for (var i = 0; i < sensors.length; i++) {
            var portName: string = sensors[i].getAttribute('port').split("###")[0];
            var typeSplittedStr = sensors[i].getAttribute('type').split("::");
            var device: DeviceInfo = DeviceInfoImpl.fromString(typeSplittedStr[typeSplittedStr.length - 1]);

            var posString = sensors[i].getAttribute('position');
            var pos = this.parsePositionString(posString);
            var direction: number = parseFloat(sensors[i].getAttribute('direction'));

            this.addSensor(portName, device, pos, direction);
        }
    }
}