import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SelectCAN from './SelectCANBus';

jest.mock('axios');

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

  test('displays loading state and status message on submission', async () => {
    axios.get.mockResolvedValueOnce({ data: { message: 'Success' } });

    render(
      <MemoryRouter>
        <SelectCAN />
      </MemoryRouter>
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('CAN Bus configured successfully!');
    });
  });
});
