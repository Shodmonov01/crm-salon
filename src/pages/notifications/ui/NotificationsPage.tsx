import React from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Skeleton,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { Plus, Trash } from '@phosphor-icons/react';
import {
  useCreateNotification,
  useDeleteNotification,
  useNotifications,
} from '@/shared/api/hooks/useNotifications';
import type { SalonNotificationType } from '@/shared/api/types';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { useNotificationsWs } from '@/shared/lib/notifications/NotificationsWsProvider';
import { formatDateTime, NOTIFICATION_TYPE_LABELS } from '@/shared/lib/format';
import styles from './notifications-page.module.css';

export const NotificationsPage: React.FC = () => {
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [type, setType] = React.useState<SalonNotificationType>('reminder');
  const [scheduledAt, setScheduledAt] = React.useState('');

  const { connected } = useNotificationsWs();
  const { data: notifications, isLoading, isError } = useNotifications();
  const createNotification = useCreateNotification();
  const deleteNotification = useDeleteNotification();

  const submitForm = React.useCallback(() => {
    createNotification.mutate(
      {
        title: title || null,
        body,
        type,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          setTitle('');
          setBody('');
          setScheduledAt('');
        },
      },
    );
  }, [title, body, type, scheduledAt, createNotification]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton height={48} mb="md" />
        <Skeleton height={400} radius="md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <Alert color="red" title="Не удалось загрузить уведомления">
          Проверьте доступность API
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Group gap="sm">
            <Text size="xl" fw={700}>
              Уведомления
            </Text>
            <Badge
              variant="light"
              color={connected ? 'green' : 'gray'}
              leftSection={
                <span
                  className={`${styles.statusDot} ${connected ? styles.statusDot_online : styles.statusDot_offline}`}
                />
              }
            >
              {connected ? 'Поток подключён' : 'Поток отключён'}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mt={2}>
            {notifications?.length ?? 0} уведомлений
          </Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setFormOpen(true)}>
          Создать
        </Button>
      </div>

      <Card padding={0} radius="lg" shadow="xs" className={styles.tableCard}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Тип</Table.Th>
              <Table.Th>Заголовок</Table.Th>
              <Table.Th>Текст</Table.Th>
              <Table.Th>Запланировано</Table.Th>
              <Table.Th w={48} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(notifications ?? []).map((item) => (
              <Table.Tr key={item.id} className={styles.tableRow}>
                <Table.Td>
                  <Badge size="sm" variant="light">
                    {NOTIFICATION_TYPE_LABELS[item.type] ?? item.type}
                  </Badge>
                </Table.Td>
                <Table.Td>{item.title ?? '—'}</Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {item.body}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs">{formatDateTime(item.scheduled_at)}</Text>
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => setDeleteTarget(item.id)}
                  >
                    <Trash size={14} />
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={formOpen} onClose={() => setFormOpen(false)} title="Новое уведомление" radius="md">
        <Select
          label="Тип"
          mb="md"
          data={[
            { value: 'reminder', label: 'Напоминание' },
            { value: 'other', label: 'Другое' },
          ]}
          value={type}
          onChange={(value) => setType((value as SalonNotificationType) ?? 'reminder')}
        />
        <TextInput label="Заголовок" mb="md" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        <Textarea
          label="Текст"
          required
          mb="md"
          minRows={3}
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
        />
        <TextInput
          label="Запланировать на"
          type="datetime-local"
          mb="lg"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setFormOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submitForm} loading={createNotification.isPending} disabled={!body}>
            Создать
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={deleteTarget != null}
        title="Удалить уведомление"
        message="Удалить это уведомление?"
        loading={deleteNotification.isPending}
        onConfirm={() =>
          deleteTarget != null &&
          deleteNotification.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) })
        }
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
