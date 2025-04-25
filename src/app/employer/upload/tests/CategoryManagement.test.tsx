// src/app/employer/upload/tests/CategoryManagement.test.tsx
import React from 'react';
// Import waitFor and within
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryManagement from '../CategoryManagement'; // Adjust path
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@clerk/nextjs');
jest.mock('next/navigation');
jest.mock('lucide-react', () => ({ Trash2: () => <div data-testid="icon-trash">T</div> }));

describe('CategoryManagement Component', () => {
    const mockOnAddCategory = jest.fn().mockResolvedValue(undefined);
    const mockOnRemoveCategory = jest.fn().mockResolvedValue(undefined);
    const mockPush = jest.fn(); // Keep mockPush if redirect is intended
    const mockRefresh = jest.fn();
    const mockUserId = 'test-user-cat';

    const mockCategories = [
        { id: 'cat1', name: 'Reports' },
        { id: 'cat2', name: 'Manuals' },
    ];

    const defaultProps = {
        categories: mockCategories,
        onAddCategory: mockOnAddCategory,
        onRemoveCategory: mockOnRemoveCategory,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ userId: mockUserId });
        // Provide refresh in the mock router return value
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: mockRefresh });
        mockOnAddCategory.mockClear().mockResolvedValue(undefined);
        mockOnRemoveCategory.mockClear().mockResolvedValue(undefined);
        mockPush.mockClear(); // Clear push mock too
        mockRefresh.mockClear(); // Clear refresh mock
    });

    test('should render title and category list', () => {
        render(<CategoryManagement {...defaultProps} />);
        expect(screen.getByRole('heading', { name: /manage categories/i })).toBeInTheDocument();
        expect(screen.getByText('Reports')).toBeInTheDocument();
        expect(screen.getByText('Manuals')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getAllByTestId('icon-trash')).toHaveLength(2);
    });

    test('should render input field and add button', () => {
        render(<CategoryManagement {...defaultProps} />);
        expect(screen.getByPlaceholderText(/new category name/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
    });

    test('should update newCategory state on input change', async () => {
        const user = userEvent.setup();
        render(<CategoryManagement {...defaultProps} />);
        const input = screen.getByPlaceholderText(/new category name/i);
        await user.type(input, 'Invoices');
        expect(input).toHaveValue('Invoices');
    });

    // FIX for #6: Added waitFor for async assertions
    test('should call onAddCategory and clear input on form submit', async () => {
        const user = userEvent.setup();
        render(<CategoryManagement {...defaultProps} />);
        const input = screen.getByPlaceholderText(/new category name/i);
        const addButton = screen.getByRole('button', { name: /add category/i });
        const newCatName = 'Contracts';

        await user.type(input, newCatName);
        expect(input).toHaveValue(newCatName);

        await user.click(addButton);

        // Wait for async call and state updates
        await waitFor(() => {
             expect(mockOnAddCategory).toHaveBeenCalledTimes(1);
             expect(mockOnAddCategory).toHaveBeenCalledWith(mockUserId, newCatName);
        });

        // Input clearing might happen slightly after the mock call resolves
        await waitFor(() => {
            expect(input).toHaveValue("");
        });
        // Refresh should be called after successful add (if intended)
        await waitFor(() => {
            expect(mockRefresh).toHaveBeenCalledTimes(1);
        });
    });

     test('should not call onAddCategory if input is empty', async () => {
        const user = userEvent.setup();
        render(<CategoryManagement {...defaultProps} />);
        const addButton = screen.getByRole('button', { name: /add category/i });
        await user.click(addButton); // Click with empty input
        expect(mockOnAddCategory).not.toHaveBeenCalled();
        expect(mockRefresh).not.toHaveBeenCalled(); // Refresh shouldn't happen
    });

     test('should not call onAddCategory if userId is null', async () => {
         const user = userEvent.setup();
        (useAuth as jest.Mock).mockReturnValue({ userId: null });
        render(<CategoryManagement {...defaultProps} />);
        const input = screen.getByPlaceholderText(/new category name/i);
        const addButton = screen.getByRole('button', { name: /add category/i });
        await user.type(input, 'Wont Add');
        await user.click(addButton);
        expect(mockOnAddCategory).not.toHaveBeenCalled();
        expect(mockRefresh).not.toHaveBeenCalled();
     });

    // FIX for #7: Use within, add waitFor
    test('should call onRemoveCategory and router.refresh when remove button is clicked', async () => {
        const user = userEvent.setup();
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

        render(<CategoryManagement {...defaultProps} />);
        // Find the list item containing 'Manuals', then the button within it
        const manualsItem = screen.getByText('Manuals').closest('li');
        expect(manualsItem).toBeInTheDocument();
        const removeButton = within(manualsItem!).getByRole('button'); // Use within

        await user.click(removeButton);

        expect(confirmSpy).toHaveBeenCalledTimes(1);
        // Wait for async handler and subsequent refresh
        await waitFor(() => {
           expect(mockOnRemoveCategory).toHaveBeenCalledTimes(1);
           expect(mockOnRemoveCategory).toHaveBeenCalledWith('cat2'); // ID of 'Manuals'
        });
        await waitFor(() => {
             expect(mockRefresh).toHaveBeenCalledTimes(1);
        });

        confirmSpy.mockRestore();
    });

     // FIX for #8: Use within
     test('should not call onRemoveCategory if confirm returns false', async () => {
         const user = userEvent.setup();
         const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => false);
         render(<CategoryManagement {...defaultProps} />);
         // Find the button associated with 'Reports' reliably
         const reportsItem = screen.getByText('Reports').closest('li');
         expect(reportsItem).toBeInTheDocument();
         const removeButton = within(reportsItem!).getByRole('button'); // Use within

         await user.click(removeButton);

         expect(confirmSpy).toHaveBeenCalledTimes(1);
         expect(mockOnRemoveCategory).not.toHaveBeenCalled();
         expect(mockRefresh).not.toHaveBeenCalled();

         confirmSpy.mockRestore();
     });

    // FIX for #9: Added waitFor
    test('should handle error during onAddCategory', async () => {
         const user = userEvent.setup();
         const error = new Error("Failed to add");
         mockOnAddCategory.mockRejectedValueOnce(error);
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         render(<CategoryManagement {...defaultProps} />);
         const input = screen.getByPlaceholderText(/new category name/i);
         const addButton = screen.getByRole('button', { name: /add category/i });

         await user.type(input, 'Error Case');
         await user.click(addButton);

         // Wait for the async function call to potentially reject
         await waitFor(() => {
             expect(mockOnAddCategory).toHaveBeenCalled();
         });
         // Check console error and ensure no refresh/input clear
         expect(consoleErrorSpy).toHaveBeenCalledWith("Error adding category:", error);
         expect(mockRefresh).not.toHaveBeenCalled();
         expect(input).toHaveValue('Error Case'); // Input should retain value on error

         consoleErrorSpy.mockRestore();
    });

    // FIX for #10: Added waitFor
    test('should handle error during onRemoveCategory', async () => {
         const user = userEvent.setup();
         const error = new Error("Failed to remove");
         mockOnRemoveCategory.mockRejectedValueOnce(error);
         const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
         const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

         render(<CategoryManagement {...defaultProps} />);
         // Find button reliably (e.g., associated with 'Manuals')
         const manualsItem = screen.getByText('Manuals').closest('li');
         expect(manualsItem).toBeInTheDocument();
         const removeButton = within(manualsItem!).getByRole('button'); // Use within

         await user.click(removeButton);

         // Wait for the async function call to potentially reject
          await waitFor(() => {
             expect(mockOnRemoveCategory).toHaveBeenCalled();
         });
         // Check console error and ensure no refresh
         expect(consoleErrorSpy).toHaveBeenCalledWith("Error removing category:", error);
         expect(mockRefresh).not.toHaveBeenCalled();

         confirmSpy.mockRestore();
         consoleErrorSpy.mockRestore();
    });

});