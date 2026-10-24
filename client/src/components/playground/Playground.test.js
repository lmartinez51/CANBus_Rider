import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Playground from './Playground';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
  }));
});

// Mock Canvas component to avoid HTMLCanvasElement context errors
jest.mock('./Helpers/Canvas', () => () => <div data-testid="canvas" />);

// Mock CANTable to isolate Playground rendering
jest.mock('./Table', () => () => <div data-testid="can-table" />);

test('renders prompt buttons, chat input, and send button with accessible aria-labels', () => {
  render(<Playground />);

  const chatInput = screen.getByLabelText('Message Mike');
  expect(chatInput).toBeInTheDocument();

  const sendButton = screen.getByLabelText('Send message');
  expect(sendButton).toBeInTheDocument();

  const promptButton1 = screen.getByLabelText('Find description of the WheelBasedVehicleSpeed signal');
  expect(promptButton1).toBeInTheDocument();

  const promptButton2 = screen.getByLabelText('Find LSB, scale and offset of the WheelBasedVehicleSpeed signal');
  expect(promptButton2).toBeInTheDocument();
});

test('shows accessible loading status and disables controls when fetching messages', async () => {
  let resolveFetch;
  const fetchPromise = new Promise((resolve) => {
    resolveFetch = resolve;
  });

  global.fetch = jest.fn().mockImplementation(() =>
    fetchPromise.then(() => ({
      json: () => Promise.resolve({ message: 'Hello from Mike' }),
    }))
  );

  render(<Playground />);

  const chatInput = screen.getByLabelText('Message Mike');
  const sendButton = screen.getByLabelText('Send message');

  fireEvent.change(chatInput, { target: { value: 'How does CAN bus work?' } });
  expect(sendButton).not.toBeDisabled();

  fireEvent.click(sendButton);

  // During fetch execution
  const statusElement = screen.getByRole('status');
  expect(statusElement).toBeInTheDocument();
  expect(statusElement).toHaveTextContent('Mike is thinking...');

  expect(chatInput).toBeDisabled();
  expect(sendButton).toBeDisabled();

  // Resolve fetch promise
  await act(async () => {
    resolveFetch();
  });

  // After fetch completes, status element disappears
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(chatInput).not.toBeDisabled();
});
