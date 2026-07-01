import React from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  Menu,
  Modal,
  NumberInput,
  Select,
  Skeleton,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DotsThree, MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import {
  useCreateMaterial,
  useDeleteMaterial,
  useMaterials,
  useUpdateMaterial,
  useUpdateMaterialQuantity,
} from '@/shared/api/hooks/useMaterials';
import type {
  Material,
  MaterialCreatePayload,
  MaterialUpdatePayload,
  MeasurementUnit,
} from '@/shared/api/types';
import { AuditLogsPanel } from '@/shared/ui/AuditLogsPanel';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { DataTable, DataTableRow, ListPage, listPageStyles } from '@/shared/ui';
import { formatPrice, MEASUREMENT_UNIT_LABELS } from '@/shared/lib/format';

const MEASUREMENT_OPTIONS = Object.entries(MEASUREMENT_UNIT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface MaterialFormState {
  article: string;
  name: string;
  description: string;
  quantity: number;
  measurement_unit: MeasurementUnit;
  volume: number;
  purchase_price: number;
  retail_price: number;
  wholesale_price: number;
  sell_price: number;
  can_be_product: boolean;
}

const emptyForm = (): MaterialFormState => ({
  article: '',
  name: '',
  description: '',
  quantity: 0,
  measurement_unit: 'piece',
  volume: 0,
  purchase_price: 0,
  retail_price: 0,
  wholesale_price: 0,
  sell_price: 0,
  can_be_product: false,
});

const materialToForm = (material: Material): MaterialFormState => ({
  article: material.article,
  name: material.name,
  description: material.description ?? '',
  quantity: material.quantity,
  measurement_unit: material.measurement_unit,
  volume: material.volume,
  purchase_price: material.purchase_price,
  retail_price: material.retail_price,
  wholesale_price: material.wholesale_price,
  sell_price: material.sell_price,
  can_be_product: material.can_be_product,
});

export const MaterialsPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [quantityOpen, setQuantityOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Material | null>(null);
  const [quantityTarget, setQuantityTarget] = React.useState<Material | null>(null);
  const [form, setForm] = React.useState<MaterialFormState>(emptyForm);
  const [quantityValue, setQuantityValue] = React.useState(1);
  const [quantityOperation, setQuantityOperation] = React.useState<'1' | '-1'>('1');
  const [deleteTarget, setDeleteTarget] = React.useState<Material | null>(null);

  const { data: materials, isLoading, isError } = useMaterials();
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const updateQuantity = useUpdateMaterialQuantity();
  const deleteMaterial = useDeleteMaterial();

  const filtered = React.useMemo(
    () =>
      (materials ?? []).filter((item) => {
        const q = search.toLowerCase();
        return (
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.article.toLowerCase().includes(q)
        );
      }),
    [materials, search],
  );

  const openCreate = React.useCallback(() => {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  }, []);

  const openEdit = React.useCallback((material: Material) => {
    setEditing(material);
    setForm(materialToForm(material));
    setFormOpen(true);
  }, []);

  const openQuantity = React.useCallback((material: Material) => {
    setQuantityTarget(material);
    setQuantityValue(1);
    setQuantityOperation('1');
    setQuantityOpen(true);
  }, []);

  const submitForm = React.useCallback(() => {
    if (editing) {
      const payload: MaterialUpdatePayload = {
        id: editing.id,
        article: form.article,
        name: form.name,
        description: form.description || null,
        measurement_unit: form.measurement_unit,
        volume: form.volume,
        purchase_price: form.purchase_price,
        retail_price: form.retail_price,
        wholesale_price: form.wholesale_price,
        sell_price: form.sell_price,
        can_be_product: form.can_be_product,
      };
      updateMaterial.mutate(payload, { onSuccess: () => setFormOpen(false) });
      return;
    }

    const payload: MaterialCreatePayload = {
      article: form.article,
      name: form.name,
      description: form.description || null,
      quantity: form.quantity,
      measurement_unit: form.measurement_unit,
      volume: form.volume,
      purchase_price: form.purchase_price,
      retail_price: form.retail_price,
      wholesale_price: form.wholesale_price,
      sell_price: form.sell_price,
      can_be_product: form.can_be_product,
    };
    createMaterial.mutate(payload, { onSuccess: () => setFormOpen(false) });
  }, [editing, form, createMaterial, updateMaterial]);

  const submitQuantity = React.useCallback(() => {
    if (!quantityTarget) return;
    updateQuantity.mutate(
      {
        id: quantityTarget.id,
        operation: Number(quantityOperation) as 1 | -1,
        quantity: quantityValue,
      },
      { onSuccess: () => setQuantityOpen(false) },
    );
  }, [quantityTarget, quantityOperation, quantityValue, updateQuantity]);

  if (isLoading) {
    return (
      <ListPage title="Склад">
        <Skeleton height={48} mb="md" />
        <Skeleton height={400} radius="md" />
      </ListPage>
    );
  }

  if (isError) {
    return (
      <ListPage title="Склад">
        <Alert color="red" title="Не удалось загрузить материалы">
          Проверьте доступность API
        </Alert>
      </ListPage>
    );
  }

  return (
    <ListPage
      title="Склад"
      subtitle={`${materials?.length ?? 0} материалов`}
      actions={
        <Button leftSection={<Plus size={16} />} onClick={openCreate}>
          Добавить материал
        </Button>
      }
      filters={
        <TextInput
          className={listPageStyles.searchInput}
          placeholder="Поиск по названию или артикулу..."
          leftSection={<MagnifyingGlass size={15} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      }
    >
      <DataTable
        columns={[
          { key: 'article', label: 'Артикул' },
          { key: 'name', label: 'Название' },
          { key: 'quantity', label: 'Кол-во' },
          { key: 'price', label: 'Цена продажи' },
          { key: 'actions', label: '', width: 48 },
        ]}
        isEmpty={filtered.length === 0}
        emptyMessage="Материалы не найдены"
      >
        {filtered.map((material) => (
          <DataTableRow key={material.id}>
            <Table.Td>
              <Text size="sm" ff="monospace" c="dimmed">
                {material.article}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" fw={500}>
                {material.name}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm">
                {material.quantity} {MEASUREMENT_UNIT_LABELS[material.measurement_unit]}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" fw={600}>
                {formatPrice(material.sell_price)}
              </Text>
            </Table.Td>
            <Table.Td>
              <Menu shadow="sm" width={180} radius="md">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <DotsThree size={16} weight="bold" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<PencilSimple size={14} />}
                    onClick={() => openEdit(material)}
                  >
                    Редактировать
                  </Menu.Item>
                  <Menu.Item onClick={() => openQuantity(material)}>Изменить количество</Menu.Item>
                  <Menu.Item
                    leftSection={<Trash size={14} />}
                    color="red"
                    onClick={() => setDeleteTarget(material)}
                  >
                    Удалить
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </DataTableRow>
        ))}
      </DataTable>

      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Редактировать материал' : 'Новый материал'}
        radius="md"
        size="lg"
      >
        <Group grow mb="md">
          <TextInput
            label="Артикул"
            required
            value={form.article}
            onChange={(event) => setForm({ ...form, article: event.currentTarget.value })}
          />
          <TextInput
            label="Название"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.currentTarget.value })}
          />
        </Group>
        <Textarea
          label="Описание"
          mb="md"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.currentTarget.value })}
        />
        <Group grow mb="md">
          {!editing && (
            <NumberInput
              label="Начальное количество"
              min={0}
              value={form.quantity}
              onChange={(value) => setForm({ ...form, quantity: Number(value) || 0 })}
            />
          )}
          <Select
            label="Единица измерения"
            data={MEASUREMENT_OPTIONS}
            value={form.measurement_unit}
            onChange={(value) =>
              setForm({ ...form, measurement_unit: (value as MeasurementUnit) ?? 'piece' })
            }
          />
          <NumberInput
            label="Объём"
            min={0}
            value={form.volume}
            onChange={(value) => setForm({ ...form, volume: Number(value) || 0 })}
          />
        </Group>
        <Group grow mb="md">
          <NumberInput
            label="Закупочная"
            min={0}
            value={form.purchase_price}
            onChange={(value) => setForm({ ...form, purchase_price: Number(value) || 0 })}
          />
          <NumberInput
            label="Розничная"
            min={0}
            value={form.retail_price}
            onChange={(value) => setForm({ ...form, retail_price: Number(value) || 0 })}
          />
          <NumberInput
            label="Оптовая"
            min={0}
            value={form.wholesale_price}
            onChange={(value) => setForm({ ...form, wholesale_price: Number(value) || 0 })}
          />
          <NumberInput
            label="Продажная"
            min={0}
            value={form.sell_price}
            onChange={(value) => setForm({ ...form, sell_price: Number(value) || 0 })}
          />
        </Group>
        <Checkbox
          label="Можно продавать как товар"
          mb="lg"
          checked={form.can_be_product}
          onChange={(event) => setForm({ ...form, can_be_product: event.currentTarget.checked })}
        />
        {editing && (
          <>
            <Text size="sm" fw={600} mb="xs">
              История изменений
            </Text>
            <AuditLogsPanel tableName="materials" recordId={editing.id} />
          </>
        )}
        <Group justify="flex-end" mt={editing ? 'md' : undefined}>
          <Button variant="subtle" color="gray" onClick={() => setFormOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={submitForm}
            loading={createMaterial.isPending || updateMaterial.isPending}
            disabled={!form.article || !form.name}
          >
            {editing ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={quantityOpen}
        onClose={() => setQuantityOpen(false)}
        title="Изменить количество"
        radius="md"
      >
        <Select
          label="Операция"
          mb="md"
          data={[
            { value: '1', label: 'Приход' },
            { value: '-1', label: 'Расход' },
          ]}
          value={quantityOperation}
          onChange={(value) => setQuantityOperation((value as '1' | '-1') ?? '1')}
        />
        <NumberInput
          label="Количество"
          min={1}
          mb="lg"
          value={quantityValue}
          onChange={(value) => setQuantityValue(Number(value) || 1)}
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => setQuantityOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submitQuantity} loading={updateQuantity.isPending}>
            Применить
          </Button>
        </Group>
      </Modal>

      <ConfirmModal
        opened={Boolean(deleteTarget)}
        title="Удалить материал"
        message={`Удалить «${deleteTarget?.name ?? ''}»?`}
        loading={deleteMaterial.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteMaterial.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
        onClose={() => setDeleteTarget(null)}
      />
    </ListPage>
  );
};
