import React from 'react';

export const AppFooter: React.FC = () => (
  <footer className="border-t border-line bg-white px-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slatesoft">
      <p>
        &copy; {new Date().getFullYear()} ShikkhaERP — built by{' '}
        <span className="font-semibold text-ink">ITDataScience Ltd.</span>
      </p>
      <p className="font-mono text-[11px]">Smart School. Smarter Management.</p>
    </div>
  </footer>
);
