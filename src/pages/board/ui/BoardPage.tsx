import React from 'react';
import {
  Button,
  Text,
  Badge,
  SegmentedControl,
  Skeleton,
  Alert
} from '@mantine/core';
import { Plus } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useEmployees } from '@/shared/api/hooks/useEmployees';
import {
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useDeleteAppointment
} from '@/shared/api/hooks/useAppointments';
import { useClients } from '@/shared/api/hooks/useClients';
import { useServices } from '@/shared/api/hooks/useServices';
import type { Employee } from '@/shared/api/types';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { PersonAvatar } from '@/shared/ui/PersonAvatar';
import {
  getClientFullName,
  getEmployeeColor,
  getEmployeeFullName,
  getEmployeeInitials,
  getEmployeeLightColor,
  isSameDay,
  parseApiDateFromDateTime,
  toDateInput
} from '@/shared/lib/format';
import type { BoardAppointment } from '../lib/appointmentBoard';
import {
  HOUR_LABELS,
  MINUTE_HEIGHT,
  TIME_END,
  TIME_START,
  TOTAL_HEIGHT,
  getApptStyle,
  getWeekDays,
  getWeekStart,
  mapAppointmentsToBoard
} from '../lib/appointmentBoard';
import { hasBoardTimeConflict } from '../lib/hasBoardTimeConflict';
import {
  appointmentToFormValues,
  buildServiceOptions,
  emptyAppointmentForm,
  formValuesToPayload,
  type AppointmentFormValues
} from '../lib/appointmentForm';
import { useCreateAppointmentDrag } from '../hooks/useCreateAppointmentDrag';
import { AppointmentFormModal } from './AppointmentFormModal';
import { BoardDateNav } from './BoardDateNav';
import { BoardSidebar } from './BoardSidebar';
import { EmployeeFilterPopover } from './EmployeeFilterPopover';
import { CreatePreview } from './CreatePreview';
import styles from './board-page.module.css';

interface BoardEmployee {
  id: number;
  name: string;
  role: string;
  color: string;
  lightColor: string;
  initials: string;
}

const formatHeaderDate = (d: Date): string =>
  d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

const formatWeekRange = (weekStart: Date): string => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const start = weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const end = weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return `${start} — ${end}`;
};

const mapEmployee = (employee: Employee): BoardEmployee => {
  const color = getEmployeeColor(employee.id);
  return {
    id: employee.id,
    name: getEmployeeFullName(employee),
    role: employee.active ? 'Сотрудник' : 'Неактивен',
    color,
    lightColor: getEmployeeLightColor(color),
    initials: getEmployeeInitials(employee)
  };
};

interface AppointmentCardProps {
  appt: BoardAppointment;
  color: string;
  lightColor: string;
  showEmployee?: boolean;
  onClick: (appt: BoardAppointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appt,
  color,
  lightColor,
  showEmployee = false,
  onClick
}) => {
  const apptStyle = getApptStyle(appt);
  const status = appt.paid ? 'confirmed' : 'pending';

  return (
    <div
      role='button'
      tabIndex={0}
      className={`${styles.appt} ${styles[`appt_${status}`]}`}
      style={{
        ...apptStyle,
        borderLeftColor: color,
        backgroundColor: lightColor
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(appt);
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Text size='xs' fw={700} lineClamp={1} style={{ color }}>
        {appt.client}
      </Text>
      {showEmployee && apptStyle.height > 40 && (
        <Text size='xs' c='dimmed' lineClamp={1}>
          {appt.employeeName}
        </Text>
      )}
      {apptStyle.height > 48 && (
        <Text size='xs' c='dimmed' lineClamp={1}>
          {appt.service}
        </Text>
      )}
      {apptStyle.height > 72 && (
        <Text size='xs' c='dimmed' mt='auto'>
          {`${appt.startHour.toString().padStart(2, '0')}:${appt.startMinute.toString().padStart(2, '0')} · ${appt.duration} мин`}
        </Text>
      )}
    </div>
  );
};

export const BoardPage: React.FC = () => {
  const {
    data: apiEmployees,
    isLoading: employeesLoading,
    isError: employeesError
  } = useEmployees();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: clients } = useClients();
  const { data: services } = useServices();
  const createAppointment = useCreateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const [date, setDate] = React.useState(() => new Date());
  const [view, setView] = React.useState<'day' | 'week'>('day');
  const [employeeFilter, setEmployeeFilter] = React.useState<Set<number>>(() => new Set());
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [formValues, setFormValues] = React.useState<AppointmentFormValues>(() =>
    emptyAppointmentForm()
  );
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = React.useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const { data: editingAppointment, isLoading: editingLoading } = useAppointment(editingId ?? 0);

  const today = React.useMemo(() => new Date(), []);
  const weekStart = React.useMemo(() => getWeekStart(date), [date]);
  const weekDays = React.useMemo(() => getWeekDays(weekStart), [weekStart]);

  const activeEmployees = React.useMemo(
    () => (apiEmployees ?? []).filter((e) => e.active),
    [apiEmployees]
  );

  const employees = React.useMemo(() => {
    const mapped = activeEmployees.map(mapEmployee);
    if (employeeFilter.size === 0) return mapped;
    return mapped.filter((e) => employeeFilter.has(e.id));
  }, [activeEmployees, employeeFilter]);

  const filterSet = React.useMemo(
    () => (employeeFilter.size > 0 ? employeeFilter : undefined),
    [employeeFilter]
  );

  const boardAppointments = React.useMemo(
    () => mapAppointmentsToBoard(appointments ?? [], date, filterSet),
    [appointments, date, filterSet]
  );

  const appointmentDates = React.useMemo(() => {
    const dates = new Set<string>();
    for (const appt of appointments ?? []) {
      dates.add(parseApiDateFromDateTime(appt.start_time_est));
    }
    return dates;
  }, [appointments]);

  const dayRevenue = React.useMemo(
    () => boardAppointments.reduce((sum, appt) => sum + (appt.paid ? appt.totalPrice : 0), 0),
    [boardAppointments]
  );

  const navigate = React.useCallback(
    (delta: number) => {
      setDate((d) => {
        const step = view === 'week' ? delta * 7 : delta;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + step);
      });
    },
    [view]
  );

  const goToday = React.useCallback(() => setDate(new Date()), []);

  const handleDatePick = React.useCallback((picked: Date) => {
    setDate(picked);
  }, []);

  const isToday = isSameDay(date, today);
  const isCurrentWeek = weekDays.some((d) => isSameDay(d, today));

  const dateNavLabel = React.useMemo(
    () => (view === 'day' ? formatHeaderDate(date) : formatWeekRange(weekStart)),
    [view, date, weekStart]
  );

  const isAtToday = view === 'day' ? isToday : isCurrentWeek;

  const currentTimeMinutes = isToday ? today.getHours() * 60 + today.getMinutes() : -1;
  const currentTimeTop =
    currentTimeMinutes >= TIME_START * 60 && currentTimeMinutes <= TIME_END * 60
      ? (currentTimeMinutes - TIME_START * 60) * MINUTE_HEIGHT
      : -1;

  const closeForm = React.useCallback(() => {
    setFormOpen(false);
    setEditingId(null);
    setEditingEmployeeId(null);
    setFormMode('create');
    setDeleteConfirmOpen(false);
  }, []);

  React.useEffect(() => {
    if (!editingAppointment || formMode !== 'edit' || editingEmployeeId == null) return;
    setFormValues(appointmentToFormValues(editingAppointment, editingEmployeeId));
  }, [editingAppointment, editingEmployeeId, formMode]);

  const openCreateForm = React.useCallback(
    (prefill?: Partial<AppointmentFormValues>, targetDate?: Date) => {
      setEditingId(null);
      setEditingEmployeeId(null);
      setFormMode('create');
      setFormValues({ ...emptyAppointmentForm(targetDate ?? date), ...prefill });
      setFormOpen(true);
    },
    [date]
  );

  const handleApptClick = React.useCallback((appt: BoardAppointment) => {
    setEditingId(appt.id);
    setEditingEmployeeId(appt.employeeId);
    setFormMode('edit');
    setFormOpen(true);
  }, []);

  const checkCreateConflict = React.useCallback(
    (
      ctx: { employeeId?: number; targetDate: Date },
      startTotalMins: number,
      endTotalMins: number
    ) => {
      const dayAppts = mapAppointmentsToBoard(appointments ?? [], ctx.targetDate, filterSet);
      return hasBoardTimeConflict(dayAppts, startTotalMins, endTotalMins, ctx.employeeId);
    },
    [appointments, filterSet]
  );

  const handleDragCreated = React.useCallback(
    (params: { employeeId?: number; targetDate: Date; startTime: string; endTime: string }) => {
      openCreateForm(
        {
          employeeId: params.employeeId != null ? String(params.employeeId) : null,
          date: toDateInput(params.targetDate),
          startTime: params.startTime,
          endTime: params.endTime
        },
        params.targetDate
      );
    },
    [openCreateForm]
  );

  const { preview, handleColumnMouseDown } = useCreateAppointmentDrag({
    onCreated: handleDragCreated,
    checkConflict: checkCreateConflict
  });

  const handleFormSubmit = React.useCallback(() => {
    const payload = formValuesToPayload(formValues);
    const afterSave = () => closeForm();

    if (editingId) {
      deleteAppointment.mutate(editingId, {
        onSuccess: () => createAppointment.mutate(payload, { onSuccess: afterSave })
      });
      return;
    }

    createAppointment.mutate(payload, { onSuccess: afterSave });
  }, [formValues, editingId, deleteAppointment, createAppointment, closeForm]);

  const handleDelete = React.useCallback(() => {
    if (!editingId) return;
    deleteAppointment.mutate(editingId, {
      onSuccess: () => closeForm()
    });
  }, [editingId, deleteAppointment, closeForm]);

  const selectedEmployee = React.useMemo(
    () => activeEmployees.find((e) => String(e.id) === formValues.employeeId),
    [activeEmployees, formValues.employeeId]
  );

  const clientOptions = React.useMemo(
    () => (clients ?? []).map((c) => ({ value: String(c.id), label: getClientFullName(c) })),
    [clients]
  );

  const employeeOptions = React.useMemo(
    () => activeEmployees.map((e) => ({ value: String(e.id), label: getEmployeeFullName(e) })),
    [activeEmployees]
  );

  const serviceOptions = React.useMemo(
    () => buildServiceOptions(services ?? [], selectedEmployee),
    [services, selectedEmployee]
  );

  const isSaving = createAppointment.isPending || deleteAppointment.isPending;
  const formLoading = isSaving || (formMode === 'edit' && editingLoading && !editingAppointment);
  const isLoading = employeesLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton height={56} radius={0} />
        <Skeleton height='100%' radius={0} />
      </div>
    );
  }

  if (employeesError) {
    return (
      <div className={styles.page}>
        <Alert color='red' title='Не удалось загрузить данные' m='md'>
          Проверьте доступность API и авторизацию
        </Alert>
      </div>
    );
  }

  const renderTimeGrid = () => (
    <div className={styles.timeColumn} style={{ height: TOTAL_HEIGHT }}>
      {HOUR_LABELS.map(({ label, top }) => (
        <div key={label} className={styles.timeLabel} style={{ top }}>
          <Text size='xs' c='dimmed' fw={500}>
            {label}
          </Text>
        </div>
      ))}
    </div>
  );

  const renderGridLines = (showCurrentTime = isToday) => (
    <>
      {HOUR_LABELS.map(({ hour, top }) => (
        <div key={hour} className={styles.hourLine} style={{ top }} />
      ))}
      {HOUR_LABELS.slice(0, -1).map(({ hour, top }) => (
        <div key={`half-${hour}`} className={styles.halfHourLine} style={{ top: top + 48 }} />
      ))}
      {showCurrentTime && currentTimeTop >= 0 && (
        <div className={styles.currentTimeLine} style={{ top: currentTimeTop }} />
      )}
    </>
  );

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarMain}>
          <div className={styles.toolbarGroup}>
            {activeEmployees.length > 0 && (
              <EmployeeFilterPopover
                employees={activeEmployees}
                selectedIds={employeeFilter}
                onChange={setEmployeeFilter}
                embedded
              />
            )}

            <SegmentedControl
              classNames={{ root: styles.viewSwitch }}
              size='sm'
              value={view}
              onChange={(v) => setView((v as 'day' | 'week') ?? 'day')}
              data={[
                { value: 'day', label: 'День' },
                { value: 'week', label: 'Неделя' }
              ]}
            />
          </div>

          <Button
            leftSection={<Plus size={16} />}
            size='sm'
            onClick={() => openCreateForm()}
            disabled={clientOptions.length === 0 || employeeOptions.length === 0}
          >
            Новая запись
          </Button>
        </div>

        <BoardDateNav
          view={view}
          date={date}
          label={dateNavLabel}
          isAtToday={isAtToday}
          onNavigate={navigate}
          onGoToday={goToday}
          onDateChange={handleDatePick}
          className={styles.toolbarDateMobile}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          {employees.length === 0 && employeeFilter.size > 0 ? (
            <Alert color='gray' title='Фильтр сотрудников' m='md'>
              Выберите сотрудников в панели выше или сбросьте фильтр
            </Alert>
          ) : activeEmployees.length === 0 ? (
            <Alert color='gray' title='Нет активных сотрудников' m='md'>
              Добавьте сотрудников, чтобы отобразить рабочий стол
            </Alert>
          ) : (
            <>
            <div className={styles.gridScroll}>
          {view === 'day' ? (
            <div
              className={styles.grid}
              style={{ gridTemplateColumns: `72px repeat(${Math.max(employees.length, 1)}, 1fr)` }}
            >
              <div className={styles.cornerCell} />
              {employees.map((emp) => (
                <Link
                  key={emp.id}
                  to={`/employees/${emp.id}`}
                  className={`${styles.employeeHeader} ${styles.employeeHeader_link}`}
                  title={`Открыть профиль: ${emp.name}`}
                >
                  <PersonAvatar seed={emp.id} initials={emp.initials} size='md' />
                  <div className={styles.employeeInfo}>
                    <Text size='sm' fw={600} lineClamp={1}>
                      {emp.name}
                    </Text>
                    <Text size='xs' c='dimmed'>
                      {emp.role}
                    </Text>
                  </div>
                </Link>
              ))}

              {renderTimeGrid()}

              {employees.map((emp) => {
                const empAppts = boardAppointments.filter((a) => a.employeeId === emp.id);
                return (
                  <div
                    key={emp.id}
                    className={`${styles.apptColumn} ${styles.apptColumn_clickable}`}
                    style={{ height: TOTAL_HEIGHT }}
                    onMouseDown={(event) =>
                      handleColumnMouseDown(event, {
                        columnKey: `emp-${emp.id}`,
                        employeeId: emp.id,
                        targetDate: date
                      })
                    }
                  >
                    {renderGridLines()}
                    {preview?.columnKey === `emp-${emp.id}` && <CreatePreview preview={preview} />}
                    {empAppts.map((appt) => (
                      <AppointmentCard
                        key={`${appt.id}-${appt.employeeId}`}
                        appt={appt}
                        color={emp.color}
                        lightColor={emp.lightColor}
                        onClick={handleApptClick}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={styles.grid}
              style={{ gridTemplateColumns: `72px repeat(7, minmax(140px, 1fr))` }}
            >
              <div className={styles.cornerCell} />
              {weekDays.map((day) => (
                <div key={day.toISOString()} className={styles.employeeHeader}>
                  <Text size='sm' fw={600} tt='capitalize'>
                    {day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })}
                  </Text>
                  {isSameDay(day, today) && (
                    <Badge size='xs' variant='light' color='blue' mt={4}>
                      Сегодня
                    </Badge>
                  )}
                </div>
              ))}

              {renderTimeGrid()}

              {weekDays.map((day) => {
                const dayAppts = mapAppointmentsToBoard(appointments ?? [], day, filterSet);
                return (
                  <div
                    key={day.toISOString()}
                    className={`${styles.apptColumn} ${styles.apptColumn_clickable}`}
                    style={{ height: TOTAL_HEIGHT }}
                    onMouseDown={(event) =>
                      handleColumnMouseDown(event, {
                        columnKey: `day-${day.toISOString()}`,
                        targetDate: day
                      })
                    }
                  >
                    {renderGridLines(isSameDay(day, today))}
                    {preview?.columnKey === `day-${day.toISOString()}` && (
                      <CreatePreview preview={preview} />
                    )}
                    {dayAppts.map((appt) => {
                      const emp = employees.find((e) => e.id === appt.employeeId) ?? {
                        color: getEmployeeColor(appt.employeeId),
                        lightColor: getEmployeeLightColor(getEmployeeColor(appt.employeeId))
                      };
                      return (
                        <AppointmentCard
                          key={`${appt.id}-${appt.employeeId}`}
                          appt={appt}
                          color={emp.color}
                          lightColor={emp.lightColor}
                          showEmployee
                          onClick={handleApptClick}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
            </div>

            <Text size='xs' c='dimmed' px='md' py={6} className={styles.hint}>
              Потяните по слоту — новая запись · Клик по записи — редактирование
            </Text>
            </>
          )}
        </div>

        <BoardSidebar
          date={date}
          isAtToday={isAtToday}
          markedDates={appointmentDates}
          dayRevenue={dayRevenue}
          appointmentsCount={boardAppointments.length}
          onDateChange={handleDatePick}
          onGoToday={goToday}
        />
      </div>

      <AppointmentFormModal
        opened={formOpen}
        mode={formMode}
        loading={formLoading}
        paid={editingAppointment?.paid}
        appointment={editingAppointment ?? null}
        values={formValues}
        clientOptions={clientOptions}
        clients={clients ?? []}
        employeeOptions={employeeOptions}
        serviceOptions={serviceOptions}
        onChange={setFormValues}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        onDelete={formMode === 'edit' ? () => setDeleteConfirmOpen(true) : undefined}
      />

      <ConfirmModal
        opened={deleteConfirmOpen}
        title='Удалить запись'
        message='Удалить эту запись?'
        loading={deleteAppointment.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
};
