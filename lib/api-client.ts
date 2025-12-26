import { getApiKey } from './api-key';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an API request with the user's API key attached
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new ApiError(
      'API key required. Please configure your OpenRouter API key in Settings.',
      401,
      'API_KEY_MISSING'
    );
  }

  const headers = new Headers(options.headers);
  headers.set('x-api-key', apiKey);

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  let data: any;

  try {
    const text = await response.text();

    if (!text || text.trim() === '') {
      throw new ApiError(
        'Empty response from server',
        response.status,
        'EMPTY_RESPONSE'
      );
    }

    data = JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `Invalid JSON response from server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response.status,
      'INVALID_JSON'
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data.error || 'An error occurred',
      response.status,
      data.code
    );
  }

  return data as T;
}

/**
 * POST request helper with JSON body
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * POST request helper for FormData (file uploads)
 */
export async function apiPostForm<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: formData,
  });
}
