// src/app/employee/documents/WorkspaceWithRetries.test.ts
import { fetchWithRetries } from '../fetchWithRetries';

describe('fetchWithRetries Utility', () => {
  const url = 'https://example.com/api/data';
  const options = { method: 'POST', body: JSON.stringify({ key: 'value' }) };

  beforeEach(() => {
    // Reset fetch mock defined in jest.setup.ts before each test
    (global.fetch as jest.Mock).mockClear();
  });

  test('should return data on successful fetch (first try)', async () => {
    const mockData = { message: 'Success' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true, json: async () => mockData, status: 200,
    });
    const data = await fetchWithRetries(url, options, 3);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(url, options);
    expect(data).toEqual(mockData);
  });

  test('should retry on timeout error and succeed on retry', async () => {
     const mockData = { message: 'Success after retry' };
     (global.fetch as jest.Mock)
       .mockRejectedValueOnce(new Error('Fetch timed out')) // First call fails
       .mockResolvedValueOnce({ // Second call succeeds
         ok: true, json: async () => mockData, status: 200,
       });
     const data = await fetchWithRetries(url, options, 3);
     expect(global.fetch).toHaveBeenCalledTimes(2);
     expect(data).toEqual(mockData);
  });

  test('should throw error after exceeding max retries on timeout', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch timed out')); // Always timeout
    await expect(fetchWithRetries(url, options, 3)).rejects.toThrow('Fetch timed out');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  // --- NEW TEST CASE FOR BRANCH COVERAGE (Lines 54-57) ---
  test('should throw final Error instance after all retries fail due to timeout', async () => {
      const timeoutError = new Error('Fetch timed out');
      (global.fetch as jest.Mock).mockRejectedValue(timeoutError); // Always timeout

      // Expect the *specific* timeout error to be thrown after all retries
      await expect(fetchWithRetries(url, options, 2)).rejects.toThrow(timeoutError);
      // Verify fetch was called for all attempts (initial + retries)
      expect(global.fetch).toHaveBeenCalledTimes(2);
  });
  // --- END NEW TEST CASE ---


  test('should throw immediately on non-OK response with valid JSON error', async () => {
    const errorResponse = { error: 'Invalid input' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => errorResponse, status: 400 });
    await expect(fetchWithRetries(url, options, 3)).rejects.toThrow('Invalid input');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

   test('should throw generic error if non-OK response has empty JSON error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({}), status: 500 });
    await expect(fetchWithRetries(url, options, 3)).rejects.toThrow('Request failed with status 500');
    expect(global.fetch).toHaveBeenCalledTimes(1);
   });

   test('should throw generic error if non-OK response has non-object JSON', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => "Error Text", status: 500 });
        await expect(fetchWithRetries(url, options, 3)).rejects.toThrow('Request failed with status 500');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should throw generic error if non-OK response .json() call fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: jest.fn().mockRejectedValue(new Error("Failed to parse JSON")), // Simulate .json() failing
        });
        // It should catch the .json() error and throw based on status
        await expect(fetchWithRetries(url, options, 3)).rejects.toThrow('Request failed with status 500');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });


    test('should throw wrapped non-Error immediately (no retry)', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw 'Failed Non-Error';
        });

        await expect(fetchWithRetries(url, options, 2)).rejects.toThrow('Non-Error thrown: Failed Non-Error');
        // Corrected Assertion: Only called ONCE
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

});