// app/loading/page.test.tsx

import LoadingPage from '../page';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '~/server/db/index';
import { eq } from 'drizzle-orm';
import { users } from '~/server/db/schema';

// Mock Clerk's auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock the redirect function
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: jest.fn((path) => {
    mockRedirect(path);
    throw new Error(`__REDIRECT__:${path}`);
  }),
}));

// Mock console.log to avoid cluttering test output
jest.spyOn(console, 'log').mockImplementation(() => {});

// Mock the database and schema
jest.mock('~/server/db/index', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock('~/server/db/schema', () => ({
  users: {
    userId: 'userId', // Mock column reference for eq function
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn().mockImplementation((col, val) => ({ column: col, value: val })),
}));

describe('LoadingPage Server Component', () => {
  let mockedAuth;
  let mockedDb;
  let mockedSelect;
  let mockedFrom;
  let mockedWhere;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth
    mockedAuth = auth;
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: 'test-user-id' });
    
    // Setup the database mock chain
    mockedSelect = jest.spyOn(db, 'select');
    mockedFrom = jest.spyOn(db, 'from');
    mockedWhere = jest.spyOn(db, 'where');
    
    // Default to user not found in database
    mockedWhere.mockResolvedValue([]);
  });

  // Helper function to check redirects
  async function expectRedirect(asyncFunc, expectedPath) {
    try {
      await asyncFunc();
      throw new Error(`Expected redirect to ${expectedPath} but no redirect occurred.`);
    } catch (error) {
      if (error.message === `__REDIRECT__:${expectedPath}`) {
        expect(mockRedirect).toHaveBeenCalledWith(expectedPath);
      } else {
        throw error;
      }
    }
  }

  test('should redirect to "/" if userId is null', async () => {
    // Setup
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: null });

    // Test
    await expectRedirect(() => LoadingPage(), '/');
    
    // Verify
    expect(mockedSelect).not.toHaveBeenCalled();
  });

  test('should redirect to "/signup" if user not found in database', async () => {
    // Setup
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: 'new-user' });
    mockedWhere.mockResolvedValue([]);

    // Test
    await expectRedirect(() => LoadingPage(), '/signup');
    
    // Verify
    expect(mockedSelect).toHaveBeenCalled();
    expect(mockedFrom).toHaveBeenCalledWith(users);
    expect(mockedWhere).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith(users.userId, 'new-user');
  });

  test('should redirect to "/employer/home" if user is an employer', async () => {
    // Setup
    const mockUser = { userId: 'employer-id', role: 'employer' };
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: 'employer-id' });
    mockedWhere.mockResolvedValue([mockUser]);

    // Test
    await expectRedirect(() => LoadingPage(), '/employer/home');
  });

  test('should redirect to "/employer/home" if user is an owner', async () => {
    // Setup
    const mockUser = { userId: 'owner-id', role: 'owner' };
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: 'owner-id' });
    mockedWhere.mockResolvedValue([mockUser]);

    // Test
    await expectRedirect(() => LoadingPage(), '/employer/home');
  });

  test('should redirect to "/employee/documents" if user is an employee', async () => {
    // Setup
    const mockUser = { userId: 'employee-id', role: 'employee' };
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: 'employee-id' });
    mockedWhere.mockResolvedValue([mockUser]);

    // Test
    await expectRedirect(() => LoadingPage(), '/employee/documents');
  });

  test('should redirect to "/employee/documents" for any other role', async () => {
    // Setup
    const mockUser = { userId: 'other-id', role: 'unknown-role' };
    (mockedAuth as jest.Mock).mockResolvedValue({ userId: 'other-id' });
    mockedWhere.mockResolvedValue([mockUser]);

    // Test
    await expectRedirect(() => LoadingPage(), '/employee/documents');
  });
});