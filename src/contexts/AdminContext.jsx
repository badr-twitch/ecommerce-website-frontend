import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // FIXED: Use refs instead of state for values that shouldn't trigger re-renders
  const lastCheckRef = useRef(null);
  const isAdminRef = useRef(false);

  // FIXED: Stable function that doesn't depend on changing values
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminData(null);
      setLoading(false);
      return;
    }

    // FIXED: Use ref instead of state to prevent re-renders
    const now = Date.now();
    if (lastCheckRef.current && (now - lastCheckRef.current) < 30000) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsAdmin(true);
        isAdminRef.current = true;
        setAdminData(response.data.data);
      } else {
        setIsAdmin(false);
        isAdminRef.current = false;
        setAdminData(null);
      }
      lastCheckRef.current = now;
    } catch (error) {
      if (error.response?.status === 403) {
        setIsAdmin(false);
        isAdminRef.current = false;
        setAdminData(null);
      } else {
        console.error('❌ Error checking admin status:', error);
        setIsAdmin(false);
        isAdminRef.current = false;
        setAdminData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]); // FIXED: Only depend on user, not lastCheck

  // FIXED: Stable refresh function that doesn't depend on isAdmin state
  const refreshAdminData = useCallback(async () => {
    // FIXED: Use ref instead of state to prevent dependency changes
    if (!isAdminRef.current) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setAdminData(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error refreshing admin data:', error);
      toast.error('Erreur lors du rafraîchissement des données');
    }
  }, []); // FIXED: No dependencies - uses ref instead

  // FIXED: Stable effect with minimal dependencies
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // FIXED: Memoize context value with stable dependencies
  const value = useMemo(() => ({
    isAdmin,
    adminData,
    loading,
    refreshAdminData
  }), [isAdmin, adminData, loading, refreshAdminData]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 