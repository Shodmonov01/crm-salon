import React from 'react';
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import styles from './app-layout.module.css';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        breakpoint: 'sm',
      }}
      padding={0}
      classNames={{ root: styles.root, main: styles.main }}
    >
      <AppShell.Header>
        <Header collapsed={collapsed} onToggle={toggleCollapsed} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar collapsed={collapsed} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
