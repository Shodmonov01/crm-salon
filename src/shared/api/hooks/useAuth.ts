import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiPost, authStorage } from '@/shared/api/client';
import type { LoginPayload, StaffLoginResponse } from '@/shared/api/types';
import { addNotification } from '@/shared/lib/notifications';

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface PasswordResetResponse {
  new_password: string;
}

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPost<StaffLoginResponse, LoginPayload>('/api/v1/auth/login', payload),
    onSuccess: (staff) => {
      authStorage.setAuthenticated(true);
      if (staff.tenant_name) {
        authStorage.setTenantName(staff.tenant_name);
      }
      addNotification.success({ message: 'Вход выполнен' });
    },
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void, Record<string, never>>('/api/v1/auth/logout', {}),
    onSuccess: () => {
      // Очищаем авторизацию
      authStorage.setAuthenticated(false);
      
      // Очищаем весь кэш React Query
      queryClient.clear();
      
      // Редирект на login
      window.location.href = '/login';
      
      addNotification.success({ message: 'Выход выполнен' });
    },
    onError: () => {
      // Даже если запрос упал, выполняем logout локально
      authStorage.setAuthenticated(false);
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};

export const useRefreshToken = () =>
  useMutation({
    mutationFn: () => apiPost<void, Record<string, never>>('/api/v1/auth/refresh', {}),
    onSuccess: () => {
      authStorage.setAuthenticated(true);
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      apiPost<void, ChangePasswordPayload>('/api/v1/auth/change-password', payload),
    onSuccess: () => {
      addNotification.success({ message: 'Пароль успешно изменён' });
    },
    onError: (error: Error) => {
      addNotification.error({
        message: error.message || 'Не удалось изменить пароль',
      });
    },
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (userId: number) =>
      apiPatch<PasswordResetResponse, Record<string, never>>(
        `/api/v1/auth/reset-password?id=${userId}`,
        {},
      ),
    onSuccess: (result) => {
      addNotification.success({
        message: `Новый пароль: ${result.new_password}`,
      });
    },
    onError: (error: Error) => {
      addNotification.error({
        message: error.message || 'Не удалось сбросить пароль',
      });
    },
  });
