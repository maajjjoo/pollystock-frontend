// Centralized API Client

// Define the base URL. For physical devices, you must change localhost to your computer's LAN IP.
// Example: 'http://192.168.1.100:3000/api'
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api'; // 10.0.2.2 for Android Emulator, localhost for Web/iOS Simulator

export interface ApiResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
}

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string = 'NETWORK_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = BASE_URL + endpoint;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Attempt to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (!response.ok) {
        throw new ApiError('Error de servidor no manejado', 'HTTP_' + response.status);
      }
      return null as any;
    }

    if (!response.ok) {
      throw new ApiError(data.message || 'Error en la solicitud', data.code || 'HTTP_' + response.status);
    }

    return data.data; // Return only the nested data payload
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('API Network Error:', error);
    throw new ApiError('Error de red al conectar con el servidor', 'NETWORK_ERROR');
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
