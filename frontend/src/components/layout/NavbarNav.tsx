// frontend/src/components/layout/NavbarNav.tsx

import { Users, Package, LayoutDashboard, BarChart3, LogOut, NotepadText, UserPlus } from 'lucide-react';

// 1. Adicionado 'users' às opções válidas de abas
export type TabType = 'welcome' | 'clients' | 'materials' | 'rentals' | 'analytics' | 'users';

export interface NavItem {
  id: TabType;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean; // Flag para identificar rotas exclusivas de admin
}

const NAV_ITEMS: NavItem[] = [
  { id: 'welcome', label: 'Início', icon: LayoutDashboard },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'materials', label: 'Materiais', icon: Package },
  { id: 'rentals', label: 'Locação', icon: NotepadText },
  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Usuários', icon: UserPlus, adminOnly: true }, // Nova aba exclusiva para Admin
];

interface NavbarNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  variant: 'desktop' | 'mobile';
  user?: { username: string; is_admin: boolean } | null;
  onLogout?: () => void;
}

export function NavbarNav({ currentTab, onSelectTab, variant, user, onLogout }: NavbarNavProps) {
  // Filtra os itens da navbar: se o item for adminOnly, só exibe se o usuário for admin
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return user?.is_admin === true;
    }
    return true;
  });

  if (variant === 'desktop') {
    return (
      <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
        {filteredNavItems.map((item) => {
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
    );
  }

  // Versão Mobile (Barra Inferior Fixa)
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-gray-900 font-semibold' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {user && onLogout && (
          <button
            onClick={onLogout}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        )}
      </div>
    </div>
  );
}