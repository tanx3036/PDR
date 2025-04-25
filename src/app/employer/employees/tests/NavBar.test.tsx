// src/app/employer/employees/tests/NavBar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import NavBar from '../NavBar'; // Adjust path if needed

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Brain: () => <div data-testid="icon-brain">Brain</div>,
  Home: () => <div data-testid="icon-home">Home</div>,
}));

describe('Employees NavBar Component', () => {

    beforeEach(() => {
        mockPush.mockClear();
    });

    test('should render logo text and icon', () => {
        render(<NavBar />);
        expect(screen.getByText(/pdr ai/i)).toBeInTheDocument();
        expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
    });

    test('should render home button with icon', () => {
        render(<NavBar />);
        const homeButton = screen.getByRole('button', { name: /home/i });
        expect(homeButton).toBeInTheDocument();
        expect(screen.getByTestId('icon-home')).toBeInTheDocument();
    });

    test('should call router.push with /employer/home when home button is clicked', async () => {
        const user = userEvent.setup();
        render(<NavBar />);
        const homeButton = screen.getByRole('button', { name: /home/i });
        await user.click(homeButton);
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/employer/home');
    });
});