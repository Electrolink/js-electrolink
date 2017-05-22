import 'paho-mqtt';
const EventEmitter = require('events');
const short = require('short-uuid');


class Electrolink extends EventEmitter {
    constructor(broker_addr, port) {

        this.COMMON_TOPIC = "common/command";
        this.devices = new Array();

        this.BROKER_ADDRESS = broker_addr;
        this.port = port;
        
        // this is broker client
        this.client = new Paho.MQTT.Client(this.BROKER_ADDRESS , this.port, "browser");
        
        // set callback handlers      
        this.client.onConnectionLost = this.onConnectionLost.bind(this);
        this.client.onMessageArrived = this.onMessageArrived.bind(this);

        this.client.connect({onSuccess:this.onConnect.bind(this)});

        this.translator = short();
        
    }
   
   get uuid() { // call it with this.uuid
        return this.translator.new();
   }
    // called when the client connects
    onConnect() {
        console.log("connected to broker");
        this.client.subscribe("common/reply");
        this.emit('onConnected');
    }

    // called when the client loses its connection
    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("Connection lost:"+responseObject.errorMessage);
        }
    }

    // called when a message arrives
    onMessageArrived(message) {
        if (message.destinationName === "common/reply") {
            console.log("onMessageArrived:"+message.payloadString, message);
            let s = JSON.parse(message.payloadString);
            let requested = s.requested;

            if (requested === "ping") {
                let value = s.value;
                this.devices.push(value);
            }

        }
    }

    discoverDevices(delay) {
        let devices = new Array();
        console.log("common topic", this.COMMON_TOPIC);
        this.sender(this.COMMON_TOPIC, "ping", []);
        setTimeout( () => { this.emit("onDiscovery", this.devices)}, delay);
    }

    sender(target, method, params) {
        let out = {"method":method, "params":params};
        let message = new Paho.MQTT.Message(JSON.stringify(out));
        console.log(target, out);
        message.destinationName = target;
        this.client.send(message);
    }

}
export {Electrolink}