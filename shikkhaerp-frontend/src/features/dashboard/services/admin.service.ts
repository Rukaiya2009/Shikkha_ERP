const API_BASE_URL = 'http://localhost:8080/api';

const adminService = {
  // Get School Summary Stats
  getSummary: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Recent Activities
  getRecentActivities: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/recent-activities`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Enrollment Trend
  getEnrollmentTrend: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/enrollment-trend`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Revenue Trend
  getRevenueTrend: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/revenue-trend`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Class Distribution
  getClassDistribution: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/class-distribution`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Gender Ratio
  getGenderRatio: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/gender-ratio`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Recent Users
  getRecentUsers: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/recent-users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get System Health
  getHealth: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/admin/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};

export default adminService;
