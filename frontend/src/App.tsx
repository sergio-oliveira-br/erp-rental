// frontend/src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
        {/* Router / Layouts serão inseridos aqui */}
        <main className="p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-primary">ERP Rental Management</h1>
          <p className="mt-2 text-gray-600">Sistema configurado e pronto para renderizar os módulos.</p>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;