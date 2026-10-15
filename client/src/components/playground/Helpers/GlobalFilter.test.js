import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GlobalFilter } from './GlobalFilter';

jest.mock('react-table', () => ({
  ...jest.requireActual('react-table'),
  useAsyncDebounce: (fn) => fn,
}));

test('renders search input with aria-label', () => {
  render(<GlobalFilter globalFilter="" setGlobalFilter={() => {}} />);
  const searchInput = screen.getByLabelText('Search messages');
  expect(searchInput).toBeInTheDocument();
});
