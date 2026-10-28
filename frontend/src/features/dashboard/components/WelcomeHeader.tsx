
import { Sparkles, Calendar } from 'lucide-react';
import { useDashboardUser } from '@/features/dashboard/hooks/useDashboard';

interface WelcomeHeaderProps {
  activeCount: number;
}

export function WelcomeHeader({ activeCount }: WelcomeHeaderProps) {
  const { data: user, isLoading, isError } = useDashboardUser();

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayName = isLoading
    ? '...'
    : isError
      ? 'Usuário'
      : user?.username || 'Usuário';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Visão Geral do Sistema
        </div>

        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          Olá, {displayName}.
        </h1>

        <p className="text-sm text-gray-500">
          Você possui{' '}
          <span className="font-semibold text-gray-800">
            {activeCount} contratos ativos
          </span>{' '}
          sob gestão no momento.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 self-start md:self-auto">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="capitalize">{currentDate}</span>
      </div>
    </div>
  );
}
