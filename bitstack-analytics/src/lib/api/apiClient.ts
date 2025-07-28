/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown; // ←  body can be anything (serialised if JSON)
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

/** Internal cache entry structure */
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  duration: number;
}

export class ApiError extends Error {
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

/* ------------------------------------------------------------------ */
/* ApiClient                                                           */
/* ------------------------------------------------------------------ */

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  /** URL-keyed in-memory cache */
  private cache = new Map<string, CacheEntry>();

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

  /* ---------------------------------------------------- */
  /* Cache helpers                                         */
  /* ---------------------------------------------------- */

  private getCacheKey(url: string, cfg: ApiRequestConfig): string {
    return `${cfg.method || 'GET'}:${url}:${JSON.stringify(cfg.body ?? {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const expired = Date.now() - cached.timestamp > cached.duration;
    if (expired) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, duration: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), duration });
  }

  /* ---------------------------------------------------- */
  /* Core request                                          */
  /* ---------------------------------------------------- */

  private async makeRequest<T>(
    url: string,
    cfg: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
      cache = false,
      cacheDuration = 300_000, // 5 min
    } = cfg;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = this.getCacheKey(fullUrl, cfg);

    if (method === 'GET' && cache) {
      const cached = this.getFromCache<ApiResponse<T>>(cacheKey);
      if (cached) return cached;
    }

    const ctrl = new AbortController();
    const tId = setTimeout(() => ctrl.abort(), timeout);

    const reqHeaders = { ...this.defaultHeaders, ...headers };
    const jsonBody =
      body !== undefined && reqHeaders['Content-Type']?.includes('json')
        ? JSON.stringify(body)
        : (body as BodyInit | null | undefined);

    let lastErr: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(fullUrl, {
          method,
          headers: reqHeaders,
          body: jsonBody as BodyInit,
          signal: ctrl.signal,
        });

        clearTimeout(tId);

        if (!res.ok) {
          const msg = await res.text().catch(() => res.statusText);
          throw new ApiError(res.status, res.statusText, msg, res);
        }

        const data: T = (await res.json().catch(() => null)) as T;

        const apiRes: ApiResponse<T> = {
          data,
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        };

        if (method === 'GET' && cache) {
          this.setCache(cacheKey, apiRes, cacheDuration);
        }
        return apiRes;
      } catch (err) {
        lastErr = err as Error;

        // No retry on specific status codes or abort
        if (err instanceof ApiError && [401, 403, 404].includes(err.status)) {
          throw err;
        }
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout} ms`);
        }
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
        }
      }
    }
    clearTimeout(tId);
    throw lastErr;
  }

  /* ---------------------------------------------------- */
  /* HTTP helpers                                          */
  /* ---------------------------------------------------- */

  async get<T>(
    url: string,
    cfg?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const res = await this.makeRequest<T>(url, { ...cfg, method: 'GET' });
    return res.data;
  }

  async post<T>(
    url: string,
    body?: unknown,
    cfg?: Omit<ApiRequestConfig, 'method'>
  ): Promise<T> {
    const res = await this.makeRequest<T>(url, {
      ...cfg,
      method: 'POST',
      body,
    });
    return res.data;
  }

  async put<T>(
    url: string,
    body?: unknown,
    cfg?: Omit<ApiRequestConfig, 'method'>
  ): Promise<T> {
    const res = await this.makeRequest<T>(url, {
      ...cfg,
      method: 'PUT',
      body,
    });
    return res.data;
  }

  async delete<T>(
    url: string,
    cfg?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const res = await this.makeRequest<T>(url, { ...cfg, method: 'DELETE' });
    return res.data;
  }

  /* ---------------------------------------------------- */
  /* Cache utils                                           */
  /* ---------------------------------------------------- */

  clearCache(): void {
    this.cache.clear();
  }
  getCacheSize(): number {
    return this.cache.size;
  }
}

/* ------------------------------------------------------------------ */
/* Instances                                                           */
/* ------------------------------------------------------------------ */

export const coinGeckoApi = new ApiClient('https://api.coingecko.com/api/v3');
export const coinCapApi = new ApiClient('https://api.coincap.io/v2');
export const stacksApi = new ApiClient(
  process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so'
);

export { ApiClient as default };
