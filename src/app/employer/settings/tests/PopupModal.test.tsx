// src/app/employer/settings/tests/PopupModal.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PopupModal from '../PopupModal'; // Adjust path if needed

describe('PopupModal Component', () => {
  const mockOnClose = jest.fn();
  const message = "Test Popup Message";

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('should not render when visible is false', () => {
    render(<PopupModal visible={false} message={message} onClose={mockOnClose} />);
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ok/i })).not.toBeInTheDocument();
  });

  test('should render message and OK button when visible is true', () => {
    render(<PopupModal visible={true} message={message} onClose={mockOnClose} />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
  });

  test('should call onClose when OK button is clicked', async () => {
    const user = userEvent.setup();
    render(<PopupModal visible={true} message={message} onClose={mockOnClose} />);
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});