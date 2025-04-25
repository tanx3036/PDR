// src/app/employee/documents/DocumentContent.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentContent } from '../DocumentContent';
import QAHistory from '~/app/employer/documents/ChatHistory'; // Using alias
import { ViewMode } from '../types';
import { QAHistoryEntry } from '~/app/employer/documents/ChatHistory';

describe('DocumentContent Component', () => {
  const mockSetAiQuestion = jest.fn();
  const mockHandleAiSearch = jest.fn((e) => e?.preventDefault()); // Handle optional event
  const mockSetPdfPageNumber = jest.fn();

   const defaultDoc = {
       id: 1, title: 'Test Document Title', category: 'Test', url: 'http://example.com/doc.pdf', aiSummary: 'Optional summary'
   };

  const defaultProps = {
    selectedDoc: defaultDoc, viewMode: 'document-only' as ViewMode, aiQuestion: '', setAiQuestion: mockSetAiQuestion, aiAnswer: '', aiError: '', aiLoading: false, handleAiSearch: mockHandleAiSearch, referencePages: [], pdfPageNumber: 1, setPdfPageNumber: mockSetPdfPageNumber, qaHistory: [] as QAHistoryEntry[],
  };

  beforeEach(() => { jest.clearAllMocks(); })

  test('should render "Select a document" when selectedDoc is null', () => {
    render(<DocumentContent {...defaultProps} selectedDoc={null} />);
    expect(screen.getByRole('heading', { name: /select a document/i })).toBeInTheDocument();
  });

  test('should render document title and PDF viewer in document-only mode', () => {
    render(<DocumentContent {...defaultProps} viewMode="document-only" />);
    expect(screen.getByRole('heading', { name: defaultDoc.title })).toBeInTheDocument();
    const iframe = screen.getByTitle(defaultDoc.title) as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe(`${defaultDoc.url}#page=1`);
    expect(screen.queryByRole('heading', { name: /ai q&a/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /question history/i })).not.toBeInTheDocument();
  });

   test('should update iframe src when pdfPageNumber prop changes', () => {
     const { rerender } = render(<DocumentContent {...defaultProps} pdfPageNumber={1} />);
     const iframe = screen.getByTitle(defaultDoc.title) as HTMLIFrameElement;
     expect(iframe.src).toBe(`${defaultDoc.url}#page=1`);
     rerender(<DocumentContent {...defaultProps} pdfPageNumber={5} />);
     const updatedIframe = screen.getByTitle(defaultDoc.title) as HTMLIFrameElement;
     expect(updatedIframe.src).toBe(`${defaultDoc.url}#page=5`);
   });

  test('should render AI Q&A section in with-ai-qa mode', () => {
    render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" />);
    expect(screen.getByRole('heading', { name: /ai q&a/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask ai/i })).toBeInTheDocument();
  });

  test('should call setAiQuestion on input change', async () => {
    const user = userEvent.setup();
    render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" />);
    const input = screen.getByPlaceholderText(/ask a question/i);
    await user.type(input, 'test question');
    expect(mockSetAiQuestion).toHaveBeenCalled();
  });

  test('should call handleAiSearch on form submit', async () => {
     const user = userEvent.setup();
     render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" aiQuestion="test"/>); // Ensure button is enabled
     const button = screen.getByRole('button', { name: /ask ai/i });
     await user.click(button);
     expect(mockHandleAiSearch).toHaveBeenCalledTimes(1);
  });

  test('should display AI answer and reference pages when provided', () => {
    const answer = "This is the AI answer.";
    const pages = [2, 5];
    render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" aiAnswer={answer} referencePages={pages} />);
    expect(screen.getByText(answer)).toBeInTheDocument();
    expect(screen.getByText(/reference pages/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /page 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /page 5/i })).toBeInTheDocument();
  });

   test('should call setPdfPageNumber when a reference page button is clicked', async () => {
       const user = userEvent.setup();
       const pages = [2, 5];
       render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" aiAnswer="Answer" referencePages={pages} />);
       const pageButton = screen.getByRole('button', { name: /page 5/i });
       await user.click(pageButton);
       expect(mockSetPdfPageNumber).toHaveBeenCalledWith(5);
   });

  test('should display AI error message when provided', () => {
    const error = "An error occurred.";
    render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" aiError={error} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });

   test('should display "Asking AI..." on button when aiLoading is true', () => {
      render(<DocumentContent {...defaultProps} viewMode="with-ai-qa" aiLoading={true} />);
      expect(screen.getByRole('button', { name: /asking ai/i })).toBeInTheDocument();
  });

  test('should render QA History section in with-ai-qa-history mode', () => {
     const testDate = new Date().toISOString();
     const history: QAHistoryEntry[] = [{ id: 'h1', question: 'Q1', response: 'A1', createdAt: testDate, documentId: 1, documentTitle: 'Doc 1', pages: [1] }];
     render(<DocumentContent {...defaultProps} viewMode="with-ai-qa-history" qaHistory={history}/>);
     expect(screen.getByRole('heading', { name: /question history/i })).toBeInTheDocument();
     expect(screen.getByText(/Q1/i)).toBeInTheDocument();
     expect(screen.queryByRole('heading', { name: /ai q&a/i })).not.toBeInTheDocument();
  });
});