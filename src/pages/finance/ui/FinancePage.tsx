import React from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Skeleton,
  Table,
  Tabs,
  Text,
} from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import { useAppointments } from '@/shared/api/hooks/useAppointments';
import { useClients } from '@/shared/api/hooks/useClients';
import { useMaterials } from '@/shared/api/hooks/useMaterials';
import { useCreatePayment, usePayments } from '@/shared/api/hooks/usePayments';
import { useCancelReceipt, useCreateReceipt, useReceipts } from '@/shared/api/hooks/useReceipts';
import type { Payment, PaymentMethod, Receipt, ReceiptType } from '@/shared/api/types';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import { ConfirmModal, DataTable, DataTableRow, ListPage } from '@/shared/ui';
import {
  formatDateTime,
  formatPrice,
  getClientFullName,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  RECEIPT_STATUS_LABELS,
  RECEIPT_TYPE_LABELS,
} from '@/shared/lib/format';
import { TransactionsTab } from './TransactionsTab';

export const FinancePage: React.FC = () => {
  const [tab, setTab] = React.useState<string>('receipts');
  const [receiptFormOpen, setReceiptFormOpen] = React.useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = React.useState(false);
  const [cancelTarget, setCancelTarget] = React.useState<number | null>(null);
  const [historyReceipt, setHistoryReceipt] = React.useState<Receipt | null>(null);
  const [historyPayment, setHistoryPayment] = React.useState<Payment | null>(null);

  const [receiptType, setReceiptType] = React.useState<ReceiptType>('appointment');
  const [appointmentId, setAppointmentId] = React.useState<string | null>(null);
  const [clientId, setClientId] = React.useState<string | null>(null);
  const [materialId, setMaterialId] = React.useState<string | null>(null);
  const [materialQty, setMaterialQty] = React.useState(1);

  const [paymentReceiptId, setPaymentReceiptId] = React.useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('cash');
  const [addChangeToDeposit, setAddChangeToDeposit] = React.useState(false);

  const { data: receipts, isLoading: receiptsLoading, isError: receiptsError } = useReceipts();
  const { data: payments, isLoading: paymentsLoading, isError: paymentsError } = usePayments();
  const { data: appointments } = useAppointments();
  const { data: clients } = useClients();
  const { data: materials } = useMaterials();

  const createReceipt = useCreateReceipt();
  const cancelReceipt = useCancelReceipt();
  const createPayment = useCreatePayment();

  const appointmentOptions = React.useMemo(
    () =>
      (appointments ?? [])
        .filter((item) => !item.paid)
        .map((item) => ({
          value: String(item.id),
          label: `#${item.id} · ${item.client ? getClientFullName(item.client) : 'Клиент'} · ${formatPrice(item.total_price)}`,
        })),
    [appointments],
  );

  const clientOptions = React.useMemo(
    () => (clients ?? []).map((c) => ({ value: String(c.id), label: getClientFullName(c) })),
    [clients],
  );

  const materialOptions = React.useMemo(
    () =>
      (materials ?? [])
        .filter((material) => material.quantity > 0)
        .map((material) => ({
          value: String(material.id),
          label: `${material.name} · ${material.quantity} шт. · ${formatPrice(material.sell_price)}`,
        })),
    [materials],
  );

  const selectedMaterial = React.useMemo(
    () => (materials ?? []).find((material) => String(material.id) === materialId) ?? null,
    [materials, materialId],
  );

  const openReceiptForm = React.useCallback(() => {
    setReceiptType('appointment');
    setAppointmentId(null);
    setClientId(null);
    setMaterialId(null);
    setMaterialQty(1);
    setReceiptFormOpen(true);
  }, []);

  const pendingReceiptOptions = React.useMemo(
    () =>
      (receipts ?? [])
        .filter((r) => r.status === 'pending')
        .map((r) => ({
          value: String(r.id),
          label: `#${r.id} · ${formatPrice(r.remaining_amount)}`,
        })),
    [receipts],
  );

  const openPaymentForm = React.useCallback((receiptId?: number) => {
    const receipt = (receipts ?? []).find((r) => r.id === receiptId);
    setPaymentReceiptId(receiptId != null ? String(receiptId) : null);
    setPaymentAmount(receipt?.remaining_amount ?? 0);
    setPaymentMethod('cash');
    setAddChangeToDeposit(false);
    setPaymentFormOpen(true);
  }, [receipts]);

  const submitReceipt = React.useCallback(() => {
    if (receiptType === 'appointment') {
      createReceipt.mutate(
        {
          receipt_type: 'appointment',
          appointment_id: appointmentId ? Number(appointmentId) : null,
        },
        { onSuccess: () => setReceiptFormOpen(false) },
      );
      return;
    }

    createReceipt.mutate(
      {
        receipt_type: 'direct sale',
        client_id: clientId ? Number(clientId) : null,
        receipt_items: materialId
          ? [{ material_id: Number(materialId), quantity: materialQty }]
          : [],
      },
      { onSuccess: () => setReceiptFormOpen(false) },
    );
  }, [receiptType, appointmentId, clientId, materialId, materialQty, createReceipt]);

  const submitPayment = React.useCallback(() => {
    if (!paymentReceiptId) return;
    createPayment.mutate(
      {
        receipt_id: Number(paymentReceiptId),
        amount: paymentAmount,
        method: paymentMethod,
        add_change_to_deposit: addChangeToDeposit,
      },
      { onSuccess: () => setPaymentFormOpen(false) },
    );
  }, [paymentReceiptId, paymentAmount, paymentMethod, addChangeToDeposit, createPayment]);

  const isLoading = receiptsLoading || paymentsLoading;
  const isError = receiptsError || paymentsError;

  if (isLoading) {
    return (
      <ListPage title="Финансы">
        <Skeleton height={48} mb="md" />
        <Skeleton height={400} radius="md" />
      </ListPage>
    );
  }

  if (isError) {
    return (
      <ListPage title="Финансы">
        <Alert color="red" title="Не удалось загрузить финансы">
          Проверьте доступность API
        </Alert>
      </ListPage>
    );
  }

  return (
    <ListPage
      title="Финансы"
      subtitle={`${receipts?.length ?? 0} чеков · ${payments?.length ?? 0} оплат`}
      actions={
        tab !== 'transactions' ? (
          <Group>
            <Button variant="light" onClick={() => openPaymentForm()}>
              Провести оплату
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openReceiptForm}>
              Новый чек
            </Button>
          </Group>
        ) : undefined
      }
    >
      <Tabs value={tab} onChange={(value) => setTab(value ?? 'receipts')} variant="pills" radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="receipts">Чеки</Tabs.Tab>
          <Tabs.Tab value="payments">Оплаты</Tabs.Tab>
          <Tabs.Tab value="transactions">Транзакции</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {tab === 'receipts' && (
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'type', label: 'Тип' },
            { key: 'total', label: 'Сумма' },
            { key: 'remaining', label: 'Остаток' },
            { key: 'status', label: 'Статус' },
            { key: 'date', label: 'Дата' },
            { key: 'actions', label: '', width: 220 },
          ]}
          isEmpty={(receipts ?? []).length === 0}
          emptyMessage="Чеков нет"
        >
          {(receipts ?? []).map((receipt) => (
            <DataTableRow key={receipt.id}>
              <Table.Td>
                <Text size="sm" ff="monospace" c="dimmed">
                  #{receipt.id}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {RECEIPT_TYPE_LABELS[receipt.receipt_type] ?? receipt.receipt_type}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {formatPrice(receipt.total_amount)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatPrice(receipt.remaining_amount)}</Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  size="sm"
                  variant="light"
                  color={
                    receipt.status === 'paid'
                      ? 'green'
                      : receipt.status === 'cancelled'
                        ? 'gray'
                        : 'orange'
                  }
                >
                  {RECEIPT_STATUS_LABELS[receipt.status] ?? receipt.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="xs">{formatDateTime(receipt.created_at)}</Text>
              </Table.Td>
              <Table.Td>
                <Group gap={6}>
                  <Button size="xs" variant="subtle" onClick={() => setHistoryReceipt(receipt)}>
                    История
                  </Button>
                  {receipt.status === 'pending' && (
                    <>
                      <Button size="xs" variant="light" onClick={() => openPaymentForm(receipt.id)}>
                        Оплатить
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => setCancelTarget(receipt.id)}
                      >
                        Отменить
                      </Button>
                    </>
                  )}
                </Group>
              </Table.Td>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      {tab === 'payments' && (
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'receipt', label: 'Чек' },
            { key: 'amount', label: 'Сумма' },
            { key: 'method', label: 'Способ' },
            { key: 'date', label: 'Дата' },
            { key: 'actions', label: '', width: 100 },
          ]}
          isEmpty={(payments ?? []).length === 0}
          emptyMessage="Оплат нет"
        >
          {(payments ?? []).map((payment) => (
            <DataTableRow key={payment.id}>
              <Table.Td>
                <Text size="sm" ff="monospace" c="dimmed">
                  #{payment.id}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">#{payment.receipt_id}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {formatPrice(payment.amount)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="xs">{formatDateTime(payment.created_at)}</Text>
              </Table.Td>
              <Table.Td>
                <Button size="xs" variant="subtle" onClick={() => setHistoryPayment(payment)}>
                  История
                </Button>
              </Table.Td>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      {tab === 'transactions' && <TransactionsTab enabled />}

      <Modal
        opened={receiptFormOpen}
        onClose={() => setReceiptFormOpen(false)}
        title="Новый чек"
        radius="md"
        size="md"
      >
        <Select
          label="Тип чека"
          mb="md"
          data={[
            { value: 'appointment', label: 'По записи' },
            { value: 'direct sale', label: 'Прямая продажа' },
          ]}
          value={receiptType}
          onChange={(value) => setReceiptType((value as ReceiptType) ?? 'appointment')}
        />
        {receiptType === 'appointment' ? (
          <Select
            label="Запись"
            searchable
            mb="lg"
            data={appointmentOptions}
            value={appointmentId}
            onChange={setAppointmentId}
          />
        ) : (
          <>
            <Select
              label="Клиент"
              searchable
              clearable
              mb="md"
              data={clientOptions}
              value={clientId}
              onChange={setClientId}
            />
            <Select
              label="Материал"
              searchable
              mb="md"
              data={materialOptions}
              value={materialId}
              onChange={setMaterialId}
              nothingFoundMessage="Нет материалов на складе"
              comboboxProps={{ withinPortal: true }}
              placeholder={materialOptions.length === 0 ? 'Сначала добавьте остаток на складе' : 'Выберите материал'}
            />
            <NumberInput
              label="Количество"
              min={1}
              max={selectedMaterial?.quantity ?? undefined}
              mb="lg"
              value={materialQty}
              onChange={(value) => setMaterialQty(Number(value) || 1)}
              description={
                selectedMaterial
                  ? `Доступно: ${selectedMaterial.quantity} шт.`
                  : undefined
              }
            />
          </>
        )}
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setReceiptFormOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={submitReceipt}
            loading={createReceipt.isPending}
            disabled={
              receiptType === 'appointment'
                ? !appointmentId
                : !materialId || materialQty <= 0
            }
          >
            Создать
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={paymentFormOpen}
        onClose={() => setPaymentFormOpen(false)}
        title="Провести оплату"
        radius="md"
      >
        <Select
          label="Чек"
          searchable
          mb="md"
          data={pendingReceiptOptions}
          value={paymentReceiptId}
          onChange={setPaymentReceiptId}
        />
        <NumberInput
          label="Сумма"
          min={1}
          mb="md"
          value={paymentAmount}
          onChange={(value) => setPaymentAmount(Number(value) || 0)}
          thousandSeparator=" "
          suffix=" сум"
        />
        <Select
          label="Способ оплаты"
          mb="md"
          data={PAYMENT_METHOD_OPTIONS}
          value={paymentMethod}
          onChange={(value) => setPaymentMethod((value as PaymentMethod) ?? 'cash')}
        />
        <Checkbox
          label="Сдачу на депозит клиента"
          mb="lg"
          checked={addChangeToDeposit}
          onChange={(event) => setAddChangeToDeposit(event.currentTarget.checked)}
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setPaymentFormOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={submitPayment}
            loading={createPayment.isPending}
            disabled={!paymentReceiptId || paymentAmount <= 0}
          >
            Оплатить
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={cancelTarget != null}
        title="Отменить чек"
        message="Отменить этот чек?"
        loading={cancelReceipt.isPending}
        onConfirm={() =>
          cancelTarget != null &&
          cancelReceipt.mutate(cancelTarget, { onSuccess: () => setCancelTarget(null) })
        }
        onClose={() => setCancelTarget(null)}
      />

      <Modal
        opened={Boolean(historyReceipt)}
        onClose={() => setHistoryReceipt(null)}
        title={historyReceipt ? `История чека #${historyReceipt.id}` : 'История чека'}
        radius="md"
        size="lg"
      >
        {historyReceipt && (
          <>
            <Text size="sm" fw={600} mb="xs">
              Чек
            </Text>
            <AuditLogsPanel tableName="receipts" recordId={historyReceipt.id} />
            {historyReceipt.items.map((item) => (
              <React.Fragment key={item.id}>
                <Text size="sm" fw={600} mt="md" mb="xs">
                  Позиция #{item.id}
                </Text>
                <AuditLogsPanel tableName="receipt_items" recordId={item.id} />
              </React.Fragment>
            ))}
          </>
        )}
      </Modal>

      <Modal
        opened={Boolean(historyPayment)}
        onClose={() => setHistoryPayment(null)}
        title={historyPayment ? `История оплаты #${historyPayment.id}` : 'История оплаты'}
        radius="md"
        size="md"
      >
        {historyPayment && (
          <AuditLogsPanel tableName="payments" recordId={historyPayment.id} />
        )}
      </Modal>
    </ListPage>
  );
};
