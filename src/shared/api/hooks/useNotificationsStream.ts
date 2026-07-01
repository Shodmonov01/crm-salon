import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/shared/config/env';
import { queryKeys } from '@/shared/api/query-keys';
import type { SalonNotificationWsPayload } from '@/shared/api/types';
import { addNotification } from '@/shared/lib/notifications';

export const useNotificationsStream = (enabled = true) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('✅ SSE подключение установлено');
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: SalonNotificationWsPayload = JSON.parse(event.data);

        // Показываем toast уведомление
        addNotification.info({
          message: notification.title
            ? `${notification.title}: ${notification.body}`
            : notification.body,
        });

        // Инвалидируем кэш уведомлений для обновления списка
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      } catch (err) {
        console.error('❌ Не удалось обработать SSE сообщение:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Ошибка подключения к серверу уведомлений');
      console.error('❌ SSE соединение потеряно');
      eventSource.close();
    };

    return () => {
      console.log('🔌 Закрываем SSE соединение');
      eventSource.close();
      setIsConnected(false);
    };
  }, [enabled, queryClient]);

  return { isConnected, error };
};
