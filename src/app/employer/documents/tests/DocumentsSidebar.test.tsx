// src/app/employer/documents/tests/DocumentsSidebar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react'; // Removed fireEvent as userEvent is used
import userEvent from '@testing-library/user-event';
import { DocumentsSidebar } from '../DocumentsSidebar'; // Adjust path if needed
import { ViewMode } from '../types'; // Adjust path if needed

// Mock Next.js router and Link
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode, href: string}) => <a href={href}>{children}</a>
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Brain: () => <div data-testid="icon-brain">Brain</div>,
  Search: () => <div data-testid="icon-search">Search</div>,
  FileText: () => <div data-testid="icon-filetext">File</div>,
  ChevronDown: () => <div data-testid="icon-chevrondown">Down</div>,
  ChevronRight: () => <div data-testid="icon-chevronright">Right</div>,
  Home: () => <div data-testid="icon-home">Home</div>,
}));


describe('Employer DocumentsSidebar Component', () => {
  const mockSetSearchTerm = jest.fn();
  const mockSetSelectedDoc = jest.fn();
  const mockSetViewMode = jest.fn();

  const mockDoc1 = { id: 1, title: 'Employer Doc 1', category: 'Reports', url: 'r1.pdf' };
  const mockDoc2 = { id: 2, title: 'Employer Doc 2', category: 'Reports', url: 'r2.pdf' };
  const mockDoc3 = { id: 3, title: 'Manual', category: 'Guides', url: 'm1.pdf' };

  const mockCategories = [
    { name: 'Reports', isOpen: true, documents: [mockDoc1, mockDoc2] },
    { name: 'Guides', isOpen: true, documents: [mockDoc3] },
  ];

  const defaultProps = {
    categories: mockCategories,
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    selectedDoc: null,
    setSelectedDoc: mockSetSelectedDoc,
    viewMode: 'document-only' as ViewMode,
    setViewMode: mockSetViewMode,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render logo, search bar, and view mode buttons', () => {
    render(<DocumentsSidebar {...defaultProps} />);
    expect(screen.getByText(/PDR AI/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /document only/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai q&a \+ doc/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai q&a history \+ doc/i })).toBeInTheDocument();
  });

  test('should render categories and documents correctly when open', () => {
      render(<DocumentsSidebar {...defaultProps} />);
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Guides')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /employer doc 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /employer doc 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manual/i })).toBeInTheDocument();
      expect(screen.getAllByTestId('icon-chevrondown')).toHaveLength(mockCategories.length);
  });

  test.todo('should handle category expand/collapse click');

  test('should call setSearchTerm when search input changes', async () => {
    const user = userEvent.setup();
    render(<DocumentsSidebar {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/search documents/i);
    await user.type(searchInput, 'report');
    expect(mockSetSearchTerm).toHaveBeenCalled();
    // This assertion SHOULD pass with userEvent.type
    expect(mockSetSearchTerm).toHaveBeenLastCalledWith('report');
  });

  test('should call setSelectedDoc when a document item is clicked', async () => {
     const user = userEvent.setup();
     render(<DocumentsSidebar {...defaultProps} />);
     const docButton = screen.getByRole('button', { name: /manual/i });
     await user.click(docButton);
     expect(mockSetSelectedDoc).toHaveBeenCalledTimes(1);
     expect(mockSetSelectedDoc).toHaveBeenCalledWith(mockDoc3);
  });

  test('should highlight the selected document', () => {
    // Assuming CSS class 'selected' is added to the selected button
    render(<DocumentsSidebar {...defaultProps} selectedDoc={mockDoc1} />);
    const selectedButton = screen.getByRole('button', { name: /employer doc 1/i });
    // Use a flexible class check if CSS Modules mangles names
    expect(selectedButton).toHaveClass('selected'); // Simple check
    // Or check for presence of a specific data attribute if classes are unstable
    // expect(selectedButton).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: /employer doc 2/i })).not.toHaveClass('selected');
  });

  test('should call setViewMode when view mode buttons are clicked', async () => {
     const user = userEvent.setup();
     render(<DocumentsSidebar {...defaultProps} />);
     const aiButton = screen.getByRole('button', { name: /ai q&a \+ doc/i });
     await user.click(aiButton);
     expect(mockSetViewMode).toHaveBeenCalledTimes(1);
     expect(mockSetViewMode).toHaveBeenCalledWith('with-ai-qa');

     const historyButton = screen.getByRole('button', { name: /ai q&a history \+ doc/i });
     await user.click(historyButton);
     expect(mockSetViewMode).toHaveBeenCalledTimes(2);
     expect(mockSetViewMode).toHaveBeenCalledWith('with-ai-qa-history');
  });

   test('should apply active class to the current view mode button', () => {
     // Assuming CSS class 'activeViewMode' is added
     render(<DocumentsSidebar {...defaultProps} viewMode="with-ai-qa" />);
     const aiButton = screen.getByRole('button', { name: /ai q&a \+ doc/i });
     expect(aiButton).toHaveClass('activeViewMode');
     expect(screen.getByRole('button', { name: /document only/i })).not.toHaveClass('activeViewMode');
   });

   test('should render Home link correctly', () => {
       render(<DocumentsSidebar {...defaultProps} />);
       const homeLink = screen.getByRole('link', { name: /home/i });
       expect(homeLink).toBeInTheDocument();
       expect(homeLink).toHaveAttribute('href', '/employer/home');
       expect(screen.getByTestId('icon-home')).toBeInTheDocument();
   });

});