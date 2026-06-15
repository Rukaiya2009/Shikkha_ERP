const API_BASE_URL = 'http://localhost:8080/api';

const superAdminService = {
  getStats: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/superadmin/stats`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  getSchools: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/superadmin/schools`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  getUsers: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/superadmin/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  getSystemHealth: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/superadmin/system-health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};

export default superAdminService;
