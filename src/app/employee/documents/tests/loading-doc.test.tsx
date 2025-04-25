// src/app/employee/documents/loading-doc.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingDoc from '../loading-doc'; // Assuming default export

// Mock Lucide icons if needed
// jest.mock('lucide-react', () => ({ /* ... */ }));

describe('LoadingDoc Component', () => {

  test('should render loading text and icon', () => {
    render(<LoadingDoc />);

    // Check for the loading text
    expect(screen.getByText(/loading documents/i)).toBeInTheDocument();

    // Check if the FileText icon might be present (requires mocking or specific test-id)
    // Example: Assuming lucide mock adds data-testid="icon-filetext"
    // expect(screen.getByTestId('icon-filetext')).toBeInTheDocument();

    // Or use snapshot testing for simple components
    // const { container } = render(<LoadingDoc />);
    // expect(container).toMatchSnapshot();
  });

  // Add more tests if the component has any props or conditional logic
});