const fs = require('fs')
const can = require('socketcan');
let now = new Date()

module.exports = () => {
  //Create channel to listen interface vcan0
  const channel = can.createRawChannel("vcan0", true)
  // Start listening channel
  channel.start()
  //Writing raw packets to file
  channel.addListener("onMessage", dumpPacket)
}

//This function emulates candump -L 
function toHex(number) {
	return ("00000000" + number.toString(16)).slice(-8);
}

// Dump raw packets to file
function dumpPacket(msg) {
	let timestamp = now.toISOString().replace(/[-:.]/g, '')
	let filename = './packets/' + timestamp + '.log'
	let writeStream = fs.createWriteStream(filename, {flags: 'a'});
	let data = '(' + (msg.ts_sec + msg.ts_usec / 1000000).toFixed(6) + ')  ' + 'vcan0  ' +
	toHex(msg.id).toUpperCase() + '  [8]  ' + msg.data.toString('hex').toUpperCase() + '\r\n';
	writeStream.write(data) //This works perfectly to write the stream on a file
	writeStream.end()
  
	// This is here incase any errors occur
	writeStream.on('error', function (err) {
	  console.log(err)
	})
}
