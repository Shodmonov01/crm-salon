import type { Appointment } from '@/shared/api/types';
import { parseApiDateTimeParts, toDateInput } from '@/shared/lib/format';

export const SLOT_HEIGHT = 96;
export const TIME_START = 8;
export const TIME_END = 22;
export const MINUTE_HEIGHT = SLOT_HEIGHT / 60;
export const TOTAL_HEIGHT = (TIME_END - TIME_START) * SLOT_HEIGHT;
export const SNAP_MINUTES = 15;

export interface BoardAppointment {
  id: number;
  employeeId: number;
  clientId: number;
  serviceId: number | null;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  duration: number;
  client: string;
  service: string;
  employeeName: string;
  paid: boolean;
  cancelled: boolean;
  totalPrice: number;
  notes: string | null;
}

export const padTime = (value: number): string => value.toString().padStart(2, '0');

export const formatTimeValue = (hours: number, minutes: number): string =>
  `${padTime(hours)}:${padTime(minutes)}`;

export const parseTimeValue = (value: string): { hours: number; minutes: number } => {
  const [hours, minutes] = value.split(':').map(Number);
  return { hours: hours ?? 0, minutes: minutes ?? 0 };
};

export const addMinutesToTime = (value: string, addMinutes: number): string => {
  const { hours, minutes } = parseTimeValue(value);
  const total = hours * 60 + minutes + addMinutes;
  return formatTimeValue(Math.floor(total / 60) % 24, total % 60);
};

export const snapMinutesFromTop = (topPx: number): number => {
  const raw = topPx / MINUTE_HEIGHT;
  return Math.max(0, Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES);
};

export const minutesToTimeString = (totalMinutes: number): string =>
  formatTimeValue(Math.floor(totalMinutes / 60), totalMinutes % 60);

export const getWeekStart = (date: Date): Date => {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
};

export const getWeekDays = (weekStart: Date): Date[] =>
  Array.from(
    { length: 7 },
    (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
  );

export const mapAppointmentsToBoard = (
  appointments: Appointment[],
  date: Date,
  employeeFilter?: Set<number>
): BoardAppointment[] => {
  const result: BoardAppointment[] = [];

  for (const appt of appointments) {
    const startParts = parseApiDateTimeParts(appt.start_time_est);
    if (startParts.date !== toDateInput(date)) continue;

    const endParts = parseApiDateTimeParts(appt.end_time_est);
    const duration = Math.max(
      endParts.hours * 60 + endParts.minutes - (startParts.hours * 60 + startParts.minutes),
      15
    );
    const clientName = appt.client
      ? [appt.client.firstname, appt.client.lastname].filter(Boolean).join(' ')
      : `Клиент #${appt.client_id}`;

    for (const record of appt.records ?? []) {
      if (employeeFilter && employeeFilter.size > 0 && !employeeFilter.has(record.employee_id)) {
        continue;
      }

      const employeeName = record.employee
        ? [record.employee.firstname, record.employee.lastname].filter(Boolean).join(' ')
        : `Сотрудник #${record.employee_id}`;

      const serviceName =
        record.services?.map((s) => s.service?.name ?? 'Услуга').join(', ') || 'Запись';
      const serviceId = record.services?.[0]?.service_id ?? null;

      result.push({
        id: appt.id,
        employeeId: record.employee_id,
        clientId: appt.client_id,
        serviceId,
        startHour: startParts.hours,
        startMinute: startParts.minutes,
        endHour: endParts.hours,
        endMinute: endParts.minutes,
        duration,
        client: clientName,
        service: serviceName,
        employeeName,
        paid: appt.paid,
        cancelled: !!appt.cancelled_at,
        totalPrice: appt.total_price,
        notes: appt.notes
      });
    }
  }

  return result.sort(
    (a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute)
  );
};

export const getApptStyle = (appt: BoardAppointment): { top: number; height: number } => {
  const startMinutes = appt.startHour * 60 + appt.startMinute - TIME_START * 60;
  return {
    top: startMinutes * MINUTE_HEIGHT,
    height: Math.max(appt.duration * MINUTE_HEIGHT - 4, 32)
  };
};

export const HOUR_LABELS = Array.from({ length: TIME_END - TIME_START + 1 }, (_, i) => ({
  hour: TIME_START + i,
  top: i * SLOT_HEIGHT,
  label: `${padTime(TIME_START + i)}:00`
}));
