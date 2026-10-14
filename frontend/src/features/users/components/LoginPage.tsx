// frontend/src/features/users/components/LoginPage.tsx

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLoginStep1, useVerify2FA } from '../hooks/useUsers';
import { LoginFormStep } from './LoginFormStep';
import { TwoFactorFormStep } from './TwoFactorFormStep';

interface LoginPageProps {
  onSuccessLogin: () => void;
}

export function LoginPage({ onSuccessLogin }: LoginPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [phoneHint, setPhoneHint] = useState('');

  const loginStep1 = useLoginStep1();
  const verify2FA = useVerify2FA();

  const handleStep1Submit = async (userVal: string, passVal: string) => {
    setUsername(userVal);
    const res = await loginStep1.mutateAsync({ username: userVal, password: passVal });
    if (res.requires_2fa) {
      setPhoneHint(res.phone_hint);
      setStep(2);
    }
  };

  const handleStep2Submit = async (codeVal: string) => {
    await verify2FA.mutateAsync({ username, code: codeVal });
    onSuccessLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">

        {/* Header do Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary/10 text-primary rounded-xl mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Locações</h1>
          <p className="text-sm text-gray-500">
            {step === 1 ? 'Insira suas credenciais para acessar o sistema' : 'Verificação de Segurança (2FA)'}
          </p>
        </div>

        {/* Renderização Condicional Limpa */}
        {step === 1 ? (
          <LoginFormStep
            onSubmit={handleStep1Submit}
            isLoading={loginStep1.isPending}
          />
        ) : (
          <TwoFactorFormStep
            phoneHint={phoneHint}
            onBack={() => setStep(1)}
            onSubmit={handleStep2Submit}
            isLoading={verify2FA.isPending}
          />
        )}
      </div>
    </div>
  );
}