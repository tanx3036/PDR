// src/app/signup/tests/RoleSelection.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import RoleSelection from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
  Briefcase: () => <div data-testid="mock-briefcase-icon">Briefcase Icon</div>,
  Users: () => <div data-testid="mock-users-icon">Users Icon</div>,
  ArrowRight: () => <div data-testid="mock-arrow-right-icon">Arrow Right Icon</div>,
  Brain: () => <div data-testid="mock-brain-icon">Brain Icon</div>,
}));

describe('RoleSelection Component', () => {
  let mockRouter: { push: jest.Mock };

  beforeEach(() => {
    // Setup router mock before each test
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Component renders correctly
  test('renders the role selection page with correct elements', () => {
    render(<RoleSelection />);

    // Check page title and subtitle
    expect(screen.getByText('Choose Your Role')).toBeInTheDocument();
    expect(screen.getByText('Select how you will be using PDR AI')).toBeInTheDocument();

    // Check that both role cards are displayed
    expect(screen.getByText("I'm an Employer")).toBeInTheDocument();
    expect(screen.getByText("I'm an Employee")).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText(/Upload and manage documents/)).toBeInTheDocument();
    expect(screen.getByText(/Access and review documents/)).toBeInTheDocument();

    // Check that continue button is disabled initially
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();

    // Check icons are rendered
    expect(screen.getByTestId('mock-briefcase-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-arrow-right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-brain-icon')).toBeInTheDocument();
  });

  // Test 2: Selecting employer role
  test('selecting employer role updates the UI and enables the continue button', () => {
    render(<RoleSelection />);

    // Initially continue button should be disabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();

    // Select employer role
    const employerCard = screen.getByText("I'm an Employer").closest('div');
    fireEvent.click(employerCard!);

    // Check that the card has the selected class (using data attributes for testing)
    expect(employerCard).toHaveClass('selected');
    
    // Continue button should now be enabled
    expect(continueButton).not.toBeDisabled();
  });

  // Test 3: Selecting employee role
  test('selecting employee role updates the UI and enables the continue button', () => {
    render(<RoleSelection />);

    // Select employee role
    const employeeCard = screen.getByText("I'm an Employee").closest('div');
    fireEvent.click(employeeCard!);

    // Check that the card has the selected class
    expect(employeeCard).toHaveClass('selected');
    
    // Continue button should be enabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).not.toBeDisabled();
  });

  // Test 4: Switching between roles
  test('switching between roles updates selection correctly', () => {
    render(<RoleSelection />);

    const employerCard = screen.getByText("I'm an Employer").closest('div');
    const employeeCard = screen.getByText("I'm an Employee").closest('div');

    // Select employer first
    fireEvent.click(employerCard!);
    expect(employerCard).toHaveClass('selected');
    expect(employeeCard).not.toHaveClass('selected');

    // Switch to employee
    fireEvent.click(employeeCard!);
    expect(employerCard).not.toHaveClass('selected');
    expect(employeeCard).toHaveClass('selected');
  });

  // Test 5: Navigation when employer is selected
  test('clicking continue with employer selected navigates to employer signup', async () => {
    render(<RoleSelection />);

    // Select employer role
    const employerCard = screen.getByText("I'm an Employer").closest('div');
    fireEvent.click(employerCard!);

    // Click continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // Verify router was called correctly
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/signup/employer');
    });
  });

  // Test 6: Navigation when employee is selected
  test('clicking continue with employee selected navigates to employee signup', async () => {
    render(<RoleSelection />);

    // Select employee role
    const employeeCard = screen.getByText("I'm an Employee").closest('div');
    fireEvent.click(employeeCard!);

    // Click continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // Verify router was called correctly
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/signup/employee');
    });
  });

  // Test 7: Button is disabled when no role is selected
  test('continue button remains disabled until a role is selected', () => {
    render(<RoleSelection />);

    // Initially button should be disabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();

    // Select employee role
    const employeeCard = screen.getByText("I'm an Employee").closest('div');
    fireEvent.click(employeeCard!);

    // Button should become enabled
    expect(continueButton).not.toBeDisabled();
  });

  // Test 8: Keyboard accessibility for role selection
  test('handles keyboard interaction for accessibility', () => {
    render(<RoleSelection />);

    const employerCard = screen.getByText("I'm an Employer").closest('div');
    
    // Simulate keyboard interaction
    fireEvent.keyDown(employerCard!, { key: 'Enter', code: 'Enter' });
    
    // The card should be selected
    expect(employerCard).toHaveClass('selected');
    
    // Continue button should be enabled
    const continueButton = screen.getByText('Continue');
    expect(continueButton).not.toBeDisabled();
  });

  // Test 9: Default redirection if something goes wrong
  test('redirects to home page if role selection is null', async () => {
    render(<RoleSelection />);
    
    // Force the continue button to be enabled and clicked without selecting a role
    // This is an edge case that shouldn't happen in normal usage
    const continueButton = screen.getByText('Continue');
    
    // Override the disabled attribute
    Object.defineProperty(continueButton, 'disabled', {
      writable: true,
      value: false,
    });
    
    fireEvent.click(continueButton);
    
    // Verify the fallback redirection to home
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
});