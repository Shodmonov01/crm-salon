import React from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Indicator,
  Menu,
  Modal,
  PasswordInput,
  Popover,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { Bell, Key, List, Scissors, SignOut, User } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/shared/api/hooks/useNotifications';
import { useLogout, useChangePassword } from '@/shared/api/hooks/useAuth';
import { authStorage } from '@/shared/api/client';
import { useNotificationsWs } from '@/shared/lib/notifications/NotificationsWsProvider';
import { formatDateTime } from '@/shared/lib/format';
import { AUTH_ENABLED } from '@/shared/config/env';
import styles from './header.module.css';
import { PersonAvatar } from '@/shared/ui';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  const { connected } = useNotificationsWs();
  const { data: notifications } = useNotifications();
  const logout = useLogout();
  const changePassword = useChangePassword();
  const recent = (notifications ?? []).slice(0, 5);

  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleLogout = () => {
    logout.mutate();
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    changePassword.mutate(
      { old_password: oldPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setChangePasswordOpen(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  const isPasswordValid = oldPassword && newPassword && newPassword === confirmPassword && newPassword.length >= 6;
  const tenantName = authStorage.getTenantName() ?? 'Salon CRM';

  return (
    <header className={styles.header}>
      <Group gap="md" className={styles.left}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <List size={20} />
        </ActionIcon>

        <Group gap={8} className={styles.logo}>
          <div className={styles.logoIcon}>
            <Scissors size={18} weight="bold" color="white" />
          </div>
          <Text fw={700} size="sm" className={styles.logoText}>
            {tenantName}
          </Text>
        </Group>
      </Group>

      <Group gap="sm" className={styles.right}>
        <Popover width={320} position="bottom-end" shadow="md" radius="md">
          <Popover.Target>
            <Indicator
              color={connected ? 'green' : 'gray'}
              size={8}
              offset={4}
              disabled={!connected}
            >
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Уведомления">
                <Bell size={20} />
              </ActionIcon>
            </Indicator>
          </Popover.Target>
          <Popover.Dropdown p={0}>
            <Stack gap={0}>
              <Group justify="space-between" px="md" py="sm">
                <Text size="sm" fw={600}>
                  Уведомления
                </Text>
                <Badge size="xs" variant="light" color={connected ? 'green' : 'gray'}>
                  {connected ? 'online' : 'offline'}
                </Badge>
              </Group>
              <ScrollArea.Autosize mah={280}>
                {recent.length === 0 ? (
                  <Text size="sm" c="dimmed" px="md" py="sm">
                    Нет уведомлений
                  </Text>
                ) : (
                  recent.map((item) => (
                    <div key={item.id} className={styles.notificationItem}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {item.title ?? 'Уведомление'}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {item.body}
                      </Text>
                      <Text size="xs" c="dimmed" mt={4}>
                        {formatDateTime(item.scheduled_at)}
                      </Text>
                    </div>
                  ))
                )}
              </ScrollArea.Autosize>
              <Link to="/notifications" className={styles.notificationsLink}>
                Все уведомления
              </Link>
            </Stack>
          </Popover.Dropdown>
        </Popover>

        {AUTH_ENABLED ? (
          <Menu shadow="md" width={200} position="bottom-end" radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Профиль">
                <PersonAvatar seed={1} initials="A" size="md" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Аккаунт</Menu.Label>
              <Menu.Item leftSection={<User size={14} />} disabled>
                Профиль
              </Menu.Item>
              <Menu.Item
                leftSection={<Key size={14} />}
                onClick={() => setChangePasswordOpen(true)}
              >
                Сменить пароль
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<SignOut size={14} />}
                color="red"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                {logout.isPending ? 'Выход...' : 'Выйти'}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Avatar size="sm" radius="md" color="blue">
            CRM
          </Avatar>
        )}
      </Group>

      <Modal
        opened={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Смена пароля"
        radius="md"
      >
        <Stack gap="md">
          <PasswordInput
            label="Текущий пароль"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.currentTarget.value)}
          />
          <PasswordInput
            label="Новый пароль"
            required
            description="Минимум 6 символов"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            error={newPassword && newPassword.length < 6 ? 'Минимум 6 символов' : undefined}
          />
          <PasswordInput
            label="Подтверждение пароля"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            error={
              confirmPassword && newPassword !== confirmPassword
                ? 'Пароли не совпадают'
                : undefined
            }
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setChangePasswordOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleChangePassword}
              loading={changePassword.isPending}
              disabled={!isPasswordValid}
            >
              Сменить пароль
            </Button>
          </Group>
        </Stack>
      </Modal>
    </header>
  );
};
