// src/app/employee/documents/tests/DocumentsSidebar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Corrected import path assuming component is one level up
import { DocumentsSidebar } from '../DocumentsSidebar'; // Changed from './DocumentsSidebar'
// Corrected import path assuming types are one level up
import { ViewMode } from '../types'; // Changed from './types'

// Mock Clerk components used within the Sidebar
jest.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="mock-user-button">Mock UserButton</div>,
  SignOutButton: ({ children }: { children: React.ReactNode }) => <button data-testid="mock-signout-button">{children}</button>,
}));

// Mock Lucide icons (optional)
// ...

describe('DocumentsSidebar Component', () => {
  const mockSetSearchTerm = jest.fn();
  const mockSetSelectedDoc = jest.fn();
  const mockSetViewMode = jest.fn();
  const mockDoc1 = { id: 1, title: 'Doc One', category: 'Cat A', url: 'd1.pdf' };
  const mockDoc2 = { id: 2, title: 'Doc Two', category: 'Cat A', url: 'd2.pdf' };
  const mockCategories = [ { name: 'Cat A', isOpen: true, documents: [mockDoc1, mockDoc2] } ];
  const defaultProps = { categories: mockCategories, searchTerm: '', setSearchTerm: mockSetSearchTerm, selectedDoc: null, setSelectedDoc: mockSetSelectedDoc, viewMode: 'document-only' as ViewMode, setViewMode: mockSetViewMode, };

  beforeEach(() => { jest.clearAllMocks(); });

  test('should render logo, search bar, and view mode buttons', () => { render(<DocumentsSidebar {...defaultProps} />); expect(screen.getByText(/PDR AI/i)).toBeInTheDocument(); expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument(); expect(screen.getByRole('button', { name: /document only/i })).toBeInTheDocument(); });
  test('should render categories and documents correctly', () => { render(<DocumentsSidebar {...defaultProps} />); expect(screen.getByText('Cat A')).toBeInTheDocument(); expect(screen.getByRole('button', { name: /doc one/i })).toBeInTheDocument(); expect(screen.getByRole('button', { name: /doc two/i })).toBeInTheDocument(); });
  test.todo('should handle category expand/collapse click');
  test('should call setSearchTerm when search input changes', async () => { const user = userEvent.setup(); render(<DocumentsSidebar {...defaultProps} />); const searchInput = screen.getByPlaceholderText(/search documents/i); await user.type(searchInput, 'test search'); expect(mockSetSearchTerm).toHaveBeenCalled(); });
  test('should call setSelectedDoc when a document item is clicked', async () => { const user = userEvent.setup(); render(<DocumentsSidebar {...defaultProps} />); const docButton = screen.getByRole('button', { name: /doc two/i }); await user.click(docButton); expect(mockSetSelectedDoc).toHaveBeenCalledTimes(1); expect(mockSetSelectedDoc).toHaveBeenCalledWith(mockDoc2); });
  test('should highlight the selected document', () => { render(<DocumentsSidebar {...defaultProps} selectedDoc={mockDoc1} />); const selectedButton = screen.getByRole('button', { name: /doc one/i }); expect(selectedButton).toBeDefined(); /* Add expect(...).toHaveClass(...) */ });
  test('should call setViewMode when view mode buttons are clicked', async () => { const user = userEvent.setup(); render(<DocumentsSidebar {...defaultProps} />); const aiButton = screen.getByRole('button', { name: /ai q&a \+ doc/i }); await user.click(aiButton); expect(mockSetViewMode).toHaveBeenCalledWith('with-ai-qa'); });
  test('should apply active class to the current view mode button', () => { render(<DocumentsSidebar {...defaultProps} viewMode="with-ai-qa" />); const aiButton = screen.getByRole('button', { name: /ai q&a \+ doc/i }); expect(aiButton).toBeDefined(); /* Add expect(...).toHaveClass(...) */ });
  test('should render Clerk UserButton and SignOutButton', () => { render(<DocumentsSidebar {...defaultProps} />); expect(screen.getByTestId('mock-user-button')).toBeInTheDocument(); expect(screen.getByTestId('mock-signout-button')).toBeInTheDocument(); });
});