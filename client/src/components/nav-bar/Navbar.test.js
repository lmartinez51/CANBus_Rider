import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  test('renders main navigation landmark and homepage brand link', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const navElement = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(navElement).toBeInTheDocument();

    const brandLink = screen.getByLabelText('CAN Bus Rider homepage');
    expect(brandLink).toBeInTheDocument();

    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Open Project')).toBeInTheDocument();
    expect(screen.getByText('CAN Bus Manager')).toBeInTheDocument();
    expect(screen.getByText('CAN Map Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Playground')).toBeInTheDocument();
  });
});
