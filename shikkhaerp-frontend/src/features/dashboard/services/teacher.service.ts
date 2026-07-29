import { axiosInstance } from '../../../core/api/axiosInstance';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

const BASE = API_ENDPOINTS.DASHBOARD.TEACHER; // /v1/dashboard/teacher

// NOTE: the backend does not yet expose a teacher dashboard controller. This
// call is wired to the correct path so it lights up automatically once that
// endpoint ships; until then it resolves to null and the dashboard shows a
// clean "not available yet" state instead of crashing.
const teacherService = {
  getSummary: async (_token?: string) => {
    try {
      const res = await axiosInstance.get(`${BASE}/summary`);
      return res.data?.data ?? res.data ?? null;
    } catch {
      return null;
    }
  },
};

export default teacherService;
