const childProcess = require('child_process');
const { initializeVirtualCAN } = require('../modules/vcanconfig');

jest.mock('child_process', () => ({
    execSync: jest.fn()
}));

describe('vcanconfig - initializeVirtualCAN', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        childProcess.execSync.mockReturnValue(Buffer.from('ok'));
    });

    test('should accept valid alphanumeric device name and call execSync', () => {
        expect(() => initializeVirtualCAN('vcan0')).not.toThrow();
        expect(childProcess.execSync).toHaveBeenCalledWith('sudo ip link del vcan0');
    });

    test('should reject invalid device name with special characters / command injection', () => {
        const invalidDevices = [
            'vcan0; id;',
            'vcan0 && whoami',
            'vcan0 | ls',
            'vcan0`id`',
            '$(id)',
            'vcan-0',
            'vcan_0',
            '',
            ' ',
            'vcan 0'
        ];

        invalidDevices.forEach((device) => {
            expect(() => initializeVirtualCAN(device)).toThrow('Invalid device name. Device must be alphanumeric.');
        });
        expect(childProcess.execSync).not.toHaveBeenCalled();
    });

    test('should reject non-string device inputs', () => {
        const invalidInputs = [null, undefined, 123, {}, []];

        invalidInputs.forEach((input) => {
            expect(() => initializeVirtualCAN(input)).toThrow('Invalid device name. Device must be alphanumeric.');
        });
        expect(childProcess.execSync).not.toHaveBeenCalled();
    });
});
