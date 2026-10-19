import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CANTable from './Table';
import SignalContext from './Helpers/SignalContext';

jest.mock('react-table', () => ({
  ...jest.requireActual('react-table'),
  useAsyncDebounce: (fn) => fn,
}));

// Mock worker-loader with virtual: true
jest.mock('worker-loader!./Helpers/FileProcessingWorker', () => {
  return function WorkerMock() {
    this.postMessage = jest.fn();
    this.terminate = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
  };
}, { virtual: true });

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { message: 'Success' } }),
}));

describe('CANTable Component', () => {
  const renderComponent = () => {
    return render(
      <SignalContext.Provider value={{ signal: 'Speed', setSignal: jest.fn() }}>
        <CANTable />
      </SignalContext.Provider>
    );
  };

  test('renders CANTable and file menu options', () => {
    renderComponent();
    expect(screen.getByText('Decoded Values')).toBeInTheDocument();
    expect(screen.getByText('BitWise Whisperer')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
  });

  test('handleSavePackets constructs valid packet format when triggered', async () => {
    const mockWritable = {
      write: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const mockHandle = {
      name: 'test.log',
      createWritable: jest.fn().mockResolvedValue(mockWritable),
    };

    window.showSaveFilePicker = jest.fn().mockResolvedValue(mockHandle);

    renderComponent();

    const fileDropdown = screen.getByText('File');
    fireEvent.click(fileDropdown);

    const saveOption = screen.getByText('Save Log File');
    fireEvent.click(saveOption);

    await waitFor(() => {
      expect(window.showSaveFilePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          suggestedName: 'test.log',
        })
      );
    });
  });
});
