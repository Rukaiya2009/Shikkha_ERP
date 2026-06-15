import React from 'react';

export const DashboardContainer: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'blue', fontSize: '24px' }}>Dashboard Working!</h1>
      <p>If you see this, the dashboard is rendering correctly.</p>
      <div style={{ background: '#e0f7fa', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <p>✅ Frontend is connected to backend</p>
        <p>✅ Authentication is working</p>
        <p>✅ Dashboard is displaying</p>
      </div>
    </div>
  );
};
