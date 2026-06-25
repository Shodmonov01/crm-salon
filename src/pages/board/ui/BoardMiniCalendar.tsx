import React from 'react';
import { ActionIcon, Text } from '@mantine/core';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { isSameDay, toDateInput } from '@/shared/lib/format';
import styles from './board-mini-calendar.module.css';

interface BoardMiniCalendarProps {
  date: Date;
  markedDates?: Set<string>;
  onDateChange: (date: Date) => void;
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const buildMonthGrid = (year: number, month: number): Array<Date | null> => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: Array<Date | null> = Array.from({ length: startOffset }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export const BoardMiniCalendar: React.FC<BoardMiniCalendarProps> = ({
  date,
  markedDates,
  onDateChange
}) => {
  const today = React.useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = React.useState(() => ({
    year: date.getFullYear(),
    month: date.getMonth()
  }));

  React.useEffect(() => {
    setViewMonth({ year: date.getFullYear(), month: date.getMonth() });
  }, [date]);

  const monthLabel = React.useMemo(
    () =>
      new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
      }),
    [viewMonth.month, viewMonth.year]
  );

  const cells = React.useMemo(
    () => buildMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth.month, viewMonth.year]
  );

  const handlePrevMonth = React.useCallback(() => {
    setViewMonth((current) => {
      const next = new Date(current.year, current.month - 1, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }, []);

  const handleNextMonth = React.useCallback(() => {
    setViewMonth((current) => {
      const next = new Date(current.year, current.month + 1, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }, []);

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <ActionIcon variant='subtle' color='gray' size='sm' onClick={handlePrevMonth}>
          <CaretLeft size={16} />
        </ActionIcon>
        <Text size='sm' fw={600} tt='capitalize' className={styles.calendarTitle}>
          {monthLabel}
        </Text>
        <ActionIcon variant='subtle' color='gray' size='sm' onClick={handleNextMonth}>
          <CaretRight size={16} />
        </ActionIcon>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className={styles.weekday}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.days}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <span key={`empty-${index}`} className={styles.dayEmpty} />;
          }

          const dateKey = toDateInput(cell);
          const isSelected = isSameDay(cell, date);
          const isToday = isSameDay(cell, today);
          const hasAppointments = markedDates?.has(dateKey);

          return (
            <button
              key={dateKey}
              type='button'
              className={[
                styles.day,
                isSelected ? styles.day_selected : '',
                isToday ? styles.day_today : '',
                hasAppointments ? styles.day_marked : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onDateChange(cell)}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
