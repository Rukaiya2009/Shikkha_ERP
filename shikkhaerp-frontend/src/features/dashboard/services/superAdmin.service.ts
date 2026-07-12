import { axiosInstance } from '../../../core/api/axiosInstance';

// NOTE: the `token` argument is no longer used — axiosInstance's request
// interceptor attaches the Bearer token automatically. It is kept as an
// optional parameter so existing call sites (which still pass a token)
// continue to compile. Those call sites can be cleaned up separately.
const superAdminService = {
  getStats: async (_token?: string) => {
    const response = await axiosInstance.get('/dashboard/superadmin/stats');
    return response.data;
  },

  getSchools: async (_token?: string) => {
    const response = await axiosInstance.get('/dashboard/superadmin/schools');
    return response.data;
  },

  getUsers: async (_token?: string) => {
    const response = await axiosInstance.get('/dashboard/superadmin/users');
    return response.data;
  },

  getSystemHealth: async (_token?: string) => {
    const response = await axiosInstance.get('/dashboard/superadmin/system-health');
    return response.data;
  },
};

export default superAdminService;
