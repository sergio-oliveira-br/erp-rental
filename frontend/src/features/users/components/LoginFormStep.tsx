// frontend/src/features/users/components/LoginFormStep.tsx

import { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormStepProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export function LoginFormStep({ onSubmit, isLoading }: LoginFormStepProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onSubmit(username, password);
    }
  };

  return (
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
        disabled={isLoading}
      >
        {isLoading ? 'Validando...' : 'Avançar'}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
}