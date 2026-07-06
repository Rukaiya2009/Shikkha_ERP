import React from 'react';

const DeveloperEmailLogsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📧 Email Logs</h1>
        <p className="text-gray-500 mt-2">Monitor recent email activity and delivery status.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-3">
          {[
            { subject: 'Welcome email', recipient: 'admin@school.com', status: 'Delivered' },
            { subject: 'Password reset', recipient: 'teacher@school.com', status: 'Failed' },
            { subject: 'Demo request', recipient: 'developer@shikkhaerp.com', status: 'Delivered' },
          ].map((log) => (
            <div key={log.subject} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-800">{log.subject}</p>
                <p className="text-sm text-gray-500">To: {log.recipient}</p>
              </div>
              <span className="text-sm font-medium text-gray-600">{log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperEmailLogsPage;
