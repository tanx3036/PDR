// src/app/employee/documents/tests/DocumentViewer.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs'; // Corrected Clerk hook import path if needed
import { useRouter } from 'next/navigation'; // Corrected Next.js hook import path if needed

import DocumentViewer from '../page';

// Mock dependencies with corrected relative paths
import { fetchWithRetries } from '../fetchWithRetries';
import { DocumentsSidebar } from '../DocumentsSidebar';
import { DocumentContent } from '../DocumentContent';
import { QAHistoryEntry } from '../ChatHistory'; // Assuming ChatHistory component is sibling or check path

// Mock Modules
jest.mock('@clerk/nextjs', () => ({ useAuth: jest.fn() })); // Mock hooks at top level
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

jest.mock('../DocumentsSidebar', () => ({ DocumentsSidebar: jest.fn(() => <div>Mock Sidebar</div>) }));
jest.mock('../DocumentContent', () => ({ DocumentContent: jest.fn(() => <div data-testid="mock-content">Mock Document Content</div>) }));
jest.mock('~/app/_components/loading', () => ({ __esModule: true, default: () => <div>Mock Loading Page</div> }));
jest.mock('../loading-doc', () => ({ __esModule: true, default: () => <div>Mock Loading Doc</div> }));
jest.mock('../fetchWithRetries');

// Type definitions
type SidebarProps = React.ComponentProps<typeof DocumentsSidebar>;
type ContentProps = React.ComponentProps<typeof DocumentContent>;

describe('DocumentViewer Component (page.tsx)', () => { // Changed describe name slightly
  let mockUseAuth: jest.MockedFunction<typeof useAuth>;
  let mockUseRouter: jest.MockedFunction<typeof useRouter>;
  let mockPush: jest.Mock;
  let mockFetchWithRetries: jest.MockedFunction<typeof fetchWithRetries>;
  let MockedSidebar: jest.Mock;
  let MockedContent: jest.Mock;

  const getLatestProps = <T,>(mc: jest.Mock): T | undefined => mc.mock.calls.length > 0 ? mc.mock.calls[mc.mock.calls.length - 1][0] as T : undefined;
  const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
    mockPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush, replace: jest.fn() } as any);
    mockFetchWithRetries = fetchWithRetries as jest.MockedFunction<typeof fetchWithRetries>;
    MockedSidebar = DocumentsSidebar as jest.Mock;
    MockedContent = DocumentContent as jest.Mock;

    // Default mocks
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-user-id' } as any);
    mockFetchWithRetries.mockResolvedValue({ success: true, summarizedAnswer: 'Mock AI Success', recommendedPages: [1] });
    global.fetch = jest.fn().mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.endsWith('/api/employeeAuth')) return { ok: true, status: 200, json: async () => ({ success: true }) };
        if (urlStr.endsWith('/api/fetchDocument')) return { ok: true, status: 200, json: async () => [] };
        if (urlStr.endsWith('/api/Questions/fetch')) return { ok: true, status: 200, json: async () => ({ status: 'ok', chatHistory: [] }) };
        if (urlStr.endsWith('/api/Questions/add')) return { ok: true, status: 200, json: async () => ({ success: true }) };
        return { ok: false, status: 404, json: async () => ({ error: 'Unhandled API mock' }) };
    });
  });

  // ... (Paste other tests here, assumed correct from previous versions) ...
  test('should show loading page while auth is loading', () => { /* ... */ });
  test('should show loading page while role is checking', async () => { /* ... */ });
  test('should show loading doc while documents are fetching', async () => { /* ... */ });
  test('should render sidebar and content after loading finishes', async () => { /* ... */ });
  test('should redirect to / if no userId after loaded', () => { /* ... */ });
  test('should redirect to pending if status 300', async () => { /* ... */ });
  test('should redirect to / if auth fetch fails (non-300)', async () => { /* ... */ });
  test('should redirect to / if auth fetch throws error', async () => { /* ... */ });
  test('should handle document fetch error', async () => { /* ... */ });
  test('should handle invalid document data format', async () => { /* ... */ });
  test('should filter documents based on search term', async () => { /* ... */ });
  test('handleAiSearch should set error if question is empty', async () => { /* ... */ }); // Assumed already fixed
  test('handleAiSearch should set error if no document selected', async () => { /* ... */ }); // Assumed already fixed
  test('handleAiSearch should call fetchWithRetries and update state on success', async () => { /* ... */ }); // Assumed already fixed
  test('handleAiSearch should set error state on fetchWithRetries failure', async () => { /* ... */ }); // Assumed already fixed
  test('handleAiSearch should set timeout error state specifically', async () => { /* ... */ }); // Assumed already fixed


  // FIX for Failure #29: Correct mock setup and console assertion
  test('handleAiSearch should set error state if saveToDatabase fails', async () => {
    const question = "Save fail q?";
    const answer = "Save fail a";
    const pages = [4];
    const doc = { id: 6, title: 'Save Doc', category: 'S', url: 's.pdf' };
    const initialHistory: QAHistoryEntry[] = []; // Start with empty history
    const documents = [doc]; // Initial documents

    mockFetchWithRetries.mockResolvedValueOnce({ summarizedAnswer: answer, recommendedPages: pages });

    // Specific fetch mock for this scenario
    (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
        const urlStr = url.toString();
        // Ensure prerequisite calls succeed
        if (urlStr.endsWith('/api/employeeAuth')) return { ok: true, status: 200, json: async () => ({ success: true }) };
        if (urlStr.endsWith('/api/fetchDocument')) return { ok: true, status: 200, json: async () => documents };
        if (urlStr.endsWith('/api/Questions/fetch')) return { ok: true, status: 200, json: async () => ({ status: 'ok', chatHistory: initialHistory }) };
        // *** Make the save call fail (return non-ok response) ***
        if (urlStr.endsWith('/api/Questions/add')) return { ok: false, status: 500, json: async () => ({ error: 'DB Save Error' }) };
        return { ok: false, status: 404, json: async () => ({ error: 'Unhandled API mock in test' }) };
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<DocumentViewer />);
    await waitFor(() => expect(screen.getByText('Mock Sidebar')).toBeInTheDocument());

    // Simulate selecting doc, asking question, triggering search
    const sidebarProps = getLatestProps<SidebarProps>(MockedSidebar);
    const contentProps = getLatestProps<ContentProps>(MockedContent);
    act(() => { sidebarProps?.setSelectedDoc(doc); });
    await waitFor(() => expect(getLatestProps<ContentProps>(MockedContent)?.selectedDoc).toEqual(doc));
    act(() => { getLatestProps<ContentProps>(MockedContent)?.setAiQuestion(question); });
    await waitFor(() => expect(getLatestProps<ContentProps>(MockedContent)?.aiQuestion).toEqual(question));
    const latestContentProps = getLatestProps<ContentProps>(MockedContent);
    await act(async () => { await latestContentProps?.handleAiSearch(mockEvent); });

    // Wait for fetchWithRetries and save attempt
    expect(mockFetchWithRetries).toHaveBeenCalled();
    await waitFor(() => { expect(global.fetch).toHaveBeenCalledWith('/api/Questions/add', expect.anything()); });

    // Check console error and AI error state
    await waitFor(() => {
        // Check the error logged from the component's catch block for save failure
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to add Q&A to history", expect.any(Object)); // Or expect.any(Error) if it logs the error object
    });
    const finalContentProps = getLatestProps<ContentProps>(MockedContent);
    expect(finalContentProps?.aiError).toContain("Failed to save question to history"); // Check AI error state
    expect(finalContentProps?.qaHistory).toEqual(initialHistory); // History should not have updated

    consoleErrorSpy.mockRestore();
  });
  // --- End Fix ---


  test('should fetch history when selectedDoc changes', async () => { /* ... */ }); // Assumed already correct
  test('should handle error during history fetch', async () => { /* ... */ }); // Assumed already correct
  test('should handle invalid data format during history fetch', async () => { /* ... */ }); // Assumed already correct (Failure #30 requires source code fix)
  test('selecting a new document should reset page number and AI state', async () => { /* ... */ }); // Assumed already correct
});