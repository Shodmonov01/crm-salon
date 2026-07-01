import React from 'react';
import { Card, ScrollArea, Table, Text } from '@mantine/core';
import { Table as TableIcon } from '@phosphor-icons/react';
import styles from './data-table.module.css';

export interface DataTableColumn {
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: DataTableColumn[];
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyColSpan?: number;
  compact?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  children,
  isEmpty = false,
  emptyMessage = 'Нет данных',
  emptyColSpan,
  compact = false,
  stickyHeader = true,
  maxHeight,
  className,
}) => {
  const colSpan = emptyColSpan ?? columns.length;

  return (
    <Card
      padding={0}
      radius="lg"
      shadow="xs"
      className={[styles.card, compact ? styles.compact : '', className].filter(Boolean).join(' ')}
    >
      <ScrollArea.Autosize
        className={styles.scroll}
        mah={maxHeight ?? 'calc(100vh - 220px)'}
        type="auto"
      >
        <Table
          highlightOnHover={false}
          verticalSpacing={compact ? 'xs' : 'sm'}
          horizontalSpacing={compact ? 'md' : 'lg'}
          stickyHeader={stickyHeader}
          className={styles.table}
        >
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  w={column.width}
                  ta={column.align}
                  className={styles.headCell}
                >
                  {column.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isEmpty ? (
              <Table.Tr>
                <Table.Td colSpan={colSpan}>
                  <div className={styles.empty}>
                    <div className={styles.emptyIcon}>
                      <TableIcon size={24} />
                    </div>
                    <Text size="sm" c="dimmed">
                      {emptyMessage}
                    </Text>
                  </div>
                </Table.Td>
              </Table.Tr>
            ) : (
              children
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea.Autosize>
    </Card>
  );
};

interface DataTableRowProps {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}

export const DataTableRow: React.FC<DataTableRowProps> = ({ children, muted = false, className }) => (
  <Table.Tr
    className={[styles.row, muted ? styles.rowMuted : '', className].filter(Boolean).join(' ')}
  >
    {children}
  </Table.Tr>
);

export { styles as dataTableStyles };
