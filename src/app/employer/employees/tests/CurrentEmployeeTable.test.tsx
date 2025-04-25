// src/app/employer/employees/tests/CurrentEmployeeTable.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react'; // Import within
import userEvent from '@testing-library/user-event';
import EmployeeTable from '../CurrentEmployeeTable'; // Adjust path if needed
import { Employee } from '../types'; // Adjust path if needed

// Mock Lucide icon
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="icon-trash">Remove</div>, // Add text for button name
}));

describe('EmployeeTable (CurrentEmployeeTable) Component', () => {
  const mockOnRemove = jest.fn();

  const mockEmployees: Employee[] = [
    { id: '1', name: 'Alice (Owner)', email: 'alice@test.com', role: 'owner', status: 'verified' },
    { id: '2', name: 'Bob (Employer)', email: 'bob@test.com', role: 'employer', status: 'verified' },
    { id: '3', name: 'Charlie (Employee)', email: 'charlie@test.com', role: 'employee', status: 'verified' },
    { id: '4', name: 'Diana (Employee)', email: 'diana@test.com', role: 'employee', status: 'verified' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render "No approved employees yet" when employees array is empty', () => {
    render(<EmployeeTable employees={[]} onRemove={mockOnRemove} currentUserRole="owner" />);
    expect(screen.getByText(/no approved employees yet/i)).toBeInTheDocument();
  });

  test('should render table headers correctly', () => {
    render(<EmployeeTable employees={mockEmployees} onRemove={mockOnRemove} currentUserRole="owner" />);
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /action/i })).toBeInTheDocument();
  });

  test('should render employee data correctly, displaying "admin" for "employer" role', () => {
    render(<EmployeeTable employees={mockEmployees} onRemove={mockOnRemove} currentUserRole="owner" />);
    // FIX (#9, #10, #11): Use exact text for cell queries where possible
    expect(screen.getByRole('cell', { name: 'Alice (Owner)' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'bob@test.com' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Charlie (Employee)' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'diana@test.com' })).toBeInTheDocument();

    const aliceCell = screen.getByRole('cell', { name: 'Alice (Owner)' });
    const bobCell = screen.getByRole('cell', { name: 'Bob (Employer)' });
    const charlieCell = screen.getByRole('cell', { name: 'Charlie (Employee)' });
    expect(aliceCell.closest('tr')).toHaveTextContent(/owner/);
    expect(bobCell.closest('tr')).toHaveTextContent(/admin/);
    expect(charlieCell.closest('tr')).toHaveTextContent(/employee/);
  });

  describe('Remove Button Visibility (shouldShowTrash logic)', () => {
    test('owner should see remove button for employer and employee', () => {
      render(<EmployeeTable employees={mockEmployees} onRemove={mockOnRemove} currentUserRole="owner" />);
      // FIX (#9): Use exact name for cell query
      const aliceRow = screen.getByRole('cell', { name: 'Alice (Owner)' }).closest('tr');
      const bobRow = screen.getByRole('cell', { name: 'Bob (Employer)' }).closest('tr');
      const charlieRow = screen.getByRole('cell', { name: 'Charlie (Employee)' }).closest('tr');

      expect(within(aliceRow!).queryByRole('button', {name: /remove/i})).not.toBeInTheDocument();
      expect(within(bobRow!).getByRole('button', {name: /remove/i})).toBeInTheDocument();
      expect(within(charlieRow!).getByRole('button', {name: /remove/i})).toBeInTheDocument();
    });

    test('employer should see remove button only for employee', () => {
        const employeesForEmployer = mockEmployees.filter(e => e.role !== 'owner');
        render(<EmployeeTable employees={employeesForEmployer} onRemove={mockOnRemove} currentUserRole="employer" />);
        // FIX (#10): Use exact name for cell query
        const bobRow = screen.getByRole('cell', { name: 'Bob (Employer)' }).closest('tr');
        const charlieRow = screen.getByRole('cell', { name: 'Charlie (Employee)' }).closest('tr');

        expect(within(bobRow!).queryByRole('button', {name: /remove/i})).not.toBeInTheDocument();
        expect(within(charlieRow!).getByRole('button', {name: /remove/i})).toBeInTheDocument();
    });

     test('employee should not see any remove buttons', () => {
        render(<EmployeeTable employees={mockEmployees} onRemove={mockOnRemove} currentUserRole="employee" />);
        mockEmployees.forEach(emp => {
            // FIX: Use exact name for cell query
            const nameCell = screen.getByRole('cell', { name: emp.name }); // Use exact name
            const row = nameCell.closest('tr');
            expect(row).toBeInTheDocument();
            expect(within(row!).queryByRole('button', {name: /remove/i})).not.toBeInTheDocument();
        });
     });
  });

  test('should call onRemove with correct employee ID when remove button is clicked', async () => {
     const user = userEvent.setup();
     render(<EmployeeTable employees={mockEmployees} onRemove={mockOnRemove} currentUserRole="owner" />);
     // FIX (#11): Use exact name for cell query
     const charlieRow = screen.getByRole('cell', { name: 'Charlie (Employee)' }).closest('tr');
     expect(charlieRow).toBeInTheDocument();
     const removeButton = within(charlieRow!).getByRole('button', {name: /remove/i});

     await user.click(removeButton);

     expect(mockOnRemove).toHaveBeenCalledTimes(1);
     expect(mockOnRemove).toHaveBeenCalledWith('3');
  });

});