import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Eye, Package, Truck, CheckCircle, XCircle, Clock, User, MapPin, CreditCard } from 'lucide-react';

const OrderDetail = ({ order, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (order) {
      loadOrderDetails();
    }
  }, [order]);

  const loadOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/${order.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setOrderDetails(response.data.data);
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      toast.error('Erreur lors du chargement des détails de la commande');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!orderDetails) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/orders/${order.id}/status`,
        {
          status: newStatus,
          comment: statusComment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Statut de commande mis à jour avec succès');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En cours de traitement';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      case 'refunded':
        return 'Remboursée';
      default:
        return status;
    }
  };

  if (!orderDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Détails de la Commande</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des détails...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Commande #{orderDetails.id.slice(0, 8)}</h2>
              <p className="text-gray-600">Créée le {new Date(orderDetails.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Order Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                  {getStatusIcon(orderDetails.status)}
                  <span className="ml-2">{getStatusText(orderDetails.status)}</span>
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">€{orderDetails.totalAmount}</p>
                <p className="text-sm text-gray-600">{orderDetails.orderItems?.length || 0} article(s)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informations Client</h3>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">Nom:</span> {orderDetails.user?.firstName} {orderDetails.user?.lastName}</p>
                <p><span className="font-medium">Email:</span> {orderDetails.user?.email}</p>
                <p><span className="font-medium">Téléphone:</span> {orderDetails.user?.phone || 'Non renseigné'}</p>
                <p><span className="font-medium">Client depuis:</span> {new Date(orderDetails.user?.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Adresse de Livraison</h3>
              </div>
              {orderDetails.shippingAddress ? (
                <div className="space-y-2">
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-gray-600">Adresse non disponible</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles Commandés</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix Unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderDetails.orderItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={item.product?.imageUrl || '/placeholder.png'} 
                              alt={item.product?.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.product?.name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.product?.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          €{item.unitPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €{(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mettre à Jour le Statut</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ajouter un commentaire sur la mise à jour du statut..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={loading || status === orderDetails.status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === orderDetails.status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 