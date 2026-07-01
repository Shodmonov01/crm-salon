import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiDelete,
  apiFetchAllPost,
  apiPatch,
  apiPost,
  apiPostGetMany,
  apiRequest,
} from '@/shared/api/client';
import { queryKeys } from '@/shared/api/query-keys';
import type { Appointment, AppointmentCreatePayload } from '@/shared/api/types';
import { addNotification } from '@/shared/lib/notifications';

export const useAppointments = () =>
  useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: () => apiFetchAllPost<Appointment>('/api/v1/appointments'),
    staleTime: 1 * 60 * 1000, // 1 минута - часто обновляется
  });

export const useAppointment = (id: number) =>
  useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => apiRequest<Appointment>(`/api/v1/appointments/${id}`),
    enabled: id > 0,
  });

export const useAppointmentsMany = (ids: number[]) =>
  useQuery({
    queryKey: queryKeys.appointments.many(ids),
    queryFn: () => apiPostGetMany<Appointment>('/api/v1/appointments', ids),
    enabled: ids.length > 0,
  });

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AppointmentCreatePayload) =>
      apiPost<Appointment, AppointmentCreatePayload>('/api/v1/appointments/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      addNotification.success({ message: 'Запись создана' });
    },
    onError: (error: Error) => {
      addNotification.error({ message: error.message || 'Не удалось создать запись' });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiPatch<Appointment, Record<string, never>>(
        `/api/v1/appointments/${id}/cancel`,
        {},
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
      addNotification.success({ message: 'Запись отменена' });
    },
    onError: (error: Error) => {
      addNotification.error({ message: error.message || 'Не удалось отменить запись' });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/v1/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      addNotification.success({ message: 'Запись удалена' });
    },
    onError: (error: Error) => {
      addNotification.error({ message: error.message || 'Не удалось удалить запись' });
    },
  });
};
