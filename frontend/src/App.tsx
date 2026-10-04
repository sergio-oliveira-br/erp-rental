// frontend/src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsPage } from '@/features/clients/components/ClientsPage';

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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <main className="p-6 max-w-7xl mx-auto">
          <ClientsPage />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;