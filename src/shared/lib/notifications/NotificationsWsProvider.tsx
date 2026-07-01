import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetchAllPost, authStorage, API_BASE_URL } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/query-keys';
import type { SalonNotification, SalonNotificationWsPayload } from '@/shared/api/types';
import { SalonNotificationAlertModal } from '@/shared/lib/notifications/SalonNotificationAlertModal';
import {
  getNotificationDelayMs,
  shouldShowNotification,
  toNotificationWsPayload,
} from '@/shared/lib/notifications/notificationDelivery';
import {
  playNotificationSound,
  unlockNotificationAudio,
} from '@/shared/lib/notifications/playNotificationSound';

interface NotificationsWsContextValue {
  connected: boolean;
  liveNotifications: SalonNotificationWsPayload[];
}

const NotificationsWsContext = React.createContext<NotificationsWsContextValue>({
  connected: false,
  liveNotifications: [],
});

export const useNotificationsWs = (): NotificationsWsContextValue =>
  React.useContext(NotificationsWsContext);

const RECONNECT_DELAY_MS = 5000;
const POLL_INTERVAL_MS = 10_000;

const toSalonNotification = (payload: SalonNotificationWsPayload): SalonNotification => ({
  id: payload.id,
  client_id: payload.client_id ?? null,
  title: payload.title,
  body: payload.body,
  type: payload.type,
  scheduled_at: payload.scheduled_at,
  delivered_at: payload.delivered_at ?? new Date().toISOString(),
  created_at: payload.scheduled_at,
  updated_at: payload.scheduled_at,
});

export const NotificationsWsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [connected, setConnected] = React.useState(false);
  const [liveNotifications, setLiveNotifications] = React.useState<SalonNotificationWsPayload[]>([]);
  const [alertQueue, setAlertQueue] = React.useState<SalonNotificationWsPayload[]>([]);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimerRef = React.useRef<number | null>(null);
  const shownIdsRef = React.useRef<Set<number>>(new Set());
  const scheduleTimersRef = React.useRef<Map<number, number>>(new Map());

  const isAuthenticated = authStorage.isAuthenticated();

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => apiFetchAllPost<SalonNotification>('/api/v1/notifications'),
    enabled: isAuthenticated,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const currentAlert = alertQueue[0] ?? null;

  const showAlert = React.useCallback((payload: SalonNotificationWsPayload) => {
    if (shownIdsRef.current.has(payload.id)) return;
    shownIdsRef.current.add(payload.id);

    const timerId = scheduleTimersRef.current.get(payload.id);
    if (timerId != null) {
      window.clearTimeout(timerId);
      scheduleTimersRef.current.delete(payload.id);
    }

    setAlertQueue((prev) => {
      if (prev.some((item) => item.id === payload.id)) return prev;
      const next = [...prev, payload];
      if (prev.length === 0) {
        playNotificationSound();
      }
      return next;
    });
  }, []);

  const handleIncoming = React.useCallback(
    (payload: SalonNotificationWsPayload) => {
      setLiveNotifications((prev) => [payload, ...prev].slice(0, 50));

      queryClient.setQueryData<SalonNotification[]>(queryKeys.notifications.all, (old) => {
        const item = toSalonNotification(payload);
        if (!old) return [item];
        if (old.some((n) => n.id === item.id)) {
          return old.map((n) => (n.id === item.id ? { ...n, delivered_at: item.delivered_at } : n));
        }
        return [item, ...old];
      });

      showAlert(payload);
    },
    [queryClient, showAlert],
  );

  const dismissAlert = React.useCallback(() => {
    setAlertQueue((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        playNotificationSound();
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (!notifications) return;

    const activeIds = new Set(notifications.map((item) => item.id));
    for (const [id, timerId] of scheduleTimersRef.current) {
      if (!activeIds.has(id)) {
        window.clearTimeout(timerId);
        scheduleTimersRef.current.delete(id);
      }
    }

    const nowMs = Date.now();

    for (const notification of notifications) {
      if (!shouldShowNotification(notification, shownIdsRef.current, nowMs)) {
        if (!notification.delivered_at && getNotificationDelayMs(notification, nowMs) > 0) {
          if (!scheduleTimersRef.current.has(notification.id)) {
            const delay = getNotificationDelayMs(notification, nowMs);
            const timerId = window.setTimeout(() => {
              scheduleTimersRef.current.delete(notification.id);
              showAlert(toNotificationWsPayload(notification));
            }, delay);
            scheduleTimersRef.current.set(notification.id, timerId);
          }
        }
        continue;
      }

      showAlert(toNotificationWsPayload(notification));
    }
  }, [notifications, showAlert]);

  React.useEffect(() => {
    const unlock = () => unlockNotificationAudio();

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const connect = () => {
      if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

      const eventSource = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream`, {
        withCredentials: true,
      });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
      };

      eventSource.addEventListener('connected', () => {
        setConnected(true);
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const payload = JSON.parse(event.data) as SalonNotificationWsPayload;
          handleIncoming(payload);
        } catch (err) {
          console.error('Ошибка обработки SSE уведомления:', err);
        }
      });

      eventSource.onerror = () => {
        setConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        if (authStorage.isAuthenticated()) {
          reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimerRef.current != null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [handleIncoming, isAuthenticated]);

  React.useEffect(
    () => () => {
      for (const timerId of scheduleTimersRef.current.values()) {
        window.clearTimeout(timerId);
      }
      scheduleTimersRef.current.clear();
    },
    [],
  );

  const value = React.useMemo(
    () => ({ connected, liveNotifications }),
    [connected, liveNotifications],
  );

  return (
    <NotificationsWsContext.Provider value={value}>
      {children}
      <SalonNotificationAlertModal
        notification={currentAlert}
        queueLength={alertQueue.length}
        onDismiss={dismissAlert}
      />
    </NotificationsWsContext.Provider>
  );
};
