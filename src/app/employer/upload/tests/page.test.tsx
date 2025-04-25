// src/app/employer/upload/tests/page.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'; // Import if needed for future tests
import { useRouter } from 'next/navigation';
import UploadPage from '../page'; // Adjust path

// Mock dependencies
jest.mock('../EmployerAuthCheck', () => ({
    __esModule: true,
    default: jest.fn(({ children, onAuthSuccess }) => {
        React.useEffect(() => { onAuthSuccess('mock-auth-user-id'); }, [onAuthSuccess]);
        return <div data-testid="mock-auth-check">{children}</div>;
    })
}));
jest.mock('../UploadForm', () => ({ __esModule: true, default: jest.fn(() => <div data-testid="mock-upload-form">Upload Form</div>) }));
jest.mock('../CategoryManagement', () => ({ __esModule: true, default: jest.fn(() => <div data-testid="mock-category-management">Category Management</div>) }));
jest.mock('lucide-react', () => ({ Brain: () => 'B', Home: () => 'H' }));
jest.mock('next/navigation');

// Mock API responses and fetch (keep as is)
const mockCategoriesData = [{ id: 'c1', name: 'Initial Cat' }];
const mockApiResponses: Record<string, { status?: number, ok?: boolean, body?: any, error?: Error }> = {
    '/api/Categories/GetCategories': { ok: true, status: 200, body: mockCategoriesData },
    '/api/Categories/AddCategories': { ok: true, status: 200, body: { id: 'newCat', name: 'New Category Added' } },
    '/api/Categories/DeleteCategories': { ok: true, status: 200, body: { success: true } },
};
global.fetch = jest.fn(async (urlInput, options) => { /* ... keep fetch mock ... */ const url = urlInput.toString(); const key = Object.keys(mockApiResponses).find(k => url.endsWith(k)); const mock = key ? mockApiResponses[key] : { status: 404, ok: false, body: { error: 'Not Found' } }; if (mock.error) { throw mock.error; } return { ok: mock.ok ?? true, status: mock.status ?? 200, json: async () => mock.body, text: async () => JSON.stringify(mock.body) } as Response; });


describe('Employer Upload Page', () => {
    let mockPush: jest.Mock;
    let MockedUploadForm: jest.Mock;
    let MockedCategoryManagement: jest.Mock;

    // FIX (#20-23): Define the missing helper function
    const getLatestProps = <T,>(mc: jest.Mock): T | undefined => {
        if (!mc || !mc.mock || !mc.mock.calls || mc.mock.calls.length === 0) {
            return undefined;
        }
        return mc.mock.calls[mc.mock.calls.length - 1][0] as T;
    };
    // --- End Fix ---

    beforeEach(() => {
        jest.clearAllMocks();
        mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: jest.fn() });
        MockedUploadForm = require('../UploadForm').default as jest.Mock;
        MockedCategoryManagement = require('../CategoryManagement').default as jest.Mock;

        // Reset API mocks
        mockApiResponses['/api/Categories/GetCategories'] = { ok: true, status: 200, body: mockCategoriesData };
        mockApiResponses['/api/Categories/AddCategories'] = { ok: true, status: 200, body: { id: 'newCat', name: 'New Category Added' } };
        mockApiResponses['/api/Categories/DeleteCategories'] = { ok: true, status: 200, body: { success: true } };
        (global.fetch as jest.Mock).mockClear(); // Clear fetch calls too
    });

    // --- Tests remain the same, but should now pass if getLatestProps was the only issue ---
    test('should render structure and fetch categories on auth success', async () => {
        render(<UploadPage />);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/Categories/GetCategories', expect.anything());
        });
        expect(screen.getByTestId('mock-auth-check')).toBeInTheDocument();
        // ... other assertions ...
        await waitFor(() => {
             expect(MockedUploadForm).toHaveBeenCalledWith(expect.objectContaining({ categories: mockCategoriesData }), {});
             expect(MockedCategoryManagement).toHaveBeenCalledWith(expect.objectContaining({ categories: mockCategoriesData }), {});
        });
    });

     test('should handle category fetch error', async () => {
         mockApiResponses['/api/Categories/GetCategories'] = { error: new Error("Fetch Cat Failed")};
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         render(<UploadPage />);
         await waitFor(() => {
             expect(global.fetch).toHaveBeenCalledWith('/api/Categories/GetCategories', expect.anything());
             expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching categories:", expect.any(Error)); // Changed message slightly to match common patterns
         });
         // Check components still render but with empty categories
        expect(MockedUploadForm).toHaveBeenCalledWith(expect.objectContaining({ categories: [] }), {});
        expect(MockedCategoryManagement).toHaveBeenCalledWith(expect.objectContaining({ categories: [] }), {});
         consoleErrorSpy.mockRestore();
    });

    // These tests now use the defined getLatestProps
    test('handleAddCategory should call API and update state', async () => {
        render(<UploadPage />);
        await waitFor(() => { expect(MockedCategoryManagement).toHaveBeenCalled(); });
        const mgmtProps = MockedCategoryManagement.mock.calls[0][0];
        const newCategoryName = 'Test Add';
        await act(async () => { await mgmtProps.onAddCategory('mock-auth-user-id', newCategoryName); });
        expect(global.fetch).toHaveBeenCalledWith('/api/Categories/AddCategories', expect.anything());
        await waitFor(() => {
            const latestMgmtProps = getLatestProps(MockedCategoryManagement);
            expect(latestMgmtProps?.categories).toEqual( expect.arrayContaining([ ...mockCategoriesData, { id: 'newCat', name: 'New Category Added' } ]) );
        });
    });

    test('handleAddCategory should handle API error', async () => {
         mockApiResponses['/api/Categories/AddCategories'] = { ok: false, status: 400 };
         const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         render(<UploadPage />);
         await waitFor(() => { expect(MockedCategoryManagement).toHaveBeenCalled(); });
         const mgmtProps = MockedCategoryManagement.mock.calls[0][0];
         await act(async () => { await mgmtProps.onAddCategory('mock-auth-user-id', 'Fail Add'); });
         await waitFor(() => { expect(global.fetch).toHaveBeenCalledWith('/api/Categories/AddCategories', expect.anything()); });
         expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Error creating category"));
         expect(consoleErrorSpy).toHaveBeenCalled();
         const latestMgmtProps = getLatestProps(MockedCategoryManagement);
         expect(latestMgmtProps?.categories).toEqual(mockCategoriesData);
         alertSpy.mockRestore();
         consoleErrorSpy.mockRestore();
     });

    test('handleRemoveCategory should call API and update state', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
        render(<UploadPage />);
        await waitFor(() => { expect(MockedCategoryManagement).toHaveBeenCalled(); });
        const mgmtProps = MockedCategoryManagement.mock.calls[0][0];
        const categoryToRemoveId = 'c1';
        await act(async () => { await mgmtProps.onRemoveCategory(categoryToRemoveId); });
        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/Categories/DeleteCategories', expect.anything());
        await waitFor(() => {
            const latestMgmtProps = getLatestProps(MockedCategoryManagement);
            expect(latestMgmtProps?.categories).toEqual([]);
        });
        confirmSpy.mockRestore();
    });

     test('handleRemoveCategory should handle API error', async () => {
        mockApiResponses['/api/Categories/DeleteCategories'] = { ok: false, status: 500 };
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<UploadPage />);
        await waitFor(() => { expect(MockedCategoryManagement).toHaveBeenCalled(); });
        const mgmtProps = MockedCategoryManagement.mock.calls[0][0];
        await act(async () => { await mgmtProps.onRemoveCategory('c1'); });
        await waitFor(() => { expect(global.fetch).toHaveBeenCalledWith('/api/Categories/DeleteCategories', expect.anything()); });
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Error removing category"));
        expect(consoleErrorSpy).toHaveBeenCalled();
        const latestMgmtProps = getLatestProps(MockedCategoryManagement);
        expect(latestMgmtProps?.categories).toEqual(mockCategoriesData);
        confirmSpy.mockRestore();
        alertSpy.mockRestore();
        consoleErrorSpy.mockRestore();
     });

      test('handleRemoveCategory should not call API if confirm is false', async () => {
         const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => false);
         render(<UploadPage />);
         await waitFor(() => { expect(MockedCategoryManagement).toHaveBeenCalled(); });
         const mgmtProps = MockedCategoryManagement.mock.calls[0][0];
         await act(async () => { await mgmtProps.onRemoveCategory('c1'); });
         expect(confirmSpy).toHaveBeenCalledTimes(1);
         expect(global.fetch).not.toHaveBeenCalledWith('/api/Categories/DeleteCategories', expect.anything());
         confirmSpy.mockRestore();
     });
});