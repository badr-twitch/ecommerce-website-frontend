import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationPreferencesPage = () => {
  const { preferences, updatePreferences } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const from = location.state?.from || '/admin';
    navigate(from);
  };

  const notificationTypes = {
    order_new: 'Nouvelles commandes',
    order_status_change: 'Changements de statut',
    order_high_value: 'Commandes haute valeur',
    inventory_low_stock: 'Stock faible',
    inventory_out_of_stock: 'Rupture de stock',
    inventory_restored: 'Stock restauré',
    user_registration: 'Nouveaux utilisateurs',
    system_error: 'Erreurs système'
  };

  const handleToggle = (type, setting) => {
    const newPreferences = { ...preferences };
    
    if (!newPreferences[type]) {
      newPreferences[type] = {
        enabled: true,
        toastEnabled: true,
        soundEnabled: true,
        emailEnabled: false
      };
    }
    
    newPreferences[type][setting] = !newPreferences[type][setting];
    updatePreferences(newPreferences);
  };

  // Handle global sounds toggle
  const handleGlobalSoundsToggle = () => {
    const newPreferences = { ...preferences };
    
    // Toggle global sounds setting
    newPreferences.globalSounds = !newPreferences.globalSounds;
    
    updatePreferences(newPreferences);
  };

  // Helper function to get the actual boolean value
  const getPreferenceValue = (type, setting) => {
    if (!preferences[type]) {
      // Default values when preference doesn't exist
      const defaults = {
        enabled: true,
        toastEnabled: true,
        soundEnabled: true,
        emailEnabled: false
      };
      return defaults[setting];
    }
    return preferences[type][setting] !== false; // Convert to boolean
  };

  // Get global sounds value
  const getGlobalSoundsValue = () => {
    // If the preference doesn't exist, default to true
    if (preferences.globalSounds === undefined) {
      return true;
    }
    // If it exists, return the actual boolean value
    return preferences.globalSounds === true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres de notification</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Global Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres globaux</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={getGlobalSoundsValue()}
                  onChange={handleGlobalSoundsToggle}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Sons globaux</span>
              </label>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Types de notifications</h2>
            
            {Object.entries(notificationTypes).map(([type, label]) => {
              const isEnabled = getPreferenceValue(type, 'enabled');
              const toastEnabled = getPreferenceValue(type, 'toastEnabled');
              const soundEnabled = getPreferenceValue(type, 'soundEnabled');
              
              return (
                <div key={type} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{label}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggle(type, 'enabled')}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    </label>
                  </div>
                  
                  {isEnabled && (
                    <div className="space-y-4 pl-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={toastEnabled}
                          onChange={() => handleToggle(type, 'toastEnabled')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Notifications toast</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={soundEnabled}
                          onChange={() => handleToggle(type, 'soundEnabled')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Sons</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage; 