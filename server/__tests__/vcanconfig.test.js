const childProcess = require('child_process');
const vcanconfig = require('../modules/vcanconfig');

jest.mock('child_process', () => ({
    execSync: jest.fn()
}));

describe('vcanconfig module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initializeVirtualCAN', () => {
        it('should execute CAN configuration commands for valid device name', () => {
            childProcess.execSync.mockReturnValue(Buffer.from('vcan0 flags=...'));

            expect(() => vcanconfig.initializeVirtualCAN('vcan0')).not.toThrow();
            expect(childProcess.execSync).toHaveBeenCalledWith('sudo ip link del vcan0');
            expect(childProcess.execSync).toHaveBeenCalledWith('sudo modprobe vcan');
            expect(childProcess.execSync).toHaveBeenCalledWith('sudo ip link add dev vcan0 type vcan');
            expect(childProcess.execSync).toHaveBeenCalledWith('sudo ip link set up vcan0');
            expect(childProcess.execSync).toHaveBeenCalledWith('ifconfig vcan0');
        });

        it('should reject invalid or dangerous device names containing injection attempts', () => {
            const maliciousInputs = [
                'vcan0; whoami',
                'vcan0 && rm -rf /',
                'vcan0 | cat /etc/passwd',
                'vcan0`id`',
                'vcan0$(id)',
                'vcan0\nwhoami',
                'vcan 0',
                'vcan-0',
                '',
                null,
                undefined,
                123,
                {}
            ];

            for (const input of maliciousInputs) {
                expect(() => vcanconfig.initializeVirtualCAN(input)).toThrow('Invalid device name');
            }

            expect(childProcess.execSync).not.toHaveBeenCalled();
        });
    });
});
