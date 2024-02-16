/* eslint-disable no-restricted-globals */
self.onmessage = async (event) => {
    const file = event.data;
    const chunkSize = 1024 * 1024; // Tamaño del chunk en bytes (1MB)
    let offset = 0;
    const parsedData = [];

    const reader = file.stream().getReader();
    let done = false;
    while (!done) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            lines.forEach((line) => {
                if (line.trim() === '' || !line.includes(' ')) return;
                const parts = line.split(' ');
                const time = parts[0];
                const can = parts[1];
                const [id, data] = parts[2].split('#');
                const dt = data.match(/.{1,2}/g);
                parsedData.push({ time, can, id, dt1: dt[0], dt2: dt[1], dt3: dt[2], dt4: dt[3], dt5: dt[4], dt6: dt[5], dt7: dt[6], dt8: dt[7] });
            });            
        }
    }
    

    self.postMessage(parsedData);
};


