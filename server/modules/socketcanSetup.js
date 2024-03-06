const can = require('socketcan')

const NETWORK_DESCRIPTION_PATH = "./dbc-files/j1939.kcd"
const CHANNEL_NAME = 'vcan0'

function setupSocketCAN() {
  // Parse CAN signals database
  const network = can.parseNetworkDescription(NETWORK_DESCRIPTION_PATH)
  // Create channel to listen interface vcan0
  const channel = can.createRawChannel(CHANNEL_NAME, true)
  const db_bus = new can.DatabaseService(channel, network.buses["Private"])
  // Start listening channel
  channel.start()

  // Store Decoded Information in a list
  let decodedInfo = {
    revs: 0,
    seed: 0,
    dist: 0,
    engCoolantTemp: 0,
    fuelLevel: 0
  }

  function createSignalUpdateHandler(decodedInfoProperty, shouldRound = true) {
    return function(s, socket = global.connectedSocket) {
      decodedInfo[decodedInfoProperty] = shouldRound ? Math.round(s.value) : s.value
      if (socket) socket.emit('message', decodedInfo)
    }
  }

  // Register a listener to get any value updates
  db_bus.messages["EEC1"].signals["EngSpeed"].onUpdate(createSignalUpdateHandler("revs"))
  db_bus.messages["CCVS"].signals["WheelBasedVehicleSpeed"].onUpdate(createSignalUpdateHandler("speed"))
  db_bus.messages["VDHR"].signals["HghRslutionTotalVehicleDistance"].onUpdate(createSignalUpdateHandler("dist", false))
  db_bus.messages["ET1"].signals["EngCoolantTemp"].onUpdate(createSignalUpdateHandler("engCoolantTemp"))
  db_bus.messages["DD"].signals["FuelLevel1"].onUpdate(createSignalUpdateHandler("fuelLevel"))
}

module.exports = { setupSocketCAN }
