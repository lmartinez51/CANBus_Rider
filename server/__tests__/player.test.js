const child_process = require('child_process');
const path = require('path');
const { player } = require('../modules/player');

jest.mock('child_process', () => ({
    execFile: jest.fn()
}));

describe('player module', () => {
    let mockChildProcess;

    beforeEach(() => {
        jest.clearAllMocks();
        mockChildProcess = {
            stderr: { on: jest.fn() },
            on: jest.fn()
        };
        child_process.execFile.mockReturnValue(mockChildProcess);
    });

    it('should invoke canplayer with safe file path for normal input', () => {
        player('test.log');

        const expectedPath = path.join('log-files', 'test.log');
        expect(child_process.execFile).toHaveBeenCalledWith(
            'canplayer',
            ['-I', expectedPath, 'vcan0=vcan0', '-v', '-g', '2']
        );
    });

    it('should sanitize path traversal sequences and confine to log-files directory', () => {
        player('../../etc/passwd');

        const expectedPath = path.join('log-files', 'passwd');
        expect(child_process.execFile).toHaveBeenCalledWith(
            'canplayer',
            ['-I', expectedPath, 'vcan0=vcan0', '-v', '-g', '2']
        );
    });

    it('should handle filenames with directory parts safely', () => {
        player('../candump-mod.log');

        const expectedPath = path.join('log-files', 'candump-mod.log');
        expect(child_process.execFile).toHaveBeenCalledWith(
            'canplayer',
            ['-I', expectedPath, 'vcan0=vcan0', '-v', '-g', '2']
        );
    });
});
