import React from 'react';
import { Text, Skeleton, Badge, Table } from '@mantine/core';
import { useEmployeePayrolls } from '@/shared/api/hooks/useEmployees';
import { DataTable, DataTableRow } from '@/shared/ui';
import { formatPrice, PAYROLL_TYPE_LABELS } from '@/shared/lib/format';
import styles from '../employee-profile.module.css';

interface FinanceTabProps {
  employeeId: number;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ employeeId }) => {
  const { data: payrolls, isLoading } = useEmployeePayrolls(employeeId);

  const summary = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const payroll of payrolls ?? []) {
      const month = new Date(payroll.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
      });
      const sign = payroll.type === 'penalty' ? -1 : 1;
      map.set(month, (map.get(month) ?? 0) + sign * payroll.amount);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [payrolls]);

  const byType = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const payroll of payrolls ?? []) {
      map.set(payroll.type, (map.get(payroll.type) ?? 0) + payroll.amount);
    }
    return Array.from(map.entries());
  }, [payrolls]);

  const total = React.useMemo(
    () => (payrolls ?? []).reduce((sum, p) => sum + (p.type === 'penalty' ? -p.amount : p.amount), 0),
    [payrolls],
  );

  if (isLoading) {
    return <Skeleton height={160} radius="md" />;
  }

  return (
    <div>
      <Text fw={600} mb="md">
        Финансовый отчёт · итого {formatPrice(total)}
      </Text>

      <Text size="sm" fw={600} mb="sm">
        По месяцам
      </Text>
      <DataTable
        compact
        stickyHeader={false}
        maxHeight={280}
        columns={[
          { key: 'period', label: 'Период' },
          { key: 'total', label: 'Итог' },
        ]}
        isEmpty={summary.length === 0}
        emptyMessage="Нет данных"
      >
        {summary.map(([period, amount]) => (
          <DataTableRow key={period}>
            <Table.Td>
              <Text size="sm">{period}</Text>
            </Table.Td>
            <Table.Td>
              <Badge color={amount < 0 ? 'red' : 'green'} variant="light">
                {formatPrice(amount)}
              </Badge>
            </Table.Td>
          </DataTableRow>
        ))}
      </DataTable>

      <Text size="sm" fw={600} mb="sm" mt="xl">
        По типам
      </Text>
      <div className={styles.salaryGrid}>
        {byType.map(([type, amount]) => (
          <div key={type} className={styles.salaryItem}>
            <Text size="xs" c="dimmed">
              {PAYROLL_TYPE_LABELS[type as keyof typeof PAYROLL_TYPE_LABELS] ?? type}
            </Text>
            <Text size="sm" fw={600}>
              {formatPrice(amount)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};
