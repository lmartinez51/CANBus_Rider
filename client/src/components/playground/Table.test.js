import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CANTable from './Table';
import ContextValues from './Helpers/SignalContext';

// Mock GlobalFilter (named export)
jest.mock('./Helpers/GlobalFilter', () => ({
  GlobalFilter: () => <div data-testid="global-filter" />,
}));

let workerListener = null;
let workerInstance = null;

// Mock worker-loader as constructor function
jest.mock(
  'worker-loader!./Helpers/FileProcessingWorker',
  () => {
    return function Worker() {
      workerInstance = this;
      this.listeners = {};
      this.postMessage = jest.fn();
      this.addEventListener = jest.fn((event, cb) => {
        if (event === 'message') {
          workerListener = cb;
        }
      });
      this.removeEventListener = jest.fn();
      this.terminate = jest.fn();
    };
  },
  { virtual: true }
);

describe('CANTable Context Menu UX & Accessibility', () => {
  beforeEach(() => {
    workerListener = null;
    jest.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders Table and confirms accessibility attributes for calculator inputs and buttons', () => {
    render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    // Context menu is initially hidden
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Calculator inputs and buttons have aria-labels
    expect(screen.getByLabelText('Least Significant Bit')).toBeInTheDocument();
    expect(screen.getByLabelText('Scale')).toBeInTheDocument();
    expect(screen.getByLabelText('Offset')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected Value')).toBeInTheDocument();
    expect(screen.getByLabelText('Calculate bitwise value')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear calculator fields')).toBeInTheDocument();
  });

  test('context menu provides menu role, menuitem role, and copied feedback', async () => {
    const { container } = render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    // Context menu container starts hidden
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Find raw data table element to trigger right click
    const rawTable = container.querySelector('.rawDataTable');
    expect(rawTable).toBeInTheDocument();

    // Trigger right click to show context menu
    fireEvent.contextMenu(rawTable, { clientX: 100, clientY: 100 });

    // Menu and menuitem should now be accessible
    const menu = screen.getByRole('menu', { name: 'Table row actions' });
    expect(menu).toBeInTheDocument();

    const menuItem = screen.getByRole('menuitem', { name: 'Copy Row' });
    expect(menuItem).toBeInTheDocument();

    // Click copy row menuItem
    fireEvent.click(menuItem);

    // Should show visual status feedback after promise resolves
    const copiedMenuItem = await screen.findByRole('menuitem', { name: '✓ Copied!' });
    expect(copiedMenuItem).toBeInTheDocument();
  });

  test('decoded signals are accessible and selectable via mouse click and keyboard (Enter/Space)', async () => {
    const setSignalMock = jest.fn();
    render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: setSignalMock }}>
        <CANTable />
      </ContextValues.Provider>
    );

    // Simulate worker sending a parsed CAN packet with signals
    act(() => {
      if (workerListener) {
        workerListener({
          data: [
            {
              time: '0.001',
              can: 'vcan0',
              id: '18FEF1FE',
              dt1: '00',
              dt2: '00',
              dt3: '00',
              dt4: '00',
              dt5: '00',
              dt6: '00',
              dt7: '00',
              dt8: '00',
              ecu: 'CruiseControl',
              values: '{WheelBasedVehicleSpeed: 55 km/h, BrakeSwitch: 0 state}',
            },
          ],
        });
      }
    });

    // Click on the raw table row to decode the message
    const rawRow = screen.getByText('18FEF1FE').closest('tr');
    fireEvent.click(rawRow);

    // Now decoded signals should appear as accessible buttons
    const speedSignal = screen.getByRole('button', { name: 'Select signal WheelBasedVehicleSpeed' });
    const brakeSignal = screen.getByRole('button', { name: 'Select signal BrakeSwitch' });

    expect(speedSignal).toBeInTheDocument();
    expect(speedSignal).toHaveAttribute('tabIndex', '0');
    expect(brakeSignal).toBeInTheDocument();

    // Mouse click selects signal
    fireEvent.click(speedSignal);
    expect(setSignalMock).toHaveBeenCalledWith('WheelBasedVehicleSpeed');

    // Keyboard 'Enter' selects signal
    fireEvent.keyDown(brakeSignal, { key: 'Enter', code: 'Enter' });
    expect(setSignalMock).toHaveBeenCalledWith('BrakeSwitch');

    // Keyboard 'Space' selects signal
    fireEvent.keyDown(speedSignal, { key: ' ', code: 'Space' });
    expect(setSignalMock).toHaveBeenCalledTimes(3);
  });
});

describe('CANTable Live Traffic UX & Accessibility', () => {
  let mockClose;
  let mockEventSource;

  beforeEach(() => {
    mockClose = jest.fn();
    mockEventSource = jest.fn(() => ({
      close: mockClose,
      onmessage: null,
      onerror: null,
    }));
    global.EventSource = mockEventSource;
  });

  afterEach(() => {
    delete global.EventSource;
  });

  test('toggles Live Traffic running status, disabled states, and aria-live feedback', () => {
    render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    // Initial state: Dropdown title is 'Live Traffic', live traffic stopped
    const dropdownToggle = screen.getByRole('button', { name: /Live Traffic/i });
    expect(dropdownToggle).toHaveTextContent('Live Traffic');

    const statusLiveRegion = screen.getByRole('status');
    expect(statusLiveRegion).toHaveTextContent('Live CAN traffic is stopped');

    // Open dropdown
    fireEvent.click(dropdownToggle);

    const startItem = screen.getByRole('button', { name: /^Start$/i });
    const stopItem = screen.getByRole('button', { name: /^Stop$/i });

    expect(startItem).not.toHaveClass('disabled');
    expect(stopItem).toHaveClass('disabled');

    // Click Start
    fireEvent.click(startItem);

    // Now streaming: title updates, Start is disabled, Stop is enabled
    expect(mockEventSource).toHaveBeenCalledWith('http://localhost:8080/play');
    expect(dropdownToggle).toHaveTextContent('Live Traffic (Running)');
    expect(statusLiveRegion).toHaveTextContent('Live CAN traffic is streaming');
    expect(startItem).toHaveClass('disabled');
    expect(stopItem).not.toHaveClass('disabled');

    // Click Stop
    fireEvent.click(stopItem);

    // Now stopped: close() is called, title reverts, status updates
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(dropdownToggle).toHaveTextContent('Live Traffic');
    expect(statusLiveRegion).toHaveTextContent('Live CAN traffic is stopped');
    expect(startItem).not.toHaveClass('disabled');
    expect(stopItem).toHaveClass('disabled');
  });
});
