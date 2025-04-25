// src/app/employer/settings/tests/SettingsForm.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsForm from '../SettingsForm'; // Adjust path if needed

describe('SettingsForm Component', () => {
  const mockOnCompanyNameChange = jest.fn();
  const mockOnEmployerPasskeyChange = jest.fn();
  const mockOnEmployeePasskeyChange = jest.fn();
  const mockOnStaffCountChange = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    displayName: 'Test User',
    email: 'test@example.com',
    companyName: 'Test Company', // Initial value
    employerPasskey: 'emp123',
    employeePasskey: 'ee123',
    staffCount: '10',
    isSaving: false,
    onCompanyNameChange: mockOnCompanyNameChange,
    onEmployerPasskeyChange: mockOnEmployerPasskeyChange,
    onEmployeePasskeyChange: mockOnEmployeePasskeyChange,
    onStaffCountChange: mockOnStaffCountChange,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all form fields with initial values', () => {
    render(<SettingsForm {...defaultProps} />);
    expect(screen.getByLabelText(/display name/i)).toHaveValue(defaultProps.displayName);
    expect(screen.getByLabelText(/display name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toHaveValue(defaultProps.email);
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/company name/i)).toHaveValue(defaultProps.companyName);
    expect(screen.getByLabelText(/employer passkey/i)).toHaveValue(defaultProps.employerPasskey);
    expect(screen.getByLabelText(/employee passkey/i)).toHaveValue(defaultProps.employeePasskey);
    expect(screen.getByLabelText(/number of staff/i)).toHaveValue(Number(defaultProps.staffCount));
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  // FIX for #34 Applied Here
  test('should call onChange handlers when inputs change', async () => {
    const user = userEvent.setup();
    render(<SettingsForm {...defaultProps} />);

    const companyInput = screen.getByLabelText(/company name/i);
    // Clear the input first before typing new value
    await user.clear(companyInput);
    await user.type(companyInput, 'New Company');
    expect(mockOnCompanyNameChange).toHaveBeenCalled();
    // Check the final value passed
    expect(mockOnCompanyNameChange).toHaveBeenLastCalledWith('New Company');

    const employerPasskeyInput = screen.getByLabelText(/employer passkey/i);
    await user.clear(employerPasskeyInput);
    await user.type(employerPasskeyInput, 'newEmpKey');
    expect(mockOnEmployerPasskeyChange).toHaveBeenCalled();
    expect(mockOnEmployerPasskeyChange).toHaveBeenLastCalledWith('newEmpKey');

    const staffInput = screen.getByLabelText(/number of staff/i);
    await user.clear(staffInput);
    await user.type(staffInput, '25');
    expect(mockOnStaffCountChange).toHaveBeenCalled();
    expect(mockOnStaffCountChange).toHaveBeenLastCalledWith('25');
  });
  // --- End Fix ---

  test('should display "Saving..." and disable button when isSaving is true', () => {
    render(<SettingsForm {...defaultProps} isSaving={true} />);
    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test('should call onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsForm {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});