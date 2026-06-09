import React from 'react';
import {
  Group,
  Button,
  Text,
  Badge,
  ActionIcon,
  SegmentedControl,
  Avatar,
  Tooltip,
} from '@mantine/core';
import { CaretLeft, CaretRight, Plus, Users } from '@phosphor-icons/react';
import styles from './board-page.module.css';

const SLOT_HEIGHT = 96;
const TIME_START = 8;
const TIME_END = 22;
const MINUTE_HEIGHT = SLOT_HEIGHT / 60;
const TOTAL_HEIGHT = (TIME_END - TIME_START) * SLOT_HEIGHT;

interface Employee {
  id: number;
  name: string;
  role: string;
  color: string;
  lightColor: string;
  initials: string;
}

interface Appointment {
  id: string;
  employeeId: number;
  startHour: number;
  startMinute: number;
  duration: number;
  client: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Азизбек Каримов', role: 'Барбер', color: '#6366f1', lightColor: '#eef2ff', initials: 'АК' },
  { id: 2, name: 'Дилноза Рашидова', role: 'Стилист', color: '#8b5cf6', lightColor: '#f5f3ff', initials: 'ДР' },
  { id: 3, name: 'Сардор Тошматов', role: 'Барбер', color: '#0ea5e9', lightColor: '#f0f9ff', initials: 'СТ' },
  { id: 4, name: 'Мохира Назарова', role: 'Косметолог', color: '#10b981', lightColor: '#ecfdf5', initials: 'МН' },
];

const APPOINTMENTS: Appointment[] = [
  { id: '1', employeeId: 1, startHour: 9, startMinute: 0, duration: 90, client: 'Камола Юсупова', service: 'Стрижка + укладка', status: 'confirmed' },
  { id: '2', employeeId: 2, startHour: 9, startMinute: 30, duration: 45, client: 'Жахонгир Рашидов', service: 'Мужская стрижка', status: 'confirmed' },
  { id: '3', employeeId: 3, startHour: 10, startMinute: 0, duration: 60, client: 'Зулфия Каримова', service: 'Окрашивание', status: 'confirmed' },
  { id: '4', employeeId: 1, startHour: 11, startMinute: 0, duration: 60, client: 'Бобур Тошматов', service: 'Стрижка', status: 'confirmed' },
  { id: '5', employeeId: 4, startHour: 10, startMinute: 30, duration: 90, client: 'Малика Назарова', service: 'Чистка лица', status: 'confirmed' },
  { id: '6', employeeId: 2, startHour: 13, startMinute: 0, duration: 120, client: 'Нилуфар Каримова', service: 'Окрашивание + укладка', status: 'confirmed' },
  { id: '7', employeeId: 3, startHour: 12, startMinute: 0, duration: 30, client: 'Тимур Рашидов', service: 'Борода', status: 'pending' },
  { id: '8', employeeId: 1, startHour: 14, startMinute: 0, duration: 60, client: 'Феруза Юсупова', service: 'Стрижка', status: 'confirmed' },
  { id: '9', employeeId: 4, startHour: 15, startMinute: 0, duration: 60, client: 'Дилором Хасанова', service: 'Маникюр', status: 'confirmed' },
  { id: '10', employeeId: 2, startHour: 16, startMinute: 0, duration: 90, client: 'Шахло Абдуллаева', service: 'Мелирование', status: 'pending' },
  { id: '11', employeeId: 3, startHour: 14, startMinute: 30, duration: 60, client: 'Санжар Алиев', service: 'Стрижка + борода', status: 'confirmed' },
  { id: '12', employeeId: 4, startHour: 17, startMinute: 0, duration: 90, client: 'Гулнора Юсупова', service: 'Наращивание ресниц', status: 'confirmed' },
];

const TODAY = new Date(2026, 5, 8);

const HOUR_LABELS = Array.from({ length: TIME_END - TIME_START + 1 }, (_, i) => ({
  hour: TIME_START + i,
  top: i * SLOT_HEIGHT,
  label: `${(TIME_START + i).toString().padStart(2, '0')}:00`,
}));

const formatDate = (d: Date): string =>
  d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const BoardPage: React.FC = () => {
  const [date, setDate] = React.useState(TODAY);
  const [view] = React.useState<'day' | 'week'>('day');

  const prevDay = React.useCallback(() => {
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  }, []);

  const nextDay = React.useCallback(() => {
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  }, []);

  const goToday = React.useCallback(() => {
    setDate(TODAY);
  }, []);

  const isToday = isSameDay(date, TODAY);

  const now = TODAY;
  const currentTimeMinutes = isToday
    ? now.getHours() * 60 + now.getMinutes()
    : -1;
  const currentTimeTop =
    currentTimeMinutes >= TIME_START * 60 && currentTimeMinutes <= TIME_END * 60
      ? (currentTimeMinutes - TIME_START * 60) * MINUTE_HEIGHT
      : -1;

  interface ApptDimensions {
    top: number;
    height: number;
  }

  const getApptStyle = React.useCallback(
    (appt: Appointment): ApptDimensions => {
      const startMinutes = appt.startHour * 60 + appt.startMinute - TIME_START * 60;
      return {
        top: startMinutes * MINUTE_HEIGHT,
        height: Math.max(appt.duration * MINUTE_HEIGHT - 4, 32),
      };
    },
    [],
  );

  const getEmployee = React.useCallback(
    (id: number): Employee => EMPLOYEES.find((e) => e.id === id) ?? EMPLOYEES[0],
    [],
  );

  const totalColumns = EMPLOYEES.length;

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Group gap="xs">
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={prevDay}>
            <CaretLeft size={18} />
          </ActionIcon>

          <div className={styles.dateBlock}>
            <Text fw={600} size="sm" tt="capitalize">
              {formatDate(date)}
            </Text>
            {isToday && (
              <Badge size="xs" variant="light" color="blue" ml={8}>
                Сегодня
              </Badge>
            )}
          </div>

          <ActionIcon variant="subtle" color="gray" size="lg" onClick={nextDay}>
            <CaretRight size={18} />
          </ActionIcon>

          {!isToday && (
            <Button variant="subtle" size="xs" color="gray" onClick={goToday}>
              Сегодня
            </Button>
          )}
        </Group>

        <Group gap="sm">
          <Group gap={6} className={styles.employeeChips}>
            <Tooltip label="Все сотрудники" withArrow>
              <ActionIcon variant="light" color="gray" size="sm" radius="xl">
                <Users size={14} />
              </ActionIcon>
            </Tooltip>
            {EMPLOYEES.map((emp) => (
              <Tooltip key={emp.id} label={emp.name} withArrow>
                <Avatar
                  size={28}
                  radius="xl"
                  style={{ backgroundColor: emp.color, cursor: 'pointer', border: `2px solid white` }}
                >
                  <Text size="xs" fw={700} c="white">
                    {emp.initials}
                  </Text>
                </Avatar>
              </Tooltip>
            ))}
          </Group>

          <SegmentedControl
            size="xs"
            value={view}
            data={[
              { value: 'day', label: 'День' },
              { value: 'week', label: 'Неделя' },
            ]}
          />

          <Button leftSection={<Plus size={15} />} size="sm">
            Новая запись
          </Button>
        </Group>
      </div>

      {/* Schedule grid */}
      <div className={styles.gridScroll}>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `72px repeat(${totalColumns}, 1fr)` }}
        >
          {/* Header: corner + employee columns */}
          <div className={styles.cornerCell} />
          {EMPLOYEES.map((emp) => (
            <div key={emp.id} className={styles.employeeHeader}>
              <Avatar
                size={36}
                radius="md"
                style={{ backgroundColor: emp.color }}
              >
                <Text size="xs" fw={700} c="white">
                  {emp.initials}
                </Text>
              </Avatar>
              <div className={styles.employeeInfo}>
                <Text size="sm" fw={600} lineClamp={1}>
                  {emp.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {emp.role}
                </Text>
              </div>
            </div>
          ))}

          {/* Time column */}
          <div className={styles.timeColumn} style={{ height: TOTAL_HEIGHT }}>
            {HOUR_LABELS.map(({ label, top }) => (
              <div key={label} className={styles.timeLabel} style={{ top }}>
                <Text size="xs" c="dimmed" fw={500}>
                  {label}
                </Text>
              </div>
            ))}
          </div>

          {/* Employee appointment columns */}
          {EMPLOYEES.map((emp) => {
            const empAppts = APPOINTMENTS.filter((a) => a.employeeId === emp.id);

            return (
              <div key={emp.id} className={styles.apptColumn} style={{ height: TOTAL_HEIGHT }}>
                {/* Hour lines */}
                {HOUR_LABELS.map(({ hour, top }) => (
                  <div
                    key={hour}
                    className={styles.hourLine}
                    style={{ top }}
                  />
                ))}
                {/* Half-hour lines */}
                {HOUR_LABELS.slice(0, -1).map(({ hour, top }) => (
                  <div
                    key={`half-${hour}`}
                    className={styles.halfHourLine}
                    style={{ top: top + SLOT_HEIGHT / 2 }}
                  />
                ))}

                {/* Current time indicator */}
                {currentTimeTop >= 0 && (
                  <div className={styles.currentTimeLine} style={{ top: currentTimeTop }} />
                )}

                {/* Appointments */}
                {empAppts.map((appt) => {
                  const apptStyle = getApptStyle(appt);
                  const employee = getEmployee(appt.employeeId);
                  return (
                    <div
                      key={appt.id}
                      className={`${styles.appt} ${styles[`appt_${appt.status}`]}`}
                      style={{
                        ...apptStyle,
                        borderLeftColor: employee.color,
                        backgroundColor: employee.lightColor,
                      }}
                    >
                      <Text size="xs" fw={700} lineClamp={1} style={{ color: employee.color }}>
                        {appt.client}
                      </Text>
                      {apptStyle.height > 48 && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {appt.service}
                        </Text>
                      )}
                      {apptStyle.height > 72 && (
                        <Text size="xs" c="dimmed" mt="auto">
                          {`${appt.startHour.toString().padStart(2, '0')}:${appt.startMinute.toString().padStart(2, '0')} · ${appt.duration} мин`}
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
