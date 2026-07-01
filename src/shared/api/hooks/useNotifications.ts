import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiDelete,
  apiFetchAllPost,
  apiPost,
  apiRequest,
} from '@/shared/api/client';
import { queryKeys } from '@/shared/api/query-keys';
import type {
  SalonNotification,
  SalonNotificationCreatePayload,
} from '@/shared/api/types';
import { addNotification } from '@/shared/lib/notifications';

export const useNotifications = () =>
  useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => apiFetchAllPost<SalonNotification>('/api/v1/notifications'),
  });

export const useNotification = (id: number) =>
  useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => apiRequest<SalonNotification>(`/api/v1/notifications/${id}`),
    enabled: id > 0,
  });

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalonNotificationCreatePayload) =>
      apiPost<SalonNotification, SalonNotificationCreatePayload>(
        '/api/v1/notifications',
        payload,
      ),
    onSuccess: (created) => {
      queryClient.setQueryData<SalonNotification[]>(queryKeys.notifications.all, (old) => {
        if (!old) return [created];
        if (old.some((item) => item.id === created.id)) return old;
        return [created, ...old];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      addNotification.success({ message: 'Уведомление создано' });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/v1/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      addNotification.success({ message: 'Уведомление удалено' });
    },
  });
};
