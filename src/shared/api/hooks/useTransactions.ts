import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetchAllPost, apiPost, apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/query-keys';
import type { Transaction, TransactionCreatePayload } from '@/shared/api/types';
import { addNotification } from '@/shared/lib/notifications';

interface UseTransactionsOptions {
  enabled?: boolean;
}

export const useTransactions = (options?: UseTransactionsOptions) =>
  useQuery({
    queryKey: queryKeys.transactions.all,
    queryFn: () => apiFetchAllPost<Transaction>('/api/v1/transactions'),
    enabled: options?.enabled ?? true,
  });

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransactionCreatePayload) =>
      apiPost<Transaction, TransactionCreatePayload>('/api/v1/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      addNotification.success({ message: 'Транзакция добавлена' });
    },
    onError: (error: Error) => {
      addNotification.error({
        message: error.message || 'Не удалось создать транзакцию',
      });
    },
  });
};

export const useTransaction = (id: number) =>
  useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: () => apiRequest<Transaction>(`/api/v1/transactions/${id}`),
    enabled: id > 0,
  });

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiPost<Transaction, Record<string, never>>(
        `/api/v1/transactions/${id}/cancel`,
        {},
      ),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Transaction[]>(queryKeys.transactions.all, (prev) =>
        prev?.map((item) => (item.id === id ? { ...item, cancelled: true } : item)),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(id) });
      addNotification.success({ message: 'Транзакция отменена' });
    },
    onError: (error: Error) => {
      addNotification.error({
        message: error.message || 'Не удалось отменить транзакцию',
      });
    },
  });
};
