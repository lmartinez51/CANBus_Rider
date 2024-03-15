const can = require('socketcan')
const NETWORK_DESCRIPTION_PATH = "./dbc-files/j1939.kcd"
const CHANNEL_NAME = 'vcan0'

class SocketCANSetup {
  constructor() {
    this.decodedInfo = {
      revs: 0,
      dist: 0,
      speed: 0,
      engCoolantTemp: 0,
      fuelLevel: 100,
      engLamp: 0,
      hazardLamp: 0
    };
    // Inicializa una variable para almacenar el último momento en que se recibió una señal
    this.lastSignalTime = Date.now();
    // Inicializa un temporizador
    this.timer = null;
  }

  getDecodedInfo() {
    return this.decodedInfo;
  }

  // Función para resetear todos los valores a cero, excepto fuelLevel que se resetea a 100
  resetDecodedInfo() {
    for (let key in this.decodedInfo) {
      if (key === 'fuelLevel') {
        this.decodedInfo[key] = 100;
      } else {
        this.decodedInfo[key] = 0;
      }
    }
  }

  handleSignalUpdate(value, key, socket) {
    clearTimeout(this.timer); // Cancela el temporizador anterior
    this.lastSignalTime = Date.now(); // Actualiza el último momento en que se recibió una señal

    if (key === 'revs') {
        const roundedValue = Math.round(value);
        if (this.decodedInfo[key] !== undefined && Math.abs(roundedValue - this.decodedInfo[key]) <= 2) {
            // Si el nuevo valor es solo mayor en dos unidades o menos, no emitir mensaje (no es necesario emitir tantos mensajes)
            return;
        }
        this.decodedInfo[key] = roundedValue;
    } else {
        this.decodedInfo[key] = Math.round(value);
    }

    if (socket) socket.emit('message', this.decodedInfo);

    // Inicia un nuevo temporizador, en caso que no se reciban valores despues de 5 sec, limpiar decodedInfo
    this.timer = setTimeout(() => {
        this.resetDecodedInfo();
    }, 5000);
  }

  setup() {
    try {
      // Parse CAN signals database
      const network = can.parseNetworkDescription(NETWORK_DESCRIPTION_PATH)
      // Create channel to listen interface vcan0
      const channel = can.createRawChannel(CHANNEL_NAME, true)
      const db_bus = new can.DatabaseService(channel, network.buses["Private"])
      // Start listening channel
      channel.start()

      //Register a listener to get any value updates
      db_bus.messages["EEC1"].signals["EngSpeed"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'revs', socket);
      })

      db_bus.messages["CCVS"].signals["WheelBasedVehicleSpeed"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'speed', socket);
      })
      
      db_bus.messages["VDHR"].signals["HghRslutionTotalVehicleDistance"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'dist', socket);
      })
      
      db_bus.messages["ET1"].signals["EngCoolantTemp"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'engCoolantTemp', socket);
      })

      db_bus.messages["DD"].signals["FuelLevel1"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'fuelLevel', socket);
      })

      db_bus.messages["DLCC1"].signals["EngRedStopLampCmd"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'engLamp', socket);
      })

      db_bus.messages["OEL"].signals["HazardLightSwitch"].onUpdate((s, socket = global.connectedSocket) => {
        this.handleSignalUpdate(s.value, 'hazardLamp', socket);
      })

      /* Esta seccion es para imprimir las senales en la terminal (USE THEM ONLY WHEN NECESSARY)
      // Asegurarse de poner todas las senales de cada mensaje para no ver tantos mensajes de error
      db_bus.messages["ASC1"].signals["DoorRelease"].onUpdate(function(s) {
          console.log("Door Release: " + (s.value === 1 ? "Door Opened" : s.value === 0 ? "Door closed" : "Not available"));
      })

      db_bus.messages["EEC1"].signals["EngSpeed"].onUpdate(function(s) {
          console.log("Engine Speed: " + s.value)
      })

      db_bus.messages["CCVS"].signals["CruiseCtrlActive"].onUpdate(function(s) {
        console.log("Cruise Control: " + s.value)
      })

      db_bus.messages["CCVS"].signals["WheelBasedVehicleSpeed"].onUpdate(function(s) {
          console.log("Wheel Based Vehicle Speed: " + s.value)
      })

      db_bus.messages["CCVS"].signals["ParkingBrakeSwitch"].onUpdate(function(s) {
        console.log("Parking Brake Switch: " + s.value)
      })

      db_bus.messages["CCVS"].signals["BrakeSwitch"].onUpdate(function(s) {
        console.log("Brake Switch: " + s.value)
      })

      db_bus.messages["VD"].signals["TotalVehicleDistance"].onUpdate(function(s) {
          console.log("Total Vehicle Distance: " + s.value)
      })

      db_bus.messages["VD"].signals["TripDistance"].onUpdate(function(s) {
        console.log("Trip Distance: " + s.value)
      }) */
    } catch (err) {
      console.log('Error:', err.message);
      console.log('Error: Please ensure that the virtual CAN interface is created and the CAN kernel module is loaded.')
    }
  }
}

module.exports = { SocketCANSetup }
