import React from 'react';
import {
  Group,
  Text,
  Badge,
  Tabs,
  TextInput,
  Skeleton,
  Alert,
  Button,
  ActionIcon,
  Menu,
  Modal,
  Select,
  NumberInput,
  Table,
} from '@mantine/core';
import { MagnifyingGlass, Sparkle, Plus, DotsThree, PencilSimple, Trash, UploadSimple, Archive } from '@phosphor-icons/react';
import {
  useArchiveServiceCategory,
  useCreateService,
  useCreateServiceCategory,
  useDeleteService,
  useDeleteServiceCategory,
  useImportServices,
  useServiceCategories,
  useServices,
  useUpdateService,
  useUpdateServiceCategory,
} from '@/shared/api/hooks/useServices';
import type {
  Service,
  ServiceCategory,
  ServiceCategoryCreatePayload,
  ServiceCategoryUpdatePayload,
  ServiceCreatePayload,
  ServiceUpdatePayload,
} from '@/shared/api/types';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import { ConfirmModal, DataTable, DataTableRow, ListPage, listPageStyles } from '@/shared/ui';
import { formatPrice } from '@/shared/lib/format';
import styles from './services-page.module.css';

export const ServicesPage: React.FC = () => {
  const [mainTab, setMainTab] = React.useState<string>('services');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const [serviceFormOpen, setServiceFormOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [serviceName, setServiceName] = React.useState('');
  const [servicePrice, setServicePrice] = React.useState(0);
  const [serviceCategory, setServiceCategory] = React.useState<string | null>(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = React.useState<Service | null>(null);

  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ServiceCategory | null>(null);
  const [categoryName, setCategoryName] = React.useState('');
  const [deleteCategoryTarget, setDeleteCategoryTarget] = React.useState<ServiceCategory | null>(null);

  const { data: services, isLoading: servicesLoading, isError: servicesError } = useServices();
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useServiceCategories();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();
  const archiveCategory = useArchiveServiceCategory();
  const importServices = useImportServices();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isLoading = servicesLoading || categoriesLoading;
  const isError = servicesError || categoriesError;

  const categoryMap = React.useMemo(() => {
    const map = new Map<number, ServiceCategory>();
    for (const category of categories ?? []) map.set(category.id, category);
    return map;
  }, [categories]);

  const filtered = React.useMemo(
    () =>
      (services ?? []).filter((service) => {
        const matchCategory =
          activeCategory === 'all' || String(service.category_id) === activeCategory;
        const matchSearch = !search || service.name.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
      }),
    [services, activeCategory, search],
  );

  const categoryServiceCount = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const service of services ?? []) {
      if (service.category_id != null) {
        map.set(service.category_id, (map.get(service.category_id) ?? 0) + 1);
      }
    }
    return map;
  }, [services]);

  const openServiceCreate = React.useCallback(() => {
    setEditingService(null);
    setServiceName('');
    setServicePrice(0);
    setServiceCategory(null);
    setServiceFormOpen(true);
  }, []);

  const openServiceEdit = React.useCallback((service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServicePrice(service.price);
    setServiceCategory(service.category_id != null ? String(service.category_id) : null);
    setServiceFormOpen(true);
  }, []);

  const closeServiceForm = React.useCallback(() => {
    setServiceFormOpen(false);
    setEditingService(null);
  }, []);

  const submitService = React.useCallback(() => {
    if (editingService) {
      const payload: ServiceUpdatePayload = {
        id: editingService.id,
        name: serviceName,
        price: servicePrice > 0 ? servicePrice : undefined,
        category_id: serviceCategory ? Number(serviceCategory) : null,
      };
      updateService.mutate(payload, { onSuccess: closeServiceForm });
      return;
    }

    const payload: ServiceCreatePayload = {
      name: serviceName,
      category_id: serviceCategory ? Number(serviceCategory) : null,
    };

    createService.mutate(payload, {
      onSuccess: (created) => {
        if (servicePrice > 0) {
          updateService.mutate(
            { id: created.id, price: servicePrice },
            { onSuccess: closeServiceForm },
          );
          return;
        }
        closeServiceForm();
      },
    });
  }, [
    serviceName,
    servicePrice,
    serviceCategory,
    editingService,
    createService,
    updateService,
    closeServiceForm,
  ]);

  const openCategoryCreate = React.useCallback(() => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryFormOpen(true);
  }, []);

  const openCategoryEdit = React.useCallback((category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryFormOpen(true);
  }, []);

  const submitCategory = React.useCallback(() => {
    if (editingCategory) {
      const payload: ServiceCategoryUpdatePayload = { id: editingCategory.id, name: categoryName };
      updateCategory.mutate(payload, { onSuccess: () => setCategoryFormOpen(false) });
    } else {
      const payload: ServiceCategoryCreatePayload = { name: categoryName };
      createCategory.mutate(payload, { onSuccess: () => setCategoryFormOpen(false) });
    }
  }, [categoryName, editingCategory, createCategory, updateCategory]);

  const handleImportClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      importServices.mutate(file);
      event.target.value = '';
    },
    [importServices],
  );

  if (isLoading) {
    return (
      <ListPage title="Услуги">
        <Skeleton height={48} mb="md" />
        <Skeleton height={400} radius="md" />
      </ListPage>
    );
  }

  if (isError) {
    return (
      <ListPage title="Услуги">
        <Alert color="red" title="Не удалось загрузить данные">
          Проверьте доступность API
        </Alert>
      </ListPage>
    );
  }

  const categoryOptions = (categories ?? []).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  return (
    <ListPage
      title="Услуги"
      subtitle={`${services?.length ?? 0} услуг · ${categories?.length ?? 0} категорий`}
      actions={
        <Group>
          {mainTab === 'services' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleImportFile}
              />
              <Button
                variant="light"
                leftSection={<UploadSimple size={16} />}
                onClick={handleImportClick}
                loading={importServices.isPending}
              >
                Импорт Excel
              </Button>
            </>
          )}
          <Button
            leftSection={<Plus size={16} />}
            onClick={mainTab === 'services' ? openServiceCreate : openCategoryCreate}
          >
            {mainTab === 'services' ? 'Добавить услугу' : 'Добавить категорию'}
          </Button>
        </Group>
      }
    >
      <Tabs
        value={mainTab}
        onChange={(value) => setMainTab(value ?? 'services')}
        variant="pills"
        radius="md"
        mb="md"
      >
        <Tabs.List>
          <Tabs.Tab value="services">Услуги</Tabs.Tab>
          <Tabs.Tab value="categories">Категории</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {mainTab === 'services' ? (
        <>
          <Group gap="md" className={styles.filtersRow} mb="md">
            <Tabs
              value={activeCategory}
              onChange={(value) => setActiveCategory(value ?? 'all')}
              variant="pills"
              radius="md"
            >
              <Tabs.List>
                <Tabs.Tab value="all" fw={500} leftSection={<Sparkle size={14} />}>
                  Все
                </Tabs.Tab>
                {(categories ?? []).map((category) => (
                  <Tabs.Tab key={category.id} value={String(category.id)} fw={500}>
                    {category.name}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
            <TextInput
              placeholder="Поиск услуги..."
              leftSection={<MagnifyingGlass size={15} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              size="sm"
              className={listPageStyles.searchInput}
            />
          </Group>

          <DataTable
            columns={[
              { key: 'name', label: 'Услуга' },
              { key: 'category', label: 'Категория' },
              { key: 'price', label: 'Цена', align: 'right' },
              { key: 'actions', label: '', width: 48 },
            ]}
            isEmpty={filtered.length === 0}
            emptyMessage="Услуги не найдены"
          >
            {filtered.map((service) => {
              const categoryLabel =
                service.category_id != null
                  ? (categoryMap.get(service.category_id)?.name ?? '—')
                  : '—';

              return (
                <DataTableRow key={service.id}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {service.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {categoryLabel !== '—' ? (
                      <Badge size="sm" variant="light" color="gray">
                        {categoryLabel}
                      </Badge>
                    ) : (
                      <Text size="sm" c="dimmed">
                        —
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700}>
                      {service.price > 0 ? formatPrice(service.price) : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Menu shadow="sm" width={160} radius="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <DotsThree size={16} weight="bold" />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<PencilSimple size={14} />}
                          onClick={() => openServiceEdit(service)}
                        >
                          Редактировать
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<Trash size={14} />}
                          color="red"
                          onClick={() => setDeleteServiceTarget(service)}
                        >
                          Удалить
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </DataTableRow>
              );
            })}
          </DataTable>
        </>
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Категория' },
            { key: 'count', label: 'Услуг' },
            { key: 'actions', label: '', width: 48 },
          ]}
          isEmpty={(categories ?? []).length === 0}
          emptyMessage="Категории не найдены"
        >
          {(categories ?? []).map((category) => (
            <DataTableRow key={category.id}>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {category.name}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {categoryServiceCount.get(category.id) ?? 0}
                </Text>
              </Table.Td>
              <Table.Td>
                <Menu shadow="sm" width={160} radius="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <DotsThree size={16} weight="bold" />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<PencilSimple size={14} />}
                      onClick={() => openCategoryEdit(category)}
                    >
                      Редактировать
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Archive size={14} />}
                      onClick={() => archiveCategory.mutate(category.id)}
                    >
                      Архивировать
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Trash size={14} />}
                      color="red"
                      onClick={() => setDeleteCategoryTarget(category)}
                    >
                      Удалить
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      <Modal
        opened={serviceFormOpen}
        onClose={closeServiceForm}
        title={editingService ? 'Редактировать услугу' : 'Новая услуга'}
        radius="md"
      >
        <TextInput
          label="Название"
          required
          mb="md"
          value={serviceName}
          onChange={(event) => setServiceName(event.currentTarget.value)}
        />
        <NumberInput
          label="Цена"
          min={0}
          mb="md"
          value={servicePrice}
          onChange={(value) => setServicePrice(Number(value) || 0)}
          thousandSeparator=" "
          suffix=" сум"
        />
        <Select
          label="Категория"
          data={categoryOptions}
          clearable
          mb="lg"
          value={serviceCategory}
          onChange={setServiceCategory}
        />
        {editingService && (
          <>
            <Text size="sm" fw={600} mb="xs">
              История изменений
            </Text>
            <AuditLogsPanel tableName="services" recordId={editingService.id} />
          </>
        )}
        <Group justify="flex-end" mt={editingService ? 'md' : undefined}>
          <Button variant="subtle" color="gray" onClick={closeServiceForm}>
            Отмена
          </Button>
          <Button
            onClick={submitService}
            loading={createService.isPending || updateService.isPending}
            disabled={!serviceName}
          >
            {editingService ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
        radius="md"
      >
        <TextInput
          label="Название"
          required
          mb="lg"
          value={categoryName}
          onChange={(event) => setCategoryName(event.currentTarget.value)}
        />
        {editingCategory && (
          <>
            <Text size="sm" fw={600} mb="xs">
              История изменений
            </Text>
            <AuditLogsPanel tableName="service_categories" recordId={editingCategory.id} />
          </>
        )}
        <Group justify="flex-end" mt={editingCategory ? 'md' : undefined}>
          <Button variant="subtle" color="gray" onClick={() => setCategoryFormOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={submitCategory}
            loading={createCategory.isPending || updateCategory.isPending}
            disabled={!categoryName}
          >
            {editingCategory ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={Boolean(deleteServiceTarget)}
        title="Удалить услугу"
        message={`Удалить «${deleteServiceTarget?.name ?? ''}»?`}
        loading={deleteService.isPending}
        onConfirm={() =>
          deleteServiceTarget &&
          deleteService.mutate(deleteServiceTarget.id, { onSuccess: () => setDeleteServiceTarget(null) })
        }
        onClose={() => setDeleteServiceTarget(null)}
      />
      <ConfirmModal
        opened={Boolean(deleteCategoryTarget)}
        title="Удалить категорию"
        message={`Удалить «${deleteCategoryTarget?.name ?? ''}»?`}
        loading={deleteCategory.isPending}
        onConfirm={() =>
          deleteCategoryTarget &&
          deleteCategory.mutate(deleteCategoryTarget.id, { onSuccess: () => setDeleteCategoryTarget(null) })
        }
        onClose={() => setDeleteCategoryTarget(null)}
      />
    </ListPage>
  );
};
