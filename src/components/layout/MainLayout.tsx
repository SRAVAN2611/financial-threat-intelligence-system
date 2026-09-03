import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { ToastContainer } from '../common/ToastContainer';

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased main-layout-container">
      <ToastContainer />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Navbar
          collapsed={collapsed}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
