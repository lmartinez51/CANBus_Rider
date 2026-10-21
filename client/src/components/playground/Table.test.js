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

// Mock worker-loader as constructor function
jest.mock(
  'worker-loader!./Helpers/FileProcessingWorker',
  () => {
    return function Worker() {
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

  test('displays context menu with ARIA roles and provides visual feedback on copy', async () => {
    const { container } = render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    // Simulate worker sending row data
    act(() => {
      if (workerListener) {
        workerListener({
          data: [
            {
              time: '1000',
              can: 'can0',
              id: '18F005FE',
              dt1: '01',
              dt2: '02',
              dt3: '03',
              dt4: '04',
              dt5: '05',
              dt6: '06',
              dt7: '07',
              dt8: '08',
              ecu: 'Engine',
              values: '{Speed: 100 km/h}',
            },
          ],
        });
      }
    });

    const row = container.querySelector('.rawrow');
    expect(row).toBeInTheDocument();

    // Trigger context menu on row
    fireEvent.contextMenu(row);

    const menu = screen.getByRole('menu', { name: 'Row options' });
    expect(menu).toBeInTheDocument();

    const menuItem = screen.getByRole('menuitem', { name: 'Copy Row' });
    expect(menuItem).toBeInTheDocument();

    // Click copy row
    await act(async () => {
      fireEvent.click(menuItem);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '1000 can0 18F005FE#0102030405060708Engine{Speed: 100 km/h}'
    );
    expect(screen.getByRole('menuitem', { name: '✓ Copied!' })).toBeInTheDocument();

    // Fast-forward timer for context menu close
    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
