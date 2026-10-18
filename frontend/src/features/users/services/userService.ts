// frontend/src/features/users/services/userService.ts

import { apiClient } from '@/api/client';
import type {
  LoginPayload,
  LoginResponse,
  Verify2FAPayload,
  AuthTokenResponse,
  CreateUserPayload
} from '@/types';

export const userService = {
  // Passo 1 do Login: Envia credenciais e solicita o OTP 2FA
  loginStep1: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  // Passo 2 do Login: Valida o código 2FA e recebe o Token JWT
  verify2FA: async (payload: Verify2FAPayload): Promise<AuthTokenResponse> => {
    const response = await apiClient.post<AuthTokenResponse>('/auth/verify-2fa', payload);
    return response.data;
  },

  // Acesso Convidado (Modo Demo / Portfólio): Autenticação direta sem 2FA
  guestLogin: async (): Promise<AuthTokenResponse> => {
    const response = await apiClient.post<AuthTokenResponse>('/auth/guest');
    return response.data;
  },

  // Rota protegida (Exclusiva para Administradores): Cadastra um novo operador/admin
  registerUser: async (payload: CreateUserPayload): Promise<{ message: string; id: string; is_admin: boolean }> => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },
};