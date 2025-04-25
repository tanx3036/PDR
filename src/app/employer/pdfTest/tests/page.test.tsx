// src/app/employer/pdfTest/tests/page.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../page'; // Component under test

// Mock API response
const mockApiResponses: Record<string, { status?: number, ok?: boolean, body?: any, error?: Error }> = {
    '/api/question': { ok: true, status: 200, body: { answer: 'Mock Answer', references: [1, 5] } },
};

global.fetch = jest.fn(async (urlInput) => {
    const url = urlInput.toString();
    const mock = mockApiResponses[url] || { status: 404, ok: false, body: { error: 'Not Found' } };
    if (mock.error) { throw mock.error; }
    return {
        ok: mock.ok ?? true, status: mock.status ?? 200,
        json: async () => mock.body, text: async () => JSON.stringify(mock.body)
    } as Response;
});


describe('pdfTest HomePage Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset API mock to default success
        mockApiResponses['/api/question'] = { ok: true, status: 200, body: { answer: 'Mock Answer', references: [1, 5] } };
    });

    test('should render initial state correctly', () => {
        render(<HomePage />);
        expect(screen.getByRole('heading', { name: /ask about the pdf/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeDisabled(); // Disabled initially
        expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /answer/i })).not.toBeInTheDocument();
    });

    test('should enable button when text is entered', async () => {
        const user = userEvent.setup();
        render(<HomePage />);
        const textarea = screen.getByPlaceholderText(/ask a question/i);
        const button = screen.getByRole('button', { name: /ask/i });

        expect(button).toBeDisabled();
        await user.type(textarea, 'test');
        expect(button).toBeEnabled();
    });

    test('should call API and display answer/references on successful fetch', async () => {
        const user = userEvent.setup();
        render(<HomePage />);
        const textarea = screen.getByPlaceholderText(/ask a question/i);
        const button = screen.getByRole('button', { name: /ask/i });
        const question = 'What is section 1 about?';

        await user.type(textarea, question);
        await user.click(button);

        // Check loading state
        expect(await screen.findByRole('button', { name: /asking/i })).toBeDisabled();

        // Check API call
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('/api/question', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ question })
            }));
        });

        // Check final state
        expect(await screen.findByRole('heading', { name: /answer/i })).toBeInTheDocument();
        expect(screen.getByText('Mock Answer')).toBeInTheDocument(); // From mock response
        expect(screen.getByText(/references \(pages\):/i)).toBeInTheDocument();
        expect(screen.getByText('1, 5')).toBeInTheDocument(); // From mock response
        expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeEnabled(); // Button re-enabled
    });

     test('should display error message if API fetch fails (non-OK response)', async () => {
        const user = userEvent.setup();
        const question = 'Another question';
        mockApiResponses['/api/question'] = { ok: false, status: 500, body: { error: 'Server Error' } }; // Simulate API error response

        render(<HomePage />);
        const textarea = screen.getByPlaceholderText(/ask a question/i);
        const button = screen.getByRole('button', { name: /ask/i });

        await user.type(textarea, question);
        await user.click(button);

        expect(await screen.findByRole('button', { name: /asking/i })).toBeDisabled();

        // Check final state
        expect(await screen.findByText(/error: server error/i)).toBeInTheDocument(); // Check specific error
        expect(screen.queryByRole('heading', { name: /answer/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeEnabled();
    });

      test('should display error message if API fetch throws network error', async () => {
        const user = userEvent.setup();
        const question = 'Network error question';
        mockApiResponses['/api/question'] = { error: new Error("Network Failed") }; // Simulate fetch throw

        render(<HomePage />);
        const textarea = screen.getByPlaceholderText(/ask a question/i);
        const button = screen.getByRole('button', { name: /ask/i });

        await user.type(textarea, question);
        await user.click(button);

        expect(await screen.findByRole('button', { name: /asking/i })).toBeDisabled();

        // Check final state
        expect(await screen.findByText(/error: network failed/i)).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /answer/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeEnabled();
    });

     test('should handle non-object JSON response', async () => {
        const user = userEvent.setup();
        const question = 'Bad JSON question';
         mockApiResponses['/api/question'] = { ok: true, status: 200, body: "just a string" }; // Invalid JSON structure

        render(<HomePage />);
        const textarea = screen.getByPlaceholderText(/ask a question/i);
        const button = screen.getByRole('button', { name: /ask/i });

        await user.type(textarea, question);
        await user.click(button);

        expect(await screen.findByRole('button', { name: /asking/i })).toBeDisabled();

        // Check final state
        expect(await screen.findByText(/error: invalid response from server/i)).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /answer/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeEnabled();
    });


});