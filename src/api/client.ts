interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...restOptions } = options;

    // Construct URL with query parameters
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (path.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      // Auth now lives exclusively in httpOnly cookies (never in localStorage,
      // which is readable by any injected script). 'include' ensures cookies
      // are sent even if the API and app ever end up on different origins.
      credentials: 'include',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'An unknown error occurred' };
      }

      throw new ApiError(
        errorData.messageEn || errorData.error || errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Check if response is empty (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  },

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return apiClient.request<T>(path, { ...options, method: 'GET', params });
  },

  async post<T>(path: string, body?: any, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return apiClient.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(path: string, body?: any, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return apiClient.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return apiClient.request<T>(path, { ...options, method: 'DELETE' });
  },
};
