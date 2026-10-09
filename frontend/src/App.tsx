// frontend/src/App.tsx

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsPage } from '@/features/clients/components/ClientsPage';
import { ToastProvider } from '@/components/ui/Toaster';
import { Navbar } from '@/components/layout/Navbar.tsx';
import { Package } from 'lucide-react';

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
  const [currentTab, setCurrentTab] = useState<'clients' | 'materials'>('clients');

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />

      <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-20 md:pb-8">
        {/* Navbar Responsiva */}
        <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Conteúdo Principal */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'clients' && <ClientsPage />}

          {currentTab === 'materials' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Gestão de Materiais
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Controle de equipamentos e patrimônio.
                </p>
              </div>

              <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center shadow-xs">
                <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Módulo de Materiais</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mt-1">
                 msg genérica para teste  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">Material</code>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;