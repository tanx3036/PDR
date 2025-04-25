// src/app/employer/documents/tests/ChatHistory.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; // waitFor 已经导入
import userEvent from '@testing-library/user-event';

// --- Corrected component import path (assuming test is in 'tests' subdir) ---
import QAHistory, { QAHistoryEntry } from '../ChatHistory'; // 从上一级目录导入
// --- End Correction ---

// --- Mocks ---

// Mock dayjs to return a consistent date format for testing
jest.mock('dayjs', () => {
  const dayjs = jest.requireActual('dayjs');
  const mockFormat = jest.fn(() => 'Mocked Date 1/1/2024'); // 返回一个固定的模拟日期字符串
  const mockDayjsInstance = { format: mockFormat };
  const mockDayjs = jest.fn(() => mockDayjsInstance);
  Object.assign(mockDayjs, dayjs);
  return mockDayjs;
});


// Mock Lucide icons for simplicity
jest.mock('lucide-react', () => ({
  Clock: () => <div data-testid="icon-clock">Clock</div>,
  ChevronDown: (props: any) => <div data-testid="icon-chevron-down" {...props}>v</div>, // Pass props to allow click
  ChevronUp: (props: any) => <div data-testid="icon-chevron-up" {...props}>^</div>,   // Pass props to allow click
}));

// --- End Mocks ---


describe('QAHistory Component', () => {
  const mockOnQuestionSelect = jest.fn();
  const mockSetPdfPageNumber = jest.fn();

  const mockHistoryEmpty: QAHistoryEntry[] = [];

  // Use slightly different dates to ensure order isn't assumed
  const mockHistoryItems: QAHistoryEntry[] = [
    { id: 'q1', question: 'Question One?', response: 'Answer One.', createdAt: new Date(2024, 0, 1, 10, 30, 0).toISOString(), documentId: 1, documentTitle: 'Doc Alpha', pages: [1, 2] },
    { id: 'q2', question: 'Question Two', response: 'Answer Two.', createdAt: new Date(2024, 0, 1, 9, 0, 0).toISOString(), documentId: 1, documentTitle: 'Doc Alpha', pages: [3] },
    { id: 'q3', question: 'No Pages Item', response: 'Answer Three.', createdAt: new Date(2024, 0, 1, 8, 0, 0).toISOString(), documentId: 2, documentTitle: 'Doc Beta', pages: [] },
  ];

  // Default props based on component usage
  const defaultProps = {
    history: mockHistoryItems,
    onQuestionSelect: mockOnQuestionSelect,
    setPdfPageNumber: mockSetPdfPageNumber,
    // Props below seem unused by component itself, pass null/empty if required by type
    documentTitle: "", // Likely unused internally, uses item.documentTitle
    selectedDoc: null,  // Likely unused internally
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear dayjs mock calls
     const mockDayjs = require('dayjs');
     if (mockDayjs()?.format?.mockClear) {
         mockDayjs().format.mockClear();
     }
  });

  test('should render "No questions asked yet" message when history is empty', () => {
    render(<QAHistory {...defaultProps} history={mockHistoryEmpty} />);
    expect(screen.getByText(/no questions asked yet/i)).toBeInTheDocument();
  });

  test('should render list of history items with questions, dates, and titles', () => {
    render(<QAHistory {...defaultProps} history={mockHistoryItems} />);
    expect(screen.getByRole('button', { name: /question one\?/i})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /question two/i})).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no pages item/i})).toBeInTheDocument();
    expect(screen.getAllByText(/doc alpha/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/doc beta/i)).toBeInTheDocument();
    expect(screen.getAllByText('Mocked Date 1/1/2024').length).toBe(mockHistoryItems.length); // Check mocked date
    expect(screen.queryByText('Answer One.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /page 1/i })).not.toBeInTheDocument();
  });

  test('should call onQuestionSelect with the question when question button is clicked', async () => {
    const user = userEvent.setup();
    render(<QAHistory {...defaultProps} history={mockHistoryItems} />);
    const questionButton = screen.getByRole('button', { name: /question two/i });
    await user.click(questionButton);
    expect(mockOnQuestionSelect).toHaveBeenCalledTimes(1);
    expect(mockOnQuestionSelect).toHaveBeenCalledWith(mockHistoryItems[1]?.question);
  });

  test('should toggle item expansion when chevron button is clicked', async () => {
    const user = userEvent.setup();
    render(<QAHistory {...defaultProps} history={mockHistoryItems} />);
    const toggleButtons = screen.getAllByTestId('icon-chevron-down');
    const firstToggleButton = toggleButtons[0]!; // Use non-null assertion after check

    expect(firstToggleButton).toBeInTheDocument();
    expect(screen.queryByText('Answer One.')).not.toBeInTheDocument();

    // Expand
    await user.click(firstToggleButton);
    expect(await screen.findByText('Answer One.')).toBeVisible();
    expect(screen.getByRole('button', { name: /page 1/i })).toBeVisible();
    expect(screen.getByTestId('icon-chevron-up')).toBeInTheDocument(); // Check icon change

     // Collapse again
     const collapseButton = screen.getByTestId('icon-chevron-up');
     await user.click(collapseButton);
     await waitFor(() => {
         expect(screen.queryByText('Answer One.')).not.toBeInTheDocument();
     });
     expect(screen.queryByRole('button', { name: /page 1/i })).not.toBeInTheDocument();
     expect(screen.queryByTestId('icon-chevron-up')).not.toBeInTheDocument();
     expect(screen.getAllByTestId('icon-chevron-down').length).toBe(mockHistoryItems.length);
  });

   test('should not render reference pages section if item.pages is empty when expanded', async () => {
     const user = userEvent.setup();
     render(<QAHistory {...defaultProps} history={mockHistoryItems} />);
     const toggleButtons = screen.getAllByTestId('icon-chevron-down');
     const thirdToggleButton = toggleButtons[2]!; // Item with no pages

     await user.click(thirdToggleButton);
     expect(await screen.findByText('Answer Three.')).toBeVisible();
     expect(screen.queryByText(/reference pages:/i)).not.toBeInTheDocument();
     expect(screen.queryByRole('button', { name: /page \d/i })).not.toBeInTheDocument();
   });

   test('should call setPdfPageNumber with correct page when a reference page button is clicked', async () => {
       const user = userEvent.setup();
       render(<QAHistory {...defaultProps} history={mockHistoryItems} />);
       const toggleButtons = screen.getAllByTestId('icon-chevron-down');
       const firstToggleButton = toggleButtons[0]!;
       await user.click(firstToggleButton); // Expand first item
       const pageButton = await screen.findByRole('button', { name: /page 2/i });
       await user.click(pageButton);
       expect(mockSetPdfPageNumber).toHaveBeenCalledTimes(1);
       expect(mockSetPdfPageNumber).toHaveBeenCalledWith(2);
   });

   test('should format date using dayjs with correct format string', () => {
       const mockDayjs = require('dayjs');
       render(<QAHistory {...defaultProps} history={mockHistoryItems} />);
       expect(mockDayjs).toHaveBeenCalledTimes(mockHistoryItems.length);
       expect(screen.getAllByText('Mocked Date 1/1/2024').length).toBe(mockHistoryItems.length);
       expect(mockDayjs().format).toHaveBeenCalledTimes(mockHistoryItems.length);
       expect(mockDayjs().format).toHaveBeenCalledWith("M/D/YYYY, h:mm:ss A");
   });

});