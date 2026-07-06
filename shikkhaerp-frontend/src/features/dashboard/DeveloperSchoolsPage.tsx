import React from 'react';

const DeveloperSchoolsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🏫 All Schools</h1>
        <p className="text-gray-500 mt-2">Browse and manage all schools registered in the platform.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: 'ABC School', admin: 'Rahim Uddin', status: 'Active' },
            { name: 'Dhaka Model School', admin: 'Nadia Akter', status: 'Active' },
            { name: 'Green Valley College', admin: 'Sajid Hasan', status: 'Pending' },
          ].map((school) => (
            <div key={school.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{school.name}</h3>
                <span className="text-sm text-gray-500">{school.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Admin: {school.admin}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperSchoolsPage;
