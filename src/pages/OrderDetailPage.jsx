import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import { OrderStatus } from '../components/orders';
import OrderActivityFeed from '../components/orders/OrderActivityFeed';
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
import OrderShareModal from '../components/orders/OrderShareModal';

const getStatusInfo = (status) => {
  const statusMap = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    processing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-800', icon: Package },
    shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    refunded: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  };
  return statusMap[status] || statusMap.pending;
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Veuillez indiquer la raison du remboursement');
      return;
    }

    try {
      setIsRefunding(true);
      const response = await ordersAPI.refund(id, { reason: refundReason });

      if (response.data.success) {
        toast.success('Remboursement effectué avec succès');
        setShowRefundModal(false);
        setRefundReason('');
        fetchOrder();
      } else {
        toast.error(response.data.error || 'Erreur lors du remboursement');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du remboursement');
    } finally {
      setIsRefunding(false);
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
                <button
                  onClick={() => window.print()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Imprimer"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button
                  onClick={async () => {
                    try {
                      toast.loading('Génération de la facture...', { id: 'invoice' });
                      const response = await ordersAPI.getInvoice(order.id);
                      const blob = new Blob([response.data], { type: 'application/pdf' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `facture-${order.orderNumber}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Facture téléchargée', { id: 'invoice' });
                    } catch (e) {
                      toast.error('Erreur lors du téléchargement', { id: 'invoice' });
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Télécharger la facture"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Partager"
                >
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

            {/* Activity Feed */}
            <OrderActivityFeed orderId={order.id} />

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
                      {item.product?.salePercentage > 0 && (
                        <p className="text-sm text-green-600">
                          Réduction: {item.product.salePercentage}%
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
                  
                  <button
                    onClick={() => navigate(`/track-order?order=${order.orderNumber}&email=${order.customerEmail}`)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
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

                {(order.status === 'delivered' || order.status === 'shipped') && order.paymentStatus !== 'refunded' && (
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50"
                  >
                    Demander un remboursement
                  </button>
                )}
                
                <button
                  onClick={() => navigate(`/contact?order=${order.orderNumber}`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le support
                </button>

                <a
                  href="tel:+212522000000"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler le support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Demander un remboursement</h3>
            <p className="text-sm text-gray-600 mb-4">
              Commande #{order.orderNumber} — {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(order.totalAmount)}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison du remboursement
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Décrivez la raison de votre demande..."
              />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Le remboursement sera traité sous 5 à 10 jours ouvrés sur votre moyen de paiement d'origine.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRefund}
                disabled={isRefunding || !refundReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {isRefunding ? 'Traitement...' : 'Confirmer le remboursement'}
              </button>
              <button
                onClick={() => { setShowRefundModal(false); setRefundReason(''); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {order && (
        <OrderShareModal
          order={order}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default OrderDetailPage; 