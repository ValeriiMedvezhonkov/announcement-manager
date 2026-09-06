/**
 * Transport used by every generated endpoint.
 *
 * Prepends the configured API base URL, sends/receives JSON and converts
 * non-2xx responses into a typed ApiError carrying the backend's error
 * contract, so callers never handle raw Response objects.
 */

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.body = body;
  }
}

interface ImportMetaEnv {
  VITE_API_BASE_URL?: string;
}

const env = (import.meta as unknown as { env?: ImportMetaEnv }).env;
const BASE_URL: string = env?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  // Generated code passes paths including the /api prefix; the base URL also
  // ends with it, so strip the duplicate before joining.
  const path = url.startsWith('/api') ? url.slice(4) : url;

  // Headers dedupe case-insensitively; a plain object spread would not, and
  // duplicate content-type headers make Express reject the JSON body.
  const headers = new Headers(options?.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(
      isApiErrorBody(data)
        ? data
        : { statusCode: response.status, code: 'INTERNAL_ERROR', message: response.statusText },
    );
  }

  return data as T;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'statusCode' in value
  );
}
