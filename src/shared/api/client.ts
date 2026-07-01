import { API_BASE_URL, AUTH_ENABLED } from '@/shared/config/env';

// Re-export для удобства
export { API_BASE_URL };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface RequestAllParams {
  page?: number;
  pageSize?: number;
  filters?: Record<string, unknown> | null;
}

const AUTH_KEY = 'salon_auth';
const TENANT_NAME_KEY = 'salon_tenant_name';

export const authStorage = {
  isAuthenticated: (): boolean =>
    !AUTH_ENABLED || localStorage.getItem(AUTH_KEY) === '1',
  getTenantName: (): string | null => localStorage.getItem(TENANT_NAME_KEY),
  setTenantName: (name: string): void => {
    localStorage.setItem(TENANT_NAME_KEY, name);
  },
  clearSession: (): void => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TENANT_NAME_KEY);
  },
  setAuthenticated: (value: boolean): void => {
    if (value) {
      localStorage.setItem(AUTH_KEY, '1');
    } else {
      authStorage.clearSession();
    }
  },
  // Очистить auth при переключении режима разработки
  clearIfAuthDisabled: (): void => {
    if (!AUTH_ENABLED) {
      authStorage.clearSession();
    }
  },
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { detail?: string | { msg: string }[] };
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  } catch {
    // ignore
  }
  return `Ошибка API: ${response.status}`;
};

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (AUTH_ENABLED && response.status === 401 && !path.includes('/auth/')) {
    authStorage.setAuthenticated(false);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiPostGetAll<T>(
  path: string,
  params: RequestAllParams = {},
): Promise<PaginatedResponse<T>> {
  return apiPost<PaginatedResponse<T>, RequestAllParams>(`${path}/get-all`, {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 100,
    filters: params.filters ?? null,
  });
}

export async function apiFetchAllPost<T>(
  path: string,
  filters?: Record<string, unknown>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await apiPostGetAll<T>(path, { page, pageSize: 100, filters });
    all.push(...data.items);
    totalPages = data.totalPages;
    page += 1;
  }

  return all;
}

export async function apiGetPaginated<T>(
  path: string,
  params: RequestAllParams = {},
): Promise<PaginatedResponse<T>> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 1));
  qs.set('pageSize', String(params.pageSize ?? 100));
  return apiRequest<PaginatedResponse<T>>(`${path}?${qs}`);
}

export async function apiFetchAllGet<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await apiGetPaginated<T>(path, { page, pageSize: 100 });
    all.push(...data.items);
    totalPages = data.totalPages;
    page += 1;
  }

  return all;
}

export async function apiPost<T, B>(path: string, body: B): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T, B>(path: string, body: B): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path: string): Promise<void> {
  return apiRequest<void>(path, { method: 'DELETE' });
}

export async function apiPostGetMany<T>(path: string, ids: number[]): Promise<T[]> {
  return apiPost<T[], number[]>(`${path}/get-many`, ids);
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    method: 'POST',
    body: formData,
  });

  if (AUTH_ENABLED && response.status === 401 && !path.includes('/auth/')) {
    authStorage.setAuthenticated(false);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  return response.json() as Promise<T>;
}
