const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001';

interface AuthResponse {
  token(arg0: string, token: any): unknown;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new ApiError(response.status, errorData.message || 'Erro na requisição');
  }

  // Check if response has content before trying to parse JSON
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  if (contentLength === '0' || !contentType?.includes('application/json')) {
    // Return empty object for DELETE operations or non-JSON responses
    return {} as T;
  }

  return response.json();
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login: email, password }),
    });
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {


    return fetchApi<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username: name,
        password,
      }),
    });
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return fetchApi<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// Authenticated API instance
class AuthenticatedApi {
  private getAuthHeaders(): Record<string, string> {
    console.log('🔍 Buscando token de autenticação...');

    // Primeiro tenta pegar do localStorage direto (mais confiável)
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('📦 Token direto encontrado');
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');

      // Verificar formato do token
      const parts = token.split('.');
      console.log('📋 Token parts:', parts.length, 'should be 3 for JWT');

      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📄 Token payload:', payload);
        } catch (e) {
          console.warn('❌ Erro ao decodificar payload:', e);
        }
      }

      console.log('✅ Usando token do localStorage');
      return { 'Authorization': `Bearer ${token}` };
    }

    // Fallback para Zustand persist storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const zustandToken = parsed?.state?.accessToken;
        if (zustandToken) {
          console.log('📄 Token do Zustand encontrado');
          console.log('✅ Usando token do Zustand');
          return { 'Authorization': `Bearer ${zustandToken}` };
        }
      } catch (e) {
        console.warn('❌ Erro ao parsear auth storage:', e);
      }
    }

    console.log('❌ Nenhum token encontrado!');
    return {};
  }

  async get<T>(endpoint: string): Promise<T> {
    return fetchApi<T>(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = this.getAuthHeaders();
    console.log('📤 POST Headers being sent:', headers);
    console.log('📤 POST Endpoint:', endpoint);
    console.log('📤 POST Data:', data);

    return fetchApi<T>(endpoint, {
      method: 'POST',
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return fetchApi<T>(endpoint, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }
}

export const api = new AuthenticatedApi();

