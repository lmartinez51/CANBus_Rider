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

    // Calculator inputs have aria-labels
    expect(screen.getByLabelText('Least Significant Bit')).toBeInTheDocument();
    expect(screen.getByLabelText('Scale')).toBeInTheDocument();
    expect(screen.getByLabelText('Offset')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected Value')).toBeInTheDocument();

    // Calculator buttons have accessible names
    expect(screen.getByRole('button', { name: 'Calculate bitwise value' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear calculator inputs' })).toBeInTheDocument();
  });

  test('announces calculation results and clearing actions via status region', () => {
    render(
      <ContextValues.Provider value={{ signal: 'test', setSignal: jest.fn() }}>
        <CANTable />
      </ContextValues.Provider>
    );

    const lsbInput = screen.getByLabelText('Least Significant Bit');
    const scaleInput = screen.getByLabelText('Scale');
    const offsetInput = screen.getByLabelText('Offset');
    const valueInput = screen.getByLabelText('Expected Value');
    const calcButton = screen.getByRole('button', { name: 'Calculate bitwise value' });
    const clearButton = screen.getByRole('button', { name: 'Clear calculator inputs' });

    fireEvent.change(lsbInput, { target: { value: '8' } });
    fireEvent.change(scaleInput, { target: { value: '1' } });
    fireEvent.change(offsetInput, { target: { value: '0' } });
    fireEvent.change(valueInput, { target: { value: '10' } });

    fireEvent.click(calcButton);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveTextContent(/Calculated Bit Position 8-15 and New Hex Value/i);

    fireEvent.click(clearButton);
    expect(statusRegion).toHaveTextContent('Calculator inputs and results cleared');
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
