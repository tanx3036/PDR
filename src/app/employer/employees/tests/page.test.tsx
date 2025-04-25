// src/app/employer/employees/tests/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '../page'; // Default export

// Mock the actual page implementation component
jest.mock('../ManageEmployeePage', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-manage-employees-page">Manage Employees Page Content</div>
}));

describe('Employees Page Wrapper', () => {
    test('should render the ManageEmployeesPage component', () => {
        render(<Page />);
        expect(screen.getByTestId('mock-manage-employees-page')).toBeInTheDocument();
    });
});
