import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders default language decks', () => {
  render(<App />);
  expect(screen.getAllByText(/Hiszpanski A1-A2/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Angielski B2/i)).toBeInTheDocument();
});

test('switches to learn mode', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
  expect(screen.getByText(/Translate/i)).toBeInTheDocument();
  expect(screen.getByText(/Type answer/i)).toBeInTheDocument();
});

test('switches to test mode', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Test' }));
  expect(screen.getByText(/Test question/i)).toBeInTheDocument();
  expect(screen.getByText(/Written test/i)).toBeInTheDocument();
});
