import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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

test('renders prompt buttons and send button with accessible aria-labels', () => {
  render(<Playground />);

  const sendButton = screen.getByLabelText('Send message');
  expect(sendButton).toBeInTheDocument();

  const promptButton1 = screen.getByLabelText('Find description of the WheelBasedVehicleSpeed signal');
  expect(promptButton1).toBeInTheDocument();

  const promptButton2 = screen.getByLabelText('Find LSB, scale and offset of the WheelBasedVehicleSpeed signal');
  expect(promptButton2).toBeInTheDocument();
});
