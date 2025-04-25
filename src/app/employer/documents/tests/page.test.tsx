import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs'; // Original import
import { useRouter } from 'next/navigation'; // Original import

// --- Component Under Test ---
import DocumentViewer from '../page'; // Import employer page component

// --- Mocks ---
// Import the actual functions/components you want to mock
import { fetchWithRetries } from '../fetchWithRetries';
import { DocumentsSidebar } from '../DocumentsSidebar';
import { DocumentContent } from '../DocumentContent';
import { QAHistoryEntry } from '../ChatHistory'; // Import from local employer path

// --- Explicitly Mock Modules ---
// Mock Clerk's useAuth
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(), // Mock the hook itself
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(), // Mock the hook itself
}));

// Mock child components and utilities
jest.mock('../DocumentsSidebar', () => ({ DocumentsSidebar: jest.fn(() => <div data-testid="mock-employer-sidebar">Mock Sidebar</div>) }));
jest.mock('../DocumentContent', () => ({ DocumentContent: jest.fn(() => <div data-testid="mock-employer-content">Mock Document Content</div>) }));
jest.mock('~/app/_components/loading', () => ({ __esModule: true, default: () => <div data-testid="mock-loading-page">Mock Loading Page</div> }));
jest.mock('../loading-doc', () => ({ __esModule: true, default: () => <div data-testid="mock-loading-doc">Mock Loading Doc</div> }));
jest.mock('../fetchWithRetries');
// Mock global fetch (optional, depends if you need it mocked globally or just per test)
// global.fetch = jest.fn(); // Consider mocking fetch inside beforeEach/tests if behavior varies
// --- End Mocks ---

// Type definitions (keep as is)
type SidebarProps = React.ComponentProps<typeof DocumentsSidebar>;
type ContentProps = React.ComponentProps<typeof DocumentContent>;

describe('Employer DocumentViewer Component (page.tsx)', () => {
  // --- Declare mock variables ---
  // It's good practice to type them more specifically if possible
  let mockUseAuth: jest.MockedFunction<typeof useAuth>;
  let mockUseRouter: jest.MockedFunction<typeof useRouter>;
  let mockPush: jest.Mock;
  let mockFetchWithRetries: jest.MockedFunction<typeof fetchWithRetries>;
  let MockedSidebar: jest.Mock; // Keep these if you need to assert calls on the component mocks
  let MockedContent: jest.Mock;

  // Helper function (keep as is)
  const getLatestProps = <T,>(mc: jest.Mock): T | undefined => mc.mock.calls.length > 0 ? mc.mock.calls[mc.mock.calls.length - 1][0] as T : undefined;
  const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

  beforeEach(() => {
    jest.clearAllMocks();

    // --- Assign mocked functions ---
    // Now that jest.mock is used, these imports ARE mock functions
    mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
    mockPush = jest.fn();
    mockFetchWithRetries = fetchWithRetries as jest.MockedFunction<typeof fetchWithRetries>;
    MockedSidebar = DocumentsSidebar as jest.Mock; // Direct assignment after jest.mock
    MockedContent = DocumentContent as jest.Mock; // Direct assignment after jest.mock

    // --- Setup default mock implementations ---
    // Always return the mock router instance
    mockUseRouter.mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
        refresh: jest.fn(), // Add other methods if used
    });
    // Default auth state
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: 'test-employer-id', signOut: jest.fn(), getToken: jest.fn() } as any); // Cast to any or provide all properties if needed
    // Default fetchWithRetries state
    mockFetchWithRetries.mockResolvedValue({ success: true, summarizedAnswer: 'Mock AI Success', recommendedPages: [1] });

    // Default global fetch (ensure it's mocked if tests rely on it)
    global.fetch = jest.fn().mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.endsWith('/api/employerAuth')) { return { ok: true, status: 200, json: async () => ({ success: true, role: 'employer' }) }; }
        if (urlStr.endsWith('/api/fetchDocument')) { return { ok: true, status: 200, json: async () => [] }; } // Default empty docs
        if (urlStr.endsWith('/api/Questions/fetch')) { return { ok: true, status: 200, json: async () => ({ status: 'ok', chatHistory: [] }) }; } // Default empty history
        if (urlStr.endsWith('/api/Questions/add')) { return { ok: true, status: 200, json: async () => ({ success: true }) }; } // Default save success
        // console.warn(`Unhandled fetch mock request: ${urlStr}`);
        return { ok: false, status: 404, json: async () => ({ error: 'Unhandled API mock' }) };
    });
  });

  // --- Tests (Keep all your tests as they were) ---
  test('should show loading page while auth is loading', () => { /* ... */ });
  test('should show loading page while role is checking', async () => { /* ... */ });
  test('should show loading doc while documents are fetching', async () => { /* ... */ });
  test('should render sidebar and content after loading finishes', async () => { /* ... */ });
  test('should redirect to / if no userId after loaded', () => { /* ... */ });
  test('should redirect to pending if employer auth returns status 300', async () => { /* ... */ });
  test('should redirect to / if employer auth fetch fails (non-300)', async () => { /* ... */ });
  test('should redirect to / if employer auth fetch throws error', async () => { /* ... */ });
  test('should handle document fetch error', async () => { /* ... */ });
  test('should handle invalid document data format', async () => { /* ... */ });
  test('should filter documents based on search term', async () => { /* ... */ });
  test('handleAiSearch should not submit if question is empty', async () => { /* ... */ });
  test('handleAiSearch should call fetchWithRetries and save on success', async () => {
      const question = "Q?";
      const answer = "A";
      const pages = [1];
      const doc = { id: 5, title: 'P Doc', category: 'HR', url: 'hr.pdf' };
      // Specific mock for this test (already default, but good practice)
      mockFetchWithRetries.mockResolvedValueOnce({ summarizedAnswer: answer, recommendedPages: pages });

      render(<DocumentViewer />);
      await waitFor(() => expect(screen.getByTestId('mock-employer-sidebar')).toBeInTheDocument());

      // Get latest props passed to mocked components
      const sidebarProps = getLatestProps<SidebarProps>(MockedSidebar);
      const contentProps = getLatestProps<ContentProps>(MockedContent);

      // Simulate selecting a document and typing a question via props passed down
      act(() => { sidebarProps?.setSelectedDoc(doc); });
      // Need to wait for the state update reflected in props
      await waitFor(() => expect(getLatestProps<ContentProps>(MockedContent)?.selectedDoc).toEqual(doc));

      act(() => { getLatestProps<ContentProps>(MockedContent)?.setAiQuestion(question); });
       // Need to wait for the state update reflected in props
      await waitFor(() => expect(getLatestProps<ContentProps>(MockedContent)?.aiQuestion).toEqual(question));

      // Get the latest props again *after* state updates
      const latestContentProps = getLatestProps<ContentProps>(MockedContent);

      // Trigger the search
      await act(async () => {
          // Ensure the function exists before calling
          if(latestContentProps?.handleAiSearch) {
              await latestContentProps.handleAiSearch(mockEvent);
          } else {
              throw new Error("handleAiSearch prop was not passed to MockedContent");
          }
      });

      // Check API calls
      expect(mockFetchWithRetries).toHaveBeenCalledWith(
          '/api/LangChain',
          expect.objectContaining({
              method: 'POST', // Assuming POST
              headers: expect.any(Object),
              body: JSON.stringify({ documentId: doc.id, question: question })
          }),
          5 // Retries
      );

      // Check state updates reflected in props
      await waitFor(() => {
          const finalContentProps = getLatestProps<ContentProps>(MockedContent);
          expect(finalContentProps?.aiAnswer).toBe(answer);
          expect(finalContentProps?.referencePages).toEqual(pages);
          // Check if aiQuestion is cleared (depends on component logic)
          // expect(finalContentProps?.aiQuestion).toBe("");
      });

      // Check if save API was called
      await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith('/api/Questions/add', expect.objectContaining({
              method: 'POST', // Assuming POST
              body: expect.any(String) // More specific check if needed
          }));
      });

      // Check if history state updated (this depends on how history is passed/updated)
      // This assertion might need adjustment based on how state flows
      await waitFor(() => {
        const finalContentPropsAfterSave = getLatestProps<ContentProps>(MockedContent);
        // Check if the new entry exists in the history prop passed down
        expect(finalContentPropsAfterSave?.qaHistory).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    documentId: doc.id,
                    question: question,
                    response: answer // Assuming response is saved too
                })
            ])
        );
      });
  });
  test('handleAiSearch should set error state on fetch failure', async () => { /* ... */ });

  // **ERROR OCCURRED HERE IN PREVIOUS LOG**
  test('handleAiSearch should handle saveToDatabase error', async () => {
    const question = "Save fail?";
    const answer = "A";
    const pages = [1];
    const doc = { id: 6, title: 'S Doc', category: 'S', url: 's.pdf' };
    mockFetchWithRetries.mockResolvedValueOnce({ summarizedAnswer: answer, recommendedPages: pages });

    // --- Specific fetch mock for this test case ---
    // Ensure other fetches still work (auth, get docs, get initial history)
    const initialHistory: QAHistoryEntry[] = []; // Example initial state
    const documents = [doc];
    (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
        const urlStr = url.toString();
        if (urlStr.endsWith('/api/employerAuth')) return { ok: true, status: 200, json: async () => ({ success: true, role: 'employer' }) };
        if (urlStr.endsWith('/api/fetchDocument')) return { ok: true, status: 200, json: async () => documents };
        if (urlStr.endsWith('/api/Questions/fetch')) return { ok: true, status: 200, json: async () => ({ status: 'ok', chatHistory: initialHistory }) };
        // *** Make the save call fail ***
        if (urlStr.endsWith('/api/Questions/add')) throw new Error("Save DB Error");
        // Fallback for other calls if needed
        return { ok: false, status: 404, json: async () => ({ error: 'Unhandled API mock in test' }) };
    });
    // --- End specific fetch mock ---

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<DocumentViewer />);
    await waitFor(() => expect(screen.getByTestId('mock-employer-sidebar')).toBeInTheDocument());

    // Get latest props
    const sidebarProps = getLatestProps<SidebarProps>(MockedSidebar);
    const contentProps = getLatestProps<ContentProps>(MockedContent);

    // Simulate selecting doc and typing question
    act(() => { sidebarProps?.setSelectedDoc(doc); });
    await waitFor(() => expect(getLatestProps<ContentProps>(MockedContent)?.selectedDoc).toEqual(doc));

    act(() => { getLatestProps<ContentProps>(MockedContent)?.setAiQuestion(question); });
    await waitFor(() => expect(getLatestProps<ContentProps>(MockedContent)?.aiQuestion).toEqual(question));

    // Get latest props again before triggering action
    const latestContentProps = getLatestProps<ContentProps>(MockedContent);

    // Trigger the search
    await act(async () => {
        if(latestContentProps?.handleAiSearch) {
          await latestContentProps.handleAiSearch(mockEvent);
        } else {
          throw new Error("handleAiSearch prop was not passed to MockedContent in test");
        }
    });

    // Check LangChain call happened
    expect(mockFetchWithRetries).toHaveBeenCalledWith(
        '/api/LangChain',
        expect.objectContaining({ body: JSON.stringify({ documentId: doc.id, question: question }) }),
        5
    );
    // Check AI Answer was set (even though save failed)
     await waitFor(() => {
          const propsAfterLlm = getLatestProps<ContentProps>(MockedContent);
          expect(propsAfterLlm?.aiAnswer).toBe(answer);
          expect(propsAfterLlm?.referencePages).toEqual(pages);
     });

    // Check the add API call was attempted
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/Questions/add', expect.anything());
    });

    // Check console error was logged because save failed
    await waitFor(() => {
      // *** Adjusted Expectation: The error logged should be about SAVING, not role checking ***
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error saving Q&A to history:", expect.any(Error));
      // expect(consoleErrorSpy).toHaveBeenCalledWith("Error checking employee role:", expect.any(Error)); // This was likely wrong based on the code flow
    });

    // Check that the history state *was not* updated because the save failed
    // It should still contain only the initialHistory fetched earlier
    const finalContentProps = getLatestProps<ContentProps>(MockedContent);
    expect(finalContentProps?.qaHistory).toEqual(initialHistory); // Should NOT contain the new item
    // The previous check `expect(finalContentProps?.qaHistory).toEqual([]);` was likely incorrect
    // if initial history could be non-empty. Comparing to initial state is safer.

    consoleErrorSpy.mockRestore();
  });


  test('should fetch history when selectedDoc changes', async () => { /* ... */ });
  test('should handle error during history fetch', async () => { /* ... */ });
  test('should handle invalid data format during history fetch', async () => { /* ... */ });
  test('selecting a new document should reset page number and AI state', async () => { /* ... */ });

});