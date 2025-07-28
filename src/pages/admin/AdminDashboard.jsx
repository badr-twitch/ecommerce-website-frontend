import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import CategoryForm from './CategoryForm';

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

  // Load data based on active tab
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
  }, [activeTab]);

  const loadProducts = async () => {
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
  };

  const loadCategories = async () => {
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
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

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
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

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
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/status`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(`Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      loadUsers();
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      toast.error('Erreur lors de la modification du statut utilisateur');
    }
  };

  const changeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const confirmMessage = currentRole === 'admin' 
      ? 'Êtes-vous sûr de vouloir retirer les droits d\'administrateur de cet utilisateur ?'
      : 'Êtes-vous sûr de vouloir donner les droits d\'administrateur à cet utilisateur ?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/role`, 
        { role: newRole }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success(`Rôle utilisateur changé de ${currentRole} à ${newRole} avec succès`);
      loadUsers();
    } catch (error) {
      console.error('❌ Error changing user role:', error);
      toast.error('Erreur lors du changement de rôle utilisateur');
    }
  };

  // Product management functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    console.log('🔍 Edit button clicked for product:', product);
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleProductSuccess = () => {
    loadProducts();
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleProductDetailClose = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const handleProductDetailEdit = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const handleProductDetailDelete = (productId) => {
    deleteProduct(productId);
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  // Category management functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategorySuccess = () => {
    loadCategories();
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCategoryFormClose = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/${orderId}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Statut de commande mis à jour avec succès');
      loadOrders();
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Utilisateurs</p>
              <p className="text-3xl font-bold">{adminData?.statistics?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Produits</p>
              <p className="text-3xl font-bold">{adminData?.statistics?.totalProducts || 0}</p>
            </div>
            <Package className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Commandes</p>
              <p className="text-3xl font-bold">{adminData?.statistics?.totalOrders || 0}</p>
            </div>
            <ShoppingCart className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Catégories</p>
              <p className="text-3xl font-bold">{adminData?.statistics?.totalCategories || 0}</p>
            </div>
            <Tag className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Commandes Récentes</h3>
        <div className="space-y-4">
          {adminData?.recentOrders?.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">#{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600">
                  {order.user?.firstName} {order.user?.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">€{order.totalAmount}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
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
                        <img 
                          src={product.imageUrl || '/placeholder.png'} 
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
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
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} unité(s)
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
  );

  const renderCategories = () => (
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
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestion des Commandes</h2>

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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">En attente</option>
                        <option value="processing">En cours</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
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
  );

  const renderUsers = () => (
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
                {users.map((user) => (
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
  );

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
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'products', label: 'Produits', icon: Package },
              { id: 'categories', label: 'Catégories', icon: Tag },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart },
              { id: 'users', label: 'Utilisateurs', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'users' && renderUsers()}
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
      </div>
    </div>
  );
};

export default AdminDashboard; 