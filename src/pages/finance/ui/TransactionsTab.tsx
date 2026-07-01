import React from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Skeleton,
  Table,
  Text,
  Textarea,
} from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import {
  useCancelTransaction,
  useCreateTransaction,
  useTransactions,
} from '@/shared/api/hooks/useTransactions';
import type {
  ManualTransactionCategory,
  Transaction,
  TransactionMethod,
  TransactionType,
} from '@/shared/api/types';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import {
  formatDateTime,
  formatPrice,
  MANUAL_TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_METHOD_LABELS,
  TRANSACTION_METHOD_OPTIONS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_OPTIONS,
} from '@/shared/lib/format';
import styles from './transactions-tab.module.css';

interface TransactionsTabProps {
  enabled: boolean;
}

interface TransactionFormState {
  type: TransactionType;
  category: ManualTransactionCategory;
  method: TransactionMethod;
  amount: number;
  notes: string;
}

const DEFAULT_FORM: TransactionFormState = {
  type: 'expense',
  category: 'other',
  method: 'cash',
  amount: 0,
  notes: '',
};

const isActiveTransaction = (transaction: Transaction): boolean => !transaction.cancelled;

const getSignedAmount = (transaction: Transaction): number =>
  transaction.type === 'income' ? transaction.amount : -transaction.amount;

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ enabled }) => {
  const [formOpen, setFormOpen] = React.useState(false);
  const [cancelTarget, setCancelTarget] = React.useState<number | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<TransactionFormState>(DEFAULT_FORM);

  const { data: transactions, isLoading, isError } = useTransactions({ enabled });
  const createTransaction = useCreateTransaction();
  const cancelTransaction = useCancelTransaction();

  const categoryFilterOptions = React.useMemo(
    () =>
      Object.entries(TRANSACTION_CATEGORY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  const filteredTransactions = React.useMemo(() => {
    let items = [...(transactions ?? [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    if (typeFilter) {
      items = items.filter((item) => item.type === typeFilter);
    }

    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter);
    }

    if (sourceFilter === 'auto') {
      items = items.filter((item) => item.auto_generated);
    }

    if (sourceFilter === 'manual') {
      items = items.filter((item) => !item.auto_generated);
    }

    return items;
  }, [transactions, typeFilter, categoryFilter, sourceFilter]);

  const summary = React.useMemo(() => {
    const active = (transactions ?? []).filter(isActiveTransaction);

    const income = active
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = active
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  const openForm = React.useCallback(() => {
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  }, []);

  const submitForm = React.useCallback(() => {
    if (form.amount <= 0) return;

    createTransaction.mutate(
      {
        type: form.type,
        category: form.category,
        method: form.method,
        amount: form.amount,
        notes: form.notes.trim() || null,
      },
      { onSuccess: () => setFormOpen(false) },
    );
  }, [form, createTransaction]);

  if (isLoading) {
    return (
      <div className={styles.tab}>
        <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
          <Skeleton height={88} radius="md" />
          <Skeleton height={88} radius="md" />
          <Skeleton height={88} radius="md" />
        </SimpleGrid>
        <Skeleton height={360} radius="md" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card padding="lg" radius="lg" shadow="xs">
        <Text c="red">Не удалось загрузить транзакции</Text>
      </Card>
    );
  }

  return (
    <div className={styles.tab}>
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
        <Card padding="md" radius="lg" shadow="xs" className={styles.summaryCard}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Доход
          </Text>
          <Text size="xl" fw={700} c="green">
            {formatPrice(summary.income)}
          </Text>
        </Card>
        <Card padding="md" radius="lg" shadow="xs" className={styles.summaryCard}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Расход
          </Text>
          <Text size="xl" fw={700} c="red">
            {formatPrice(summary.expense)}
          </Text>
        </Card>
        <Card padding="md" radius="lg" shadow="xs" className={styles.summaryCard}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Баланс
          </Text>
          <Text size="xl" fw={700} c={summary.balance >= 0 ? 'green' : 'red'}>
            {formatPrice(summary.balance)}
          </Text>
        </Card>
      </SimpleGrid>

      <Group justify="space-between" mb="md" align="flex-end" wrap="wrap">
        <Group gap="sm" wrap="wrap">
          <Select
            label="Тип"
            placeholder="Все"
            clearable
            w={160}
            data={TRANSACTION_TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          <Select
            label="Категория"
            placeholder="Все"
            clearable
            searchable
            w={200}
            data={categoryFilterOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          <Select
            label="Источник"
            placeholder="Все"
            clearable
            w={160}
            data={[
              { value: 'auto', label: 'Автоматические' },
              { value: 'manual', label: 'Ручные' },
            ]}
            value={sourceFilter}
            onChange={setSourceFilter}
          />
        </Group>
        <Button leftSection={<Plus size={16} />} onClick={openForm}>
          Новая транзакция
        </Button>
      </Group>

      <Card padding={0} radius="lg" shadow="xs" className={styles.tableCard}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Тип</Table.Th>
              <Table.Th>Категория</Table.Th>
              <Table.Th>Сумма</Table.Th>
              <Table.Th>Способ</Table.Th>
              <Table.Th>Связь</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Дата</Table.Th>
              <Table.Th w={100} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredTransactions.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Text c="dimmed" ta="center" py="lg">
                    Транзакций нет
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredTransactions.map((transaction) => {
                const cancelled = Boolean(transaction.cancelled);
                const canCancel = !transaction.auto_generated && !cancelled;

                return (
                  <Table.Tr
                    key={transaction.id}
                    className={cancelled ? styles.rowCancelled : styles.tableRow}
                  >
                    <Table.Td>#{transaction.id}</Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        variant="light"
                        color={transaction.type === 'income' ? 'green' : 'red'}
                      >
                        {TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {TRANSACTION_CATEGORY_LABELS[transaction.category] ?? transaction.category}
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="sm"
                        fw={600}
                        c={transaction.type === 'income' ? 'green' : 'red'}
                        td={cancelled ? 'line-through' : undefined}
                      >
                        {formatPrice(Math.abs(getSignedAmount(transaction)))}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {TRANSACTION_METHOD_LABELS[transaction.method] ?? transaction.method}
                    </Table.Td>
                    <Table.Td>
                      {transaction.receipt_id != null && (
                        <Text size="xs">Чек #{transaction.receipt_id}</Text>
                      )}
                      {transaction.payout_id != null && (
                        <Text size="xs">Выплата #{transaction.payout_id}</Text>
                      )}
                      {transaction.receipt_id == null && transaction.payout_id == null && (
                        <Text size="xs" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        {transaction.auto_generated ? (
                          <Badge size="xs" variant="outline" color="blue">
                            Авто
                          </Badge>
                        ) : (
                          <Badge size="xs" variant="outline" color="gray">
                            Ручная
                          </Badge>
                        )}
                        {cancelled && (
                          <Badge size="xs" variant="light" color="gray">
                            Отменена
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{formatDateTime(transaction.created_at)}</Text>
                      {transaction.notes && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {transaction.notes}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {canCancel && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => setCancelTarget(transaction.id)}
                        >
                          Отменить
                        </Button>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        title="Новая транзакция"
        radius="md"
        size="md"
      >
        <Select
          label="Тип"
          mb="md"
          data={TRANSACTION_TYPE_OPTIONS}
          value={form.type}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, type: (value as TransactionType) ?? 'expense' }))
          }
        />
        <Select
          label="Категория"
          mb="md"
          data={[...MANUAL_TRANSACTION_CATEGORY_OPTIONS]}
          value={form.category}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              category: (value as ManualTransactionCategory) ?? 'other',
            }))
          }
        />
        <Select
          label="Способ оплаты"
          mb="md"
          data={TRANSACTION_METHOD_OPTIONS}
          value={form.method}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, method: (value as TransactionMethod) ?? 'cash' }))
          }
        />
        <NumberInput
          label="Сумма"
          min={1}
          mb="md"
          value={form.amount}
          onChange={(value) => setForm((prev) => ({ ...prev, amount: Number(value) || 0 }))}
          thousandSeparator=" "
          suffix=" сум"
        />
        <Textarea
          label="Примечание"
          mb="lg"
          minRows={2}
          value={form.notes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, notes: event.currentTarget.value }))
          }
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setFormOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={submitForm}
            loading={createTransaction.isPending}
            disabled={form.amount <= 0}
          >
            Создать
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={cancelTarget != null}
        title="Отменить транзакцию"
        message="Отменить эту транзакцию? Действие необратимо."
        loading={cancelTransaction.isPending}
        onConfirm={() =>
          cancelTarget != null &&
          cancelTransaction.mutate(cancelTarget, { onSuccess: () => setCancelTarget(null) })
        }
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
};
