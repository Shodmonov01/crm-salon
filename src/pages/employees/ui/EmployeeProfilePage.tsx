import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Tabs,
  Skeleton,
  Alert,
  Menu,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { ArrowLeft, PencilSimple, Trash, Phone, Cake, DotsThree, LockKey, Copy, Check } from '@phosphor-icons/react';
import {
  useEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '@/shared/api/hooks/useEmployees';
import { useResetPassword } from '@/shared/api/hooks/useAuth';
import type { EmployeeCreatePayload, EmployeeUpdatePayload } from '@/shared/api/types';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { PersonAvatar } from '@/shared/ui/PersonAvatar';
import { getEmployeeFullName, getEmployeeInitials } from '@/shared/lib/format';
import { EmployeeFormModal } from './EmployeeFormModal';
import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { FinanceTab } from './tabs/FinanceTab';
import { ServicesTab } from './tabs/ServicesTab';
import styles from './employee-profile.module.css';

const TAB_VALUES = ['overview', 'schedule', 'payments', 'finance', 'services', 'audit'] as const;
type TabValue = (typeof TAB_VALUES)[number];

const isTabValue = (value: string | null): value is TabValue =>
  TAB_VALUES.includes(value as TabValue);

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const employeeId = Number(id);
  const { data: employee, isLoading, isError } = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const resetPassword = useResetPassword();

  const [resetPasswordResult, setResetPasswordResult] = React.useState<string | null>(null);

  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'overview';

  const handleTabChange = React.useCallback(
    (value: string | null) => {
      setSearchParams({ tab: value ?? 'overview' }, { replace: true });
    },
    [setSearchParams],
  );

  const handleSubmit = React.useCallback(
    (payload: EmployeeCreatePayload | EmployeeUpdatePayload) => {
      updateEmployee.mutate(payload as EmployeeUpdatePayload, { onSuccess: () => setEditOpen(false) });
    },
    [updateEmployee],
  );

  const handleDelete = React.useCallback(() => {
    deleteEmployee.mutate(employeeId, { onSuccess: () => navigate('/employees') });
  }, [deleteEmployee, employeeId, navigate]);

  const handleResetPassword = React.useCallback(() => {
    resetPassword.mutate(employeeId, {
      onSuccess: (result) => {
        setResetPasswordResult(result.new_password);
      },
    });
  }, [resetPassword, employeeId]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton height={120} radius="lg" />
        <Skeleton height={400} radius="lg" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className={styles.page}>
        <Button variant="subtle" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/employees')} w="fit-content">
          К сотрудникам
        </Button>
        <Alert color="red" title="Сотрудник не найден">
          Проверьте доступность API или вернитесь к списку.
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Button variant="subtle" color="gray" leftSection={<ArrowLeft size={16} />} onClick={() => navigate('/employees')} w="fit-content">
        К сотрудникам
      </Button>

      <Card padding="lg" radius="lg" shadow="xs" className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <PersonAvatar
            seed={employee.id}
            initials={getEmployeeInitials(employee)}
            size="profile"
          />
          <div>
            <Group gap={10}>
              <Text fw={700} size="xl">
                {getEmployeeFullName(employee)}
              </Text>
              <Badge color={employee.active ? 'green' : 'gray'} variant="light" size="sm">
                {employee.active ? 'Активен' : 'Неактивен'}
              </Badge>
            </Group>
            <div className={styles.contactRow}>
              <Group gap={5}>
                <Phone size={14} color="var(--mantine-color-gray-5)" />
                <Text size="sm" c="dimmed">{employee.phone ?? '—'}</Text>
              </Group>
              <Group gap={5}>
                <Cake size={14} color="var(--mantine-color-gray-5)" />
                <Text size="sm" c="dimmed">{employee.birth_date}</Text>
              </Group>
            </div>
          </div>
        </div>

        <Group gap="sm">
          <Button variant="light" leftSection={<PencilSimple size={16} />} onClick={() => setEditOpen(true)}>
            Редактировать
          </Button>
          <Menu shadow="md" width={200} position="bottom-end" radius="md">
            <Menu.Target>
              <ActionIcon variant="light" color="gray" size="lg" aria-label="Ещё действия">
                <DotsThree size={18} weight="bold" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<LockKey size={14} />}
                onClick={handleResetPassword}
                disabled={resetPassword.isPending}
              >
                Сбросить пароль
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<Trash size={14} />}
                color="red"
                onClick={() => setDeleteOpen(true)}
              >
                Удалить
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card>

      {resetPasswordResult && (
        <Alert
          color="blue"
          title="Пароль сброшен"
          onClose={() => setResetPasswordResult(null)}
          withCloseButton
        >
          <Group gap="sm">
            <Text size="sm" fw={600}>
              Новый пароль: {resetPasswordResult}
            </Text>
            <CopyButton value={resetPasswordResult}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Скопировано!' : 'Скопировать'} withArrow>
                  <ActionIcon
                    color={copied ? 'teal' : 'blue'}
                    variant="light"
                    onClick={copy}
                    size="sm"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Обязательно передайте этот пароль сотруднику
          </Text>
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} radius="md" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">Обзор</Tabs.Tab>
          <Tabs.Tab value="schedule">График</Tabs.Tab>
          <Tabs.Tab value="payments">Выплаты</Tabs.Tab>
          <Tabs.Tab value="finance">Финансы</Tabs.Tab>
          <Tabs.Tab value="services">Услуги</Tabs.Tab>
          <Tabs.Tab value="audit">История</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" className={styles.tabPanel}>
          <OverviewTab employee={employee} />
        </Tabs.Panel>
        <Tabs.Panel value="schedule" className={styles.tabPanel}>
          <ScheduleTab employeeId={employee.id} />
        </Tabs.Panel>
        <Tabs.Panel value="payments" className={styles.tabPanel}>
          <PaymentsTab employeeId={employee.id} />
        </Tabs.Panel>
        <Tabs.Panel value="finance" className={styles.tabPanel}>
          <FinanceTab employeeId={employee.id} />
        </Tabs.Panel>
        <Tabs.Panel value="services" className={styles.tabPanel}>
          <ServicesTab employee={employee} />
        </Tabs.Panel>
        <Tabs.Panel value="audit" className={styles.tabPanel}>
          <AuditLogsPanel tableName="employees" recordId={employee.id} />
        </Tabs.Panel>
      </Tabs>

      <EmployeeFormModal
        opened={editOpen}
        employee={employee}
        loading={updateEmployee.isPending}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        opened={deleteOpen}
        title="Удалить сотрудника"
        message={`Удалить ${getEmployeeFullName(employee)}?`}
        loading={deleteEmployee.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};
