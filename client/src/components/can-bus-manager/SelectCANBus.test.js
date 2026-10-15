import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectCAN from './SelectCANBus';

describe('SelectCAN Component', () => {
  test('renders select component and updates selected CAN bus value correctly', () => {
    render(
      <MemoryRouter>
        <SelectCAN />
      </MemoryRouter>
    );

    const selectElement = screen.getByLabelText('Select CAN Bus');
    expect(selectElement).toHaveValue('can0');

    fireEvent.change(selectElement, { target: { value: 'can1' } });
    expect(selectElement).toHaveValue('can1');
  });

  test('renders unique radio options and updates baud rate', () => {
    render(
      <MemoryRouter>
        <SelectCAN />
      </MemoryRouter>
    );

    const radio125 = screen.getByLabelText('125 kbps');
    const radio1M = screen.getByLabelText('1 Mbps');

    expect(radio125).toBeChecked();
    expect(radio1M).not.toBeChecked();

    fireEvent.click(radio1M);
    expect(radio1M).toBeChecked();
    expect(radio125).not.toBeChecked();
  });
});
