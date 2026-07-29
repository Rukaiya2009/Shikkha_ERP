import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const BASE = API_ENDPOINTS.DASHBOARD.SCHOOL_ADMIN; // /v1/dashboard/admin

// Rewritten to use axiosInstance (was hardcoded to http://localhost:8080, which
// could never reach the Render backend) and to unwrap the { success, data }
// envelope. The `token` arg is kept for call-site compatibility but unused —
// the axios interceptor attaches the Bearer token automatically.
const adminService = {
  getSummary: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/summary`);
    return res.data?.data ?? res.data;
  },
  getRecentActivities: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/recent-activities`);
    return res.data?.data ?? res.data;
  },
  getEnrollmentTrend: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/enrollment-trend`);
    return res.data?.data ?? res.data;
  },
  getRevenueTrend: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/revenue-trend`);
    return res.data?.data ?? res.data;
  },
  getClassDistribution: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/class-distribution`);
    return res.data?.data ?? res.data;
  },
  getGenderRatio: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/gender-ratio`);
    return res.data?.data ?? res.data;
  },
  getRecentUsers: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/recent-users`);
    return res.data?.data ?? res.data;
  },
  getHealth: async (_token?: string) => {
    const res = await axiosInstance.get(`${BASE}/health`);
    return res.data?.data ?? res.data;
  },
};

export default adminService;
