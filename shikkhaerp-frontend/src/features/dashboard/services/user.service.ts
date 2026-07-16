import { axiosInstance } from '../../../core/api/axiosInstance';
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

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  schoolId?: string | null;
}

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

  // Clears an account lockout. This endpoint lives on the /lock controller,
  // NOT /users. `null` body is deliberate — Spring's @RequestParam binds from
  // the query string, and passing the params object as the body would make
  // axios send JSON instead, producing a 400 that looks like a routing bug.
  //
  // email = the locked user's OWN email (u.email from the row). That's the key
  // the failed-login counter is stored under, so the unlock must reference it
  // to reset the count. If the backend instead expects the acting admin's
  // email for auditing, that's the single argument to change at the call site.
  unlock: async (id: string, email: string, reason = 'Unlocked by admin'): Promise<void> => {
    await axiosInstance.post(`${API_ENDPOINTS.LOCK.BASE}/${id}/unlock`, null, {
      params: { email, reason },
    });
  },

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
