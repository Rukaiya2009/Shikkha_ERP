// src/shared/layouts/SidebarBase.tsx
import React from 'react';

interface SidebarBaseProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarBase: React.FC<SidebarBaseProps> = ({ children, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col text-white md:sticky md:block
          bg-gradient-to-b from-brand to-brand-deep
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-sky">
            <span className="font-display text-sm font-extrabold text-brand">SE</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-extrabold tracking-tight">ShikkhaERP</div>
            <div className="text-[11px] text-white/50">School Management</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">{children}</nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 text-center text-[11px] text-white/45">
          <p>ShikkhaERP v1.0</p>
        </div>
      </aside>
    </>
  );
};
