const validHex = ['18F005FE', '18FEF2FE', 'CF004FE', '18FEF1FE', '18FCDCFE'];
const maxLines = 2000;

function isValidLine(line) {
    const regex = /\(\d{10}\.\d{6}\) \w*can\w* \w{6}FE#\w{16}/;
    if (!regex.test(line)) return false;

    const hexValue = line.split(' ')[2];
    return validHex.includes(hexValue);
}

async function handleFilterLogFiles() {
    const options = {
        types: [
            {
                description: 'Log files',
                accept: {
                    'text/plain': ['.log'],
                },
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
    }

    try {
        const [fileHandle] = await window.showOpenFilePicker(options);
        const file = await fileHandle.getFile();
        const text = await file.text();
        const lines = text.split('\n');

        let validLines = [];
        let fileCount = 1;
        for (const line of lines) {
            if (isValidLine(line)) {
                validLines.push(line);
            }
            if (validLines.length >= maxLines) {
                const saveFileHandle = await window.showSaveFilePicker({ suggestedName: `logfile${fileCount}.txt` });
                const writableStream = await saveFileHandle.createWritable();
                await writableStream.write(validLines.join('\n'));
                await writableStream.close();
                validLines = [];
                fileCount++;
            }
        }

        if (validLines.length > 0) {
            const saveFileHandle = await window.showSaveFilePicker({ suggestedName: `logfile${fileCount}.txt` });
            const writableStream = await saveFileHandle.createWritable();
            await writableStream.write(validLines.join('\n'));
            await writableStream.close();
        }

    } catch (err) {
        console.error('Error reading file:', err);
    }
}
