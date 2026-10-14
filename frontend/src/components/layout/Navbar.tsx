// frontend/src/components/layout/Navbar.tsx

import { NavbarBrand } from './NavbarBrand';
import { NavbarNav, type TabType } from './NavbarNav';
import { NavbarUserMenu } from './NavbarUserMenu';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user?: { username: string; is_admin: boolean } | null;
  onLogout?: () => void;
}

export function Navbar({ currentTab, onSelectTab, user, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logotipo / Marca */}
        <NavbarBrand />

        {/* Navegação Desktop */}
        <NavbarNav currentTab={currentTab} onSelectTab={onSelectTab} variant="desktop" />

        {/* Perfil e Logout (Desktop) */}
        {user && onLogout && <NavbarUserMenu user={user} onLogout={onLogout} />}
      </div>

      {/* Navegação Mobile (Barra Inferior Fixa) */}
      <NavbarNav
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        variant="mobile"
        user={user}
        onLogout={onLogout}
      />
    </header>
  );
}