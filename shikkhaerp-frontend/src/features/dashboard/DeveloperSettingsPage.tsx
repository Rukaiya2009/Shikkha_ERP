import React from 'react';

const DeveloperSettingsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Developer Settings</h1>
        <p className="text-gray-500 mt-2">Configure developer-level preferences and system utilities.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800">Environment</h3>
            <p className="text-sm text-gray-500 mt-1">Production configuration is active.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">Email and system alerts are enabled.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSettingsPage;
