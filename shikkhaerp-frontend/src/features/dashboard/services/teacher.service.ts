
const API_BASE_URL = 'http://localhost:8080/api';

const teacherService = {
  getSummary: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/teacher/summary`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
    });
    return response.json();
  },
};

export default teacherService;
