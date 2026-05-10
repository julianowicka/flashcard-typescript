import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders default language decks', () => {
  render(<App />);
  expect(screen.getAllByText(/Hiszpanski A1-A2/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Angielski B2/i)).toBeInTheDocument();
});
