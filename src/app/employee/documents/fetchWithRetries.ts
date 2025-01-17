// 1) A helper function that retries fetch up to `maxRetries` times
export async function fetchWithRetries(
    url: string,
    options: RequestInit = {},
    maxRetries = 5
) {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, options);

            if (!res.ok) {
                // For a non-200 response, you can parse the error body or just throw.
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed with status ${res.status}`);
            }

            // If fetch + response parsing is successful, return the JSON
            return res.json();
        } catch (err: any) {
            lastError = err;

            // Check if it's specifically a "timeout" or "network" error
            // (Depending on your environment, you might rely on `err.name === 'AbortError'`
            //  or a specific message like "NetworkError when attempting to fetch resource".)
            const isTimeoutError = /timed out/i.test(err.message) || err.name === "AbortError";

            if (isTimeoutError && attempt < maxRetries) {
                console.warn(`Attempt ${attempt} failed due to timeout, retrying...`);
                continue; // Go to the next attempt
            } else {
                // If it's not a timeout or we've used up all retries, throw immediately
                throw err;
            }
        }
    }

    // If we somehow exit the loop, throw the last error
    throw lastError;
}