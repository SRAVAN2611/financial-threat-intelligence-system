// Dedicated API client connecting React frontend to the Node/Express backend
export const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('sentinel_jwt_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('sentinel_jwt_token', token);
  } else {
    localStorage.removeItem('sentinel_jwt_token');
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Add 6-second timeout to prevent UI hanging when backend is offline
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Handle file downloads/exports (like CSVs)
    const contentType = res.headers.get('Content-Type');
    if (contentType && contentType.includes('text/csv')) {
      const textBlob = await res.text();
      return textBlob as unknown as T;
    }

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        setAuthToken(null);
      }
      throw new Error(data.message || 'API operation failed');
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timeout: Backend server at http://localhost:5000 is not responding. Please run `npm run server`.');
    }
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to backend server. Make sure `npm run server` is running on port 5000.');
    }
    throw error;
  }
}

// Legacy simulation client methods
export async function simulateDelay(ms: number = 0): Promise<void> {
  if (ms <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStoredData<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(`sentinel_${key}`);
    if (item) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
  }
  return defaultData;
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`sentinel_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing to localStorage for key ${key}:`, e);
  }
}
