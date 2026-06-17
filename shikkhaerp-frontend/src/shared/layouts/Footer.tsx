import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
      <p>
        &copy; {new Date().getFullYear()} ShikkhaERP – Smart School. Smarter Management.
      </p>
    </footer>
  );
};