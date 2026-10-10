// frontend/src/components/layout/Navbar.tsx

import { Users, Package } from 'lucide-react';

interface NavbarProps {
  currentTab: 'clients' | 'materials' | 'rentals';
  onSelectTab: (tab: 'clients' | 'materials' | 'rentals') => void;
}

export function Navbar({ currentTab, onSelectTab }: NavbarProps) {
  const navItems = [
    {
      id: 'clients' as const,
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'materials' as const,
      label: 'Materiais',
      icon: Package,
    },
    {
      id: 'rentals' as const,
      label: 'Locação',
      icon: Package,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Identificação Minimalista do App */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
            R
          </div>
          <span className="font-semibold text-gray-900 tracking-tight text-base">
            ERP Rental
          </span>
        </div>

        {/* Navegação Desktop (Abas no Topo) */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Navegação Mobile (Barra Inferior Fixa) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'text-gray-900 font-semibold' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}