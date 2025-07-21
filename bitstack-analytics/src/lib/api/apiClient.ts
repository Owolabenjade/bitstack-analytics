interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheDuration?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private cache = new Map<
    string,
    { data: any; timestamp: number; duration: number }
  >();

  constructor(
    baseURL: string = '',
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private getCacheKey(url: string, config: ApiRequestConfig): string {
    return `${config.method || 'GET'}:${url}:${JSON.stringify(config.body || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.duration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  private async makeRequest<T>(
    url: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
      cache = false,
      cacheDuration = 300000, // 5 minutes
    } = config;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = this.getCacheKey(fullUrl, config);

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(fullUrl, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorMessage = await response
            .text()
            .catch(() => response.statusText);
          throw new ApiError(
            response.status,
            response.statusText,
            errorMessage,
            response
          );
        }

        const data = await response.json().catch(() => null);

        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };

        // Cache successful GET requests
        if (method === 'GET' && cache) {
          this.setCache(cacheKey, apiResponse, cacheDuration);
        }

        return apiResponse;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof ApiError) {
          if (
            error.status === 401 ||
            error.status === 403 ||
            error.status === 404
          ) {
            throw error;
          }
        }

        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        // Wait before retry
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError;
  }

  async get<T>(
    url: string,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.makeRequest<T>(url, {
      ...config,
      method: 'GET',
    });
    return response.data;
  }

  async post<T>(
    url: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<T> {
    const response = await this.makeRequest<T>(url, {
      ...config,
      method: 'POST',
      body,
    });
    return response.data;
  }

  async put<T>(
    url: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method'>
  ): Promise<T> {
    const response = await this.makeRequest<T>(url, {
      ...config,
      method: 'PUT',
      body,
    });
    return response.data;
  }

  async delete<T>(
    url: string,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const response = await this.makeRequest<T>(url, {
      ...config,
      method: 'DELETE',
    });
    return response.data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Create instances
export const coinGeckoApi = new ApiClient('https://api.coingecko.com/api/v3');
export const coinCapApi = new ApiClient('https://api.coincap.io/v2');
export const stacksApi = new ApiClient(
  process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so'
);

export { ApiError };
export default ApiClient;
