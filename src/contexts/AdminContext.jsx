import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      try {
        // Check admin status by trying to access admin dashboard
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setIsAdmin(true);
          setAdminData(response.data.data);
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      } catch (error) {
        if (error.response?.status === 403) {
          // User is not admin
          setIsAdmin(false);
          setAdminData(null);
        } else {
          console.error('❌ Error checking admin status:', error);
          setIsAdmin(false);
          setAdminData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Refresh admin data
  const refreshAdminData = async () => {
    if (!isAdmin) return;

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
  };

  const value = {
    isAdmin,
    adminData,
    loading,
    refreshAdminData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 