// src/app/employee/pending-approval/tests/page.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
// Assuming the component is default export from page.tsx
import PendingApproval from '../page';

// --- Mocks ---
// Mock child components and hooks
jest.mock('../Navbar', () => ({ // Adjust path if Navbar is elsewhere
    __esModule: true,
    default: () => <div data-testid="mock-navbar">Mock Nav Bar</div>
}));
jest.mock('~/app/employer/_components/ProfileDropdown', () => ({ // Assuming NavBar uses this
    __esModule: true,
    default: () => <div data-testid="mock-profile-dropdown">Profile Dropdown</div>
}));
jest.mock('lucide-react', () => ({
    Clock: () => <div data-testid="icon-clock">Clock</div>,
    Building: () => <div data-testid="icon-building">Building</div>,
    Mail: () => <div data-testid="icon-mail">Mail</div>,
    Brain: () => <div data-testid="icon-brain">Brain</div>, // For NavBar mock if needed
}));

// Mock hooks
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: mockPush })),
}));
jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(),
    // Mock useUser if needed by ProfileDropdown/NavBar, otherwise omit
    // useUser: jest.fn(() => ({ user: { /* mock user data */ } })),
}));

// Mock global fetch
global.fetch = jest.fn();
// --- End Mocks ---

describe('PendingApproval Component', () => {
    let mockUseAuth: jest.Mock;
    let fetchMock: jest.Mock;
    let alertSpy: jest.SpyInstance; // To spy on window.alert

    const mockUserId = 'test-pending-user-id';
    const mockApiResponse = {
        name: 'Pending User',
        email: 'pending@example.com',
        company: 'Pending Inc.',
        submissionDate: '2025-04-25',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth = useAuth as jest.Mock;
        fetchMock = global.fetch as jest.Mock;
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert

        // Default mocks for successful state
        mockUseAuth.mockReturnValue({ userId: mockUserId, isLoaded: true });
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse,
        } as Response);
    });

    afterEach(() => {
        alertSpy.mockRestore(); // Restore original alert function
    });

    test('should render loading state initially if auth is not loaded', () => {
        mockUseAuth.mockReturnValue({ userId: null, isLoaded: false });
        render(<PendingApproval />);
        // Check for a loading indicator if you have one, otherwise check main content isn't there
        expect(screen.queryByRole('heading', { name: /pending approval/i })).not.toBeInTheDocument();
        // Add assertion for your loading component if applicable
        // expect(screen.getByTestId('your-loading-spinner')).toBeInTheDocument();
    });

    test('should not fetch data if userId is null', () => {
        mockUseAuth.mockReturnValue({ userId: null, isLoaded: true });
        render(<PendingApproval />);
        expect(fetchMock).not.toHaveBeenCalled();
        // Optionally check if it renders something specific for non-authed users,
        // though the component logic seems to rely on useEffect triggering fetch
    });

    test('should fetch user info and display data on mount with userId', async () => {
        render(<PendingApproval />);

        // Check fetch was called correctly
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith('/api/fetchUserInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: mockUserId }),
            });
        });

        // Check rendered data after fetch
        expect(screen.getByRole('heading', { name: /pending approval/i })).toBeInTheDocument();
        expect(screen.getByText(/your account is currently awaiting approval/i)).toBeInTheDocument();
        expect(screen.getByTestId('mock-navbar')).toBeInTheDocument(); // Check navbar mock

        // Check details section
        expect(screen.getByText('Company')).toBeInTheDocument();
        expect(screen.getByText(mockApiResponse.company)).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText(mockApiResponse.email)).toBeInTheDocument();
        expect(screen.getByText('Submission Date')).toBeInTheDocument();
        expect(screen.getByText(mockApiResponse.submissionDate)).toBeInTheDocument();

        // Check icons
        expect(screen.getAllByTestId('icon-clock').length).toBeGreaterThanOrEqual(1); // One in status, one in details
        expect(screen.getByTestId('icon-building')).toBeInTheDocument();
        expect(screen.getByTestId('icon-mail')).toBeInTheDocument();
    });

    test('should handle fetch error, show alert, and redirect', async () => {
        const fetchError = new Error('API is down');
        fetchMock.mockRejectedValueOnce(fetchError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error

        render(<PendingApproval />);

        // Wait for the fetch attempt and subsequent error handling
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        // Check error handling effects
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking employee role:", fetchError);
        expect(alertSpy).toHaveBeenCalledWith("Authentication failed! You are not an employee.");
        expect(mockPush).toHaveBeenCalledWith('/');

        consoleErrorSpy.mockRestore();
    });

    test('should handle non-ok response, show alert, and redirect', async () => {
        // Simulate a scenario where fetch itself succeeds but returns an error status
        // Note: The current component code might actually throw on .json() for non-ok,
        // which would be caught by the same catch block as a network error.
        // This test simulates if the catch block was more specific.
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 403, // Example: Forbidden
            json: async () => ({ error: 'Forbidden access' }),
        } as Response);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<PendingApproval />);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        // Expect the same error handling as the catch block
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking employee role:", expect.any(Error)); // Error likely occurs at .json() or within the try
        expect(alertSpy).toHaveBeenCalledWith("Authentication failed! You are not an employee.");
        expect(mockPush).toHaveBeenCalledWith('/');

        consoleErrorSpy.mockRestore();
    });

     test('should render support link correctly', () => {
        render(<PendingApproval />);
        const supportLink = screen.getByRole('link', { name: /pdraionline@gmail\.com/i });
        expect(supportLink).toBeInTheDocument();
        expect(supportLink).toHaveAttribute('href', 'mailto:pdraionline@gmail.com');
    });

});