import React from 'react';
import { ActionIcon, Button, Popover, Text, TextInput } from '@mantine/core';
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { toDateInput } from '@/shared/lib/format';
import styles from './board-date-nav.module.css';

interface BoardDateNavProps {
  view: 'day' | 'week';
  date: Date;
  label: string;
  isAtToday: boolean;
  onNavigate: (delta: number) => void;
  onGoToday: () => void;
  onDateChange: (date: Date) => void;
  align?: 'start' | 'end';
  className?: string;
}

export const BoardDateNav: React.FC<BoardDateNavProps> = ({
  view,
  date,
  label,
  isAtToday,
  onNavigate,
  onGoToday,
  onDateChange,
  align = 'start',
  className
}) => {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const handleDateInput = React.useCallback(
    (value: string) => {
      if (!value) return;
      const [year, month, day] = value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
      setPickerOpen(false);
    },
    [onDateChange]
  );

  return (
    <div className={[styles.dateNav, className].filter(Boolean).join(' ')}>
      <div className={styles.dateNavControls}>
        <ActionIcon variant='subtle' color='gray' size='lg' onClick={() => onNavigate(-1)}>
          <CaretLeft size={18} />
        </ActionIcon>

        <Popover
          opened={pickerOpen}
          onChange={setPickerOpen}
          position={align === 'end' ? 'bottom-end' : 'bottom-start'}
          width={260}
        >
          <Popover.Target>
            <button
              type='button'
              className={`${styles.dateNavLabel} ${view === 'week' ? styles.dateNavLabel_week : ''}`}
              onClick={() => setPickerOpen((value) => !value)}
            >
              <Text fw={600} size='sm' tt='capitalize' lineClamp={1}>
                {label}
              </Text>
            </button>
          </Popover.Target>
          <Popover.Dropdown>
            <TextInput
              className={styles.dateNavPicker}
              type='date'
              label='Перейти к дате'
              leftSection={<CalendarBlank size={16} />}
              value={toDateInput(date)}
              onChange={(event) => handleDateInput(event.currentTarget.value)}
            />
          </Popover.Dropdown>
        </Popover>

        <ActionIcon variant='subtle' color='gray' size='lg' onClick={() => onNavigate(1)}>
          <CaretRight size={18} />
        </ActionIcon>
      </div>

      <Button
        variant='light'
        color='gray'
        size='sm'
        disabled={isAtToday}
        onClick={onGoToday}
      >
        Сегодня
      </Button>
    </div>
  );
};
