import type { SalonNotification, SalonNotificationWsPayload } from '@/shared/api/types';

export const toNotificationWsPayload = (
  notification: SalonNotification,
): SalonNotificationWsPayload => ({
  id: notification.id,
  client_id: notification.client_id,
  title: notification.title,
  body: notification.body,
  type: notification.type,
  scheduled_at: notification.scheduled_at,
  delivered_at: notification.delivered_at,
});

export const isNotificationDue = (notification: SalonNotification, nowMs = Date.now()): boolean =>
  new Date(notification.scheduled_at).getTime() <= nowMs;

export const shouldShowNotification = (
  notification: SalonNotification,
  shownIds: ReadonlySet<number>,
  nowMs = Date.now(),
): boolean => {
  if (shownIds.has(notification.id)) return false;
  if (notification.delivered_at) return true;
  return isNotificationDue(notification, nowMs);
};

export const getNotificationDelayMs = (
  notification: SalonNotification,
  nowMs = Date.now(),
): number => Math.max(0, new Date(notification.scheduled_at).getTime() - nowMs);
