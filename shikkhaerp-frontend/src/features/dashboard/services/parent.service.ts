const API_BASE_URL = 'http://localhost:8080/api';

const parentService = {
  // Get Parent Dashboard Summary
  getSummary: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get My Children
  getMyChildren: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/children`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Child's Academic Performance
  getChildPerformance: async (token: string, childId: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/children/${childId}/performance`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Child's Attendance
  getChildAttendance: async (token: string, childId: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/children/${childId}/attendance`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Child's Fee Status
  getChildFeeStatus: async (token: string, childId: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/children/${childId}/fees`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Get Child's Timetable
  getChildTimetable: async (token: string, childId: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/children/${childId}/timetable`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Pay Fees
  payFees: async (token: string, data: { childId: string, feeId: string, amount: number, paymentMethod: string }) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/pay-fees`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get Payment History
  getPaymentHistory: async (token: string, childId?: string) => {
    const url = childId ? `${API_BASE_URL}/dashboard/parent/payment-history?childId=${childId}` : `${API_BASE_URL}/dashboard/parent/payment-history`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Send Message to Teacher
  sendMessage: async (token: string, data: { childId: string, teacherId: string, subject: string, message: string }) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/send-message`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get Notifications
  getNotifications: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/parent/notifications`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};

export default parentService;