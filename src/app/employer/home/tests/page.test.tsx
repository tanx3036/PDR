// src/app/employer/home/tests/page.test.tsx
import React from 'react';
// Import 'within' for scoped queries
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import HomeScreen from '../page'; // Component under test

// Mock Child Components and Hooks
jest.mock('~/app/employer/_components/ProfileDropdown', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-profile-dropdown">Profile Dropdown</div>
}));
jest.mock('~/app/_components/loading', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-loading">Loading...</div>
}));
jest.mock('lucide-react', () => ({ // Mock all icons used
  Upload: () => <div data-testid="icon-upload">Upload</div>,
  FileText: () => <div data-testid="icon-filetext">FileText</div>,
  BarChart: () => <div data-testid="icon-barchart">BarChart</div>,
  Brain: () => <div data-testid="icon-brain">Brain</div>,
  Settings: () => <div data-testid="icon-settings">Settings</div>,
  Users: () => <div data-testid="icon-users">Users</div>,
}));

const mockPush = jest.fn();
// Ensure the mock returns an object with the push function
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(), // Add other methods if your component uses them
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  })
}));
jest.mock('@clerk/nextjs', () => ({ useAuth: jest.fn() }));

// Mock API Responses
const mockApiResponses: Record<string, { status?: number; ok?: boolean; error?: Error }> = {
    '/api/employerAuth': { ok: true, status: 200 }, // Default success
};

// Use a type assertion for clarity
global.fetch = jest.fn(async (urlInput) => {
    const url = urlInput.toString();
    // Find a matching mock based on URL ending might be safer if base URL changes
    const key = Object.keys(mockApiResponses).find(k => url.endsWith(k));
    const mock = key ? mockApiResponses[key] : { status: 404, ok: false };

    if (mock.error) { throw mock.error; }
    // Ensure response structure matches what fetch expects
    return {
        ok: mock.ok ?? true,
        status: mock.status ?? 200,
        json: async () => ({}), // Provide a default json implementation
        text: async () => '',   // Provide a default text implementation
        headers: new Headers(),
        redirected: false,
        statusText: 'OK',
        type: 'basic',
        url: url,
        clone: function() { return this; }, // Add clone method
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
        // Add other methods if needed by your code
    } as Response;
});


describe('HomeScreen Component (Employer Home)', () => {
    // Use more specific types if available e.g. from @types/jest
    let mockUseAuth: jest.Mock;

     beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth = useAuth as jest.Mock;
        // Reset API mocks to defaults
        mockApiResponses['/api/employerAuth'] = { ok: true, status: 200 };
        // Reset router mock calls
        mockPush.mockClear();
        // Reset fetch mock calls
        (global.fetch as jest.Mock).mockClear();
    });

    test('should show loading state initially', () => {
        mockUseAuth.mockReturnValue({ isLoaded: false, userId: 'test-user' });
        render(<HomeScreen />);
        expect(screen.getByTestId('mock-loading')).toBeInTheDocument();
    });

    test('should redirect if not loaded and no userId', () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: null });
        render(<HomeScreen />);
        // It should redirect immediately if not loaded + no user ID
        expect(mockPush).toHaveBeenCalledWith('/');
    });

     test('should redirect to pending-approval if auth returns status 300', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user' });
        mockApiResponses['/api/employerAuth'] = { status: 300, ok: false };
        render(<HomeScreen />);
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/employee/pending-approval'));
    });

     test('should redirect if auth check is not ok (and not 300)', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user' });
        mockApiResponses['/api/employerAuth'] = { status: 401, ok: false };
        render(<HomeScreen />);
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    });

    test('should redirect if auth check fetch fails', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user' });
        mockApiResponses['/api/employerAuth'] = { error: new Error("API Fail") };
        render(<HomeScreen />);
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    });

    test('should render navbar, welcome text, and menu cards after successful auth', async () => {
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user' });
        mockApiResponses['/api/employerAuth'] = { ok: true, status: 200 }; // Ensure success

        render(<HomeScreen />);

        // Wait for loading to disappear
        await waitFor(() => expect(screen.queryByTestId('mock-loading')).not.toBeInTheDocument());

        // --- FIXED QUERIES ---
        // Check navbar elements rendered
        const navbar = screen.getByRole('navigation'); // Assuming <nav> element
        expect(within(navbar).getByText(/pdr ai/i)).toBeInTheDocument(); // Logo text within navbar
        expect(screen.getByTestId('mock-profile-dropdown')).toBeInTheDocument();

        // Check static content (use getByRole for heading)
        expect(screen.getByRole('heading', { name: /welcome to pdr ai/i })).toBeInTheDocument();
        // --------------------

        // Check menu cards (use getByRole for headings for robustness)
        expect(screen.getByRole('heading', { name: /upload documents/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /view documents/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /document statistics/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /manage employees/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /user settings/i })).toBeInTheDocument();

        // Check icons are rendered (via testids)
         expect(screen.getByTestId('icon-upload')).toBeInTheDocument();
         expect(screen.getByTestId('icon-filetext')).toBeInTheDocument();
         expect(screen.getByTestId('icon-barchart')).toBeInTheDocument();
         expect(screen.getByTestId('icon-users')).toBeInTheDocument();
         expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
         expect(screen.getByTestId('icon-brain')).toBeInTheDocument(); // Icon in navbar
    });

    test('should navigate when a menu card is clicked', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user' });
        mockApiResponses['/api/employerAuth'] = { ok: true, status: 200 };
        render(<HomeScreen />);
        await waitFor(() => expect(screen.queryByTestId('mock-loading')).not.toBeInTheDocument());

        // --- FIXED QUERY ---
        // Find the specific heading first, then find its clickable ancestor
        const cardHeading = screen.getByRole('heading', { name: /manage employees/i });
        const manageEmployeesCard = cardHeading.closest('div[role="button"]');
        // --------------------

        expect(manageEmployeesCard).toBeInTheDocument(); // Ensure the card element itself was found

        // Use non-null assertion carefully, or check if manageEmployeesCard is null first
        if (manageEmployeesCard) {
            await user.click(manageEmployeesCard);
        } else {
            throw new Error("Could not find the clickable card element for 'Manage Employees'");
        }


        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/employer/employees'); // Check correct path
    });
});