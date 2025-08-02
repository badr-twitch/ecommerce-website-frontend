import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Package, 
  Tag, 
  ShoppingCart, 
  AlertTriangle, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  DollarSign,
  UserPlus,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAdmin } from '../../contexts/AdminContext';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import CategoryForm from './CategoryForm';
import OrderDetail from './OrderDetail';
import InventoryAlerts from './InventoryAlerts';
import AnalyticsDashboard from './AnalyticsDashboard';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// FIXED: Create a stable image component to prevent vibration
const StableImage = React.memo(({ src, alt, width = 40, height = 40, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div 
      className={`rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: `${width}px`,
        maxHeight: `${height}px`
      }}
    >
      <img 
        src={imageError ? '/placeholder.png' : (src || '/placeholder.png')} 
        alt={alt}
        className="w-full h-full object-cover"
        width={width}
        height={height}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden' // Prevent flickering
        }}
      />
    </div>
  );
});

StableImage.displayName = 'StableImage';

const AdminDashboard = () => {
  const { adminData, refreshAdminData } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  // FIXED: Add render counter for debugging
  const renderCount = useRef(0);
  renderCount.current += 1;

  // BULK ORDER OPERATIONS: Add new state for bulk operations
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAllOrders, setSelectAllOrders] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);
  const [bulkStatusForm, setBulkStatusForm] = useState({
    status: 'processing',
    comment: ''
  });
  const [bulkNotifyForm, setBulkNotifyForm] = useState({
    notificationType: 'status_update',
    customMessage: ''
  });

  // FIXED: Memoize the tab change handler to prevent unnecessary re-renders
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // FIXED: Memoize all the load functions to prevent recreation
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (orderFilters.status !== 'all') params.append('status', orderFilters.status);
      if (orderFilters.search) params.append('search', orderFilters.search);
      if (orderFilters.startDate) params.append('startDate', orderFilters.startDate);
      if (orderFilters.endDate) params.append('endDate', orderFilters.endDate);
      if (orderFilters.minAmount) params.append('minAmount', orderFilters.minAmount);
      if (orderFilters.maxAmount) params.append('maxAmount', orderFilters.maxAmount);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [orderFilters]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // FIXED: Handle the correct data structure from API
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Memoize all handler functions
  const deleteProduct = useCallback(async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Produit supprimé avec succès');
      loadProducts();
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  }, [loadProducts]);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Catégorie supprimée avec succès');
      loadCategories();
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
    }
  }, [loadCategories]);

  const toggleUserStatus = useCallback(async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/toggle-status`, {
        isActive: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(`Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      loadUsers();
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  }, [loadUsers]);

  const changeUserRole = useCallback(async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'client' ? 'admin' : 'client';
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/change-role`, {
        role: newRole
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(`Rôle changé en ${newRole === 'admin' ? 'administrateur' : 'client'}`);
      loadUsers();
    } catch (error) {
      console.error('❌ Error changing user role:', error);
      toast.error('Erreur lors du changement de rôle');
    }
  }, [loadUsers]);

  // FIXED: Memoize all UI handler functions
  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setShowProductForm(true);
  }, []);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  }, []);

  const handleViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  }, []);

  const handleProductSuccess = useCallback(() => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  }, [loadProducts]);

  const handleProductFormClose = useCallback(() => {
    setShowProductForm(false);
    setEditingProduct(null);
  }, []);

  const handleProductDetailClose = useCallback(() => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  }, []);

  const handleProductDetailEdit = useCallback((product) => {
    setShowProductDetail(false);
    setEditingProduct(product);
    setShowProductForm(true);
  }, []);

  const handleProductDetailDelete = useCallback((productId) => {
    setShowProductDetail(false);
    setSelectedProduct(null);
    deleteProduct(productId);
  }, [deleteProduct]);

  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  }, []);

  const handleEditCategory = useCallback((category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  }, []);

  const handleCategorySuccess = useCallback(() => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    loadCategories();
  }, [loadCategories]);

  const handleCategoryFormClose = useCallback(() => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  }, []);

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  }, []);

  const handleOrderDetailClose = useCallback(() => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  }, []);

  const handleOrderStatusUpdate = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFilterChange = useCallback((key, value) => {
    setOrderFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterSubmit = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const clearFilters = useCallback(() => {
    setOrderFilters({
      status: 'all',
      search: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Statut de commande mis à jour');
      loadOrders();
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  }, [loadOrders]);

  // BULK ORDER OPERATIONS: Add bulk operation functions
  const handleOrderSelection = useCallback((orderId, checked) => {
    setSelectedOrders(prev => {
      if (checked) {
        return [...prev, orderId];
      } else {
        return prev.filter(id => id !== orderId);
      }
    });
  }, []);

  const handleSelectAllOrders = useCallback((checked) => {
    setSelectAllOrders(checked);
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  }, [orders]);

  const handleBulkStatusUpdate = useCallback(async () => {
    if (selectedOrders.length === 0) {
      toast.error('Aucune commande sélectionnée');
      return;
    }

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/bulk/status`,
        {
          orderIds: selectedOrders,
          status: bulkStatusForm.status,
          comment: bulkStatusForm.comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message);
      setSelectedOrders([]);
      setSelectAllOrders(false);
      setShowBulkStatusModal(false);
      setBulkStatusForm({ status: 'processing', comment: '' });
      loadOrders();
    } catch (error) {
      console.error('❌ Error updating bulk order status:', error);
      toast.error('Erreur lors de la mise à jour en masse');
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedOrders, bulkStatusForm, loadOrders]);

  const handleBulkExport = useCallback(async () => {
    if (selectedOrders.length === 0) {
      toast.error('Aucune commande sélectionnée');
      return;
    }

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/bulk/export`,
        {
          orderIds: selectedOrders
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Create and download CSV file
      const csvData = response.data.data.csvData;
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(response.data.message);
    } catch (error) {
      console.error('❌ Error exporting orders:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedOrders]);

  const handleBulkNotify = useCallback(async () => {
    if (selectedOrders.length === 0) {
      toast.error('Aucune commande sélectionnée');
      return;
    }

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/bulk/notify`,
        {
          orderIds: selectedOrders,
          notificationType: bulkNotifyForm.notificationType,
          customMessage: bulkNotifyForm.customMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message);
      setSelectedOrders([]);
      setSelectAllOrders(false);
      setShowBulkNotifyModal(false);
      setBulkNotifyForm({ notificationType: 'status_update', customMessage: '' });
    } catch (error) {
      console.error('❌ Error sending bulk notifications:', error);
      toast.error('Erreur lors de l\'envoi des notifications');
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedOrders, bulkNotifyForm]);

  // FIXED: Load data based on active tab with proper memoization
  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'categories') {
      loadCategories();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadProducts, loadCategories, loadOrders, loadUsers]);

  // FIXED: Memoize all render functions to prevent recreation
  const renderDashboard = useCallback(() => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tableau de Bord</h2>
      
      {adminData ? (
        <>
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData.statistics?.totalProducts || 0}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData.statistics?.totalOrders || 0}</p>
                  <p className="text-xs text-gray-500">
                    {adminData.statistics?.orderGrowthRate > 0 ? '+' : ''}{adminData.statistics?.orderGrowthRate || 0}% ce mois
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData.statistics?.totalUsers || 0}</p>
                  <p className="text-xs text-gray-500">
                    {adminData.statistics?.conversionRate || 0}% conversion
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold text-gray-900">€{adminData.statistics?.totalRevenue || 0}</p>
                  <p className="text-xs text-gray-500">
                    €{adminData.statistics?.averageOrderValue || 0} panier moyen
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Évolution des Revenus</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={adminData.charts?.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`€${value}`, 'Revenus']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* User Registrations Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Inscriptions Utilisateurs</h3>
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={adminData.charts?.userRegistrations || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Inscriptions']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Répartition des Commandes</h3>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={adminData.charts?.orderStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {adminData.charts?.orderStatusDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, getStatusLabel(name)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Produits les Plus Vendus</h3>
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-4">
                {adminData.topProducts?.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.totalSold} vendus</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{parseFloat(product.totalRevenue || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">€{product.price} l'unité</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Commandes Récentes</h3>
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminData.recentOrders?.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">€{order.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      )}
    </div>
  ), [adminData]);

  // Helper functions for chart colors and labels
  const getStatusColor = useCallback((status) => {
    const colors = {
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444',
      'refunded': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      'pending': 'En attente',
      'processing': 'En cours',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'refunded': 'Remboursée'
    };
    return labels[status] || status;
  }, []);

  const getStatusBadgeColor = useCallback((status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const renderProducts = useCallback(() => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Produits</h2>
        <button 
          onClick={handleAddProduct}
          className="admin-button bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 admin-icon" />
          Ajouter un produit
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 admin-loading">Chargement...</div>
      ) : (
        <div className="admin-card bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="admin-hover-transition hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="admin-flex-container flex items-center">
                        {/* FIXED: Use StableImage component with admin CSS classes */}
                        <StableImage 
                          src={product.imageUrl} 
                          alt={product.name}
                          width={40}
                          height={40}
                          className="mr-3 admin-image-container"
                        />
                        <div>
                          <div className="admin-text text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="admin-text text-sm text-gray-500">{product.description?.slice(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || 'Non catégorisé'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`admin-badge px-2 py-1 rounded-full text-xs ${
                        product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockQuantity} unité(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="admin-flex-container flex space-x-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="admin-button p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4 admin-icon" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="admin-button p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 admin-icon" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="admin-button p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 admin-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  ), [products, loading, handleAddProduct, handleViewProduct, handleEditProduct, deleteProduct]);

  const renderCategories = useCallback(() => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Catégories</h2>
        <button 
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une catégorie
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(category.id)}
                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{category.description || 'Aucune description'}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {category.products?.length || 0} produit(s)
                </div>
                {category.imageUrl && (
                  /* FIXED: Add more stable image handling to prevent vibration */
                  <StableImage 
                    src={category.imageUrl} 
                    alt={category.name}
                    width={32}
                    height={32}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ), [categories, loading, handleAddCategory, handleEditCategory, deleteCategory]);

  const renderOrders = useCallback(() => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedOrders.length} commande(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkStatusModal(true)}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkActionLoading ? 'Mise à jour...' : 'Mettre à jour le statut'}
              </button>
              <button
                onClick={handleBulkExport}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
              >
                {bulkActionLoading ? 'Export...' : 'Exporter CSV'}
              </button>
              <button
                onClick={() => setShowBulkNotifyModal(true)}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {bulkActionLoading ? 'Envoi...' : 'Envoyer notifications'}
              </button>
              <button
                onClick={() => {
                  setSelectedOrders([]);
                  setSelectAllOrders(false);
                }}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={orderFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours de traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              <option value="refunded">Remboursée</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              type="text"
              value={orderFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nom, email du client..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant minimum</label>
            <input
              type="number"
              value={orderFilters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant maximum</label>
            <input
              type="number"
              value={orderFilters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={orderFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={orderFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleFilterSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Appliquer les filtres
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAllOrders}
                      onChange={(e) => handleSelectAllOrders(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.user?.firstName} {order.user?.lastName}</div>
                        <div className="text-gray-500">{order.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">€{order.totalAmount}</div>
                      <div className="text-gray-500">{order.orderItems?.length || 0} article(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'En attente' :
                         order.status === 'processing' ? 'En cours' :
                         order.status === 'shipped' ? 'Expédiée' :
                         order.status === 'delivered' ? 'Livrée' :
                         order.status === 'cancelled' ? 'Annulée' :
                         order.status === 'refunded' ? 'Remboursée' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  ), [orders, loading, orderFilters, selectedOrders, selectAllOrders, bulkActionLoading, handleFilterChange, handleFilterSubmit, clearFilters, handleViewOrder, handleOrderSelection, handleSelectAllOrders, handleBulkExport]);

  const renderUsers = useCallback(() => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* FIXED: Add null check and ensure users is an array */}
                {Array.isArray(users) && users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Client'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Role Toggle */}
                        <button 
                          onClick={() => changeUserRole(user.id, user.role)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.role === 'admin'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          {user.role === 'admin' ? 'Rendre Client' : 'Rendre Admin'}
                        </button>
                        
                        {/* Status Toggle */}
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.isActive 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  ), [users, loading, changeUserRole, toggleUserStatus]);

  const renderProductDetail = useCallback(() => (
    <ProductDetail 
      product={selectedProduct} 
      onClose={handleProductDetailClose} 
      onEdit={handleProductDetailEdit} 
      onDelete={handleProductDetailDelete} 
      onSuccess={handleProductSuccess}
    />
  ), [selectedProduct, handleProductDetailClose, handleProductDetailEdit, handleProductDetailDelete, handleProductSuccess]);

  const renderProductForm = useCallback(() => (
    <ProductForm 
      product={editingProduct} 
      categories={categories} 
      onClose={handleProductFormClose} 
      onSuccess={handleProductSuccess} 
    />
  ), [editingProduct, categories, handleProductFormClose, handleProductSuccess]);

  const renderCategoryForm = useCallback(() => (
    <CategoryForm 
      category={editingCategory} 
      onClose={handleCategoryFormClose} 
      onSuccess={handleCategorySuccess} 
    />
  ), [editingCategory, handleCategoryFormClose, handleCategorySuccess]);

  const renderOrderDetail = useCallback(() => (
    <OrderDetail 
      order={selectedOrder} 
      onClose={handleOrderDetailClose} 
      onStatusUpdate={updateOrderStatus}
    />
  ), [selectedOrder, handleOrderDetailClose, updateOrderStatus]);

  const renderBulkStatusModal = useCallback(() => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Mettre à jour le statut des commandes</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={bulkStatusForm.status}
              onChange={(e) => setBulkStatusForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">En attente</option>
              <option value="processing">En cours de traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              <option value="refunded">Remboursée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
            <textarea
              value={bulkStatusForm.comment}
              onChange={(e) => setBulkStatusForm(prev => ({ ...prev, comment: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowBulkStatusModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {bulkActionLoading ? 'Mise à jour...' : 'Mettre à jour le statut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [bulkStatusForm, handleBulkStatusUpdate, bulkActionLoading]);

  const renderBulkNotifyModal = useCallback(() => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Envoyer des notifications aux commandes</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de notification</label>
            <select
              value={bulkNotifyForm.notificationType}
              onChange={(e) => setBulkNotifyForm(prev => ({ ...prev, notificationType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="status_update">Mise à jour du statut</option>
              <option value="shipping_update">Mise à jour de l'expédition</option>
              <option value="custom">Message personnalisé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message personnalisé (optionnel)</label>
            <textarea
              value={bulkNotifyForm.customMessage}
              onChange={(e) => setBulkNotifyForm(prev => ({ ...prev, customMessage: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowBulkNotifyModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleBulkNotify}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {bulkActionLoading ? 'Envoi...' : 'Envoyer les notifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [bulkNotifyForm, handleBulkNotify, bulkActionLoading]);

  // FIXED: Memoize tab configuration to prevent recreation
  const tabConfig = useMemo(() => [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventaire', icon: AlertTriangle },
    { id: 'users', label: 'Utilisateurs', icon: Users }
  ], []);

  // FIXED: Memoize the content rendering to prevent conditional rendering issues
  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'products':
        return renderProducts();
      case 'categories':
        return renderCategories();
      case 'orders':
        return renderOrders();
      case 'inventory':
        return <InventoryAlerts />;
      case 'users':
        return renderUsers();
      default:
        return renderDashboard();
    }
  }, [activeTab, renderDashboard, renderProducts, renderCategories, renderOrders, renderUsers]);

  // FIXED: Add debugging log
  console.log(`🔄 AdminDashboard rendered ${renderCount.current} times, activeTab: ${activeTab}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600">Gérez votre boutique en ligne</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* FIXED: Content - Use stable rendering instead of conditional */}
        <div>
          {renderContent()}
        </div>

        {/* Modals */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onClose={handleProductFormClose}
            onSuccess={handleProductSuccess}
          />
        )}

        {showProductDetail && (
          <ProductDetail
            product={selectedProduct}
            onClose={handleProductDetailClose}
            onEdit={handleProductDetailEdit}
            onDelete={handleProductDetailDelete}
          />
        )}

        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onClose={handleCategoryFormClose}
            onSuccess={handleCategorySuccess}
          />
        )}

        {showOrderDetail && (
          <OrderDetail
            order={selectedOrder}
            onClose={handleOrderDetailClose}
            onStatusUpdate={handleOrderStatusUpdate}
          />
        )}

        {/* Bulk Operation Modals */}
        {showBulkStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Mettre à jour le statut des commandes</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={bulkStatusForm.status}
                    onChange={(e) => setBulkStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="processing">En cours de traitement</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="refunded">Remboursée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
                  <textarea
                    value={bulkStatusForm.comment}
                    onChange={(e) => setBulkStatusForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowBulkStatusModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBulkStatusUpdate}
                    disabled={bulkActionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {bulkActionLoading ? 'Mise à jour...' : 'Mettre à jour le statut'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showBulkNotifyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Envoyer des notifications aux commandes</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de notification</label>
                  <select
                    value={bulkNotifyForm.notificationType}
                    onChange={(e) => setBulkNotifyForm(prev => ({ ...prev, notificationType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="status_update">Mise à jour du statut</option>
                    <option value="shipping_update">Mise à jour de l'expédition</option>
                    <option value="custom">Message personnalisé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message personnalisé (optionnel)</label>
                  <textarea
                    value={bulkNotifyForm.customMessage}
                    onChange={(e) => setBulkNotifyForm(prev => ({ ...prev, customMessage: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowBulkNotifyModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBulkNotify}
                    disabled={bulkActionLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {bulkActionLoading ? 'Envoi...' : 'Envoyer les notifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;