import React from 'react';
import { Text } from '@mantine/core';
import styles from './list-page.module.css';

interface ListPageProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ListPage: React.FC<ListPageProps> = ({
  title,
  subtitle,
  actions,
  filters,
  children,
  className,
}) => (
  <div className={[styles.page, className].filter(Boolean).join(' ')}>
    <div className={styles.header}>
      <div className={styles.titleBlock}>
        <Text size="xl" fw={700}>
          {title}
        </Text>
        {subtitle && (
          <Text size="sm" c="dimmed" mt={2}>
            {subtitle}
          </Text>
        )}
      </div>
      {actions}
    </div>
    {filters && <div className={styles.filters}>{filters}</div>}
    {children}
  </div>
);

export { styles as listPageStyles };
