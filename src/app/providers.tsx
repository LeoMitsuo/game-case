'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  // O cliente nasce dentro do componente, não no escopo do módulo:
  // no servidor, um cliente de módulo seria compartilhado entre requisições
  // de usuários diferentes.
  const [clienteQuery] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={clienteQuery}>{children}</QueryClientProvider>;
}