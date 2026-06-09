import React from 'react';
import {
  Group,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  ActionIcon,
  Menu,
  Tabs,
  TextInput,
} from '@mantine/core';
import {
  Plus,
  DotsThree,
  Clock,
  MagnifyingGlass,
  Scissors,
  Sparkle,
  PaintBrush,
  FirstAid,
} from '@phosphor-icons/react';
import styles from './services-page.module.css';

interface Service {
  id: string;
  name: string;
  category: 'haircut' | 'styling' | 'color' | 'barbershop' | 'cosmetology';
  duration: number;
  price: number;
  popular?: boolean;
}

const SERVICES: Service[] = [
  { id: '1', name: 'Женская стрижка', category: 'haircut', duration: 60, price: 80000, popular: true },
  { id: '2', name: 'Мужская стрижка', category: 'haircut', duration: 30, price: 50000, popular: true },
  { id: '3', name: 'Детская стрижка', category: 'haircut', duration: 30, price: 40000 },
  { id: '4', name: 'Укладка волос', category: 'styling', duration: 45, price: 60000 },
  { id: '5', name: 'Вечерняя укладка', category: 'styling', duration: 90, price: 120000 },
  { id: '6', name: 'Прикорневое окрашивание', category: 'color', duration: 90, price: 150000, popular: true },
  { id: '7', name: 'Мелирование', category: 'color', duration: 120, price: 200000 },
  { id: '8', name: 'Тонирование', category: 'color', duration: 60, price: 100000 },
  { id: '9', name: 'Стрижка + борода', category: 'barbershop', duration: 60, price: 70000, popular: true },
  { id: '10', name: 'Оформление бороды', category: 'barbershop', duration: 30, price: 40000 },
  { id: '11', name: 'Королевское бритьё', category: 'barbershop', duration: 45, price: 60000 },
  { id: '12', name: 'Чистка лица', category: 'cosmetology', duration: 90, price: 180000, popular: true },
  { id: '13', name: 'Маникюр', category: 'cosmetology', duration: 60, price: 80000 },
  { id: '14', name: 'Наращивание ресниц', category: 'cosmetology', duration: 120, price: 220000 },
];

const CATEGORIES = [
  { value: 'all', label: 'Все', Icon: Sparkle },
  { value: 'haircut', label: 'Стрижки', Icon: Scissors },
  { value: 'styling', label: 'Укладка', Icon: Sparkle },
  { value: 'color', label: 'Окрашивание', Icon: PaintBrush },
  { value: 'barbershop', label: 'Барбершоп', Icon: Scissors },
  { value: 'cosmetology', label: 'Косметология', Icon: FirstAid },
];

const CATEGORY_COLOR: Record<Service['category'], string> = {
  haircut: '#6366f1',
  styling: '#8b5cf6',
  color: '#ec4899',
  barbershop: '#0ea5e9',
  cosmetology: '#10b981',
};

const CATEGORY_LABEL: Record<Service['category'], string> = {
  haircut: 'Стрижки',
  styling: 'Укладка',
  color: 'Окрашивание',
  barbershop: 'Барбершоп',
  cosmetology: 'Косметология',
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ru-RU').format(value) + ' сум';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const color = CATEGORY_COLOR[service.category];

  return (
    <Card padding="lg" radius="lg" shadow="xs" className={styles.serviceCard}>
      <Group justify="space-between" align="flex-start" mb="md">
        <div
          className={styles.serviceIconWrap}
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, white)` }}
        >
          <Scissors size={18} color={color} weight="duotone" />
        </div>
        <Group gap={6}>
          {service.popular && (
            <Badge size="xs" color="orange" variant="light" radius="sm">
              Топ
            </Badge>
          )}
          <Menu shadow="sm" width={160} radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <DotsThree size={16} weight="bold" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>Редактировать</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red">Удалить</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Text fw={600} size="sm" mb={4}>
        {service.name}
      </Text>

      <Badge
        size="xs"
        variant="light"
        color="gray"
        radius="sm"
        mb="md"
        style={{ color }}
      >
        {CATEGORY_LABEL[service.category]}
      </Badge>

      <Group justify="space-between" mt="auto">
        <Group gap={5}>
          <Clock size={13} color="var(--mantine-color-gray-5)" />
          <Text size="xs" c="dimmed">
            {service.duration} мин
          </Text>
        </Group>
        <Text size="sm" fw={700} style={{ color }}>
          {formatCurrency(service.price)}
        </Text>
      </Group>
    </Card>
  );
};

export const ServicesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    return SERVICES.filter((s) => {
      const matchCategory = activeCategory === 'all' || s.category === activeCategory;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <Text size="xl" fw={700}>Услуги</Text>
          <Text size="sm" c="dimmed" mt={2}>
            {SERVICES.length} услуг в каталоге
          </Text>
        </div>
        <Button leftSection={<Plus size={16} />}>Добавить услугу</Button>
      </div>

      {/* Filters */}
      <Group gap="md" className={styles.filtersRow}>
        <Tabs
          value={activeCategory}
          onChange={(v) => setActiveCategory(v ?? 'all')}
          variant="pills"
          radius="md"
        >
          <Tabs.List>
            {CATEGORIES.map(({ value, label }) => (
              <Tabs.Tab key={value} value={value} fw={500}>
                {label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <TextInput
          placeholder="Поиск услуги..."
          leftSection={<MagnifyingGlass size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          size="sm"
          style={{ width: 240 }}
        />
      </Group>

      {/* Grid */}
      <SimpleGrid cols={4} spacing="md" className={styles.grid}>
        {filtered.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </SimpleGrid>
    </div>
  );
};
