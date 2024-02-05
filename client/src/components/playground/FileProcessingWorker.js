/* eslint-disable no-restricted-globals */
self.onmessage = async (event) => {
    const file = event.data;
    const text = await file.text();
    const lines = text.split('\n');
    const parsedData = [];
    lines.forEach((line) => {
        if (line.trim() === '') return;
        const parts = line.split(' ');
        const time = parts[0];
        const can = parts[1];
        const [id, data] = parts[2].split('#');
        const dt = data.match(/.{1,2}/g);
        parsedData.push({ time, can, id, dt1: dt[0], dt2: dt[1], dt3: dt[2], dt4: dt[3], dt5: dt[4], dt6: dt[5], dt7: dt[6], dt8: dt[7] });
    });
    self.postMessage(parsedData);
};
