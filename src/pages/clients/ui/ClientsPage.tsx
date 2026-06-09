import React from 'react';
import {
  Group,
  Text,
  TextInput,
  Button,
  Badge,
  Avatar,
  Card,
  SimpleGrid,
  Table,
  ActionIcon,
  Menu,
  Select,
} from '@mantine/core';
import {
  MagnifyingGlass,
  Plus,
  DotsThree,
  CalendarBlank,
  Phone,
  ArrowUp,
  ArrowDown,
  UserPlus,
  ArrowsCounterClockwise,
  CurrencyDollar,
} from '@phosphor-icons/react';
import styles from './clients-page.module.css';

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  totalSpent: number;
  visits: number;
  status: 'active' | 'new' | 'inactive';
  initials: string;
  color: string;
}

const CLIENTS: Client[] = [
  { id: '1', name: 'Камола Юсупова', phone: '+998 90 123-45-67', lastVisit: '07.06.2026', totalSpent: 450000, visits: 12, status: 'active', initials: 'КЮ', color: '#6366f1' },
  { id: '2', name: 'Жахонгир Рашидов', phone: '+998 91 234-56-78', lastVisit: '05.06.2026', totalSpent: 180000, visits: 5, status: 'active', initials: 'ЖР', color: '#0ea5e9' },
  { id: '3', name: 'Зулфия Каримова', phone: '+998 93 345-67-89', lastVisit: '01.06.2026', totalSpent: 320000, visits: 8, status: 'active', initials: 'ЗК', color: '#8b5cf6' },
  { id: '4', name: 'Бобур Тошматов', phone: '+998 94 456-78-90', lastVisit: '28.05.2026', totalSpent: 95000, visits: 3, status: 'new', initials: 'БТ', color: '#f59e0b' },
  { id: '5', name: 'Малика Назарова', phone: '+998 99 567-89-01', lastVisit: '25.05.2026', totalSpent: 680000, visits: 21, status: 'active', initials: 'МН', color: '#10b981' },
  { id: '6', name: 'Нилуфар Каримова', phone: '+998 90 678-90-12', lastVisit: '20.05.2026', totalSpent: 540000, visits: 15, status: 'active', initials: 'НК', color: '#ec4899' },
  { id: '7', name: 'Тимур Рашидов', phone: '+998 91 789-01-23', lastVisit: '10.04.2026', totalSpent: 60000, visits: 2, status: 'inactive', initials: 'ТР', color: '#64748b' },
  { id: '8', name: 'Феруза Юсупова', phone: '+998 93 890-12-34', lastVisit: '06.06.2026', totalSpent: 220000, visits: 7, status: 'active', initials: 'ФЮ', color: '#14b8a6' },
  { id: '9', name: 'Дилором Хасанова', phone: '+998 94 901-23-45', lastVisit: '03.06.2026', totalSpent: 390000, visits: 11, status: 'active', initials: 'ДХ', color: '#f97316' },
  { id: '10', name: 'Шахло Абдуллаева', phone: '+998 99 012-34-56', lastVisit: '04.06.2026', totalSpent: 275000, visits: 9, status: 'new', initials: 'ША', color: '#a855f7' },
];

const STATUS_CONFIG: Record<Client['status'], { label: string; color: string }> = {
  active: { label: 'Активный', color: 'green' },
  new: { label: 'Новый', color: 'blue' },
  inactive: { label: 'Неактивный', color: 'gray' },
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ru-RU').format(value) + ' сум';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  Icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendUp, Icon, color }) => (
  <Card padding="lg" radius="lg" shadow="xs">
    <Group justify="space-between" align="flex-start">
      <div>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
          {label}
        </Text>
        <Text size="xl" fw={700} mt={4}>
          {value}
        </Text>
        {trend && (
          <Group gap={4} mt={4}>
            {trendUp ? (
              <ArrowUp size={12} color="var(--mantine-color-green-6)" weight="bold" />
            ) : (
              <ArrowDown size={12} color="var(--mantine-color-red-6)" weight="bold" />
            )}
            <Text size="xs" c={trendUp ? 'green' : 'red'} fw={500}>
              {trend}
            </Text>
          </Group>
        )}
      </div>
      <div className={styles.statIcon} style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, white)` }}>
        <Icon size={20} color={color} weight="duotone" />
      </div>
    </Group>
  </Card>
);

export const ClientsPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return CLIENTS.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const rows = filtered.map((client) => {
    const statusCfg = STATUS_CONFIG[client.status];
    return (
      <Table.Tr key={client.id} className={styles.tableRow}>
        <Table.Td>
          <Group gap={10}>
            <Avatar size="sm" radius="md" style={{ backgroundColor: client.color }}>
              <Text size="xs" fw={700} c="white">
                {client.initials}
              </Text>
            </Avatar>
            <div>
              <Text size="sm" fw={600}>
                {client.name}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Group gap={6}>
            <Phone size={13} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c="dimmed">
              {client.phone}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Group gap={6}>
            <CalendarBlank size={13} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c="dimmed">
              {client.lastVisit}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500}>
            {client.visits}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={600}>
            {formatCurrency(client.totalSpent)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge color={statusCfg.color} variant="light" size="sm" radius="sm">
            {statusCfg.label}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Menu shadow="sm" width={180} radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <DotsThree size={16} weight="bold" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<CalendarBlank size={14} />}>Записать</Menu.Item>
              <Menu.Item leftSection={<Phone size={14} />}>Позвонить</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red">Удалить</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <Text size="xl" fw={700}>Клиенты</Text>
          <Text size="sm" c="dimmed" mt={2}>
            {CLIENTS.length} клиентов в базе
          </Text>
        </div>
        <Button leftSection={<Plus size={16} />}>Добавить клиента</Button>
      </div>

      {/* Stats */}
      <SimpleGrid cols={4} spacing="md" className={styles.stats}>
        <StatCard label="Всего клиентов" value="247" trend="+12% за месяц" trendUp Icon={UserPlus} color="#6366f1" />
        <StatCard label="Новых за месяц" value="18" trend="+3 за неделю" trendUp Icon={ArrowUp} color="#10b981" />
        <StatCard label="Возвращаемость" value="89%" trend="стабильно" Icon={ArrowsCounterClockwise} color="#0ea5e9" />
        <StatCard label="Средний чек" value="145 000" trend="+5% к прошлому мес." trendUp Icon={CurrencyDollar} color="#f59e0b" />
      </SimpleGrid>

      {/* Filters */}
      <Group gap="sm" className={styles.filters}>
        <TextInput
          placeholder="Поиск по имени или телефону..."
          leftSection={<MagnifyingGlass size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className={styles.searchInput}
          size="sm"
        />
        <Select
          placeholder="Статус"
          data={[
            { value: 'active', label: 'Активный' },
            { value: 'new', label: 'Новый' },
            { value: 'inactive', label: 'Неактивный' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          size="sm"
          style={{ width: 160 }}
        />
      </Group>

      {/* Table */}
      <Card padding={0} radius="lg" shadow="xs" className={styles.tableCard}>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="lg">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Клиент</Table.Th>
              <Table.Th>Телефон</Table.Th>
              <Table.Th>Последний визит</Table.Th>
              <Table.Th>Визитов</Table.Th>
              <Table.Th>Сумма</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Card>
    </div>
  );
};
