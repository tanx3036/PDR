// jest.setup.ts
import React from 'react';
import '@testing-library/jest-dom'; // Extends Jest matchers

// --- Global Mocks ---

// Mock fetch globally
global.fetch = jest.fn();

// Mock crypto.randomUUID (used in saveToHistory)
// Ensure crypto exists before trying to modify it
if (typeof global.crypto === 'undefined') {
  // @ts-ignore - Polyfilling crypto for Jest environment if needed
  global.crypto = {
    randomUUID: jest.fn(() => `mock-uuid-${Math.random()}`),
  };
} else {
   global.crypto.randomUUID = jest.fn(() => `mock-uuid-${Math.random()}`);
}


// Mock window.alert (optional, usually better to test the condition leading to it)
global.alert = jest.fn();

// --- Mock Next.js Router ---
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(), // Mock the push method
    replace: jest.fn(),
    // Add other router methods if your components use them
  })),
}));

// --- Mock Clerk Auth ---
// Use React.createElement here to avoid JSX parsing issues within jest.mock
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({
    isLoaded: true,
    userId: 'mock-user-id', // Default mock value
    // Add other properties like getToken if used
  })),
  // Use React.createElement instead of JSX for mock implementation
  SignOutButton: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  UserButton: () => React.createElement('div', null, 'Mock UserButton'),
}));

// --- Reset mocks before each test (Simplified) ---
beforeEach(() => {
  // Clear call counts, instances, contexts and results for ALL mocks
  jest.clearAllMocks();

  // Optional: Reset global.fetch to a default state if needed for some tests,
  // but often tests override this with specific implementations anyway.
  // (global.fetch as jest.Mock).mockClear().mockResolvedValue({
  //     ok: true, status: 200, json: async () => ({}),
  // });

  // REMOVED the specific resets for useAuth and useRouter implementation here.
  // jest.clearAllMocks() is usually sufficient for resetting between tests.

  // Clear specific global mocks if necessary
  (global.alert as jest.Mock).mockClear();
  if (global.crypto?.randomUUID) {
      (global.crypto.randomUUID as jest.Mock).mockClear();
  }
});

// Optional: Add any other global setup or teardown logic here