import React from 'react';

const DeveloperApprovalsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📋 Developer Approvals</h1>
        <p className="text-gray-500 mt-2">Review pending school demo requests and approval workflows.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Pending Requests</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">4 pending</span>
        </div>

        <div className="space-y-3">
          {[
            { name: 'ABC School', submitted: '2 hours ago', status: 'New' },
            { name: 'Dhaka Model School', submitted: '5 hours ago', status: 'Review' },
            { name: 'Green Valley College', submitted: 'Yesterday', status: 'Pending' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">Submitted {item.submitted}</p>
              </div>
              <span className="text-sm font-medium text-gray-600">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperApprovalsPage;
