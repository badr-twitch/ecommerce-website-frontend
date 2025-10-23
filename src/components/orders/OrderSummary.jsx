import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const OrderSummary = ({ orders = [], className = '' }) => {
  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      confirmed: { 
        label: 'Confirmée', 
        color: 'bg-blue-100 text-blue-800', 
        icon: CheckCircle 
      },
      processing: { 
        label: 'En traitement', 
        color: 'bg-purple-100 text-purple-800', 
        icon: Package 
      },
      shipped: { 
        label: 'Expédiée', 
        color: 'bg-indigo-100 text-indigo-800', 
        icon: Truck 
      },
      delivered: { 
        label: 'Livrée', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'Annulée', 
        color: 'bg-red-100 text-red-800', 
        icon: AlertCircle 
      },
      refunded: { 
        label: 'Remboursée', 
        color: 'bg-gray-100 text-gray-800', 
        icon: AlertCircle 
      }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  if (orders.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas encore passé de commande.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const recentOrders = getRecentOrders();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Résumé des commandes</h2>
        <Link
          to="/orders"
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Voir toutes
        </Link>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {getStatusCount('pending')}
              </p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {getStatusCount('shipped')}
              </p>
              <p className="text-xs text-gray-500">Expédiées</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {getStatusCount('delivered')}
              </p>
              <p className="text-xs text-gray-500">Livrées</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {getStatusCount('processing')}
              </p>
              <p className="text-xs text-gray-500">En traitement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Commandes récentes</h3>
        <div className="space-y-3">
          {recentOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-2">
          <Link
            to="/orders"
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
          >
            <span>Gérer mes commandes</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link
            to="/products"
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
          >
            <span>Nouvelle commande</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
