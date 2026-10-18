// frontend/src/features/users/components/LoginFormStep.tsx

import { useState } from 'react';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormStepProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  onGuestAccess: () => Promise<void>;
  isLoading: boolean;
  isGuestLoading: boolean;
}

export function LoginFormStep({ onSubmit, onGuestAccess, isLoading, isGuestLoading }: LoginFormStepProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onSubmit(username, password);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase">Usuário</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase">Senha</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full justify-center gap-2 mt-2"
          disabled={isLoading || isGuestLoading}
        >
          {isLoading ? 'Validando...' : 'Avançar'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Divisor Visual */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
          ou
        </span>
      </div>

      {/* Botão de Acesso Convidado (Modo Demo / Recrutadores) */}
      <Button
        type="button"
        variant="outline"
        onClick={onGuestAccess}
        disabled={isLoading || isGuestLoading}
        className="w-full justify-center gap-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        {isGuestLoading ? 'Entrando na Demo...' : 'Degustação / Modo Convidado'}
      </Button>
    </div>
  );
}