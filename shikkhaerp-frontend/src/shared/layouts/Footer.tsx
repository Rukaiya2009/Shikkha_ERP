import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line bg-white px-6 py-4 text-center text-sm text-slatesoft">
      <p>
        &copy; {new Date().getFullYear()} ShikkhaERP — Smart School. Smarter Management.
      </p>
    </footer>
  );
};
