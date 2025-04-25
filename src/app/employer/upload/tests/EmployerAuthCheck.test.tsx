// src/app/employer/upload/tests/EmployerAuthCheck.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import EmployerAuthCheck from '../EmployerAuthCheck'; // Adjust path

// Mock dependencies
jest.mock('@clerk/nextjs');
jest.mock('next/navigation');
jest.mock('~/app/_components/loading', () => ({ __esModule: true, default: () => <div data-testid="mock-loading">Loading...</div> }));

describe('EmployerAuthCheck Component', () => {
    let mockUseAuth: jest.Mock;
    let mockUseRouter: jest.Mock;
    let mockPush: jest.Mock;
    let fetchMock: jest.Mock;
    const mockOnAuthSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth = useAuth as jest.Mock;
        mockUseRouter = useRouter as jest.Mock;
        mockPush = jest.fn();
        mockUseRouter.mockReturnValue({ push: mockPush });
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-employer-auth' });

        fetchMock = jest.fn();
        global.fetch = fetchMock;
        // Default success
        fetchMock.mockResolvedValue({ ok: true, status: 200 });
    });

    test('should show loading state initially', () => {
        mockUseAuth.mockReturnValue({ isLoaded: false, userId: 'test-employer-auth' });
        render(<EmployerAuthCheck onAuthSuccess={mockOnAuthSuccess}><div>Child Content</div></EmployerAuthCheck>);
        expect(screen.getByTestId('mock-loading')).toBeInTheDocument();
    });

    test('should redirect and alert if no userId', () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: null });
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        render(<EmployerAuthCheck onAuthSuccess={mockOnAuthSuccess}><div>Child Content</div></EmployerAuthCheck>);
        expect(alertSpy).toHaveBeenCalledWith("Authentication failed! No user found.");
        expect(mockPush).toHaveBeenCalledWith('/');
        alertSpy.mockRestore();
    });

    test('should call employerAuth API and onAuthSuccess on successful check', async () => {
        render(<EmployerAuthCheck onAuthSuccess={mockOnAuthSuccess}><div>Child Content</div></EmployerAuthCheck>);
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('/api/employerAuth', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ userId: 'test-employer-auth' })
            }));
        });
        expect(mockOnAuthSuccess).toHaveBeenCalledWith('test-employer-auth');
        expect(screen.getByText('Child Content')).toBeInTheDocument(); // Children rendered after auth
        expect(screen.queryByTestId('mock-loading')).not.toBeInTheDocument(); // Loading finished
    });

    test('should redirect and alert if employerAuth API fails (not ok)', async () => {
        fetchMock.mockResolvedValue({ ok: false, status: 403 }); // Simulate auth failure
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        render(<EmployerAuthCheck onAuthSuccess={mockOnAuthSuccess}><div>Child Content</div></EmployerAuthCheck>);
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('/api/employerAuth', expect.anything());
            expect(alertSpy).toHaveBeenCalledWith("Authentication failed! You are not an employer.");
            expect(mockPush).toHaveBeenCalledWith('/');
        });
        alertSpy.mockRestore();
    });

     test('should redirect and alert if employerAuth API throws error', async () => {
        const error = new Error('Network error');
        fetchMock.mockRejectedValue(error); // Simulate fetch throwing
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<EmployerAuthCheck onAuthSuccess={mockOnAuthSuccess}><div>Child Content</div></EmployerAuthCheck>);
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('/api/employerAuth', expect.anything());
            expect(alertSpy).toHaveBeenCalledWith("Authentication failed! You are not an employer.");
            expect(mockPush).toHaveBeenCalledWith('/');
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking employer role:", error);
        });
        alertSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
});