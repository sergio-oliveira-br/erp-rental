// frontend/src/features/users/components/TwoFactorFormStep.tsx

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TwoFactorFormStepProps {
  phoneHint: string;
  onBack: () => void;
  onSubmit: (code: string) => Promise<void>;
  isLoading: boolean;
}

export function TwoFactorFormStep({ phoneHint, onBack, onSubmit, isLoading }: TwoFactorFormStepProps) {
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode) {
      onSubmit(otpCode);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
        Enviamos um código de verificação para o telefone cadastrado no final <strong>{phoneHint}</strong>.
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700 uppercase">Código OTP (6 dígitos)</label>
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="pl-9 text-center tracking-widest font-mono text-lg"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-1/3 justify-center"
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="w-2/3 justify-center"
          disabled={isLoading}
        >
          {isLoading ? 'Verificando...' : 'Entrar no ERP'}
        </Button>
      </div>
    </form>
  );
}