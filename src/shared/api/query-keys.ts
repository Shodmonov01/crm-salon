export const queryKeys = {
  clients: {
    all: ['clients'] as const,
    detail: (id: number) => ['clients', id] as const,
    appointments: (id: number) => ['clients', id, 'appointments'] as const,
  },
  employees: {
    all: ['employees'] as const,
    detail: (id: number) => ['employees', id] as const,
    many: (ids: number[]) => ['employees', 'many', ...ids] as const,
    workSchedules: (id: number) => ['employees', id, 'work-schedules'] as const,
    payrolls: (id: number) => ['employees', id, 'payrolls'] as const,
    appointments: (id: number) => ['employees', id, 'appointments'] as const,
  },
  services: {
    all: ['services'] as const,
    detail: (id: number) => ['services', id] as const,
  },
  serviceCategories: {
    all: ['service-categories'] as const,
    detail: (id: number) => ['service-categories', id] as const,
  },
  workSchedules: {
    all: ['work-schedules'] as const,
    detail: (id: number) => ['work-schedules', id] as const,
  },
  absences: {
    all: ['absences'] as const,
    detail: (id: number) => ['absences', id] as const,
  },
  payrolls: {
    all: ['payrolls'] as const,
    detail: (id: number) => ['payrolls', id] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    detail: (id: number) => ['appointments', id] as const,
    many: (ids: number[]) => ['appointments', 'many', ...ids] as const,
  },
  appointmentRecords: {
    all: ['appointment-records'] as const,
    detail: (id: number) => ['appointment-records', id] as const,
    many: (ids: number[]) => ['appointment-records', 'many', ...ids] as const,
  },
  appointmentServices: {
    all: ['appointment-services'] as const,
    detail: (id: number) => ['appointment-services', id] as const,
    many: (ids: number[]) => ['appointment-services', 'many', ...ids] as const,
  },
  materials: {
    all: ['materials'] as const,
    detail: (id: number) => ['materials', id] as const,
  },
  receipts: {
    all: ['receipts'] as const,
    detail: (id: number) => ['receipts', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    detail: (id: number) => ['payments', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    detail: (id: number) => ['notifications', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    detail: (id: number) => ['transactions', id] as const,
  },
  auditLogs: {
    list: (tableName: string, recordId: number, page: number) =>
      ['audit-logs', tableName, recordId, page] as const,
  },
};
