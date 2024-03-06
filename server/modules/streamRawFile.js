const fs = require('fs');
const readline = require('readline');
const path = require('path');
const directoryPath = '/home/kali/Proyectos_AI/CANBus_Rider/server/log-files/';

function emitSSE(res, index, time, can, id, dt1, dt2, dt3, dt4, dt5, dt6, dt7, dt8) {
    res.write('id:' + index + '\n');
    res.write(`data: {"time": "${time}", "can": "${can}", "id": "${id}", "dt1": "${dt1}", "dt2": "${dt2}", "dt3": "${dt3}", "dt4": "${dt4}", "dt5": "${dt5}", "dt6": "${dt6}", "dt7": "${dt7}", "dt8": "${dt8}"}`);
    res.write("\n\n");
}

module.exports = (req, res, fileName) => {
    //const filePath = path.join(directoryPath, fileName);
    const filePath = directoryPath + fileName
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
        console.error(`El archivo "${fileName}" no se pudo encontrar en la ruta especificada.`);
        return; // Salir de la función o manejar el error según tus necesidades
    }
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream",
        "Cache-control": "no-cache",
        "Connection": "keep-alive"
    });

    const regex = /\(\d{10}\.\d{6}\) \w*can\w* \w{6}FE#\w{16}/;
    let counter = 1;

    const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        console: false
    });

    readInterface.on('line', function(line) {
        if (regex.test(line)) {
            let time = line.match(/\(\d{10}\.\d{6}\)/)[0]; // get the time with parentheses
            let restOfLine = line.split(time)[1]; // get the rest of the line
            let frame = restOfLine.split(/[\s#]+/); // split the rest of the line
            frame = [time].concat(frame.slice(1)); // add the time to the beginning of the array
            let hexData = frame[3]; // get the hex data
            frame[3] = hexData.substring(0, 2); // get the first pair of hex data
            frame[4] = hexData.substring(2, 4); // get the second pair of hex data
            frame[5] = hexData.substring(4, 6); // get the third pair of hex data
            frame[6] = hexData.substring(6, 8); // get the fourth pair of hex data
            frame[7] = hexData.substring(8, 10); // get the fifth pair of hex data
            frame[8] = hexData.substring(10, 12); // get the sixth pair of hex data
            frame[9] = hexData.substring(12, 14); // get the seventh pair of hex data
            frame[10] = hexData.substring(14, 16); // get the eighth pair of hex data
            emitSSE(res, counter, frame[0], frame[1], frame[2], frame[3], frame[4], frame[5], frame[6], frame[7], frame[8], frame[9], frame[10]);
            counter++;
        }
    });    
    
}
