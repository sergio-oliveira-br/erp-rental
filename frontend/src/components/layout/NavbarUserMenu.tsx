// frontend/src/components/layout/NavbarUserMenu.tsx

import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarUserMenuProps {
  user: { username: string; is_admin: boolean };
  onLogout: () => void;
}

export function NavbarUserMenu({ user, onLogout }: NavbarUserMenuProps) {
  return (
    <div className="hidden md:flex items-center gap-4">
      <div className="text-right">
        <div className="text-xs font-semibold text-gray-900 flex items-center gap-1 justify-end">
          {user.username}
          {user.is_admin &&
              <span title="Administrador" className="inline-flex">
                <Shield className="w-3 h-3 text-primary" />
            </span>}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
          {user.is_admin ? 'Admin' : 'Operador'}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="text-gray-600 hover:text-rose-600 hover:border-rose-200 gap-1.5"
        title="Encerrar Sessão"
      >
        <LogOut className="w-4 h-4" />
        <span>Sair</span>
      </Button>
    </div>
  );
}