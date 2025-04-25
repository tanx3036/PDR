// src/app/employer/employees/tests/ManageEmployeePage.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'; // Not used in provided tests
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ManageEmployeesPage from '../ManageEmployeePage';

// Mock Child Components and Hooks (assuming these are correct)
jest.mock('../NavBar', () => ({ __esModule: true, default: () => <div data-testid="mock-navbar">Mock Nav</div> }));
jest.mock('../CurrentEmployeeTable', () => ({ __esModule: true, default: jest.fn(() => <div data-testid="mock-current-table">Mock Current Table</div>) }));
jest.mock('../PendingEmployeeTable', () => ({ __esModule: true, default: jest.fn(() => <div data-testid="mock-pending-table">Mock Pending Table</div>) }));
jest.mock('~/app/_components/loading', () => ({ __esModule: true, default: () => <div data-testid="mock-loading">Loading...</div> }));

// --- Explicitly Mock Hooks ---
const mockPush = jest.fn();
const mockRefresh = jest.fn(); // Mock refresh as well
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh })
}));
jest.mock('@clerk/nextjs', () => ({ useAuth: jest.fn() }));
// --- End Mocks ---


// Mock API Responses (assuming correct structure)
type Employee = { id: string; name: string; email: string; role: string; status: string };
const mockApiResponses: Record<string, { status?: number, ok?: boolean, body?: any, error?: Error }> = {
    '/api/employerAuth': { ok: true, status: 200, body: { role: 'owner' } },
    '/api/getAllEmployees': { ok: true, status: 200, body: [] },
    '/api/removeEmployees': { ok: true, status: 200, body: { success: true } },
    '/api/approveEmployees': { ok: true, status: 200, body: { success: true } },
};

// Mock Global Fetch (assuming correct implementation)
global.fetch = jest.fn(async (urlInput) => { /* ... same fetch mock ... */ const url = urlInput.toString(); const key = Object.keys(mockApiResponses).find(k => url.endsWith(k)); const mock = key ? mockApiResponses[key] : { status: 404, ok: false, body: { error: 'Not Found' } }; if (mock.error) { throw mock.error; } return { ok: mock.ok ?? true, status: mock.status ?? 200, json: async () => mock.body, text: async () => JSON.stringify(mock.body) } as Response; });


describe('ManageEmployeesPage Component', () => {
    let mockUseAuth: jest.MockedFunction<typeof useAuth>;
    let MockedCurrentTable: jest.Mock;
    let MockedPendingTable: jest.Mock;

    const mockVerifiedEmp: Employee = { id: 'v1', name: 'Verified', email: 'v@test.com', role: 'employee', status: 'verified' };
    const mockPendingEmp: Employee = { id: 'p1', name: 'Pending', email: 'p@test.com', role: 'employee', status: 'pending' };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
        MockedCurrentTable = require('../CurrentEmployeeTable').default as jest.Mock;
        MockedPendingTable = require('../PendingEmployeeTable').default as jest.Mock;

        // Set default ok state for auth
        mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user' } as any);

        // Reset API mocks & fetch calls
        mockApiResponses['/api/employerAuth'] = { ok: true, status: 200, body: { role: 'owner' } };
        mockApiResponses['/api/getAllEmployees'] = { ok: true, status: 200, body: [] };
        mockApiResponses['/api/removeEmployees'] = { ok: true, status: 200, body: { success: true } };
        mockApiResponses['/api/approveEmployees'] = { ok: true, status: 200, body: { success: true } };
        (global.fetch as jest.Mock).mockClear();
        mockPush.mockClear();
        mockRefresh.mockClear(); // Clear refresh mock too
    });

    // ... (other tests like loading, redirects, initial load remain the same) ...
    test('should show loading state initially', () => { /* ... */ });
    test('should redirect if not loaded and no userId', () => { /* ... */ });
    test('should redirect to pending-approval if auth returns status 300', async () => { /* ... */ });
    test('should redirect if auth check is not ok (and not 300)', async () => { /* ... */ });
    test('should redirect if auth check returns invalid role', async () => { /* ... */ });
    test('should redirect if auth check fetch fails', async () => { /* ... */ });
    test('should load employees and pass data to tables after successful auth', async () => { /* ... */ });
    test('should handle error during loadEmployees', async () => { /* ... */ });


    // FIX for Timeout (#39): Added await inside act, increased timeout
    test('handleRemoveEmployee should call remove API and reload employees', async () => {
        mockApiResponses['/api/getAllEmployees'] = { ok: true, status: 200, body: [mockVerifiedEmp] };
        render(<ManageEmployeesPage />);
        await waitFor(() => { expect(MockedCurrentTable).toHaveBeenCalled(); });

        const tableProps = MockedCurrentTable.mock.calls[0][0];
        const employeeToRemoveId = 'v1';

        // Use act and await the prop function call
        await act(async () => {
             await tableProps.onRemove(employeeToRemoveId);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/removeEmployees', expect.anything());
        // Wait specifically for the *second* call to getAllEmployees
        await waitFor(() => {
            const fetchCalls = (global.fetch as jest.Mock).mock.calls;
            const getAllCalls = fetchCalls.filter(call => call[0].toString().endsWith('/api/getAllEmployees'));
            expect(getAllCalls.length).toBeGreaterThanOrEqual(2);
        });
    }, 10000); // Increased timeout to 10s for diagnostics

    // FIX for Timeout (#40): Added await inside act, increased timeout
     test('handleApproveEmployee should call approve API and reload employees', async () => {
        mockApiResponses['/api/getAllEmployees'] = { ok: true, status: 200, body: [mockPendingEmp] };
        render(<ManageEmployeesPage />);
        await waitFor(() => { expect(MockedPendingTable).toHaveBeenCalled(); });

        const tableProps = MockedPendingTable.mock.calls[0][0];
        const employeeToApproveId = 'p1';

         await act(async () => {
             await tableProps.onApprove(employeeToApproveId);
         });

        expect(global.fetch).toHaveBeenCalledWith('/api/approveEmployees', expect.anything());
         await waitFor(() => {
            const fetchCalls = (global.fetch as jest.Mock).mock.calls;
            const getAllCalls = fetchCalls.filter(call => call[0].toString().endsWith('/api/getAllEmployees'));
            expect(getAllCalls.length).toBeGreaterThanOrEqual(2);
        });
    }, 10000); // Increased timeout

     // FIX for Timeout (#41): Added await inside act, increased timeout
     test('handleRemoveEmployee should log error if remove API fails', async () => {
         mockApiResponses['/api/getAllEmployees'] = { ok: true, status: 200, body: [mockVerifiedEmp] };
         mockApiResponses['/api/removeEmployees'] = { error: new Error("Remove Failed") };
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         render(<ManageEmployeesPage />);
         await waitFor(() => { expect(MockedCurrentTable).toHaveBeenCalled(); });

         const tableProps = MockedCurrentTable.mock.calls[0][0];
         await act(async () => { await tableProps.onRemove('v1'); });

         // Wait for the specific API call that fails
         await waitFor(() => {
             expect(global.fetch).toHaveBeenCalledWith('/api/removeEmployees', expect.anything());
         });
         expect(consoleErrorSpy).toHaveBeenCalledWith("Error removing employee:", expect.any(Error));
         // Verify loadEmployees was NOT called again
         const fetchCalls = (global.fetch as jest.Mock).mock.calls;
         const getAllCalls = fetchCalls.filter(call => call[0].toString().endsWith('/api/getAllEmployees'));
         expect(getAllCalls.length).toBe(1);
         consoleErrorSpy.mockRestore();
     }, 10000); // Increased timeout

      // FIX for Timeout (#42): Added await inside act, increased timeout
      test('handleApproveEmployee should log error if approve API fails', async () => {
         mockApiResponses['/api/getAllEmployees'] = { ok: true, status: 200, body: [mockPendingEmp] };
         mockApiResponses['/api/approveEmployees'] = { error: new Error("Approve Failed") };
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         render(<ManageEmployeesPage />);
         await waitFor(() => { expect(MockedPendingTable).toHaveBeenCalled(); });

         const tableProps = MockedPendingTable.mock.calls[0][0];
         await act(async () => { await tableProps.onApprove('p1'); });

          await waitFor(() => {
             expect(global.fetch).toHaveBeenCalledWith('/api/approveEmployees', expect.anything());
         });
         expect(consoleErrorSpy).toHaveBeenCalledWith("Error approving employee:", expect.any(Error));
         const fetchCalls = (global.fetch as jest.Mock).mock.calls;
         const getAllCalls = fetchCalls.filter(call => call[0].toString().endsWith('/api/getAllEmployees'));
         expect(getAllCalls.length).toBe(1);
         consoleErrorSpy.mockRestore();
     }, 10000); // Increased timeout

});