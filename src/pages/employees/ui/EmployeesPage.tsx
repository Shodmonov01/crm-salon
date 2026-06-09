import React from 'react';
import {
  Group,
  Text,
  Button,
  Badge,
  Avatar,
  Card,
  SimpleGrid,
  ActionIcon,
  Menu,
  Progress,
  Divider,
} from '@mantine/core';
import {
  Plus,
  DotsThree,
  CalendarBlank,
  Phone,
  Star,
  Users,
  Clock,
} from '@phosphor-icons/react';
import styles from './employees-page.module.css';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  color: string;
  initials: string;
  rating: number;
  todayAppts: number;
  monthAppts: number;
  monthRevenue: number;
  load: number;
  status: 'working' | 'day-off' | 'vacation';
  specializations: string[];
}

const EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Азизбек Каримов',
    role: 'Барбер',
    phone: '+998 90 111-22-33',
    color: '#6366f1',
    initials: 'АК',
    rating: 4.9,
    todayAppts: 8,
    monthAppts: 124,
    monthRevenue: 4960000,
    load: 87,
    status: 'working',
    specializations: ['Мужские стрижки', 'Борода', 'Фейдинг'],
  },
  {
    id: '2',
    name: 'Дилноза Рашидова',
    role: 'Стилист',
    phone: '+998 91 222-33-44',
    color: '#8b5cf6',
    initials: 'ДР',
    rating: 4.8,
    todayAppts: 5,
    monthAppts: 98,
    monthRevenue: 6860000,
    load: 72,
    status: 'working',
    specializations: ['Окрашивание', 'Укладка', 'Мелирование'],
  },
  {
    id: '3',
    name: 'Сардор Тошматов',
    role: 'Барбер',
    phone: '+998 93 333-44-55',
    color: '#0ea5e9',
    initials: 'СТ',
    rating: 4.7,
    todayAppts: 6,
    monthAppts: 108,
    monthRevenue: 4320000,
    load: 79,
    status: 'working',
    specializations: ['Мужские стрижки', 'Борода', 'Укладка'],
  },
  {
    id: '4',
    name: 'Мохира Назарова',
    role: 'Косметолог',
    phone: '+998 94 444-55-66',
    color: '#10b981',
    initials: 'МН',
    rating: 5.0,
    todayAppts: 4,
    monthAppts: 72,
    monthRevenue: 9360000,
    load: 65,
    status: 'working',
    specializations: ['Чистка лица', 'Маникюр', 'Ресницы'],
  },
];

const STATUS_CONFIG: Record<Employee['status'], { label: string; color: string }> = {
  working: { label: 'Работает', color: 'green' },
  'day-off': { label: 'Выходной', color: 'gray' },
  vacation: { label: 'Отпуск', color: 'orange' },
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ru-RU').format(value) + ' сум';

interface EmployeeCardProps {
  employee: Employee;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const statusCfg = STATUS_CONFIG[employee.status];

  return (
    <Card padding="lg" radius="lg" shadow="xs" className={styles.card}>
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="md">
        <Group gap={12}>
          <Avatar
            size={52}
            radius="md"
            style={{ backgroundColor: employee.color }}
          >
            <Text fw={700} c="white">
              {employee.initials}
            </Text>
          </Avatar>
          <div>
            <Text fw={700} size="md">
              {employee.name}
            </Text>
            <Text size="sm" c="dimmed">
              {employee.role}
            </Text>
          </div>
        </Group>

        <Group gap={6}>
          <Badge color={statusCfg.color} variant="light" size="sm" radius="sm">
            {statusCfg.label}
          </Badge>
          <Menu shadow="sm" width={160} radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <DotsThree size={16} weight="bold" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<CalendarBlank size={14} />}>Расписание</Menu.Item>
              <Menu.Item leftSection={<Phone size={14} />}>Позвонить</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red">Удалить</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Rating + phone */}
      <Group gap="lg" mb="md">
        <Group gap={4}>
          <Star size={14} weight="fill" color="#f59e0b" />
          <Text size="sm" fw={600}>
            {employee.rating.toFixed(1)}
          </Text>
        </Group>
        <Group gap={5}>
          <Phone size={13} color="var(--mantine-color-gray-5)" />
          <Text size="xs" c="dimmed">
            {employee.phone}
          </Text>
        </Group>
      </Group>

      {/* Specializations */}
      <Group gap={6} mb="md">
        {employee.specializations.map((spec) => (
          <Badge
            key={spec}
            size="xs"
            variant="light"
            color="gray"
            radius="sm"
          >
            {spec}
          </Badge>
        ))}
      </Group>

      <Divider mb="md" />

      {/* Stats row */}
      <SimpleGrid cols={3} mb="md">
        <div className={styles.statCell}>
          <Group gap={5} mb={2}>
            <CalendarBlank size={13} color={employee.color} />
            <Text size="xs" c="dimmed">Сегодня</Text>
          </Group>
          <Text fw={700} size="sm">
            {employee.todayAppts}
          </Text>
        </div>
        <div className={styles.statCell}>
          <Group gap={5} mb={2}>
            <Users size={13} color={employee.color} />
            <Text size="xs" c="dimmed">За месяц</Text>
          </Group>
          <Text fw={700} size="sm">
            {employee.monthAppts}
          </Text>
        </div>
        <div className={styles.statCell}>
          <Group gap={5} mb={2}>
            <Clock size={13} color={employee.color} />
            <Text size="xs" c="dimmed">Выручка</Text>
          </Group>
          <Text fw={700} size="xs" style={{ color: employee.color }}>
            {formatCurrency(employee.monthRevenue)}
          </Text>
        </div>
      </SimpleGrid>

      {/* Load bar */}
      <div>
        <Group justify="space-between" mb={6}>
          <Text size="xs" c="dimmed">
            Загрузка
          </Text>
          <Text size="xs" fw={600} style={{ color: employee.color }}>
            {employee.load}%
          </Text>
        </Group>
        <Progress
          value={employee.load}
          color={employee.color}
          size="sm"
          radius="xl"
        />
      </div>
    </Card>
  );
};

export const EmployeesPage: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <Text size="xl" fw={700}>Сотрудники</Text>
          <Text size="sm" c="dimmed" mt={2}>
            {EMPLOYEES.length} сотрудника
          </Text>
        </div>
        <Button leftSection={<Plus size={16} />}>Добавить сотрудника</Button>
      </div>

      {/* Employee cards */}
      <SimpleGrid cols={2} spacing="md">
        {EMPLOYEES.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </SimpleGrid>
    </div>
  );
};
