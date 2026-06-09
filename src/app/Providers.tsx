import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '@/shared/config';

import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" zIndex={1000} />
      <BrowserRouter>{children}</BrowserRouter>
    </MantineProvider>
  </QueryClientProvider>
);
