import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { OrderCard } from '../components/orders';
import { useOrders } from '../hooks/useOrders';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';

const OrdersPage = () => {
  console.log('🔍 OrdersPage component starting...');
  
  const { user } = useContext(AuthContext);
  console.log('🔍 OrdersPage - user:', user);
  
  // All hooks must be declared at the top, before any early returns
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Use the custom hook with error handling
  let ordersData = { orders: [], loading: false, error: '', pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }, filters: {}, updateFilters: () => {}, clearFilters: () => {}, handlePageChange: () => {}, refreshOrders: () => {} };
  
  try {
    ordersData = useOrders({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  } catch (hookError) {
    console.error('❌ Error in useOrders hook:', hookError);
    ordersData.error = 'Erreur lors du chargement des données';
  }
  
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    handlePageChange,
    refreshOrders
  } = ordersData;

  // Show loading state while authentication is being checked
  if (loading && !orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
          <p className="mt-2 text-gray-500">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's a hook error
  if (ordersData.error && ordersData.error !== '') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-red-500">{ordersData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    updateFilters({ sortBy: field, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };



  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Connexion requise</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connectez-vous pour voir vos commandes.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
          <p className="mt-2 text-gray-600">
            Suivez l'état de vos commandes et consultez votre historique d'achats
          </p>
        </div>

        {/* Order Statistics */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total commandes</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.totalItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Livrées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(order => order.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">En cours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(order => ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Dépensé total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'MAD'
                    }).format(orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de commande..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  updateFilters({ sortBy: field, sortOrder: order });
                }}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt-desc">Plus récent</option>
                <option value="createdAt-asc">Plus ancien</option>
                <option value="totalAmount-desc">Montant décroissant</option>
                <option value="totalAmount-asc">Montant croissant</option>
                <option value="status-asc">Statut A-Z</option>
                <option value="status-desc">Statut Z-A</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button
              onClick={refreshOrders}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="processing">En traitement</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="refunded">Remboursée</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Effacer les filtres
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
            <p className="mt-2 text-gray-500">Chargement des commandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-center">
              <Package className="mx-auto h-8 w-8 text-red-400" />
              <p className="mt-2 text-red-500">{error}</p>
              <button
                onClick={refreshOrders}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous n'avez pas encore passé de commande.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Découvrir nos produits
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onToggleDetails={(orderId, isExpanded) => setExpandedOrder(isExpanded ? orderId : null)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    page === pagination.currentPage
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 