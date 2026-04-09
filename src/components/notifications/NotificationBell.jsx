import React, { useCallback, useMemo } from 'react';
import { Bell, Settings, Check, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    hasMore,
    showNotificationCenter,
    setShowNotificationCenter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications
  } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const handleBellClick = useCallback(() => {
    setShowNotificationCenter(!showNotificationCenter);
  }, [showNotificationCenter, setShowNotificationCenter]);

  const handleMarkAsRead = useCallback(async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  }, [markAsRead]);

  const handleDelete = useCallback(async (notificationId, e) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleOpenPreferences = useCallback(() => {
    navigate('/notification-preferences', { state: { from: location.pathname } });
  }, [navigate, location.pathname]);

  // Click-to-navigate based on notification type
  const handleNotificationClick = useCallback((notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    setShowNotificationCenter(false);

    const data = notification.data || {};
    switch (notification.type) {
      case 'order_new':
      case 'order_status_change':
      case 'order_high_value':
        if (data.orderId) navigate(`/admin/orders/${data.orderId}`);
        break;
      case 'inventory_low_stock':
      case 'inventory_out_of_stock':
      case 'inventory_restored':
        navigate('/admin');
        break;
      case 'membership':
        navigate('/membership');
        break;
      case 'user_registration':
        navigate('/admin');
        break;
      default:
        break;
    }
  }, [markAsRead, navigate, setShowNotificationCenter]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_new': return '\u{1F195}';
      case 'order_status_change': return '\u{1F4E6}';
      case 'order_high_value': return '\u{1F4B0}';
      case 'inventory_low_stock': return '\u{26A0}\u{FE0F}';
      case 'inventory_out_of_stock': return '\u{1F6A8}';
      case 'inventory_restored': return '\u{2705}';
      case 'user_registration': return '\u{1F389}';
      case 'system_error': return '\u{1F527}';
      case 'membership': return '\u{1F451}';
      default: return '\u{1F514}';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      let label;
      if (isToday(date)) {
        label = "Aujourd'hui";
      } else if (isYesterday(date)) {
        label = 'Hier';
      } else if (isThisWeek(date)) {
        label = 'Cette semaine';
      } else {
        label = 'Plus ancien';
      }

      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, notifications: [] };
        groups.push(currentGroup);
      }
      currentGroup.notifications.push(notification);
    });

    return groups;
  }, [notifications]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </button>

      {/* Notification Center */}
      {showNotificationCenter && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-[480px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenPreferences}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Paramètres"
              >
                <Settings className="w-4 h-4" />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div>
                {groupedNotifications.map((group) => (
                  <div key={group.label}>
                    {/* Date Group Header */}
                    <div className="sticky top-0 px-4 py-2 bg-gray-100 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">{group.label}</p>
                    </div>

                    {group.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: fr
                                  })}
                                </p>
                              </div>
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${getPriorityColor(notification.priority)}`} />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-1 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer — Load More */}
          {hasMore && notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={loadMoreNotifications}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Charger plus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
