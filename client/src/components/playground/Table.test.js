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

  test('renders Table and confirms accessibility attributes for calculator inputs', () => {
    render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    // Context menu is initially hidden
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Calculator inputs have aria-labels
    expect(screen.getByLabelText('Least Significant Bit')).toBeInTheDocument();
    expect(screen.getByLabelText('Scale')).toBeInTheDocument();
    expect(screen.getByLabelText('Offset')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected Value')).toBeInTheDocument();
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
