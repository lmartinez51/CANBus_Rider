import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
});
