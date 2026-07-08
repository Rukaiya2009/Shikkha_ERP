import { axiosInstance } from '../../../core/api/axiosInstance.ts.bak';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  enabled: boolean;
  schoolId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// CHANGED: no password field. The backend now generates an unusable
// placeholder internally and emails the new user an invite link — the
// admin creating the account never sees or sets a password.
export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  schoolId?: string | null;
}

// Note: password is intentionally NOT included here.
// UserService.updateUser() on the backend never touches password,
// and the Edit form must never send one either.
export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export interface PaginatedUsers {
  content: AppUser[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

const userService = {
  getAllPaginated: async (
    page = 0,
    size = 10,
    role?: string,
    status?: string,
    schoolId?: string
  ): Promise<PaginatedUsers> => {
    // Note: the backend now enforces school scoping server-side for
    // non-super-admin callers regardless of what schoolId is sent here —
    // this param is mainly useful for a Super Admin filtering to one school.
    const response = await axiosInstance.get(`${API_ENDPOINTS.USERS.BASE}/all`, {
      params: { page, size, role, status, schoolId },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<AppUser> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.USERS.BASE}/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateUserPayload): Promise<AppUser> => {
    const response = await axiosInstance.post(API_ENDPOINTS.USERS.BASE, payload);
    return response.data.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<AppUser> => {
    const response = await axiosInstance.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, payload);
    return response.data.data;
  },

  setEnabled: async (id: string, enabled: boolean): Promise<void> => {
    await axiosInstance.put(`${API_ENDPOINTS.USERS.BASE}/${id}/status`, null, {
      params: { enabled },
    });
  },

  search: async (keyword: string): Promise<AppUser[]> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.USERS.BASE}/search`, {
      params: { keyword },
    });
    return response.data.data;
  },

  // Soft delete — backend sets deletedAt/deletedBy, user disappears from
  // the default list but is recoverable via restore(). There is no hard
  // delete endpoint, intentionally.
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.USERS.BASE}/${id}`);
  },

  restore: async (id: string): Promise<AppUser> => {
    const response = await axiosInstance.put(`${API_ENDPOINTS.USERS.BASE}/${id}/restore`);
    return response.data.data;
  },

  getDeletedPaginated: async (page = 0, size = 10): Promise<PaginatedUsers> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.USERS.BASE}/deleted`, {
      params: { page, size },
    });
    return response.data.data;
  },

  resendInvite: async (id: string): Promise<void> => {
    await axiosInstance.post(`${API_ENDPOINTS.USERS.BASE}/${id}/resend-invite`);
  },
};

export default userService;