// src/app/employer/documents/tests/loading-doc.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingDoc from '../loading-doc'; // Adjust path if needed

// Mock Next.js Link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode, href: string}) => <a href={href}>{children}</a>
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Brain: () => <div data-testid="icon-brain">Brain</div>,
  FileText: () => <div data-testid="icon-filetext">File</div>,
}));

describe('Employer LoadingDoc Component', () => {

  test('should render loading text, icons, and logo link', () => {
    render(<LoadingDoc />);

    // Check text
    expect(screen.getByText(/loading documents/i)).toBeInTheDocument();
    // Check icons (using testids from mocks)
    expect(screen.getByTestId('icon-brain')).toBeInTheDocument();
    expect(screen.getByTestId('icon-filetext')).toBeInTheDocument();
    // Check logo text
    expect(screen.getByText(/pdr ai/i)).toBeInTheDocument();
    // Check link wraps logo and points to employer home
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/employer/home');
    expect(link).toContainElement(screen.getByTestId('icon-brain'));
    expect(link).toContainElement(screen.getByText(/pdr ai/i));
  });

  // Snapshot test (optional)
  test('should match snapshot', () => {
      const { container } = render(<LoadingDoc />);
      expect(container).toMatchSnapshot();
  });
});