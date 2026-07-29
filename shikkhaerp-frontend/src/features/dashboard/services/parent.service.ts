import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const BASE = API_ENDPOINTS.DASHBOARD.PARENT; // /v1/dashboard/parent

// NOTE: the backend does not yet expose a parent dashboard controller. These
// calls are wired to the correct paths so they light up automatically once the
// endpoints ship; until then they resolve to safe empties and the dashboard
// shows a clean "no children linked yet" state instead of crashing.
const parentService = {
  getSummary: async (_token?: string) => {
    try {
      const res = await axiosInstance.get(`${BASE}/summary`);
      return res.data?.data ?? res.data ?? null;
    } catch {
      return null;
    }
  },
  getMyChildren: async (_token?: string) => {
    try {
      const res = await axiosInstance.get(`${BASE}/children`);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  getChildPerformance: async (_token: string | undefined, childId: string) => {
    const res = await axiosInstance.get(`${BASE}/children/${childId}/performance`);
    return res.data?.data ?? res.data;
  },
  getChildAttendance: async (_token: string | undefined, childId: string) => {
    const res = await axiosInstance.get(`${BASE}/children/${childId}/attendance`);
    return res.data?.data ?? res.data;
  },
};

export default parentService;
