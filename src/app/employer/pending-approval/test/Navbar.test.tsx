// src/app/employer/pending-approval/tests/Navbar.test.tsx
// (Adjust path if needed)

import React from 'react';
import { render, screen } from '@testing-library/react';
import NavBar from '../Navbar'; // Adjust import path as necessary

// --- Mocks ---

// Mock the child component ProfileDropdown
jest.mock('~/app/employer/_components/ProfileDropdown', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-profile-dropdown">Mock Profile Dropdown</div>
}));

// Mock the Lucide icon used
jest.mock('lucide-react', () => ({
    // Ensure Brain is mocked
    Brain: () => <div data-testid="icon-brain">Mock Brain Icon</div>,
    // Add mocks for any other icons potentially used by ProfileDropdown if not mocked separately
}));

// Mock CSS Modules (if not handled globally by identity-obj-proxy in jest.config)
// jest.mock('~/styles/Employer/PendingApproval.module.css', () => ({
//   navbar: 'navbar',
//   navContent: 'navContent',
//   logoContainer: 'logoContainer',
//   logoIcon: 'logoIcon',
//   logoText: 'logoText',
// }));

// --- End Mocks ---

describe('NavBar Component', () => {

    beforeEach(() => {
        // Clear mocks if necessary, though usually not needed for simple rendering tests
        // jest.clearAllMocks();
    });

    test('should render the navbar structure', () => {
        render(<NavBar />);
        // Check for the main nav element itself
        const navElement = screen.getByRole('navigation'); // The <nav> tag
        expect(navElement).toBeInTheDocument();
    });

    test('should render the logo icon and text', () => {
        render(<NavBar />);
        // Check for the mocked Brain icon via its test ID
        expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
        // Check for the logo text
        expect(screen.getByText('PDR AI')).toBeInTheDocument();
    });

    test('should render the ProfileDropdown component', () => {
        render(<NavBar />);
        // Check for the mocked ProfileDropdown component via its test ID
        expect(screen.getByTestId('mock-profile-dropdown')).toBeInTheDocument();
        expect(screen.getByText('Mock Profile Dropdown')).toBeInTheDocument();
    });

});