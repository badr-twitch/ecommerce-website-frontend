import React, { useState, useCallback } from 'react';
import { Menu, X, Shield, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const AdminSidebarLayout = ({ activeTab, onTabChange, tabs, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleTabClick = useCallback((tabId) => {
    onTabChange(tabId);
    setSidebarOpen(false);
  }, [onTabChange]);

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';
  const contentPadding = collapsed ? 'lg:pl-[72px]' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-mesh">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Administration</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            {tabs.find(t => t.id === activeTab)?.label}
          </span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl animate-slide-in-left flex flex-col">
            {/* Mobile sidebar header */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Admin</h2>
                    <p className="text-primary-200 text-xs">Gestion boutique</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Mobile nav items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`sidebar-nav-item w-full ${isActive ? 'sidebar-nav-active' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col ${sidebarWidth} bg-white/80 backdrop-blur-xl border-r border-gray-200/50 z-20 transition-all duration-300`}>
        {/* Desktop sidebar header */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-900 p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-white font-bold text-lg truncate">Administration</h2>
                <p className="text-primary-200 text-xs">Gestion boutique</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={collapsed ? tab.label : undefined}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle + footer */}
        <div className="p-2 border-t border-gray-200/50 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            title={collapsed ? 'Agrandir le menu' : 'Reduire le menu'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <PanelLeftClose className="w-4 h-4" />
                <span>Reduire</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`${contentPadding} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminSidebarLayout;
