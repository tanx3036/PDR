// src/app/signup/employee/tests/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Import the hooks directly
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import EmployeeSignIn from '../page'; // Adjust path if needed

// --- Mock dependencies ---
// Mock hooks first using factory functions
jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(),
    useUser: jest.fn(),
}));
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
// Mock icons
jest.mock('lucide-react', () => ({
    Brain: () => <div data-testid="icon-brain">B</div>,
    Building: () => <div data-testid="icon-building">Bldg</div>,
    Lock: () => <div data-testid="icon-lock">L</div>,
    Eye: () => <div data-testid="icon-eye">E</div>,
    EyeOff: () => <div data-testid="icon-eyeoff">EO</div>,
}));
// --- End Mocks ---

describe('EmployeeSignIn Page', () => {
    // Use Jest's utility types for mocked functions
    let mockUseAuth: jest.MockedFunction<typeof useAuth>;
    let mockUseUser: jest.MockedFunction<typeof useUser>;
    let mockUseRouter: jest.MockedFunction<typeof useRouter>;
    let mockPush: jest.Mock;
    let fetchMock: jest.Mock;

    const mockUserData = {
        isLoaded: true, isSignedIn: true,
        user: { id: 'test-employee-id', fullName: 'Emp Loyee', emailAddresses: [{ emailAddress: 'emp@test.com', id: 'em3' }] }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockPush = jest.fn();
        fetchMock = jest.fn();
        global.fetch = fetchMock;

        // --- Assign mocked functions from the mocked modules ---
        mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
        mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
        mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

        // --- Configure the mocks AFTER assignment ---
        // Default successful state
        mockUseAuth.mockReturnValue({ userId: 'test-employee-id', isLoaded: true } as any);
        mockUseUser.mockReturnValue(mockUserData as any);
        mockUseRouter.mockReturnValue({ push: mockPush } as any);
        fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });
    });

    // Test initial rendering
    test('should render form elements', () => {
        render(<EmployeeSignIn />);
        expect(screen.getByTestId('icon-brain')).toBeInTheDocument(); // Navbar logo
        expect(screen.getByRole('heading', { name: /employee sign in/i })).toBeInTheDocument();
        // Use placeholder text as labels might not be associated correctly in source yet
        expect(screen.getByPlaceholderText(/enter company name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter employee passcode/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByTestId('icon-eye')).toBeInTheDocument(); // Password toggle icon
    });

    // Test input changes
     test('should update form data on input', async () => {
        const user = userEvent.setup();
        render(<EmployeeSignIn />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        const passcodeInout = screen.getByPlaceholderText(/enter employee passcode/i);

        await user.type(companyInput, 'Test Co');
        expect(companyInput).toHaveValue('Test Co');
        await user.type(passcodeInout, 'pass123');
        expect(passcodeInout).toHaveValue('pass123');
     });

     // Test password toggle
      test('should toggle password visibility', async () => {
        const user = userEvent.setup();
        render(<EmployeeSignIn />);
        const passcodeInout = screen.getByPlaceholderText(/enter employee passcode/i);
        // Find button by the icon inside it
        const eyeButton = screen.getByTestId('icon-eye').closest('button');
        expect(eyeButton).toBeInTheDocument();

        // Initially password, eye icon shown
        expect(passcodeInout).toHaveAttribute('type', 'password');
        expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
        expect(screen.queryByTestId('icon-eyeoff')).not.toBeInTheDocument();

        // Click to show
        await user.click(eyeButton!);
        expect(passcodeInout).toHaveAttribute('type', 'text');
        expect(screen.queryByTestId('icon-eye')).not.toBeInTheDocument();
        expect(screen.getByTestId('icon-eyeoff')).toBeInTheDocument();

        // Find button again (now using eyeoff icon)
        const eyeOffButton = screen.getByTestId('icon-eyeoff').closest('button');
        expect(eyeOffButton).toBeInTheDocument();

        // Click to hide again
        await user.click(eyeOffButton!);
        expect(passcodeInout).toHaveAttribute('type', 'password');
        expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
        expect(screen.queryByTestId('icon-eyeoff')).not.toBeInTheDocument();
    });

    // Test validation
    test('should validate form and show errors on submit', async () => {
        const user = userEvent.setup();
        render(<EmployeeSignIn />);
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        await user.click(submitButton);

        // Use findByText for async error messages
        expect(await screen.findByText('Company name is required')).toBeInTheDocument();
        expect(screen.getByText('Employee passcode is required')).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // Test error clearing
    test('should clear errors on input change after validation fail', async () => {
        const user = userEvent.setup();
        render(<EmployeeSignIn />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // Submit to show error
        await user.click(submitButton);
        expect(await screen.findByText('Company name is required')).toBeInTheDocument();

        // Type to clear error
        await user.type(companyInput, 'C');
        // Error message should disappear
        expect(screen.queryByText('Company name is required')).not.toBeInTheDocument();
    });

    // Test successful submission
    test('should call API and redirect on successful submit', async () => {
        const user = userEvent.setup();
        render(<EmployeeSignIn />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        const passcodeInout = screen.getByPlaceholderText(/enter employee passcode/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        const company = 'Valid Company';
        const passcode = 'validPass';

        await user.type(companyInput, company);
        await user.type(passcodeInout, passcode);
        await user.click(submitButton);

        // Wait for fetch to be called
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/api/signup/employee', expect.objectContaining({
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: mockUserData.user.id,
                    name: mockUserData.user.fullName,
                    email: mockUserData.user.emailAddresses[0]?.emailAddress,
                    companyName: company,
                    employeePasskey: passcode,
                })
            }));
        });
        // Check redirect AFTER API call is confirmed
        expect(mockPush).toHaveBeenCalledWith('/employee/documents');
    });

    // Test API error (e.g., 400 Bad Request)
     test('should show API error message on 400 response', async () => {
        const user = userEvent.setup();
        const apiErrorMsg = 'Invalid passcode for company';
        // Mock fetch to return 400 error
        fetchMock.mockResolvedValueOnce({
            ok: false, status: 400, json: async () => ({ error: apiErrorMsg })
        } as Response);

        render(<EmployeeSignIn />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        const passcodeInout = screen.getByPlaceholderText(/enter employee passcode/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(companyInput, 'Test Co');
        await user.type(passcodeInout, 'wrongPass');
        await user.click(submitButton);

        // Check error message is displayed (component adds it below passcode)
        expect(await screen.findByText(apiErrorMsg)).toBeInTheDocument();
        // Check no redirect occurred
        expect(mockPush).not.toHaveBeenCalled();
    });

    // Test other API errors (e.g., 500 Server Error)
     test('should handle other API errors gracefully (e.g., 500)', async () => {
        const user = userEvent.setup();
        // Mock fetch to return 500 error
        fetchMock.mockResolvedValueOnce({
             ok: false, status: 500, json: async () => ({ message: 'Server Error' })
        } as Response);
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<EmployeeSignIn />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        const passcodeInout = screen.getByPlaceholderText(/enter employee passcode/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(companyInput, 'Test Co');
        await user.type(passcodeInout, 'somePass');
        await user.click(submitButton);

        // Wait for fetch to be called
        await waitFor(() => { expect(fetchMock).toHaveBeenCalledTimes(1); });
        // Check no redirect happened
        expect(mockPush).not.toHaveBeenCalled();
        // Check no specific error message (like the 400 one) is shown
        expect(screen.queryByText(/invalid passcode/i)).not.toBeInTheDocument();
        // Check if console.error was called (optional, depends on component's catch block)
        // If the component's submitSignIn catch block logs, this should pass:
        // expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    // Test case where user auth data is missing
     test('should not submit if userId or user is missing', async () => {
        const user = userEvent.setup();
        // Override hooks for this specific test
        mockUseAuth.mockReturnValue({ userId: null, isLoaded: true } as any); // No userId
        mockUseUser.mockReturnValue({ isLoaded: true, isSignedIn: false, user: null } as any); // No user data
        render(<EmployeeSignIn />);
        const companyInput = screen.getByPlaceholderText(/enter company name/i);
        const passcodeInout = screen.getByPlaceholderText(/enter employee passcode/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(companyInput, 'Company');
        await user.type(passcodeInout, 'Passcode');
        await user.click(submitButton);

        // submitSignIn should return early due to missing userId/user
        expect(fetchMock).not.toHaveBeenCalled();
    });
});