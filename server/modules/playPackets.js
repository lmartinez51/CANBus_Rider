var fs = require('fs');
var spawn = require('child_process').spawn;
const player = require("./player")

function emitSSE(res, index, time, can, id, dt1, dt2, dt3, dt4, dt5, dt6, dt7, dt8, ecu, values) {
    res.write('id:' + index + '\n');
    res.write(`data: {"time": "${time}", "can": "${can}", "id": "${id}", "dt1": "${dt1}", "dt2": "${dt2}", "dt3": "${dt3}", "dt4": "${dt4}", "dt5": "${dt5}", "dt6": "${dt6}", "dt7": "${dt7}", "dt8": "${dt8}", "ecu": "${ecu}", "values": "${values}"}`);
    res.write("\n\n");
}

  module.exports = (req,res, fileName, filters) => {
    res.writeHead(200, {"Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/event-stream",
                        "Cache-control": "no-cache",
                        "Connection": "keep-alive"});
    //We can use candump filters e.g. 'candump vcan0,9803FEFE:1ffffff' (extended version 29-bits) or 201:7ff (11-bit)
    const filterString = filters.join(',');
    var child = spawn('candump',['-t', 'a', '-T', '10000','vcan0,' + filterString], {detached: true});  //Terminate after 10 secs if no frames were received.
    child.unref();
    var scriptchild = spawn('python3', ['-m', 'cantools','decode', '--single-line', 'dbc-files/client-j1939.dbc'], {detached: true});
    scriptchild.unref();

    child.stdout.on('data', function (data) {
        scriptchild.stdin.write(data);
    });
    // Save decoded packets.
    //var writeStream = fs.createWriteStream('./packets/replayeddecoded.pcap',{flags: 'w'});

    //Writing to file
    // scriptchild.stdout.on('data', function (data) {
    //     writeStream.write(data); //This works perfectly to write the stream on a file
    // });

    // scriptchild.stdout.on('end', function () {
    //     writeStream.end();
    // });

    counter = 0;

    //Initializing player function to replay packets
    player.player(fileName);
    
    //Format string and send it to /logs page
    scriptchild.stdout.on('data', function (data) {
        str = ''
        str = data.toString() + '\n';
        var lines = str.split("\n");
        var clines = lines.filter(element => {
            return element !== '';
          });
        for(var i in clines) {
            counter++;
            packet ='';
            packet = clines[i].split("::");
            raw = packet[0].trim().replace(/\s+/g, '*')
            if (packet[1] === undefined) {
                continue;
            }
            decode = packet[1].trim().split(/(?=\()/g);
            // Agrega el if-statement aquí
            if (decode[0].includes('Unknown') || decode[0].includes('frame')) {
                continue; // Salta al siguiente ciclo si decode[0] contiene "frame" o "Unknown"
            }
            const chars = {'(':'{',')':'}'};
            if (decode[1] === undefined) {
                continue;
            }
            values = decode[1].replace(/[\(\)]/g, m=>chars[m]);
            frame = '';
            frame = raw.split("*");
            emitSSE(res, counter, frame[0], frame[1], frame[2], frame[4], frame[5], frame[6], frame[7], frame[8], frame[9], frame[10], frame[11], decode[0], values);
        }
    });

    child.stderr.on('data', function (data) {
        console.error(`stderr:  ${data}`);
    });

    child.on('error', (error) => {
        console.error(`error: ${error.message}`);
      });

    scriptchild.on('exit', () => {
        res.write('event: close\n');
        res.write('data: finished');
        res.write('\n\n');
        console.log(`Exiting Decoder ...`);
      });
    
    child.on('exit', () => {
        console.log(`Exiting candump...`);
    });

    child.on('close', () => {
        console.log(`candump process closed.`);
        scriptchild.stdin.end();
    });

    scriptchild.stderr.on('data', function (data) {
        console.error(`python stderr:  ${data}`);
    });

    scriptchild.on('close', () => {
        console.log(`Decoder process closed.`);
    });
}