import React from 'react';
import { Stack, Text, Tooltip, Divider } from '@mantine/core';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarBlank,
  Users,
  Scissors,
  UserList,
  CurrencyDollar,
  Package,
  ChartBar,
  Gear,
} from '@phosphor-icons/react';
import styles from './sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  path: string;
  label: string;
  Icon: React.ElementType;
  disabled?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { path: '/board', label: 'Рабочая доска', Icon: CalendarBlank },
  { path: '/clients', label: 'Клиенты', Icon: Users },
  { path: '/services', label: 'Услуги', Icon: Scissors },
  { path: '/employees', label: 'Сотрудники', Icon: UserList },
];

const SECONDARY_NAV: NavItem[] = [
  { path: '/finances', label: 'Финансы', Icon: CurrencyDollar, disabled: true },
  { path: '/warehouse', label: 'Склад', Icon: Package, disabled: true },
  { path: '/reports', label: 'Отчеты', Icon: ChartBar, disabled: true },
  { path: '/settings', label: 'Настройки', Icon: Gear, disabled: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();

  const renderItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;

    const button = (
      <NavLink
        key={item.path}
        to={item.disabled ? '#' : item.path}
        className={[
          styles.navItem,
          isActive ? styles.active : '',
          item.disabled ? styles.disabled : '',
          collapsed ? styles.collapsed : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={item.disabled ? (e) => e.preventDefault() : undefined}
      >
        <span className={styles.icon}>
          <item.Icon size={20} weight={isActive ? 'fill' : 'regular'} />
        </span>
        {!collapsed && (
          <span className={styles.label}>{item.label}</span>
        )}
        {!collapsed && item.disabled && (
          <span className={styles.soon}>Скоро</span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} label={item.label} position="right" withArrow>
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <Stack gap={2} className={styles.navGroup}>
        {!collapsed && (
          <Text size="xs" fw={600} className={styles.groupLabel} tt="uppercase">
            Основное
          </Text>
        )}
        {PRIMARY_NAV.map(renderItem)}
      </Stack>

      <Divider my="md" />

      <Stack gap={2} className={styles.navGroup}>
        {!collapsed && (
          <Text size="xs" fw={600} className={styles.groupLabel} tt="uppercase">
            Скоро
          </Text>
        )}
        {SECONDARY_NAV.map(renderItem)}
      </Stack>
    </aside>
  );
};
