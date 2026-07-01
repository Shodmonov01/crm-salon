import React from 'react';
import {
  Group,
  Button,
  Table,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Select,
  TextInput,
  Skeleton,
  NumberInput,
} from '@mantine/core';
import { Plus, DotsThree, PencilSimple, Trash } from '@phosphor-icons/react';
import { useEmployeePayrolls } from '@/shared/api/hooks/useEmployees';
import {
  useCreatePayroll,
  useDeletePayroll,
  useUpdatePayroll,
} from '@/shared/api/hooks/usePayrolls';
import type { Payroll, PayrollCreatePayload, PayrollType, PayrollUpdatePayload } from '@/shared/api/types';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import { ConfirmModal, DataTable, DataTableRow } from '@/shared/ui';
import { formatDate, formatPrice, PAYROLL_TYPE_LABELS, PAYROLL_TYPE_OPTIONS } from '@/shared/lib/format';
import styles from '../employee-profile.module.css';

interface PaymentsTabProps {
  employeeId: number;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ employeeId }) => {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Payroll | null>(null);
  const [payrollType, setPayrollType] = React.useState<PayrollType>('salary');
  const [amount, setAmount] = React.useState(0);
  const [notes, setNotes] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<Payroll | null>(null);

  const { data: payrolls, isLoading } = useEmployeePayrolls(employeeId);
  const createPayroll = useCreatePayroll();
  const updatePayroll = useUpdatePayroll();
  const deletePayroll = useDeletePayroll();

  const total = React.useMemo(
    () => (payrolls ?? []).reduce((sum, p) => sum + p.amount, 0),
    [payrolls],
  );

  const openCreate = React.useCallback(() => {
    setEditing(null);
    setPayrollType('salary');
    setAmount(0);
    setNotes('');
    setFormOpen(true);
  }, []);

  const openEdit = React.useCallback((payroll: Payroll) => {
    setEditing(payroll);
    setPayrollType(payroll.type);
    setAmount(payroll.amount);
    setNotes(payroll.notes ?? '');
    setFormOpen(true);
  }, []);

  const submit = React.useCallback(() => {
    if (editing) {
      const payload: PayrollUpdatePayload = {
        id: editing.id,
        employee_id: employeeId,
        type: payrollType,
        amount,
        notes: notes || null,
      };
      updatePayroll.mutate(payload, { onSuccess: () => setFormOpen(false) });
    } else {
      const payload: PayrollCreatePayload = {
        employee_id: employeeId,
        type: payrollType,
        amount,
        notes: notes || null,
      };
      createPayroll.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  }, [payrollType, amount, notes, employeeId, editing, createPayroll, updatePayroll]);

  return (
    <div>
      <div className={styles.toolbar}>
        <Text fw={600}>
          Выплаты {payrolls && payrolls.length > 0 ? `· итого ${formatPrice(total)}` : ''}
        </Text>
        <Button size="sm" leftSection={<Plus size={15} />} onClick={openCreate}>
          Добавить выплату
        </Button>
      </div>

      {isLoading ? (
        <Skeleton height={160} radius="md" />
      ) : (
        <DataTable
          compact
          stickyHeader={false}
          maxHeight={420}
          columns={[
            { key: 'type', label: 'Тип' },
            { key: 'amount', label: 'Сумма' },
            { key: 'notes', label: 'Заметка' },
            { key: 'date', label: 'Дата' },
            { key: 'actions', label: '', width: 48 },
          ]}
          isEmpty={(payrolls ?? []).length === 0}
          emptyMessage="Выплат пока нет"
        >
          {(payrolls ?? []).map((payroll) => (
            <DataTableRow key={payroll.id}>
              <Table.Td>
                <Badge size="sm" variant="light">
                  {PAYROLL_TYPE_LABELS[payroll.type]}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {formatPrice(payroll.amount)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{payroll.notes || '—'}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatDate(payroll.created_at)}</Text>
              </Table.Td>
              <Table.Td>
                <Menu shadow="sm" width={160} radius="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <DotsThree size={16} weight="bold" />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<PencilSimple size={14} />} onClick={() => openEdit(payroll)}>
                      Редактировать
                    </Menu.Item>
                    <Menu.Item leftSection={<Trash size={14} />} color="red" onClick={() => setDeleteTarget(payroll)}>
                      Удалить
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Редактировать выплату' : 'Новая выплата'}
        radius="md"
      >
        <Select label="Тип выплаты" required data={PAYROLL_TYPE_OPTIONS} mb="md" value={payrollType} onChange={(v) => setPayrollType((v as PayrollType) ?? 'salary')} />
        <NumberInput label="Сумма" required min={1} mb="md" value={amount} onChange={(v) => setAmount(Number(v) || 0)} />
        <TextInput label="Заметка" mb="lg" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
        {editing && (
          <>
            <Text size="sm" fw={600} mb="xs">
              История изменений
            </Text>
            <AuditLogsPanel tableName="payrolls" recordId={editing.id} />
          </>
        )}
        <Group justify="flex-end" mt={editing ? 'md' : undefined}>
          <Button variant="subtle" color="gray" onClick={() => setFormOpen(false)}>Отмена</Button>
          <Button onClick={submit} loading={createPayroll.isPending || updatePayroll.isPending} disabled={amount <= 0}>
            Сохранить
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={Boolean(deleteTarget)}
        title="Удалить выплату"
        message="Удалить эту выплату?"
        loading={deletePayroll.isPending}
        onConfirm={() => deleteTarget && deletePayroll.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
