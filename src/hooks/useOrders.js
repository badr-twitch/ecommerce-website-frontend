import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useOrders = (initialFilters = {}) => {
  const { user, isLoading: authLoading } = useContext(AuthContext);                              
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent immediate loading
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    console.log('🔍 useOrders useEffect - user:', user, 'authLoading:', authLoading);
    console.log('🔍 User object keys:', user ? Object.keys(user) : 'No user');
    console.log('🔍 User ID values:', user ? { uid: user.uid, firebaseUid: user.firebaseUid, id: user.id } : 'No user');
    
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    console.log('🔍 Token exists:', !!token);
    
    // Wait for authentication to complete
    if (authLoading) {
      console.log('⏳ Authentication still loading...');
      return;
    }
    
    if (user && token && (user.uid || user.firebaseUid || user.id)) {
      console.log('✅ User authenticated and token exists, fetching orders...');
      fetchOrders();
    } else {
      console.log('❌ User not authenticated, missing UID, or no token');
      setLoading(false);
      setOrders([]);
      setError('');
    }
  }, [user, authLoading, filters, pagination.currentPage, pagination.itemsPerPage]);

  const fetchOrders = async () => {
    // Double-check user authentication and token
    const token = localStorage.getItem('token');
    if (!user || (!user.uid && !user.firebaseUid && !user.id) || !token) {
      setError('Utilisateur non authentifié ou token manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('🔍 Making orders API call with params:', params);
      console.log('🔍 Token being sent:', localStorage.getItem('token') ? 'Token exists' : 'No token');
      
             // Test the token format
       const currentToken = localStorage.getItem('token');
       if (currentToken) {
         console.log('🔍 Token format check - Length:', currentToken.length);
         console.log('🔍 Token format check - Starts with:', currentToken.substring(0, 20) + '...');
         console.log('🔍 Token format check - Contains dots:', currentToken.includes('.'));
       }
      
      const response = await ordersAPI.getAll(params);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError(response.data.error || 'Erreur lors de la récupération des commandes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        // Don't show toast for auth errors to prevent spam
      } else if (error.response?.status === 403) {
        setError('Accès refusé. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors de la récupération des commandes');
        toast.error('Erreur lors de la récupération des commandes');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ordersAPI.getById(orderId);
      
      if (response.data.success) {
        return response.data.order;
      } else {
        setError(response.data.error || 'Erreur lors de la récupération de la commande');
        return null;
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Erreur lors de la récupération de la commande');
      toast.error('Erreur lors de la récupération de la commande');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await ordersAPI.cancel(orderId);
      
      if (response.data.success) {
        // Update the order in the list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
        
        toast.success('Commande annulée avec succès');
        return true;
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'annulation');
        return false;
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erreur lors de l\'annulation de la commande');
      return false;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  // Helper functions for order statistics
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const getOrderCountByStatus = (status) => {
    return getOrdersByStatus(status).length;
  };

  const getTotalSpent = () => {
    return orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + parseFloat(order.totalAmount), 0);
  };

  const getAverageOrderValue = () => {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    if (deliveredOrders.length === 0) return 0;
    
    const total = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    return total / deliveredOrders.length;
  };

  const getRecentOrders = (limit = 5) => {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  return {
    // State
    orders,
    loading: loading || authLoading, // Include auth loading state
    error,
    pagination,
    filters,
    
    // Actions
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    updateFilters,
    clearFilters,
    handlePageChange,
    refreshOrders,
    
    // Helpers
    getOrdersByStatus,
    getOrderCountByStatus,
    getTotalSpent,
    getAverageOrderValue,
    getRecentOrders
  };
};
