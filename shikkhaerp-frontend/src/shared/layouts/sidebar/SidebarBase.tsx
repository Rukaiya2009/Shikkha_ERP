// src/shared/layouts/sidebar/SidebarBase.tsx
import React from 'react';

interface SidebarBaseProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarBase: React.FC<SidebarBaseProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1E3A8A] text-white z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block
          flex flex-col
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#81D5FF] rounded-lg flex items-center justify-center">
            <span className="text-[#1E3A8A] font-bold text-sm">SE</span>
          </div>
          <span className="text-lg font-bold">ShikkhaERP</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">{children}</nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-white/50 text-center">
          <p>ShikkhaERP v1.0</p>
        </div>
      </aside>
    </>
  );
};