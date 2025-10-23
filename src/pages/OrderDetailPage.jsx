import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import { OrderStatus } from '../components/orders';
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchOrder();
    }
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError(response.data.error || 'Erreur lors de la récupération de la commande');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 404) {
        setError('Commande non trouvée');
      } else {
        setError('Erreur lors de la récupération de la commande');
      }
      toast.error('Erreur lors de la récupération de la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    try {
      setIsCancelling(true);
      const response = await ordersAPI.cancel(id);
      
      if (response.data.success) {
        toast.success('Commande annulée avec succès');
        fetchOrder(); // Refresh order data
      } else {
        toast.error(response.data.error || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erreur lors de l\'annulation de la commande');
    } finally {
      setIsCancelling(false);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  };



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Connexion requise</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connectez-vous pour voir les détails de votre commande.
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-8 w-8 text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-500">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Retour aux commandes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Commande non trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            La commande demandée n'existe pas ou vous n'y avez pas accès.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Retour aux commandes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes commandes
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande #{order.orderNumber}
              </h1>
              <p className="mt-2 text-gray-600">
                Passée le {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusInfo.label}
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Printer className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <OrderStatus order={order} />

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Produits commandés</h2>
              
              <div className="space-y-4">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product?.mainImage || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantité: {item.quantity}
                      </p>
                      {item.product?.discountPercentage > 0 && (
                        <p className="text-sm text-green-600">
                          Réduction: {item.product.discountPercentage}%
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.unitPrice)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total: {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Tracking */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Suivi du colis</h2>
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="font-medium text-indigo-900">
                        Numéro de suivi: {order.trackingNumber}
                      </p>
                      <p className="text-sm text-indigo-700">
                        Votre colis est en route
                      </p>
                    </div>
                  </div>
                  
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Suivre le colis
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Résumé de la commande</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA:</span>
                    <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                
                {order.shippingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison:</span>
                    <span className="font-medium">{formatPrice(order.shippingAmount)}</span>
                  </div>
                )}
                
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Réduction:</span>
                    <span className="text-green-600 font-medium">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Informations client</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Contact</h3>
                  <p className="text-gray-600">{order.customerFirstName} {order.customerLastName}</p>
                  <p className="text-gray-600">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-gray-600">{order.customerPhone}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Adresse de livraison</h3>
                  <p className="text-gray-600">{order.shippingAddress}</p>
                  <p className="text-gray-600">{order.shippingCity}, {order.shippingPostalCode}</p>
                  <p className="text-gray-600">{order.shippingCountry}</p>
                </div>
                
                {order.billingAddress !== order.shippingAddress && (
                  <div>
                    <h3 className="font-medium text-gray-900">Adresse de facturation</h3>
                    <p className="text-gray-600">{order.billingAddress}</p>
                    <p className="text-gray-600">{order.billingCity}, {order.billingPostalCode}</p>
                    <p className="text-gray-600">{order.billingCountry}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Paiement</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode:</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : order.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Payé' : 
                     order.paymentStatus === 'pending' ? 'En attente' : 'Échoué'}
                  </span>
                </div>
                
                {order.paymentTransactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction:</span>
                    <span className="font-mono text-sm">{order.paymentTransactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Actions</h2>
              
              <div className="space-y-3">
                {order.canBeCancelled && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                  >
                    {isCancelling ? 'Annulation...' : 'Annuler la commande'}
                  </button>
                )}
                
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le support
                </button>
                
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler le support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 