const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001';

interface AuthResponse {
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

    // Primeiro tenta pegar do Zustand persist storage
    const authStorage = localStorage.getItem('auth-storage');
    console.log('💾 Auth storage:', authStorage);

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('📄 Parsed storage:', parsed);
        const token = parsed?.state?.accessToken;
        console.log('🎟️ Token encontrado:', token ? 'Sim' : 'Não');
        if (token) {
          console.log('✅ Usando token do Zustand storage');
          return { 'Authorization': `Bearer ${token}` };
        }
      } catch (e) {
        console.warn('❌ Erro ao parsear auth storage:', e);
      }
    }

    // Fallback para access_token direto no localStorage
    const token = localStorage.getItem('access_token');
    console.log('🔄 Fallback token:', token ? 'Encontrado' : 'Não encontrado');

    if (token) {
      console.log('✅ Usando token do localStorage direto');
      return { 'Authorization': `Bearer ${token}` };
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
    return fetchApi<T>(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
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

