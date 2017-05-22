import {Electrolink} from './js/Electrolink';

global.app = function () {
    let electrolink = new Electrolink("127.0.0.1", 4444);
    
    electrolink.on('onConnected', () => {
        electrolink.discoverDevices(1000);
    });

    electrolink.on('onDiscovery', (devices) => {
        console.log("devices", devices);
            
    });

    //electrolink.discoverDevices().then(console.log("hello"));
 
};