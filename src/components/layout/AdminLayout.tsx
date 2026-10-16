import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useFleetStore } from '../../stores/fleetStore';

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { initRealtimeListeners } = useFleetStore();

  useEffect(() => {
    const unsubscribe = initRealtimeListeners();
    return () => {
      unsubscribe();
    };
  }, [initRealtimeListeners]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* Full-Bleed Main Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
          <div className="w-full space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
