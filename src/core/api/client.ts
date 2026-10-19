// Centralized API Client

/**
 * Returns the configured base API URL, sanitized without trailing slashes.
 * In React Native / Expo, EXPO_PUBLIC_API_URL is embedded at build/start time.
 * For physical devices (Expo Go), use your machine's LAN IPv4 (e.g., http://192.168.1.18:3000/api).
 * For Web / Chrome on the same machine, localhost also resolves.
 */
export function getBaseApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/[\/\}]+$/, '');
  }
  return 'http://10.0.2.2:3000/api';
}

export interface ApiResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
}

export class ApiError extends Error {
  code: string;
  url?: string;
  status?: number;

  constructor(message: string, code: string = 'NETWORK_ERROR', url?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.url = url;
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseApiUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Attempt to parse JSON response
    let data: any;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(
          `Error de servidor no manejado (HTTP ${response.status}) en ${url}`,
          `HTTP_${response.status}`,
          url,
          response.status
        );
      }
      return null as any;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error?.message ||
        (typeof data?.error === 'string' ? data.error : undefined) ||
        `Error en la solicitud HTTP ${response.status}`;
      const errorCode = data?.code || data?.error?.code || `HTTP_${response.status}`;
      throw new ApiError(errorMessage, errorCode, url, response.status);
    }

    return data?.data; // Return only the nested data payload
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    const details = error?.message ? ` (${error.message})` : '';
    console.error(`[API Network Error] Fallo al conectar con ${url}:`, error);
    throw new ApiError(
      `Error de red al conectar con el servidor en ${url}${details}`,
      'NETWORK_ERROR',
      url
    );
  }
}

export const apiClient = {
  getBaseUrl: getBaseApiUrl,
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
