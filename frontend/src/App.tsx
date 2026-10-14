// frontend/src/App.tsx

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsPage } from '@/features/clients/components/ClientsPage';
import { ToastProvider } from '@/components/ui/Toaster';
import { Navbar } from '@/components/layout/Navbar';
import { MaterialsPage } from "@/features/materials/components/MaterialsPage";
import { RentalsPage } from "@/features/rentals/components/RentalsPage";
import { WelcomePage } from "@/features/dashboard/components/WelcomePage";
import { AnalyticsPage } from "@/features/analytics/components/AnalyticsPage";
import { LoginPage } from "@/features/users/components/LoginPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  const [currentTab, setCurrentTab] = useState<'welcome' | 'clients' | 'materials' | 'rentals' | 'analytics'>('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; is_admin: boolean } | null>(null);

  // Verifica a sessão gravada no localStorage ao carregar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('erp_access_token');
    const storedUser = localStorage.getItem('erp_user');

    if (token && storedUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        handleLogout();
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_access_token');
    localStorage.removeItem('erp_user');
    setIsAuthenticated(false);
    setUser(null);
    queryClient.clear(); // Limpa o cache do React Query
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />

      {!isAuthenticated ? (
        /* Se não estiver autenticado, bloqueia todas as abas e exibe a tela de login/2FA */
        <LoginPage onSuccessLogin={handleLoginSuccess} />
      ) : (
        /* Se autenticado, exibe o painel completo do ERP */
        <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-20 md:pb-8">
          <Navbar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            user={user}
            onLogout={handleLogout}
          />

          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {currentTab === 'welcome' && <WelcomePage onSelectTab={setCurrentTab} />}
            {currentTab === 'clients' && <ClientsPage />}
            {currentTab === 'materials' && <MaterialsPage />}
            {currentTab === 'rentals' && <RentalsPage />}
            {currentTab === 'analytics' && <AnalyticsPage />}
          </main>
        </div>
      )}
    </QueryClientProvider>
  );
}

export default App;