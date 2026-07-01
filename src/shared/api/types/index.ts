export type Sex = 'male' | 'female';

export type PayrollType = 'salary' | 'bonus' | 'penalty' | 'commission';

export type AbsenceType = 'sick' | 'vacation' | 'day off' | 'weekend' | 'other';

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface Client extends BaseEntity {
  firstname: string;
  lastname: string | null;
  middlename: string | null;
  phone: string | null;
  birth_date: string | null;
  sex: Sex;
  deposit: number;
  notes: string | null;
}

export interface ClientCreatePayload {
  firstname: string;
  lastname?: string | null;
  middlename?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  sex: Sex;
  deposit?: number;
  notes?: string | null;
}

export interface ClientUpdatePayload {
  id: number;
  firstname?: string;
  lastname?: string | null;
  middlename?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  sex?: Sex;
  notes?: string | null;
}

export interface ClientDepositPayload {
  id: number;
  operation: 1 | -1;
  amount: number;
}

export interface ServiceCategory extends BaseEntity {
  name: string;
}

export interface Service extends BaseEntity {
  name: string;
  price: number;
  category_id: number | null;
}

export interface ServiceCreatePayload {
  name: string;
  category_id?: number | null;
}

export interface ServiceUpdatePayload {
  id: number;
  name?: string;
  price?: number;
  category_id?: number | null;
}

export interface ServiceCategoryCreatePayload {
  name: string;
}

export interface ServiceCategoryUpdatePayload {
  id: number;
  name?: string;
}

export interface Employee extends BaseEntity {
  firstname: string;
  lastname: string | null;
  middlename: string | null;
  phone: string | null;
  birth_date: string;
  active: boolean;
  specialization_id: number | null;
  services: Service[];
  salary_fixed: number;
  percent_from_services: number;
  percent_from_sales: number;
}

export interface EmployeeCreatePayload {
  firstname: string;
  lastname?: string | null;
  middlename?: string | null;
  phone?: string | null;
  birth_date: string;
  active?: boolean;
  specialization_id?: number | null;
  services_ids?: number[];
  salary_fixed?: number;
  percent_from_services?: number;
  percent_from_sales?: number;
}

export interface EmployeeUpdatePayload {
  id: number;
  firstname?: string;
  lastname?: string | null;
  middlename?: string | null;
  phone?: string | null;
  birth_date?: string;
  active?: boolean;
  specialization_id?: number | null;
  services?: number[];
  salary_fixed?: number;
  percent_from_services?: number;
  percent_from_sales?: number;
}

export interface WorkSchedule extends BaseEntity {
  employee_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export interface WorkScheduleCreatePayload {
  employee_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export interface WorkScheduleUpdatePayload {
  id: number;
  day?: string;
  start_time?: string;
  end_time?: string;
}

export interface Absence extends BaseEntity {
  employee_id: number;
  start_date: string;
  end_date: string;
  absence_type: AbsenceType;
  reason: string | null;
}

export interface AbsenceCreatePayload {
  employee_id: number;
  start_date: string;
  end_date: string;
  absence_type: AbsenceType;
  reason?: string | null;
}

export interface AbsenceUpdatePayload {
  id: number;
  start_date?: string;
  end_date?: string;
  absence_type?: AbsenceType;
  reason?: string | null;
}

export interface EmployeeWorkScheduleResponse {
  work_schedules: WorkSchedule[];
  absences: Absence[];
}

export interface Payroll extends BaseEntity {
  employee_id: number;
  amount: number;
  type: PayrollType;
  notes: string | null;
  appointment_id: number | null;
}

export interface PayrollCreatePayload {
  employee_id: number;
  amount: number;
  type: PayrollType;
  notes?: string | null;
  appointment_id?: number | null;
}

export interface PayrollUpdatePayload {
  id: number;
  employee_id?: number;
  amount?: number;
  type?: PayrollType;
  notes?: string | null;
  appointment_id?: number | null;
}

export interface AppointmentServiceNested {
  id: number;
  appointment_record_id: number;
  service_id: number | null;
  service: { id: number; name: string } | null;
  material_id: number | null;
  quantity: number;
  price: number;
  notes: string | null;
}

export interface AppointmentRecordNested {
  id: number;
  appointment_id: number;
  employee_id: number;
  employee: { id: number; firstname: string; lastname: string | null } | null;
  services: AppointmentServiceNested[];
}

export interface Appointment extends BaseEntity {
  client_id: number;
  client: { id: number; firstname: string; lastname: string | null; phone: string | null } | null;
  start_time_est: string;
  end_time_est: string;
  paid: boolean;
  total_price: number;
  records: AppointmentRecordNested[] | null;
  notes: string | null;
  cancelled_at: string | null;
}

export interface AppointmentServiceInput {
  service_id?: number | null;
  material_id?: number | null;
  quantity: number;
  price: number;
  notes?: string | null;
}

export interface AppointmentRecordInput {
  employee_id: number;
  services: AppointmentServiceInput[];
}

export interface AppointmentCreatePayload {
  client_id: number;
  start_time_est: string;
  end_time_est: string;
  records?: AppointmentRecordInput[];
  notes?: string | null;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface StaffLoginResponse extends BaseEntity {
  login: string;
  employee: unknown | null;
  firstname: string;
  lastname: string | null;
  middlename: string | null;
  active: boolean;
  staff_type: string;
  tenant_name: string;
}

export type MeasurementUnit =
  | 'piece'
  | 'pack'
  | 'box'
  | 'bottle'
  | 'milliliter'
  | 'liter'
  | 'gramm'
  | 'kilogram';

export interface Material extends BaseEntity {
  article: string;
  name: string;
  description: string | null;
  quantity: number;
  measurement_unit: MeasurementUnit;
  volume: number;
  purchase_price: number;
  retail_price: number;
  wholesale_price: number;
  sell_price: number;
  can_be_product: boolean;
}

export interface MaterialCreatePayload {
  article: string;
  name: string;
  description?: string | null;
  quantity?: number;
  measurement_unit?: MeasurementUnit;
  volume?: number;
  purchase_price?: number;
  retail_price?: number;
  wholesale_price?: number;
  sell_price?: number;
  can_be_product?: boolean;
}

export interface MaterialUpdatePayload {
  id: number;
  article?: string;
  name?: string;
  description?: string | null;
  measurement_unit?: MeasurementUnit;
  volume?: number;
  purchase_price?: number;
  retail_price?: number;
  wholesale_price?: number;
  sell_price?: number;
  can_be_product?: boolean;
}

export interface MaterialQuantityPayload {
  id: number;
  operation: 1 | -1;
  quantity: number;
}

export type ReceiptType = 'appointment' | 'direct sale';
export type ReceiptStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'deposit';

export interface ReceiptItem extends BaseEntity {
  material_id: number | null;
  appointment_service_id: number | null;
  price: number;
  quantity: number;
  notes: string | null;
  subtotal: number;
}

export interface Receipt extends BaseEntity {
  receipt_type: ReceiptType;
  appointment_id: number | null;
  client_id: number | null;
  items: ReceiptItem[];
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: ReceiptStatus;
  change_amount: number;
  change_to_deposit: boolean;
}

export interface ReceiptItemCreatePayload {
  material_id: number;
  quantity?: number;
}

export interface ReceiptCreatePayload {
  receipt_type?: ReceiptType;
  appointment_id?: number | null;
  client_id?: number | null;
  receipt_items?: ReceiptItemCreatePayload[] | null;
}

export interface Payment extends BaseEntity {
  receipt_id: number;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentCreatePayload {
  receipt_id: number;
  amount: number;
  method: PaymentMethod;
  add_change_to_deposit?: boolean;
}

export type SalonNotificationType = 'reminder' | 'other';

export interface SalonNotificationWsPayload {
  id: number;
  client_id: number | null;
  type: SalonNotificationType;
  title: string | null;
  body: string;
  scheduled_at: string;
  delivered_at: string | null;
}

export interface SalonNotification extends BaseEntity {
  client_id: number | null;
  title: string | null;
  body: string;
  type: SalonNotificationType;
  scheduled_at: string;
  delivered_at: string | null;
}

export interface SalonNotificationCreatePayload {
  client_id?: number | null;
  title?: string | null;
  body: string;
  type?: SalonNotificationType;
  scheduled_at: string;
}

export type AuditLogTable =
  | 'appointments'
  | 'appointment_records'
  | 'appointment_services'
  | 'clients'
  | 'employees'
  | 'employee_absences'
  | 'employee_work_schedules'
  | 'materials'
  | 'payments'
  | 'payrolls'
  | 'receipt_items'
  | 'receipts'
  | 'service_categories'
  | 'services'
  | 'specializations'
  | 'staffs';

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: number;
  changed_at: string;
}

export interface AuditLogsParams {
  table_name: AuditLogTable;
  record_id: number;
  page?: number;
  pageSize?: number;
}

export interface AppointmentRecord extends BaseEntity {
  appointment_id: number;
  employee_id: number;
  employee: {
    id: number;
    firstname: string;
    lastname: string | null;
    specialization: string | null;
  } | null;
  services: AppointmentServiceRecord[];
}

export interface AppointmentServiceRecord extends BaseEntity {
  appointment_record_id: number;
  service_id: number;
  service: { id: number; name: string } | null;
  material_id: number | null;
  quantity: number;
  price: number;
  price_changed_reason: string | null;
  notes: string | null;
}

export interface AppointmentServiceCreatePayload {
  appointment_record_id: number;
  service_id?: number | null;
  material_id?: number | null;
  quantity?: number;
  price: number;
  price_changed_reason?: string | null;
  notes?: string | null;
}

export interface AppointmentRecordCreatePayload {
  appointment_id: number;
  employee_id: number;
  services: AppointmentServiceCreatePayload[];
}

export interface ServicesImportResult {
  created_categories: number;
  created_services: number;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'receipt'
  | 'employee payment'
  | 'utility'
  | 'internet'
  | 'telephone'
  | 'other';

export type ManualTransactionCategory = 'utility' | 'internet' | 'telephone' | 'other';

export type TransactionMethod = 'card' | 'cash' | 'bank transfer' | 'deposit';

export interface Transaction extends BaseEntity {
  amount: number;
  type: TransactionType;
  method: TransactionMethod;
  category: TransactionCategory;
  receipt_id: number | null;
  payout_id: number | null;
  notes: string | null;
  auto_generated: boolean;
  /** Нет в API — см. docs/backend-changes.md; выставляется локально после cancel */
  cancelled?: boolean;
}

export interface TransactionCreatePayload {
  type: TransactionType;
  category: ManualTransactionCategory;
  method: TransactionMethod;
  amount: number;
  notes?: string | null;
}
