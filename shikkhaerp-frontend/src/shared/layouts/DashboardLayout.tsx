import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.slice';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>ShikkhaERP</h2>
        <nav>
          <div style={{ marginBottom: '10px' }}>
            <Link to={`/${user?.role}/dashboard`} style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Link to={`/${user?.role}/students`} style={{ color: 'white', textDecoration: 'none' }}>Students</Link>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Link to={`/${user?.role}/teachers`} style={{ color: 'white', textDecoration: 'none' }}>Teachers</Link>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <Link to={`/${user?.role}/classes`} style={{ color: 'white', textDecoration: 'none' }}>Classes</Link>
          </div>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: '50px', padding: '10px', width: '100%', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, background: '#ecf0f1' }}>
        <div style={{ background: 'white', padding: '15px', borderBottom: '1px solid #ddd' }}>
          <h3>Welcome, {user?.name || 'User'} ({user?.role})</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
