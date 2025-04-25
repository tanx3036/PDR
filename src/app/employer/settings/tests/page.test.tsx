// src/app/employer/settings/tests/page.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import SettingsPage from '../page';

// --- Mock dependencies ---
// Keep existing mocks for child components, loading, icons
jest.mock('../SettingsForm', () => ({ __esModule: true, default: jest.fn(() => <div data-testid="mock-settings-form">Settings Form</div>) }));
jest.mock('../PopupModal', () => ({
    __esModule: true,
    default: jest.fn(({ visible, message, onClose }) => visible ? (
        <div data-testid="mock-popup-modal">
            Popup Modal: {message}
            <button onClick={onClose}>OK</button>
        </div>
    ) : null)
}));
jest.mock('~/app/_components/loading', () => ({ __esModule: true, default: () => <div data-testid="mock-loading">Loading...</div> }));
jest.mock('lucide-react', () => ({
    Brain: () => <div data-testid="icon-brain">Brain</div>,
    Home: () => <div data-testid="icon-home">Home</div>,
}));

// --- Explicitly mock hook modules ---
jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(),
    useUser: jest.fn(),
}));
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
// --- End Mocks ---

// Mock API responses store
let mockApiResponses: Record<string, { status?: number, ok?: boolean, body?: any, error?: Error }>;

// Mock global fetch
global.fetch = jest.fn(async (urlInput) => {
    const url = urlInput.toString();
    const key = Object.keys(mockApiResponses).find(k => url.endsWith(k)); // Match based on suffix
    const mock = key ? mockApiResponses[key] : { status: 404, ok: false, body: { error: 'Not Found by Mock' } };

    if (mock.error) { throw mock.error; }

    // Create a Response-like object
    const response = {
         ok: mock.ok ?? (mock.status ? (mock.status >= 200 && mock.status < 300) : true), // Determine ok based on status if not provided
         status: mock.status ?? 200,
         json: async () => mock.body,
         text: async () => JSON.stringify(mock.body),
         headers: new Headers(),
         redirected: false,
         statusText: 'OK',
         type: 'basic',
         url: url,
         clone: function() { return this; },
         body: null,
         bodyUsed: false,
         arrayBuffer: async () => new ArrayBuffer(0),
         blob: async () => new Blob(),
         formData: async () => new FormData(),
     } as Response;

    return response;
});


describe('SettingsPage Component', () => {
    let mockUseAuth: jest.MockedFunction<typeof useAuth>;
    let mockUseUser: jest.MockedFunction<typeof useUser>;
    let mockUseRouter: jest.MockedFunction<typeof useRouter>;
    let mockPush: jest.Mock;
    let MockedSettingsForm: jest.Mock;
    let MockedPopupModal: jest.Mock;

    const mockCompanyData = { id: 1, name: 'ACME Corp', employerpasskey: 'abc', employeepasskey: 'def', numberOfEmployees: '50', createdAt: 'd', updatedAt: 'd' };
    const mockUserData = { isLoaded: true, isSignedIn: true, user: { id: 'test-user-settings', fullName: 'Settings User', emailAddresses: [{ emailAddress: 'settings@test.com', id: 'em2' }] } };

    beforeEach(() => {
        jest.clearAllMocks();
        mockPush = jest.fn();
        mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
        mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
        mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
        MockedSettingsForm = require('../SettingsForm').default as jest.Mock;
        MockedPopupModal = require('../PopupModal').default as jest.Mock;

        // Configure mocks AFTER assignment
        mockUseRouter.mockReturnValue({ push: mockPush } as any);
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any); // Default ok state
        mockUseUser.mockReturnValue(mockUserData as any);

        // Reset API mocks
        mockApiResponses = { // Define inside beforeEach to reset
            '/api/employerAuth': { ok: true, status: 200, body: { role: 'owner' } },
            '/api/fetchCompany': { ok: true, status: 200, body: mockCompanyData },
            '/api/updateCompany': { ok: true, status: 200, body: { success: true } },
        };
        (global.fetch as jest.Mock).mockClear();
    });

    // --- Existing Tests ---
    test('should show loading state initially', () => { /* ... */ });
    test('should redirect and show popup if no userId', async () => { /* ... */ });
    test('should handle auth check errors and redirect', async () => { /* ... */ });
    test('should handle company fetch errors and redirect', async () => { /* ... */ }); // Covers catch block
    test('should fetch data and render form with correct props on successful load', async () => { /* ... */ });
    test('handleSave should call update API and show success popup', async () => { /* ... */ });
    test('handleSave should show error popup if update API fails', async () => { /* ... */ }); // Covers catch block


    // --- NEW TESTS FOR BRANCH COVERAGE ---

    test('should redirect to pending approval if employerAuth returns status 300', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
        // Override specific API mock for this test
        mockApiResponses['/api/employerAuth'] = { ok: false, status: 300 };

        render(<SettingsPage />);

        // Wait for the redirect to be called
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/employee/pending-approval');
        });
         // Ensure fetchCompany was NOT called
         expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/api/fetchCompany'), expect.anything());
    });

    test('should show error popup and redirect if fetchCompany response is not ok', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
        // Auth check succeeds, but company fetch fails with non-ok status
        mockApiResponses['/api/fetchCompany'] = { ok: false, status: 500, body: { message: 'Server Error'} };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<SettingsPage />);

        // Wait for the error popup triggered by the catch block (because !ok throws)
        await waitFor(() => {
            expect(MockedPopupModal).toHaveBeenCalledWith(expect.objectContaining({
                visible: true,
                message: expect.stringContaining("Something went wrong"),
                redirectPath: '/' // Check redirect path is set
            }), {});
        });

        // Simulate closing popup and check redirect
        const latestPopupProps = MockedPopupModal.mock.calls.slice(-1)[0][0];
        act(() => { latestPopupProps.onClose(); });
        expect(mockPush).toHaveBeenCalledWith('/');
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching company data:", expect.any(Error));

        consoleErrorSpy.mockRestore();
    });

     test('should show error popup and redirect if fetchCompany response JSON is invalid', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
        // Auth check succeeds, company fetch returns ok but invalid JSON body
        mockApiResponses['/api/fetchCompany'] = { ok: true, status: 200, body: "not an object" as any }; // Force invalid body
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<SettingsPage />);

         // Wait for the error popup triggered by the catch block (because typeof check fails)
         await waitFor(() => {
            expect(MockedPopupModal).toHaveBeenCalledWith(expect.objectContaining({
                visible: true,
                message: expect.stringContaining("Something went wrong"),
                redirectPath: '/'
            }), {});
        });

         // Simulate closing popup and check redirect
        const latestPopupProps = MockedPopupModal.mock.calls.slice(-1)[0][0];
        act(() => { latestPopupProps.onClose(); });
        expect(mockPush).toHaveBeenCalledWith('/');
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching company data:", expect.any(Error));

        consoleErrorSpy.mockRestore();
    });

     test('handleSave should show error popup if update API returns non-ok status', async () => {
        // Setup: Render normally, wait for form
        render(<SettingsPage />);
        await waitFor(() => { expect(MockedSettingsForm).toHaveBeenCalled(); });

        // Arrange: Mock update API to fail with non-ok status
        mockApiResponses['/api/updateCompany'] = { ok: false, status: 400, body: { error: 'Validation failed'} };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Act: Trigger save
        const formProps = MockedSettingsForm.mock.calls[0][0];
        await act(async () => { await formProps.onSave(); });

        // Assert: Check API was called, popup shown with error
        expect(global.fetch).toHaveBeenCalledWith('/api/updateCompany', expect.anything());
         await waitFor(() => {
             expect(MockedPopupModal).toHaveBeenCalledWith(expect.objectContaining({
                visible: true,
                message: expect.stringContaining("Failed to update settings")
             }), {});
         });
         expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating settings", expect.any(Error)); // Error logged from catch block
         expect(mockPush).not.toHaveBeenCalled(); // No redirect on save failure

         consoleErrorSpy.mockRestore();
    });
    // Add these tests to the existing SettingsPage Component test suite

test('should not do anything when isLoaded is false', () => {
    // Setup: Mock auth not loaded yet
    mockUseAuth.mockReturnValue({ isLoaded: false, userId: null } as any);
    
    render(<SettingsPage />);
    
    // Wait a bit to ensure no side effects
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('mock-loading')).toBeInTheDocument();
  });
  
  test('should handle non-300 employerAuth failure case', async () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
    // Auth check fails with a status other than 300
    mockApiResponses['/api/employerAuth'] = { ok: false, status: 403 };
    
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<SettingsPage />);
    
    // Wait for the alert to be called
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Authentication failed! You are not an employer.');
    });
    
    // Check redirect was called
    expect(mockPush).toHaveBeenCalledWith('/');
    
    // Cleanup
    alertMock.mockRestore();
  });
  
  test('popup should close without redirect when redirectPath is empty', async () => {
    // Setup: Render component normally
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
    
    render(<SettingsPage />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(MockedSettingsForm).toHaveBeenCalled();
    });
    
    // Mock successful API call but with popup that doesn't redirect
    mockApiResponses['/api/updateCompany'] = { ok: true, status: 200 };
    
    // Trigger save which shows popup without redirect
    const formProps = MockedSettingsForm.mock.calls[0][0];
    await act(async () => { 
      await formProps.onSave(); 
    });
    
    // Check popup was shown
    expect(MockedPopupModal).toHaveBeenCalledWith(
      expect.objectContaining({
        visible: true,
        message: "Company settings saved!"
      }),
      {}
    );
    
    // Close popup without redirect
    const latestPopupProps = MockedPopupModal.mock.calls.slice(-1)[0][0];
    act(() => { 
      latestPopupProps.onClose(); 
    });
    
    // Verify no redirect happened
    expect(mockPush).not.toHaveBeenCalled();
  });
  
  test('should handle updateCompany network error', async () => {
    // Setup: Render component normally
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
    
    render(<SettingsPage />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(MockedSettingsForm).toHaveBeenCalled();
    });
    
    // Mock network error for updateCompany
    mockApiResponses['/api/updateCompany'] = { 
      error: new Error('Network error') 
    };
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Trigger save
    const formProps = MockedSettingsForm.mock.calls[0][0];
    await act(async () => { 
      await formProps.onSave(); 
    });
    
    // Check error handling
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Check popup with error message
    await waitFor(() => {
      expect(MockedPopupModal).toHaveBeenCalledWith(
        expect.objectContaining({
          visible: true,
          message: expect.stringContaining("Failed to update settings")
        }),
        {}
      );
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  test('should handle company fetch network errors', async () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-settings' } as any);
    
    // Auth check succeeds but company fetch throws network error
    mockApiResponses['/api/fetchCompany'] = { 
      error: new Error('Network error') 
    };
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SettingsPage />);
    
    // Wait for the error popup
    await waitFor(() => {
      expect(MockedPopupModal).toHaveBeenCalledWith(
        expect.objectContaining({
          visible: true,
          message: expect.stringContaining("Something went wrong"),
          redirectPath: '/' 
        }),
        {}
      );
    });
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

    // --- End New Tests ---

});