var spawn = require('child_process').spawn;
const axios = require('axios');
const { execFile } = require('node:child_process');

function player(fileName){
    console.log(`Player File Name: ${fileName}`)
    //We can use candump filters e.g. 'candump vcan0,9803FEFE:1ffffff' (extended version 29-bits) or 201:7ff (11-bit)
    var child = execFile('canplayer',['-I', 'log-files/' + fileName, 'vcan0=vcan0', '-v', '-g', '2']); //from a physical change device to: vcan0=can0

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