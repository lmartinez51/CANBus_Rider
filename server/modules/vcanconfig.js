const { execFileSync } = require('child_process');

// This function initialize the virtual CAN bus interface.
function initializeVirtualCAN (device) {
    if (typeof device !== 'string' || !/^[a-zA-Z0-9]+$/.test(device)) {
        throw new Error('Invalid device name');
    }

    // Check if the vcan interface is already running and turn it off
    try {
        execFileSync('sudo', ['ip', 'link', 'del', device]); //Checar primero antes de utilizar esta instruccion
    } catch(error) {
        console.log('No previous ' + device + ' interface is running. Proceed');
    }
    //Start simulation
    execFileSync('sudo', ['modprobe', 'vcan']);
    // Turn on CAN bus
    try {
        // Create a vcan network interface with a specific name
        execFileSync('sudo', ['ip', 'link', 'add', 'dev', device, 'type', 'vcan']);
    } catch(error) {
        console.log("CAN bus already initialized");
    }
    execFileSync('sudo', ['ip', 'link', 'set', 'up', device]);
    // The next two statements are not necessary but they show if the virtual CAN is running or not
    try {
        const result = execFileSync('ifconfig', [device]);
        console.log(result.toString());
    } catch(error) {
        console.log("Could not run ifconfig for " + device);
    }
}
module.exports = {initializeVirtualCAN}
