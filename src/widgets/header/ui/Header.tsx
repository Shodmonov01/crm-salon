import React from 'react';
import {
  Group,
  TextInput,
  ActionIcon,
  Avatar,
  Menu,
  Text,
  Badge,
  Indicator,
  UnstyledButton,
} from '@mantine/core';
import {
  List,
  MagnifyingGlass,
  Bell,
  Buildings,
  CaretDown,
  User,
  Gear,
  SignOut,
  Scissors,
} from '@phosphor-icons/react';
import styles from './header.module.css';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  return (
    <header className={styles.header}>
      <Group gap="md" className={styles.left}>
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={onToggle} aria-label="Toggle sidebar">
          <List size={20} />
        </ActionIcon>

        <Group gap={8} className={styles.logo}>
          <div className={styles.logoIcon}>
            <Scissors size={18} weight="bold" color="white" />
          </div>
          <Text fw={700} size="sm" className={styles.logoText}>
            Salon CRM
          </Text>
        </Group>
      </Group>

      <div className={styles.center}>
        <TextInput
          placeholder="Поиск клиентов, записей..."
          leftSection={<MagnifyingGlass size={16} />}
          className={styles.search}
          size="sm"
        />
      </div>

      <Group gap="sm" className={styles.right}>
        <Menu shadow="md" width={200} radius="md">
          <Menu.Target>
            <UnstyledButton className={styles.branchButton}>
              <Buildings size={16} />
              <Text size="sm" fw={500}>Главный филиал</Text>
              <CaretDown size={14} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Филиалы</Menu.Label>
            <Menu.Item leftSection={<Buildings size={14} />}>
              Главный филиал
            </Menu.Item>
            <Menu.Item leftSection={<Buildings size={14} />} disabled>
              Филиал 2 <Badge size="xs" ml={4}>Скоро</Badge>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Indicator color="red" size={8} offset={4} processing>
          <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Notifications">
            <Bell size={20} />
          </ActionIcon>
        </Indicator>

        <Menu shadow="md" width={200} radius="md">
          <Menu.Target>
            <UnstyledButton>
              <Avatar size="sm" radius="md" color="blue">
                АД
              </Avatar>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Администратор</Menu.Label>
            <Menu.Item leftSection={<User size={14} />}>Профиль</Menu.Item>
            <Menu.Item leftSection={<Gear size={14} />}>Настройки</Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<SignOut size={14} />} color="red">
              Выйти
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </header>
  );
};

