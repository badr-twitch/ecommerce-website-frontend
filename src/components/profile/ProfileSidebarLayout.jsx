import React from 'react';
import { Crown } from 'lucide-react';

const ProfileSidebarLayout = ({ activeTab, onTabChange, tabs, user, membershipStatus, children }) => {
  const initials = (user?.displayName || user?.fullName || user?.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const membershipLabel = {
    active: 'UMOD Prime',
    cancelled: 'Prime (annule)',
    expired: 'Prime (expire)',
    pending: 'Prime (en attente)',
    none: null,
  };

  const membershipBadge = membershipLabel[membershipStatus] || null;

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="lg:flex lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* User card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-soft p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  {user?.photoURL || user?.profilePhoto ? (
                    <img
                      src={user.photoURL || user.profilePhoto}
                      alt={user.displayName || 'Avatar'}
                      className="w-20 h-20 rounded-2xl object-cover shadow-medium border-2 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-medium">
                      <span className="text-2xl font-bold text-white">{initials}</span>
                    </div>
                  )}
                  <h3 className="mt-3 text-lg font-bold text-gray-900 truncate max-w-full">
                    {user?.displayName || user?.fullName || 'Utilisateur'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate max-w-full">
                    {user?.email || ''}
                  </p>
                  {membershipBadge && (
                    <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 border border-amber-200/50">
                      <Crown className="w-3.5 h-3.5" />
                      {membershipBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-soft p-3">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
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
          </aside>

          {/* Mobile horizontal tabs */}
          <div className="lg:hidden mb-6">
            {/* Mobile user header */}
            <div className="flex items-center gap-3 mb-4">
              {user?.photoURL || user?.profilePhoto ? (
                <img
                  src={user.photoURL || user.profilePhoto}
                  alt={user.displayName || 'Avatar'}
                  className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {user?.displayName || user?.fullName || 'Utilisateur'}
                </h3>
              </div>
            </div>
            {/* Horizontal scrollable tabs */}
            <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 border-b border-gray-200/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebarLayout;
