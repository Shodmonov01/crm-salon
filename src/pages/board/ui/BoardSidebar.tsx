import React from 'react';
import { Button, Text, TextInput } from '@mantine/core';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { formatPrice } from '@/shared/lib/format';
import { BoardMiniCalendar } from './BoardMiniCalendar';
import styles from './board-sidebar.module.css';

interface BoardSidebarProps {
  date: Date;
  isAtToday: boolean;
  markedDates: Set<string>;
  dayRevenue: number;
  appointmentsCount: number;
  onDateChange: (date: Date) => void;
  onGoToday: () => void;
}

export const BoardSidebar: React.FC<BoardSidebarProps> = ({
  date,
  isAtToday,
  markedDates,
  dayRevenue,
  appointmentsCount,
  onDateChange,
  onGoToday
}) => {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const clockLabel = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateLabel = date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.clock}>{clockLabel}</div>

      <div className={styles.section}>
        <Text size='sm' fw={600} tt='capitalize' lineClamp={2}>
          {dateLabel}
        </Text>
        {!isAtToday && (
          <Button variant='light' color='gray' size='xs' fullWidth mt='xs' onClick={onGoToday}>
            Сегодня
          </Button>
        )}
      </div>

      <div className={styles.section}>
        <BoardMiniCalendar date={date} markedDates={markedDates} onDateChange={onDateChange} />
      </div>

      <div className={styles.section}>
        <Text size='xs' fw={600} c='dimmed' tt='uppercase' mb={8}>
          Выручка за день
        </Text>
        <Text size='xl' fw={700} className={styles.revenueValue}>
          {formatPrice(dayRevenue)}
        </Text>
        <Text size='xs' c='dimmed' mt={4}>
          {appointmentsCount} {appointmentsCount === 1 ? 'запись' : 'записей'}
        </Text>
      </div>

      <div className={styles.section}>
        <Text size='xs' fw={600} c='dimmed' tt='uppercase' mb={8}>
          Клиент
        </Text>
        <TextInput
          placeholder='Поиск клиента'
          leftSection={<MagnifyingGlass size={16} />}
          size='sm'
          disabled
        />
        <Text size='xs' c='dimmed' mt={6}>
          Скоро: быстрый поиск и запись
        </Text>
      </div>
    </aside>
  );
};
