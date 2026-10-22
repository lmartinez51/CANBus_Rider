import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CANTable from './Table';
import ContextValues from './Helpers/SignalContext';

// Mock GlobalFilter (named export)
jest.mock('./Helpers/GlobalFilter', () => ({
  GlobalFilter: () => <div data-testid="global-filter" />,
}));

// Mock worker-loader as constructor function
jest.mock(
  'worker-loader!./Helpers/FileProcessingWorker',
  () => {
    return function Worker() {
      this.postMessage = jest.fn();
      this.addEventListener = jest.fn();
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
