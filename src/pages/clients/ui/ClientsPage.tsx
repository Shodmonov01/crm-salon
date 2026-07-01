import React from 'react';
import {
  Group,
  Text,
  TextInput,
  Button,
  ActionIcon,
  Menu,
  Modal,
  Select,
  Textarea,
  Skeleton,
  Alert,
  NumberInput,
  Tabs,
  Badge,
  Table,
} from '@mantine/core';
import {
  MagnifyingGlass,
  Plus,
  DotsThree,
  PencilSimple,
  Trash,
  CalendarBlank
} from '@phosphor-icons/react';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useUpdateClientDeposit,
  useClientAppointments
} from '@/shared/api/hooks/useClients';
import type { Client, ClientCreatePayload, ClientUpdatePayload, Sex } from '@/shared/api/types';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { DataTable, DataTableRow, ListPage, listPageStyles } from '@/shared/ui';
import { PersonAvatar } from '@/shared/ui/PersonAvatar';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import {
  formatDate,
  formatAppointmentDateTime,
  formatPrice,
  getClientFullName,
  getClientInitials,
  SEX_LABELS,
  SEX_OPTIONS
} from '@/shared/lib/format';

interface ClientFormState {
  firstname: string;
  lastname: string;
  middlename: string;
  sex: Sex;
  phone: string;
  birth_date: string;
  deposit: number;
  notes: string;
}

const emptyForm = (): ClientFormState => ({
  firstname: '',
  lastname: '',
  middlename: '',
  sex: 'female',
  phone: '',
  birth_date: '',
  deposit: 0,
  notes: ''
});

const clientToForm = (client: Client): ClientFormState => ({
  firstname: client.firstname,
  lastname: client.lastname ?? '',
  middlename: client.middlename ?? '',
  sex: client.sex,
  phone: client.phone ?? '',
  birth_date: client.birth_date ?? '',
  deposit: client.deposit,
  notes: client.notes ?? ''
});

const formToCreatePayload = (form: ClientFormState): ClientCreatePayload => ({
  firstname: form.firstname,
  lastname: form.lastname || null,
  middlename: form.middlename || null,
  sex: form.sex,
  phone: form.phone || null,
  birth_date: form.birth_date || null,
  deposit: form.deposit,
  notes: form.notes || null
});

export const ClientsPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);
  const [depositTarget, setDepositTarget] = React.useState<Client | null>(null);
  const [form, setForm] = React.useState<ClientFormState>(emptyForm);
  const [depositAmount, setDepositAmount] = React.useState(0);
  const [depositOperation, setDepositOperation] = React.useState<'1' | '-1'>('1');
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null);
  const [detailTarget, setDetailTarget] = React.useState<Client | null>(null);
  const [detailTab, setDetailTab] = React.useState<string>('appointments');

  const { data: clients, isLoading, isError } = useClients();
  const { data: clientAppointments, isLoading: appointmentsLoading } = useClientAppointments(
    detailTarget?.id ?? 0
  );
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const updateDeposit = useUpdateClientDeposit();
  const deleteClient = useDeleteClient();

  const openCreate = React.useCallback(() => {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  }, []);

  const openEdit = React.useCallback((client: Client) => {
    setEditing(client);
    setForm(clientToForm(client));
    setFormOpen(true);
  }, []);

  const openDeposit = React.useCallback((client: Client) => {
    setDepositTarget(client);
    setDepositAmount(0);
    setDepositOperation('1');
    setDepositOpen(true);
  }, []);

  const closeForm = React.useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (editing) {
      const payload: ClientUpdatePayload = {
        id: editing.id,
        ...formToCreatePayload(form)
      };
      updateClient.mutate(payload, { onSuccess: closeForm });
    } else {
      createClient.mutate(formToCreatePayload(form), { onSuccess: closeForm });
    }
  }, [form, editing, createClient, updateClient, closeForm]);

  const handleDeposit = React.useCallback(() => {
    if (!depositTarget || depositAmount <= 0) return;
    updateDeposit.mutate(
      {
        id: depositTarget.id,
        operation: Number(depositOperation) as 1 | -1,
        amount: depositAmount
      },
      { onSuccess: () => setDepositOpen(false) }
    );
  }, [depositTarget, depositAmount, depositOperation, updateDeposit]);

  const handleDelete = React.useCallback(() => {
    if (!deleteTarget) return;
    deleteClient.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteClient]);

  const filtered = React.useMemo(() => {
    return (clients ?? []).filter((client) => {
      const name = getClientFullName(client).toLowerCase();
      const q = search.toLowerCase();
      return !q || name.includes(q) || (client.phone ?? '').includes(q);
    });
  }, [clients, search]);

  const isSaving = createClient.isPending || updateClient.isPending;

  if (isLoading) {
    return (
      <ListPage title="Клиенты">
        <Skeleton height={48} />
        <Skeleton height={400} radius="lg" />
      </ListPage>
    );
  }

  if (isError) {
    return (
      <ListPage title="Клиенты">
        <Alert color="red" title="Не удалось загрузить клиентов">
          Проверьте доступность API и авторизацию
        </Alert>
      </ListPage>
    );
  }

  return (
    <ListPage
      title="Клиенты"
      subtitle={`${filtered.length} клиентов`}
      actions={
        <Button leftSection={<Plus size={16} />} onClick={openCreate}>
          Добавить клиента
        </Button>
      }
      filters={
        <TextInput
          placeholder="Поиск по имени, телефону..."
          leftSection={<MagnifyingGlass size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className={listPageStyles.searchInput}
          size="sm"
        />
      }
    >
      <DataTable
        columns={[
          { key: 'client', label: 'Клиент' },
          { key: 'phone', label: 'Телефон' },
          { key: 'sex', label: 'Пол' },
          { key: 'deposit', label: 'Депозит' },
          { key: 'birth', label: 'Дата рождения' },
          { key: 'actions', label: '', width: 48 },
        ]}
        isEmpty={filtered.length === 0}
        emptyMessage="Клиенты не найдены"
      >
        {filtered.map((client) => (
          <DataTableRow key={client.id}>
            <Table.Td>
              <Group gap={10}>
                <PersonAvatar seed={client.id} initials={getClientInitials(client)} size="xs" />
                <Text size="sm" fw={600}>
                  {getClientFullName(client)}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="dimmed">
                {client.phone ?? '—'}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm">{SEX_LABELS[client.sex]}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" fw={600}>
                {formatPrice(client.deposit)}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="dimmed">
                {formatDate(client.birth_date)}
              </Text>
            </Table.Td>
            <Table.Td>
              <Menu shadow="sm" width={180} radius="md">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <DotsThree size={16} weight="bold" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<CalendarBlank size={14} />}
                    onClick={() => {
                      setDetailTarget(client);
                      setDetailTab('appointments');
                    }}
                  >
                    Записи и история
                  </Menu.Item>
                  <Menu.Item leftSection={<PencilSimple size={14} />} onClick={() => openEdit(client)}>
                    Редактировать
                  </Menu.Item>
                  <Menu.Item onClick={() => openDeposit(client)}>Депозит</Menu.Item>
                  <Menu.Item
                    leftSection={<Trash size={14} />}
                    color="red"
                    onClick={() => setDeleteTarget(client)}
                  >
                    Удалить
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </DataTableRow>
        ))}
      </DataTable>

      <Modal
        opened={formOpen}
        onClose={closeForm}
        title={editing ? 'Редактировать клиента' : 'Новый клиент'}
        radius='md'
        size='lg'
      >
        <Group grow mb='md'>
          <TextInput
            label='Имя'
            required
            value={form.firstname}
            onChange={(e) => setForm({ ...form, firstname: e.currentTarget.value })}
          />
          <TextInput
            label='Фамилия'
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.currentTarget.value })}
          />
        </Group>
        <Group grow mb='md'>
          <TextInput
            label='Отчество'
            value={form.middlename}
            onChange={(e) => setForm({ ...form, middlename: e.currentTarget.value })}
          />
          <Select
            label='Пол'
            required
            data={[...SEX_OPTIONS]}
            value={form.sex}
            onChange={(v) => setForm({ ...form, sex: (v as Sex) ?? 'female' })}
          />
        </Group>
        <Group grow mb='md'>
          <TextInput
            label='Телефон'
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })}
          />
          <TextInput
            label='Дата рождения'
            type='date'
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.currentTarget.value })}
          />
        </Group>
        {!editing && (
          <NumberInput
            label='Начальный депозит'
            mb='md'
            min={0}
            value={form.deposit}
            onChange={(v) => setForm({ ...form, deposit: Number(v) || 0 })}
          />
        )}
        <Textarea
          label='Заметки'
          mb='lg'
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.currentTarget.value })}
        />
        <Group justify='flex-end'>
          <Button variant='subtle' color='gray' onClick={closeForm}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={!form.firstname}>
            {editing ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={depositOpen}
        onClose={() => setDepositOpen(false)}
        title='Изменить депозит'
        radius='md'
      >
        <Select
          label='Операция'
          mb='md'
          data={[
            { value: '1', label: 'Пополнить' },
            { value: '-1', label: 'Списать' }
          ]}
          value={depositOperation}
          onChange={(v) => setDepositOperation((v as '1' | '-1') ?? '1')}
        />
        <NumberInput
          label='Сумма'
          required
          min={1}
          mb='lg'
          value={depositAmount}
          onChange={(v) => setDepositAmount(Number(v) || 0)}
        />
        <Group justify='flex-end'>
          <Button variant='subtle' color='gray' onClick={() => setDepositOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleDeposit}
            loading={updateDeposit.isPending}
            disabled={depositAmount <= 0}
          >
            Применить
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={Boolean(deleteTarget)}
        title='Удалить клиента'
        message={`Удалить ${deleteTarget ? getClientFullName(deleteTarget) : ''}?`}
        loading={deleteClient.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Modal
        opened={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={detailTarget ? getClientFullName(detailTarget) : 'Клиент'}
        radius='md'
        size='lg'
      >
        <Tabs value={detailTab} onChange={(value) => setDetailTab(value ?? 'appointments')}>
          <Tabs.List mb='md'>
            <Tabs.Tab value='appointments'>Записи</Tabs.Tab>
            <Tabs.Tab value='audit'>История изменений</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='appointments'>
            {appointmentsLoading ? (
              <Skeleton height={120} />
            ) : (
              <DataTable
                compact
                stickyHeader={false}
                maxHeight={320}
                columns={[
                  { key: 'date', label: 'Дата' },
                  { key: 'amount', label: 'Сумма' },
                  { key: 'status', label: 'Статус' },
                ]}
                isEmpty={(clientAppointments ?? []).length === 0}
                emptyMessage="Записей нет"
              >
                {(clientAppointments ?? []).map((appointment) => (
                  <DataTableRow key={appointment.id}>
                    <Table.Td>
                      <Text size="xs">{formatAppointmentDateTime(appointment.start_time_est)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {formatPrice(appointment.total_price)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={appointment.paid ? 'green' : 'orange'} variant="light">
                        {appointment.paid ? 'Оплачено' : 'Не оплачено'}
                      </Badge>
                    </Table.Td>
                  </DataTableRow>
                ))}
              </DataTable>
            )}
          </Tabs.Panel>
          <Tabs.Panel value='audit'>
            {detailTarget && <AuditLogsPanel tableName='clients' recordId={detailTarget.id} />}
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </ListPage>
  );
};
