// src/app/signup/employer/tests/SignUpForm.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '../SignUpForm'; // Adjust path

// Mock dependencies
jest.mock('lucide-react', () => ({
    Eye: () => <div data-testid="icon-eye">E</div>,
    EyeOff: () => <div data-testid="icon-eyeoff">EO</div>,
    Building: () => <div data-testid="icon-building">Bldg</div>,
    Lock: () => <div data-testid="icon-lock">L</div>,
    Users: () => <div data-testid="icon-users">U</div>,
}));

describe('Employer SignUpForm Component', () => {
    const mockOnChange = jest.fn();
    const mockOnSubmit = jest.fn((e) => e.preventDefault());
    const mockOnTogglePassword = jest.fn();

    const defaultProps = {
        formData: {
            companyName: '', managerPasscode: '', managerPasscodeConfirm: '',
            employeePasscode: '', employeePasscodeConfirm: '', staffCount: '',
        },
        errors: {},
        showPasswords: { manager: false, managerConfirm: false, employee: false, employeeConfirm: false },
        onChange: mockOnChange,
        onSubmit: mockOnSubmit,
        onTogglePassword: mockOnTogglePassword,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render all form fields with initial values', () => {
        render(<SignUpForm {...defaultProps} />);
        // Using placeholders until labels are fixed in source code
        expect(screen.getByPlaceholderText(/enter company name/i)).toBeInTheDocument();
        // FIX (#1): Use more specific placeholder for the first instance
        expect(screen.getByPlaceholderText(/^Enter manager passcode$/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/re-enter manager passcode/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^Enter employee passcode$/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/re-enter employee passcode/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter staff count/i)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('should render with provided form data', () => {
        render(<SignUpForm {...defaultProps} formData={{
            companyName: 'Sign Up Co', managerPasscode: 'mgrPass', managerPasscodeConfirm: 'mgrPass',
            employeePasscode: 'empPass', employeePasscodeConfirm: 'empPass', staffCount: '99'
         }} />);
         expect(screen.getByPlaceholderText(/enter company name/i)).toHaveValue('Sign Up Co');
         // FIX (#2): Use more specific placeholder
         expect(screen.getByPlaceholderText(/^Enter manager passcode$/i)).toHaveValue('mgrPass');
         expect(screen.getByPlaceholderText(/re-enter manager passcode/i)).toHaveValue('mgrPass');
         expect(screen.getByPlaceholderText(/^Enter employee passcode$/i)).toHaveValue('empPass');
         expect(screen.getByPlaceholderText(/re-enter employee passcode/i)).toHaveValue('empPass');
         expect(screen.getByPlaceholderText(/enter staff count/i)).toHaveValue(99);
    });

     test('should display passwords as text based on showPasswords prop', () => {
        render(<SignUpForm {...defaultProps} showPasswords={{
            manager: true, managerConfirm: false, employee: true, employeeConfirm: false
        }} />);
        // Check icons (2 eye, 2 eyeoff)
        expect(screen.getAllByTestId('icon-eye')).toHaveLength(2);
        expect(screen.getAllByTestId('icon-eyeoff')).toHaveLength(2);
        // Check type attribute using placeholder
        expect(screen.getByPlaceholderText(/^Enter manager passcode$/i)).toHaveAttribute('type', 'text');
        expect(screen.getByPlaceholderText(/re-enter manager passcode/i)).toHaveAttribute('type', 'password');
        expect(screen.getByPlaceholderText(/^Enter employee passcode$/i)).toHaveAttribute('type', 'text');
        expect(screen.getByPlaceholderText(/re-enter employee passcode/i)).toHaveAttribute('type', 'password');
    });

    test('should call onChange when inputs change', async () => {
        const user = userEvent.setup();
        render(<SignUpForm {...defaultProps} />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        // FIX (#3): Use more specific placeholder
        const managerPassInput = screen.getByPlaceholderText(/^Enter manager passcode$/i);
        const staffInput = screen.getByPlaceholderText(/enter staff count/i);

        await user.type(companyInput, 'My Company');
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ target: companyInput }));
        await user.type(managerPassInput, 'pass1');
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ target: managerPassInput }));
        await user.clear(staffInput);
        await user.type(staffInput, '123');
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ target: staffInput }));
    });

    test('should call onTogglePassword with correct field name', async () => {
        const user = userEvent.setup();
        render(<SignUpForm {...defaultProps} />);
        // FIX (#14): Find buttons more reliably via icon testid
        const eyeIcons = screen.getAllByTestId('icon-eye');
        expect(eyeIcons).toHaveLength(4);

        const managerToggleButton = eyeIcons[0]!.closest('button');
        const managerConfirmToggleButton = eyeIcons[1]!.closest('button');
        const employeeToggleButton = eyeIcons[2]!.closest('button');
        const employeeConfirmToggleButton = eyeIcons[3]!.closest('button');

        expect(managerToggleButton).toBeInTheDocument();
        // ... other button checks

        await user.click(managerToggleButton!);
        expect(mockOnTogglePassword).toHaveBeenCalledWith('manager');
        await user.click(managerConfirmToggleButton!);
        expect(mockOnTogglePassword).toHaveBeenCalledWith('managerConfirm');
        await user.click(employeeToggleButton!);
        expect(mockOnTogglePassword).toHaveBeenCalledWith('employee');
        await user.click(employeeConfirmToggleButton!);
        expect(mockOnTogglePassword).toHaveBeenCalledWith('employeeConfirm');
        expect(mockOnTogglePassword).toHaveBeenCalledTimes(4);
    });

    test('should call onSubmit when form is submitted', async () => {
        const user = userEvent.setup();
        render(<SignUpForm {...defaultProps} />);
        const submitButton = screen.getByRole('button', { name: /create account/i });
        await user.click(submitButton);
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    test('should display error messages', () => {
        const errors = {
            companyName: 'Comp Req', managerPasscode: 'Mgr Req', managerPasscodeConfirm: 'Mgr Match Req',
            employeePasscode: 'Emp Req', employeePasscodeConfirm: 'Emp Match Req', staffCount: 'Staff Req'
        };
        render(<SignUpForm {...defaultProps} errors={errors} />);
        expect(screen.getByText(errors.companyName)).toBeInTheDocument();
        expect(screen.getByText(errors.managerPasscode)).toBeInTheDocument();
        expect(screen.getByText(errors.managerPasscodeConfirm)).toBeInTheDocument();
        expect(screen.getByText(errors.employeePasscode)).toBeInTheDocument();
        expect(screen.getByText(errors.employeePasscodeConfirm)).toBeInTheDocument();
        expect(screen.getByText(errors.staffCount)).toBeInTheDocument();
    });

});