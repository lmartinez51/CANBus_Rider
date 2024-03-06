const io = require("socket.io")

const PING_TIMEOUT = 90000

function setupSocketIO(httpServer) {
  const ioServer = io(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    },
    pingTimeout: PING_TIMEOUT,
  })

  ioServer.on('connection', (socket) => {
    console.log(`Client Connected: ${socket.id}`)
    //Almacenar el socket en una variable global o similar
  	global.connectedSocket = socket;
    socket.on('disconnect', ()=> {
      console.log("Client Disconnected")
    })
  })

  return ioServer
}

module.exports = { setupSocketIO }
