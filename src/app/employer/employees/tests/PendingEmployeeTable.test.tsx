// src/app/employer/employees/tests/PendingEmployeeTable.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PendingEmployeeTable from '../PendingEmployeeTable'; // Adjust path if needed
import { Employee } from '../types'; // Adjust path if needed

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="icon-trash">Trash</div>,
  CheckCircle: () => <div data-testid="icon-check">Check</div>,
}));

describe('PendingEmployeeTable Component', () => {
  const mockOnApprove = jest.fn();
  const mockOnRemove = jest.fn();

  const mockPendingEmployees: Employee[] = [
    { id: 'p1', name: 'Pending Eva', email: 'eva@test.com', role: 'employee', status: 'pending' },
    { id: 'p2', name: 'Pending Frank (Admin)', email: 'frank@test.com', role: 'employer', status: 'pending' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render "No pending employees." when employees array is empty', () => {
    render(<PendingEmployeeTable employees={[]} onApprove={mockOnApprove} onRemove={mockOnRemove} />);
    expect(screen.getByText(/no pending employees/i)).toBeInTheDocument();
  });

   test('should render table headers correctly', () => {
    render(<PendingEmployeeTable employees={mockPendingEmployees} onApprove={mockOnApprove} onRemove={mockOnRemove} />);
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /action/i })).toBeInTheDocument();
  });

  test('should render pending employee data correctly, displaying "admin" for "employer" role', () => {
    render(<PendingEmployeeTable employees={mockPendingEmployees} onApprove={mockOnApprove} onRemove={mockOnRemove} />);
    expect(screen.getByRole('cell', { name: 'Pending Eva' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'eva@test.com' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Pending Frank (Admin)' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'frank@test.com' })).toBeInTheDocument();

    // Check role display
    expect(screen.getByRole('row', { name: /eva/i })).toHaveTextContent(/employee/);
    expect(screen.getByRole('row', { name: /frank/i })).toHaveTextContent(/admin/); // Frank (employer) shown as admin
  });

  test('should render Approve and Remove buttons for each employee', () => {
     render(<PendingEmployeeTable employees={mockPendingEmployees} onApprove={mockOnApprove} onRemove={mockOnRemove} />);
     const approveButtons = screen.getAllByRole('button', { name: /approve/i });
     const removeButtons = screen.getAllByRole('button', { name: /remove/i });

     expect(approveButtons).toHaveLength(mockPendingEmployees.length);
     expect(removeButtons).toHaveLength(mockPendingEmployees.length);

     // Check icons are present
      expect(screen.getAllByTestId('icon-check')).toHaveLength(mockPendingEmployees.length);
      expect(screen.getAllByTestId('icon-trash')).toHaveLength(mockPendingEmployees.length);
  });

  test('should call onApprove with correct employee ID when approve button is clicked', async () => {
    const user = userEvent.setup();
    render(<PendingEmployeeTable employees={mockPendingEmployees} onApprove={mockOnApprove} onRemove={mockOnRemove} />);
    // Find approve button in Frank's row
    const frankRow = screen.getByRole('row', { name: /frank/i });
    const approveButton = frankRow.querySelector('button[class*="approveButton"]'); // Use class selector

    expect(approveButton).toBeInTheDocument();
    await user.click(approveButton!);

    expect(mockOnApprove).toHaveBeenCalledTimes(1);
    expect(mockOnApprove).toHaveBeenCalledWith('p2'); // Frank's ID
  });

   test('should call onRemove with correct employee ID when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<PendingEmployeeTable employees={mockPendingEmployees} onApprove={mockOnApprove} onRemove={mockOnRemove} />);
    // Find remove button in Eva's row
    const evaRow = screen.getByRole('row', { name: /eva/i });
    const removeButton = evaRow.querySelector('button[class*="removeButton"]'); // Use class selector

    expect(removeButton).toBeInTheDocument();
    await user.click(removeButton!);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith('p1'); // Eva's ID
  });

});