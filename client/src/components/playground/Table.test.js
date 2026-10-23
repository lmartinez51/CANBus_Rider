import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CANTable from './Table';
import ContextValues from './Helpers/SignalContext';

// Mock GlobalFilter (named export)
jest.mock('./Helpers/GlobalFilter', () => ({
  GlobalFilter: () => <div data-testid="global-filter" />,
}));

let workerInstance;
// Mock worker-loader as constructor function
jest.mock(
  'worker-loader!./Helpers/FileProcessingWorker',
  () => {
    return function Worker() {
      workerInstance = this;
      this.listeners = {};
      this.postMessage = jest.fn();
      this.addEventListener = jest.fn((event, callback) => {
        this.listeners[event] = callback;
      });
      this.removeEventListener = jest.fn();
      this.terminate = jest.fn();
    };
  },
  { virtual: true }
);

describe('CANTable Context Menu UX & Accessibility', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  test('renders context menu with proper ARIA roles and provides visual copy feedback', async () => {
    render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    act(() => {
      workerInstance.listeners['message']({
        data: [
          {
            time: '(1000.000)',
            can: 'can0',
            id: '123',
            dt1: '01',
            dt2: '02',
            dt3: '03',
            dt4: '04',
            dt5: '05',
            dt6: '06',
            dt7: '07',
            dt8: '08',
            ecu: 'Engine',
            values: '{Speed: 50 km/h}',
          },
        ],
      });
    });

    const row = screen.getByText('(1000.000)').closest('tr');
    fireEvent.contextMenu(row);

    const menu = screen.getByRole('menu', { name: 'Table row actions' });
    expect(menu).toBeInTheDocument();

    const menuItem = screen.getByRole('menuitem', { name: 'Copy Row' });
    expect(menuItem).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(menuItem);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('(1000.000) can0 123#0102030405060708Engine{Speed: 50 km/h}');
    expect(screen.getByRole('menuitem')).toHaveTextContent('✓ Copied!');
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
});
