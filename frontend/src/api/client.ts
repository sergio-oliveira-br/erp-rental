// frontend/src/api/client.ts

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Interface para mensagens de erro padronizadas do FastAPI
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Requisição (Anexa token JWT do Cognito se existir)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta (Tratamento centralizado de erros)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | Array<{ msg: string; loc: string[] }> }>) => {
    const apiError: ApiError = {
      message: 'Ocorreu um erro inesperado na comunicação com o servidor.',
      statusCode: error.response?.status,
    };

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        apiError.message = 'Sessão expirada. Faça login novamente.';
        localStorage.removeItem('access_token');
      } else if (status === 403) {
        apiError.message = 'Você não tem permissão para realizar esta ação.';
      } else if (status === 404) {
        apiError.message = 'Recurso não encontrado.';
      } else if (status === 422 && Array.isArray(data?.detail)) {
        // Erros de validação do Pydantic (FastAPI)
        apiError.message = data.detail.map((err) => `${err.loc.join('.')}: ${err.msg}`).join(' | ');
        apiError.details = data.detail;
      } else if (typeof data?.detail === 'string') {
        apiError.message = data.detail;
      }
    } else if (error.request) {
      apiError.message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }

    return Promise.reject(apiError);
  }
);