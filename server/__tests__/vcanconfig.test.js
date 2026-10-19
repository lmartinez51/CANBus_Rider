const { initializeVirtualCAN } = require('../modules/vcanconfig');
const child_process = require('child_process');

jest.mock('child_process', () => ({
    execFileSync: jest.fn()
}));

describe('vcanconfig - initializeVirtualCAN', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('accepts valid device name and calls execFileSync with array arguments', () => {
        child_process.execFileSync.mockReturnValue(Buffer.from('vcan0 flags=193<UP,RUNNING,NOARP>'));

        expect(() => initializeVirtualCAN('vcan0')).not.toThrow();

        expect(child_process.execFileSync).toHaveBeenCalledWith('sudo', ['ip', 'link', 'del', 'vcan0']);
        expect(child_process.execFileSync).toHaveBeenCalledWith('sudo', ['modprobe', 'vcan']);
        expect(child_process.execFileSync).toHaveBeenCalledWith('sudo', ['ip', 'link', 'add', 'dev', 'vcan0', 'type', 'vcan']);
        expect(child_process.execFileSync).toHaveBeenCalledWith('sudo', ['ip', 'link', 'set', 'up', 'vcan0']);
        expect(child_process.execFileSync).toHaveBeenCalledWith('ifconfig', ['vcan0']);
    });

    test('rejects malicious device names and throws error without executing system commands', () => {
        const maliciousPayloads = [
            'vcan0; id',
            'vcan0 && whoami',
            '$(id)',
            '`id`',
            'vcan0 | cat /etc/passwd',
            'vcan0\nid',
            '../../etc/passwd',
            'vcan0 ',
            ' vcan0',
            '',
            null,
            undefined,
            123
        ];

        for (const payload of maliciousPayloads) {
            expect(() => initializeVirtualCAN(payload)).toThrow('Invalid device name');
        }

        expect(child_process.execFileSync).not.toHaveBeenCalled();
    });
});
