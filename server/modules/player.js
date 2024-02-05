var spawn = require('child_process').spawn;
const axios = require('axios');
const { execFile } = require('node:child_process');

function player(fileName){
    //We can use candump filters e.g. 'candump vcan0,9803FEFE:1ffffff' (extended version 29-bits) or 201:7ff (11-bit)
    var child = execFile('canplayer',['-I', 'log-files/' + fileName, 'vcan0=vcan0', '-v']); //from a physical device vcan0=can0

    /*
    child.stdout.on('data', function (data) {
        console.log(`${data}`);  // Impresion de datos en la consola, NO necesaria
    });
    */

    child.stderr.on('data', function (data) {
        console.error(`stderr: ${data}`);
    });

    child.on('exit', () => {
        console.log(`Exiting canplayer...`);
    });

    child.on('close', (code) => {
        console.log(`canplayer process closed with code ${code} \n`);
    });
}

module.exports = {player}