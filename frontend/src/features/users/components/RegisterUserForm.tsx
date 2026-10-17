// frontend/src/features/users/components/RegisterUserForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Phone, Shield, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { useCreateUser } from '../hooks/useUsers';

// 1. Schema corrigido sem .default() para alinhar perfeitamente com o React Hook Form
export const createUserSchema = z.object({
  username: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone_number: z.string().min(8, 'Informe um número de telefone válido'),
  is_admin: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export function RegisterUserForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      phone_number: '',
      is_admin: false, // O valor padrão é definido aqui com segurança
    },
  });

  const createUserMutation = useCreateUser();

  const onSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        reset(); // Limpa o formulário após o sucesso
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Usuário</h2>
          <p className="text-xs text-gray-500">Adicione novos operadores ou administradores à sua conta ERP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Usuário */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase">Nome de Usuário</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="ex: operador_joao"
              {...register('username')}
              className="pl-9"
            />
          </div>
          {errors.username && <p className="text-xs text-rose-500">{errors.username.message}</p>}
        </div>

        {/* Campo Senha */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase">Senha Temporária</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="pl-9"
            />
          </div>
          {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
        </div>

        {/* Campo Telefone */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase">Telefone (para 2FA)</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="+5534999998888"
              {...register('phone_number')}
              className="pl-9"
            />
          </div>
          {errors.phone_number && <p className="text-xs text-rose-500">{errors.phone_number.message}</p>}
        </div>

        {/* Checkbox Perfil Admin */}
        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80 cursor-pointer hover:bg-gray-100/60 transition-colors">
            <input
              type="checkbox"
              {...register('is_admin')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Conceder privilégios de Administrador</span>
            </div>
          </label>
        </div>

        {/* Botão de Envio */}
        <Button
          type="submit"
          className="w-full justify-center gap-2 mt-4"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? 'Cadastrando...' : 'Cadastrar Usuário'}
        </Button>
      </form>
    </div>
  );
}