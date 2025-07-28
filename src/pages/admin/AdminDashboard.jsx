import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Tag, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle
} from 'lucide-react';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import CategoryForm from './CategoryForm';
import OrderDetail from './OrderDetail';
import InventoryAlerts from './InventoryAlerts';

// FIXED: Remove unnecessary memoization since InventoryAlerts is already optimized
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Produits</p>
                {/* FIXED: Handle the correct data structure from API */}
                <p className="text-2xl font-bold text-gray-900">{adminData.statistics?.totalProducts || 0}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Commandes</p>
                {/* FIXED: Handle the correct data structure from API */}
                <p className="text-2xl font-bold text-gray-900">{adminData.statistics?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Utilisateurs</p>
                {/* FIXED: Handle the correct data structure from API */}
                <p className="text-2xl font-bold text-gray-900">{adminData.statistics?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Chiffre d'Affaires</p>
                {/* FIXED: Handle the correct data structure from API */}
                <p className="text-2xl font-bold text-gray-900">€{adminData.statistics?.totalRevenue || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      )}
    </div>
  ), [adminData]);

  const renderProducts = useCallback(() => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Produits</h2>
        <button 
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
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
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* FIXED: Add more stable image handling to prevent vibration */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden mr-3 flex-shrink-0 bg-gray-100">
                          <img 
                            src={product.imageUrl || '/placeholder.png'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            width="40"
                            height="40"
                            loading="lazy"
                            onLoad={(e) => {
                              e.target.style.opacity = '1';
                            }}
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                              e.target.style.opacity = '1';
                            }}
                            style={{ opacity: 0, transition: 'opacity 0.2s ease-in-out' }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description?.slice(0, 50)}...</div>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockQuantity} unité(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                      width="32"
                      height="32"
                      loading="lazy"
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.2s ease-in-out' }}
                    />
                  </div>
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
  ), [orders, loading, orderFilters, handleFilterChange, handleFilterSubmit, clearFilters, handleViewOrder]);

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

  // FIXED: Memoize tab configuration to prevent recreation
  const tabConfig = useMemo(() => [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
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
      </div>
    </div>
  );
};

export default AdminDashboard; 