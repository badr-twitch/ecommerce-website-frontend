import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || socketRef.current) return;

    try {
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);

        // Join admin room if user is admin
        if (user?.role === 'admin') {
          socketRef.current.emit('join-admin');
        }

        // Join user room
        if (user?.uid) {
          socketRef.current.emit('join-user', user.uid);
        }
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });

      // Handle incoming notifications
      socketRef.current.on('notification', (notification) => {
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);

        // Show toast notification if enabled
        if (preferences[notification.type]?.toastEnabled !== false) {
          const toastOptions = {
            duration: notification.priority === 'critical' ? 8000 : 4000,
            position: 'top-right',
            style: {
              background: getPriorityColor(notification.priority),
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              maxWidth: '400px'
            }
          };

          toast(notification.message, toastOptions);
        }
      });

      // Handle sound notifications
      socketRef.current.on('notification-sound', ({ sound }) => {
        playNotificationSound(sound);
      });

    } catch (error) {
      console.error('❌ Error initializing socket:', error);
    }
  }, [isAuthenticated, user]);

  // Get priority color for notifications
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#dc2626'; // Red
      case 'high':
        return '#ea580c'; // Orange
      case 'medium':
        return '#2563eb'; // Blue
      case 'low':
        return '#059669'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  // Play notification sound
  const playNotificationSound = useCallback((soundType) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Create different sounds based on type
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      let frequency, duration;
      switch (soundType) {
        case 'critical-alert':
          frequency = 800;
          duration = 0.3;
          break;
        case 'high-alert':
          frequency = 600;
          duration = 0.2;
          break;
        case 'medium-alert':
          frequency = 400;
          duration = 0.15;
          break;
        case 'low-alert':
          frequency = 300;
          duration = 0.1;
          break;
        default:
          frequency = 400;
          duration = 0.15;
      }

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error('❌ Error playing notification sound:', error);
    }
  }, []);

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications', {
        params: { limit: 50 }
      });

      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  }, [isAuthenticated]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/unread-count');
      
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  }, [isAuthenticated]);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/preferences');
      
      if (response.data.success) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error loading notification preferences:', error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const response = await api.put('/notifications/preferences', {
        preferences: newPreferences
      });
      
      if (response.data.success) {
        setPreferences(newPreferences);
        toast.success('Préférences de notification mises à jour');
      } else {
        console.error('🔄 API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  }, []);

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user, initializeSocket]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadUnreadCount();
      loadPreferences();
    }
  }, [isAuthenticated, loadNotifications, loadUnreadCount, loadPreferences]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const value = {
    notifications,
    unreadCount,
    preferences,
    isConnected,
    showNotificationCenter,
    setShowNotificationCenter,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    loadNotifications,
    loadUnreadCount,
    loadPreferences,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 