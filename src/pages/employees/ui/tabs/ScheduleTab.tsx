import React from 'react';
import {
  Group,
  Button,
  Table,
  Text,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Skeleton,
  Tabs,
  Select,
  Badge,
} from '@mantine/core';
import { Plus, DotsThree, PencilSimple, Trash } from '@phosphor-icons/react';
import { useEmployeeWorkSchedules } from '@/shared/api/hooks/useEmployees';
import {
  useCreateWorkSchedule,
  useDeleteWorkSchedule,
  useUpdateWorkSchedule,
} from '@/shared/api/hooks/useWorkSchedules';
import {
  useCreateAbsence,
  useDeleteAbsence,
  useUpdateAbsence,
} from '@/shared/api/hooks/useAbsences';
import type {
  Absence,
  AbsenceType,
  WorkSchedule,
  WorkScheduleCreatePayload,
  WorkScheduleUpdatePayload,
} from '@/shared/api/types';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import { ConfirmModal, DataTable, DataTableRow } from '@/shared/ui';
import {
  ABSENCE_TYPE_LABELS,
  ABSENCE_TYPE_OPTIONS,
  formatDate,
  formatTime,
  toApiTime,
} from '@/shared/lib/format';
import styles from '../employee-profile.module.css';

interface ScheduleTabProps {
  employeeId: number;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ employeeId }) => {
  const [scheduleFormOpen, setScheduleFormOpen] = React.useState(false);
  const [absenceFormOpen, setAbsenceFormOpen] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState<WorkSchedule | null>(null);
  const [editingAbsence, setEditingAbsence] = React.useState<Absence | null>(null);
  const [day, setDay] = React.useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('18:00');
  const [startDate, setStartDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [absenceType, setAbsenceType] = React.useState<AbsenceType>('vacation');
  const [reason, setReason] = React.useState('');
  const [deleteScheduleTarget, setDeleteScheduleTarget] = React.useState<WorkSchedule | null>(null);
  const [deleteAbsenceTarget, setDeleteAbsenceTarget] = React.useState<Absence | null>(null);

  const { data, isLoading } = useEmployeeWorkSchedules(employeeId);
  const createSchedule = useCreateWorkSchedule();
  const updateSchedule = useUpdateWorkSchedule();
  const deleteSchedule = useDeleteWorkSchedule();
  const createAbsence = useCreateAbsence();
  const updateAbsence = useUpdateAbsence();
  const deleteAbsence = useDeleteAbsence();

  const schedules = data?.work_schedules ?? [];
  const absences = data?.absences ?? [];

  const submitSchedule = React.useCallback(() => {
    if (editingSchedule) {
      const payload: WorkScheduleUpdatePayload = {
        id: editingSchedule.id,
        day,
        start_time: toApiTime(startTime),
        end_time: toApiTime(endTime),
      };
      updateSchedule.mutate(payload, { onSuccess: () => setScheduleFormOpen(false) });
    } else {
      const payload: WorkScheduleCreatePayload = {
        employee_id: employeeId,
        day,
        start_time: toApiTime(startTime),
        end_time: toApiTime(endTime),
      };
      createSchedule.mutate(payload, { onSuccess: () => setScheduleFormOpen(false) });
    }
  }, [day, startTime, endTime, employeeId, editingSchedule, createSchedule, updateSchedule]);

  const submitAbsence = React.useCallback(() => {
    if (editingAbsence) {
      updateAbsence.mutate(
        {
          id: editingAbsence.id,
          start_date: startDate,
          end_date: endDate,
          absence_type: absenceType,
          reason: reason || null,
        },
        { onSuccess: () => setAbsenceFormOpen(false) },
      );
    } else {
      createAbsence.mutate(
        {
          employee_id: employeeId,
          start_date: startDate,
          end_date: endDate,
          absence_type: absenceType,
          reason: reason || null,
        },
        { onSuccess: () => setAbsenceFormOpen(false) },
      );
    }
  }, [startDate, endDate, absenceType, reason, employeeId, editingAbsence, createAbsence, updateAbsence]);

  return (
    <div>
      <Tabs defaultValue="shifts" radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="shifts">Смены</Tabs.Tab>
          <Tabs.Tab value="absences">Отсутствия</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="shifts">
          <div className={styles.toolbar}>
            <Text fw={600}>Рабочие смены</Text>
            <Button size="sm" leftSection={<Plus size={15} />} onClick={() => { setEditingSchedule(null); setScheduleFormOpen(true); }}>
              Добавить смену
            </Button>
          </div>
          {isLoading ? <Skeleton height={160} radius="md" /> : (
            <DataTable
              compact
              stickyHeader={false}
              maxHeight={360}
              columns={[
                { key: 'day', label: 'День' },
                { key: 'start', label: 'Начало' },
                { key: 'end', label: 'Конец' },
                { key: 'actions', label: '', width: 48 },
              ]}
              isEmpty={schedules.length === 0}
              emptyMessage="Смены не заданы"
            >
              {schedules.map((schedule) => (
                <DataTableRow key={schedule.id}>
                  <Table.Td>{formatDate(schedule.day)}</Table.Td>
                  <Table.Td>{formatTime(schedule.start_time)}</Table.Td>
                  <Table.Td>{formatTime(schedule.end_time)}</Table.Td>
                  <Table.Td>
                    <Menu shadow="sm" width={160} radius="md">
                      <Menu.Target><ActionIcon variant="subtle" color="gray" size="sm"><DotsThree size={16} weight="bold" /></ActionIcon></Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<PencilSimple size={14} />} onClick={() => { setEditingSchedule(schedule); setDay(schedule.day); setStartTime(formatTime(schedule.start_time)); setEndTime(formatTime(schedule.end_time)); setScheduleFormOpen(true); }}>Редактировать</Menu.Item>
                        <Menu.Item leftSection={<Trash size={14} />} color="red" onClick={() => setDeleteScheduleTarget(schedule)}>Удалить</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </DataTableRow>
              ))}
            </DataTable>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="absences">
          <div className={styles.toolbar}>
            <Text fw={600}>Отсутствия</Text>
            <Button size="sm" leftSection={<Plus size={15} />} onClick={() => { setEditingAbsence(null); setAbsenceFormOpen(true); }}>
              Добавить
            </Button>
          </div>
          {isLoading ? <Skeleton height={160} radius="md" /> : (
            <DataTable
              compact
              stickyHeader={false}
              maxHeight={360}
              columns={[
                { key: 'type', label: 'Тип' },
                { key: 'from', label: 'С' },
                { key: 'to', label: 'По' },
                { key: 'reason', label: 'Причина' },
                { key: 'actions', label: '', width: 48 },
              ]}
              isEmpty={absences.length === 0}
              emptyMessage="Отсутствий нет"
            >
              {absences.map((absence) => (
                <DataTableRow key={absence.id}>
                  <Table.Td><Badge variant="light">{ABSENCE_TYPE_LABELS[absence.absence_type]}</Badge></Table.Td>
                  <Table.Td>{formatDate(absence.start_date)}</Table.Td>
                  <Table.Td>{formatDate(absence.end_date)}</Table.Td>
                  <Table.Td>{absence.reason ?? '—'}</Table.Td>
                  <Table.Td>
                    <Menu shadow="sm" width={160} radius="md">
                      <Menu.Target><ActionIcon variant="subtle" color="gray" size="sm"><DotsThree size={16} weight="bold" /></ActionIcon></Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<PencilSimple size={14} />} onClick={() => { setEditingAbsence(absence); setStartDate(absence.start_date); setEndDate(absence.end_date); setAbsenceType(absence.absence_type); setReason(absence.reason ?? ''); setAbsenceFormOpen(true); }}>Редактировать</Menu.Item>
                        <Menu.Item leftSection={<Trash size={14} />} color="red" onClick={() => setDeleteAbsenceTarget(absence)}>Удалить</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </DataTableRow>
              ))}
            </DataTable>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={scheduleFormOpen} onClose={() => setScheduleFormOpen(false)} title={editingSchedule ? 'Редактировать смену' : 'Новая смена'} radius="md">
        <TextInput label="День" type="date" required mb="md" value={day} onChange={(e) => setDay(e.currentTarget.value)} />
        <Group grow mb="lg">
          <TextInput label="Начало" type="time" value={startTime} onChange={(e) => setStartTime(e.currentTarget.value)} />
          <TextInput label="Конец" type="time" value={endTime} onChange={(e) => setEndTime(e.currentTarget.value)} />
        </Group>
        {editingSchedule && (
          <>
            <Text size="sm" fw={600} mb="xs">
              История изменений
            </Text>
            <AuditLogsPanel tableName="employee_work_schedules" recordId={editingSchedule.id} />
          </>
        )}
        <Group justify="flex-end" mt={editingSchedule ? 'md' : undefined}>
          <Button variant="subtle" color="gray" onClick={() => setScheduleFormOpen(false)}>Отмена</Button>
          <Button onClick={submitSchedule} loading={createSchedule.isPending || updateSchedule.isPending}>Сохранить</Button>
        </Group>
      </Modal>

      <Modal opened={absenceFormOpen} onClose={() => setAbsenceFormOpen(false)} title={editingAbsence ? 'Редактировать отсутствие' : 'Новое отсутствие'} radius="md">
        <Select label="Тип" data={ABSENCE_TYPE_OPTIONS} mb="md" value={absenceType} onChange={(v) => setAbsenceType((v as AbsenceType) ?? 'vacation')} />
        <Group grow mb="md">
          <TextInput label="С" type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} />
          <TextInput label="По" type="date" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} />
        </Group>
        <TextInput label="Причина" mb="lg" value={reason} onChange={(e) => setReason(e.currentTarget.value)} />
        {editingAbsence && (
          <>
            <Text size="sm" fw={600} mb="xs">
              История изменений
            </Text>
            <AuditLogsPanel tableName="employee_absences" recordId={editingAbsence.id} />
          </>
        )}
        <Group justify="flex-end" mt={editingAbsence ? 'md' : undefined}>
          <Button variant="subtle" color="gray" onClick={() => setAbsenceFormOpen(false)}>Отмена</Button>
          <Button onClick={submitAbsence} loading={createAbsence.isPending || updateAbsence.isPending}>Сохранить</Button>
        </Group>
      </Modal>

      <ConfirmModal opened={Boolean(deleteScheduleTarget)} title="Удалить смену" message="Удалить эту смену?" loading={deleteSchedule.isPending} onConfirm={() => deleteScheduleTarget && deleteSchedule.mutate(deleteScheduleTarget.id, { onSuccess: () => setDeleteScheduleTarget(null) })} onClose={() => setDeleteScheduleTarget(null)} />
      <ConfirmModal opened={Boolean(deleteAbsenceTarget)} title="Удалить отсутствие" message="Удалить это отсутствие?" loading={deleteAbsence.isPending} onConfirm={() => deleteAbsenceTarget && deleteAbsence.mutate(deleteAbsenceTarget.id, { onSuccess: () => setDeleteAbsenceTarget(null) })} onClose={() => setDeleteAbsenceTarget(null)} />
    </div>
  );
};
