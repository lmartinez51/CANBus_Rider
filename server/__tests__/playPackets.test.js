const EventEmitter = require('events');
const childProcess = require('child_process');
const player = require('../modules/player');

jest.mock('child_process');
jest.mock('../modules/player');

describe('playPackets module', () => {
    let playPackets;
    let mockReq;
    let mockRes;
    let mockChildStdout;
    let mockChildStderr;
    let mockChild;
    let mockScriptchildStdout;
    let mockScriptchildStderr;
    let mockScriptchildStdin;
    let mockScriptchild;

    beforeEach(() => {
        jest.clearAllMocks();

        mockChildStdout = new EventEmitter();
        mockChildStderr = new EventEmitter();
        mockChild = new EventEmitter();
        mockChild.stdout = mockChildStdout;
        mockChild.stderr = mockChildStderr;
        mockChild.unref = jest.fn();

        mockScriptchildStdout = new EventEmitter();
        mockScriptchildStderr = new EventEmitter();
        mockScriptchildStdin = { write: jest.fn(), end: jest.fn() };
        mockScriptchild = new EventEmitter();
        mockScriptchild.stdout = mockScriptchildStdout;
        mockScriptchild.stderr = mockScriptchildStderr;
        mockScriptchild.stdin = mockScriptchildStdin;
        mockScriptchild.unref = jest.fn();

        childProcess.spawn.mockImplementation((command) => {
            if (command === 'candump') {
                return mockChild;
            }
            if (command === 'python3') {
                return mockScriptchild;
            }
            return new EventEmitter();
        });

        mockReq = {};
        mockRes = {
            writeHead: jest.fn(),
            write: jest.fn()
        };

        playPackets = require('../modules/playPackets');
    });

    test('should setup headers and process scriptchild output correctly', () => {
        playPackets(mockReq, mockRes, 'test-log.log');

        expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/event-stream",
            "Cache-control": "no-cache",
            "Connection": "keep-alive"
        });

        expect(player.player).toHaveBeenCalledWith('test-log.log');

        // Simulate data on scriptchild.stdout
        const sampleData = "(123.45) vcan0 18FEF100#1234 :: ECU_Name (Signal1: 10, Signal2: 20)\n";
        mockScriptchildStdout.emit('data', Buffer.from(sampleData));

        expect(mockRes.write).toHaveBeenCalledWith('id:1\n');
        expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('ECU_Name'));
    });

    test('should handle scriptchild exit event', () => {
        playPackets(mockReq, mockRes, 'test-log.log');

        mockScriptchild.emit('exit');

        expect(mockRes.write).toHaveBeenCalledWith('event: close\n');
        expect(mockRes.write).toHaveBeenCalledWith('data: finished');
    });
});
