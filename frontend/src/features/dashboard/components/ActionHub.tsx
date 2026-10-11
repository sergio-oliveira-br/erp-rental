// frontend/src/features/dashboard/components/ActionHub.tsx

import { PlusCircle, Users, Package, BarChart3, ArrowRight } from 'lucide-react';

interface ActionHubProps {
  onSelectTab: (tab: 'welcome' | 'clients' | 'materials' | 'rentals') => void;
  onOpenNewRental?: () => void; // Opcional caso queira abrir o modal diretamente
}

export function ActionHub({ onSelectTab }: ActionHubProps) {
  const actions = [
    {
      title: 'Nova Locação',
      description: 'Emitir um novo contrato de aluguel de equipamento',
      icon: PlusCircle,
      color: 'text-primary bg-primary/10',
      tab: 'rentals' as const,
    },
    {
      title: 'Gerenciar Clientes',
      description: 'Cadastrar ou consultar base de clientes',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      tab: 'clients' as const,
    },
    {
      title: 'Controle de Materiais',
      description: 'Verificar disponibilidade de equipamentos na frota',
      icon: Package,
      color: 'text-indigo-600 bg-indigo-50',
      tab: 'materials' as const,
    },
    {
      title: 'Gestão de Locações',
      description: 'Consultar contratos ativos, histórico e pagamentos',
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50',
      tab: 'rentals' as const,
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
        Ações Rápidas & Atalhos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(action.tab)}
              className="group bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-4 pt-3 border-t border-gray-50">
                Acessar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}