
import { env } from '../config/env';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, headers, ...requestOptions } = options;

  const isFormData = body instanceof FormData;

  const response = await fetch(
    `${env.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
    {
      ...requestOptions,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    }
  );

  const contentType = response.headers.get('content-type');

  let data: unknown = null;

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data
        ? String(data.message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string, options?: ApiRequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  delete<T>(endpoint: string, options?: ApiRequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};
