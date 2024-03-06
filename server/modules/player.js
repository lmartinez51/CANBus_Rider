const { execFile } = require('node:child_process');

function player(fileName){
    console.log(`Player File Name: ${fileName}`)
    var child = execFile('canplayer',['-I', 'log-files/' + fileName, 'vcan0=vcan0']); //from a physical change device to: vcan0=can0

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