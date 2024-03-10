const PING_TIMEOUT = 90000
const io = require("socket.io")

function setupSocketIO(httpServer) {
  let clientNames = {}
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
    // Almacenar el socket en una variable global o similar
    global.connectedSocket = socket;
      socket.on('introduce', (name) => {
          clientNames[socket.id] = name;
          console.log(`Client Connected: ${name}`);
      });
  
      socket.on('disconnect', () => {
          const name = clientNames[socket.id] || 'Home Page';
          if (name === 'Home Page') {
              console.log('Client Connected: Home Page');
          } else {
              console.log(`Client Disconnected: ${name}`);
          }
          delete clientNames[socket.id];
      });
  })
  //return ioServer   // Lo deje solo en caso de que necesite referenciar este socket despues en otro lugar.
}

module.exports = { setupSocketIO }
