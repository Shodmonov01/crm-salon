import React from 'react';
import { Badge, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { Bell } from '@phosphor-icons/react';
import type { SalonNotificationWsPayload } from '@/shared/api/types';
import { formatDateTime, NOTIFICATION_TYPE_LABELS } from '@/shared/lib/format';
import styles from './salon-notification-alert-modal.module.css';

interface SalonNotificationAlertModalProps {
  notification: SalonNotificationWsPayload | null;
  queueLength: number;
  onDismiss: () => void;
}

export const SalonNotificationAlertModal: React.FC<SalonNotificationAlertModalProps> = ({
  notification,
  queueLength,
  onDismiss,
}) => (
  <Modal
    opened={notification != null}
    onClose={onDismiss}
    centered
    radius="lg"
    size="md"
    withCloseButton
    closeOnClickOutside={false}
    closeOnEscape
    overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    title={null}
    padding="xl"
    zIndex={1100}
  >
    {notification && (
      <Stack gap="md" className={styles.modalContent}>
        <div className={styles.iconWrap}>
          <Bell size={36} weight="fill" />
        </div>

        <Badge size="sm" variant="light" mx="auto">
          {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
        </Badge>

        <Text size="xl" fw={700}>
          {notification.title ?? 'Напоминание'}
        </Text>

        <Text size="md" c="dimmed" className={styles.body}>
          {notification.body}
        </Text>

        <Text size="xs" c="dimmed" className={styles.meta}>
          Запланировано: {formatDateTime(notification.scheduled_at)}
        </Text>

        {queueLength > 1 && (
          <Text size="xs" c="dimmed">
            Ещё {queueLength - 1} уведомлений в очереди
          </Text>
        )}

        <Group justify="center" mt="sm">
          <Button size="md" onClick={onDismiss} autoFocus>
            Понятно
          </Button>
        </Group>
      </Stack>
    )}
  </Modal>
);
