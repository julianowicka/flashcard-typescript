import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StudyApp from './StudyApp';

test('renders default language decks', () => {
  render(<StudyApp />);
  expect(screen.getAllByText(/Hiszpanski A1-A2/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Angielski B2/i)).toBeInTheDocument();
});

test('switches to learn mode', () => {
  render(<StudyApp />);
  fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
  expect(screen.getByText(/Translate/i)).toBeInTheDocument();
  expect(screen.getByText(/Type answer/i)).toBeInTheDocument();
});

test('switches to test mode', () => {
  render(<StudyApp />);
  fireEvent.click(screen.getByRole('button', { name: 'Test' }));
  expect(screen.getByText(/Test question/i)).toBeInTheDocument();
  expect(screen.getByText(/Written test/i)).toBeInTheDocument();
});
