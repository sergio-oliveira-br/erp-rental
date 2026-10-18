// frontend/src/features/users/hooks/useUsers.ts

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '../services/userService';
import type { LoginPayload, Verify2FAPayload, CreateUserPayload } from '@/types';

export const userKeys = {
  all: ['system-users'] as const,
  session: () => [...userKeys.all, 'session'] as const,
};

// Hook para o Passo 1 do Login
export function useLoginStep1() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => userService.loginStep1(payload),
    onError: () => {
      toast.error('Usuário ou senha incorretos. Verifique suas credenciais.');
    },
  });
}

// Hook para o Passo 2 do Login (2FA)
export function useVerify2FA() {
  return useMutation({
    mutationFn: (payload: Verify2FAPayload) => userService.verify2FA(payload),
    onSuccess: (data) => {
      // Salva dados essenciais da sessão no localStorage
      localStorage.setItem('erp_access_token', data.access_token);
      localStorage.setItem(
        'erp_user',
        JSON.stringify({
          username: data.username,
          is_admin: data.is_admin,
        })
      );

      toast.success(`Bem-vindo, ${data.username}!`, {
        description: data.is_admin ? 'Acesso do tipo Administrador.' : 'Acesso de Operador.',
      });
    },
    onError: () => {
      toast.error('Código 2FA inválido ou expirado. Tente novamente.');
    },
  });
}

// Hook para o Administrador cadastrar novos usuários no sistema
export function useCreateUser() {
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.registerUser(payload),
    onSuccess: (res) => {
      toast.success('Novo usuário criado com sucesso!', {
        description: `O cadastro de ${res.is_admin ? 'Administrador' : 'Operador'} foi concluído.`,
      });
    },
    onError: (error: any) => {
      // Utiliza diretamente a mensagem tratada pelo interceptor do apiClient
      toast.error(error.message || 'Erro ao cadastrar usuário.');
    },
  });
}

// Hook padronizado para Acesso Convidado (Modo Demo)
export function useGuestLogin() {
  return useMutation({
    mutationFn: () => userService.guestLogin(),
    onSuccess: (data) => {
      localStorage.setItem('erp_access_token', data.access_token);
      localStorage.setItem(
        'erp_user',
        JSON.stringify({
          username: data.username,
          is_admin: data.is_admin,
        })
      );

      toast.success('Acesso de Demonstração iniciado!', {
        description: 'Você está navegando no modo Convidado com dados fictícios.',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao acessar como Convidado.');
    },
  });
}