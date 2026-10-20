import { isValidLine, handleFilterLogFiles, validHex, maxLines } from './LogFileFilter';

describe('LogFileFilter constants', () => {
    test('exports expected validHex array and maxLines threshold', () => {
        expect(validHex).toEqual(['18F005FE', '18FEF2FE', 'CF004FE', '18FEF1FE', '18FCDCFE']);
        expect(maxLines).toBe(2000);
    });
});

describe('isValidLine', () => {
    const validHexList = ['18F005FE', '18FEF2FE', 'CF004FE', '18FEF1FE', '18FCDCFE'];

    validHexList.forEach((hex) => {
        test(`returns true for valid log line containing hex ID ${hex}`, () => {
            const line = `(1623456789.123456) can0 ${hex}#1122334455667788`;
            expect(isValidLine(line)).toBe(true);
        });
    });

    test('returns true for virtual CAN interfaces like vcan0', () => {
        const line = '(1623456789.123456) vcan0 18F005FE#1122334455667788';
        expect(isValidLine(line)).toBe(true);
    });

    test('returns false when regex matches but hex value is not in validHex', () => {
        const line = '(1623456789.123456) can0 18F000FE#1122334455667788';
        expect(isValidLine(line)).toBe(false);
    });

    test('returns false for invalid line formats failing regex match', () => {
        // Malformed timestamp
        expect(isValidLine('(12345.123) can0 18F005FE#1122334455667788')).toBe(false);

        // Interface missing 'can'
        expect(isValidLine('(1623456789.123456) eth0 18F005FE#1122334455667788')).toBe(false);

        // Payload missing '#' or wrong length
        expect(isValidLine('(1623456789.123456) can0 18F005FE1122334455667788')).toBe(false);
        expect(isValidLine('(1623456789.123456) can0 18F005FE#1234')).toBe(false);
    });

    test('returns false for invalid inputs and non-string types', () => {
        expect(isValidLine('')).toBe(false);
        expect(isValidLine(null)).toBe(false);
        expect(isValidLine(undefined)).toBe(false);
        expect(isValidLine(12345)).toBe(false);
        expect(isValidLine({})).toBe(false);
    });
});

describe('handleFilterLogFiles', () => {
    let originalShowOpenFilePicker;
    let originalShowSaveFilePicker;
    let originalConsoleError;

    beforeEach(() => {
        originalShowOpenFilePicker = window.showOpenFilePicker;
        originalShowSaveFilePicker = window.showSaveFilePicker;
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        window.showOpenFilePicker = originalShowOpenFilePicker;
        window.showSaveFilePicker = originalShowSaveFilePicker;
        console.error = originalConsoleError;
        jest.restoreAllMocks();
    });

    const createMockWritableStream = () => {
        const writeMock = jest.fn().mockResolvedValue(undefined);
        const closeMock = jest.fn().mockResolvedValue(undefined);
        return {
            writableStream: {
                write: writeMock,
                close: closeMock,
            },
            writeMock,
            closeMock,
        };
    };

    test('successfully processes and saves valid lines under maxLines threshold', async () => {
        const line1 = '(1623456789.123456) can0 18F005FE#1122334455667788';
        const line2 = 'invalid line';
        const line3 = '(1623456789.123456) can0 18FEF2FE#1122334455667788';
        const fileContent = `${line1}\n${line2}\n${line3}`;

        const mockFile = {
            text: jest.fn().mockResolvedValue(fileContent),
        };
        const mockFileHandle = {
            getFile: jest.fn().mockResolvedValue(mockFile),
        };

        window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);

        const { writableStream, writeMock, closeMock } = createMockWritableStream();
        const mockSaveFileHandle = {
            createWritable: jest.fn().mockResolvedValue(writableStream),
        };

        window.showSaveFilePicker = jest.fn().mockResolvedValue(mockSaveFileHandle);

        await handleFilterLogFiles();

        expect(window.showOpenFilePicker).toHaveBeenCalledWith({
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
        });

        expect(window.showSaveFilePicker).toHaveBeenCalledWith({ suggestedName: 'logfile1.txt' });
        expect(writeMock).toHaveBeenCalledWith(`${line1}\n${line3}`);
        expect(closeMock).toHaveBeenCalled();
    });

    test('splits output into multiple files when valid lines reach maxLines', async () => {
        const validLine = '(1623456789.123456) can0 18F005FE#1122334455667788';
        // Create 2001 valid lines
        const linesCount = 2001;
        const fileContent = Array(linesCount).fill(validLine).join('\n');

        const mockFile = {
            text: jest.fn().mockResolvedValue(fileContent),
        };
        const mockFileHandle = {
            getFile: jest.fn().mockResolvedValue(mockFile),
        };

        window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);

        const stream1 = createMockWritableStream();
        const stream2 = createMockWritableStream();

        const mockSaveFileHandle1 = { createWritable: jest.fn().mockResolvedValue(stream1.writableStream) };
        const mockSaveFileHandle2 = { createWritable: jest.fn().mockResolvedValue(stream2.writableStream) };

        window.showSaveFilePicker = jest
            .fn()
            .mockResolvedValueOnce(mockSaveFileHandle1)
            .mockResolvedValueOnce(mockSaveFileHandle2);

        await handleFilterLogFiles();

        expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2);
        expect(window.showSaveFilePicker).toHaveBeenNthCalledWith(1, { suggestedName: 'logfile1.txt' });
        expect(window.showSaveFilePicker).toHaveBeenNthCalledWith(2, { suggestedName: 'logfile2.txt' });

        expect(stream1.writeMock).toHaveBeenCalledWith(Array(2000).fill(validLine).join('\n'));
        expect(stream1.closeMock).toHaveBeenCalled();

        expect(stream2.writeMock).toHaveBeenCalledWith(validLine);
        expect(stream2.closeMock).toHaveBeenCalled();
    });

    test('does not save files when no valid lines are found', async () => {
        const fileContent = 'invalid line 1\ninvalid line 2';

        const mockFile = { text: jest.fn().mockResolvedValue(fileContent) };
        const mockFileHandle = { getFile: jest.fn().mockResolvedValue(mockFile) };

        window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);
        window.showSaveFilePicker = jest.fn();

        await handleFilterLogFiles();

        expect(window.showSaveFilePicker).not.toHaveBeenCalled();
    });

    test('logs error to console when showOpenFilePicker throws an error', async () => {
        const error = new Error('User cancelled file picker');
        window.showOpenFilePicker = jest.fn().mockRejectedValue(error);

        await handleFilterLogFiles();

        expect(console.error).toHaveBeenCalledWith('Error reading file:', error);
    });

    test('logs error to console when file reading fails', async () => {
        const error = new Error('Failed to read file contents');
        const mockFileHandle = {
            getFile: jest.fn().mockRejectedValue(error),
        };
        window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);

        await handleFilterLogFiles();

        expect(console.error).toHaveBeenCalledWith('Error reading file:', error);
    });

    test('logs error to console when showSaveFilePicker throws an error', async () => {
        const validLine = '(1623456789.123456) can0 18F005FE#1122334455667788';
        const mockFile = { text: jest.fn().mockResolvedValue(validLine) };
        const mockFileHandle = { getFile: jest.fn().mockResolvedValue(mockFile) };

        window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);

        const saveError = new Error('Save cancelled');
        window.showSaveFilePicker = jest.fn().mockRejectedValue(saveError);

        await handleFilterLogFiles();

        expect(console.error).toHaveBeenCalledWith('Error reading file:', saveError);
    });
});
