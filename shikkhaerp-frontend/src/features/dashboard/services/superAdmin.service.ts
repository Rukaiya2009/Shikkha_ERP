import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const BASE = API_ENDPOINTS.DASHBOARD.SUPER_ADMIN; // /v1/dashboard/superadmin

// Responses are wrapped by the backend as { success, message, data, ... },
// so we unwrap `.data.data` to hand callers just the payload.
const superAdminService = {
  getStats: async (_token?: string) => {
    const response = await axiosInstance.get(`${BASE}/stats`);
    return response.data?.data ?? response.data;
  },
  getSchools: async (_token?: string) => {
    const response = await axiosInstance.get(`${BASE}/schools`);
    return response.data?.data ?? response.data;
  },
  getUsers: async (_token?: string) => {
    const response = await axiosInstance.get(`${BASE}/users`);
    return response.data?.data ?? response.data;
  },
  getSystemHealth: async (_token?: string) => {
    const response = await axiosInstance.get(`${BASE}/system-health`);
    return response.data?.data ?? response.data;
  },
};

export default superAdminService;
