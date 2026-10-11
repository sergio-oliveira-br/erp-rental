// frontend/src/App.tsx

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsPage } from '@/features/clients/components/ClientsPage';
import { ToastProvider } from '@/components/ui/Toaster';
import { Navbar } from '@/components/layout/Navbar.tsx';
import { MaterialsPage } from "@/features/materials/components/MaterialsPage.tsx";
import { RentalsPage } from "@/features/rentals/components/RentalsPage.tsx";
import { WelcomePage } from "@/features/dashboard/components/WelcomePage.tsx";

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
  // Adicionamos 'welcome' como uma opção válida de aba (e podemos definir como padrão inicial se desejar)
  const [currentTab, setCurrentTab] = useState<'welcome' | 'clients' | 'materials' | 'rentals'>('welcome');

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />

      <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-20 md:pb-8">
        <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'welcome' && <WelcomePage onSelectTab={setCurrentTab} />}
          {currentTab === 'clients' && <ClientsPage />}
          {currentTab === 'materials' && <MaterialsPage />}
          {currentTab === 'rentals' && <RentalsPage />}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;