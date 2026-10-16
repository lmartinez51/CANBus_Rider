import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectVirtualCAN from './SelectVirtualCANBus';

describe('SelectVirtualCAN Component', () => {
  test('renders select component and updates selected virtual CAN bus value correctly', () => {
    render(
      <MemoryRouter>
        <SelectVirtualCAN />
      </MemoryRouter>
    );

    const selectElement = screen.getByLabelText('Select Virtual CAN Bus (Testing Purposes Only)');
    expect(selectElement).toHaveValue('vcan0');

    fireEvent.change(selectElement, { target: { value: 'vcan1' } });
    expect(selectElement).toHaveValue('vcan1');
  });

  test('renders cancel link and confirm button cleanly without nested interactive elements', () => {
    render(
      <MemoryRouter>
        <SelectVirtualCAN />
      </MemoryRouter>
    );

    const cancelLink = screen.getByRole('link', { name: /cancel/i });
    expect(cancelLink).toBeInTheDocument();
    expect(cancelLink).toHaveAttribute('href', '/');

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeInTheDocument();
  });
});
