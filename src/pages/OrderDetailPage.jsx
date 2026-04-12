import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import storageService from '../services/storageService';
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
  MessageSquare,
  Upload,
  X,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import OrderShareModal from '../components/orders/OrderShareModal';

const REFUND_REASON_LABELS = {
  defective: 'Produit defectueux',
  wrong_item: 'Mauvais article recu',
  damaged_in_shipping: 'Endommage pendant la livraison',
  not_as_described: 'Non conforme a la description',
  missing_parts: 'Pieces manquantes',
};

const getStatusInfo = (status) => {
  const statusMap = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmée', color: 'bg-primary-100 text-primary-800', icon: CheckCircle },
    processing: { label: 'En préparation', color: 'bg-primary-100 text-primary-800', icon: Package },
    shipped: { label: 'Expédiée', color: 'bg-secondary-100 text-secondary-800', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    refund_requested: { label: 'Remboursement demandé', color: 'bg-orange-100 text-orange-800', icon: Clock },
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
  const [refundCategory, setRefundCategory] = useState('');
  const [refundDescription, setRefundDescription] = useState('');
  const [refundProofImages, setRefundProofImages] = useState([]);
  const [refundAffectedItems, setRefundAffectedItems] = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
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
    if (!refundCategory) {
      toast.error('Veuillez selectionner une categorie de raison');
      return;
    }
    if (refundDescription.trim().length < 20) {
      toast.error('La description doit contenir au moins 20 caracteres');
      return;
    }
    if (refundProofImages.length === 0) {
      toast.error('Veuillez ajouter au moins une photo comme preuve');
      return;
    }

    try {
      setIsRefunding(true);
      const response = await ordersAPI.refund(id, {
        reason: refundCategory,
        description: refundDescription,
        proofImages: refundProofImages,
        affectedItems: refundAffectedItems,
      });

      if (response.data.success) {
        toast.success('Demande de remboursement envoyee');
        setShowRefundModal(false);
        setRefundCategory('');
        setRefundDescription('');
        setRefundProofImages([]);
        setRefundAffectedItems([]);
        fetchOrder();
      } else {
        toast.error(response.data.error || 'Erreur lors de la demande de remboursement');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la demande de remboursement');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleProofUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingProof(true);
    try {
      for (const file of files) {
        const url = await storageService.uploadFile(file, `refund-proofs/${id}/${file.name}`);
        setRefundProofImages(prev => [...prev, url]);
      }
      toast.success('Photo(s) ajoutee(s)');
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast.error('Erreur lors du telechargement de la photo');
    } finally {
      setUploadingProof(false);
      e.target.value = '';
    }
  };

  const handleRemoveProofImage = (index) => {
    setRefundProofImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAffectedItem = (itemId) => {
    setRefundAffectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
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
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-glow-primary hover:-translate-y-0.5 transition-all duration-300"
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
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-8 w-8 text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-500">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-glow-primary hover:-translate-y-0.5 transition-all duration-300"
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
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Commande non trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            La commande demandée n'existe pas ou vous n'y avez pas accès.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-glow-primary hover:-translate-y-0.5 transition-all duration-300"
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
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes commandes
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande #{order.orderNumber}
              </h1>
              <p className="mt-2 text-gray-500">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Produits commandés</h2>
              
              <div className="space-y-4">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product?.mainImage || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-xl"
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
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
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-glow-primary hover:-translate-y-0.5 transition-all duration-300"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Actions</h2>
              
              <div className="space-y-3">
                {order.canBeCancelled && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-xl shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                  >
                    {isCancelling ? 'Annulation...' : 'Annuler la commande'}
                  </button>
                )}

                {order.status === 'delivered' && order.paymentStatus !== 'refunded' && (
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-orange-300 rounded-xl shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50"
                  >
                    Demander un remboursement
                  </button>
                )}
                
                <button
                  onClick={() => navigate(`/contact?order=${order.orderNumber}`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le support
                </button>

                <a
                  href="tel:+212522000000"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler le support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Request Details */}
      {order.status === 'refund_requested' && order.refundReason && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-orange-50/80 backdrop-blur-sm rounded-2xl shadow-soft border border-orange-200 p-6">
            <h2 className="text-lg font-medium text-orange-900 mb-4">Détails de la demande de remboursement</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Raison : </span>
                <span className="text-sm text-gray-900">{REFUND_REASON_LABELS[order.refundReason] || order.refundReason}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Description : </span>
                <p className="text-sm text-gray-900 mt-1">{order.refundDescription}</p>
              </div>
              {order.refundProofImages?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Photos :</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.refundProofImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt={`Preuve ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-orange-200" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Demander un remboursement</h3>
              <button onClick={() => { setShowRefundModal(false); setRefundCategory(''); setRefundDescription(''); setRefundProofImages([]); setRefundAffectedItems([]); }} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Commande #{order.orderNumber} — {formatPrice(order.totalAmount)}
            </p>

            {/* Reason Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie de raison <span className="text-red-500">*</span>
              </label>
              <select
                value={refundCategory}
                onChange={(e) => setRefundCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Selectionnez une raison --</option>
                {Object.entries(REFUND_REASON_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {!refundCategory && <p className="text-xs text-red-500 mt-1">La categorie est obligatoire</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description detaillee <span className="text-red-500">*</span>
              </label>
              <textarea
                value={refundDescription}
                onChange={(e) => setRefundDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Decrivez le probleme en detail (minimum 20 caracteres)..."
              />
              <div className="flex justify-between mt-1">
                {refundDescription.length > 0 && refundDescription.length < 20 && (
                  <p className="text-xs text-red-500">Minimum 20 caracteres requis</p>
                )}
                <p className={`text-xs ml-auto ${refundDescription.length < 20 ? 'text-red-500' : 'text-gray-400'}`}>
                  {refundDescription.length}/20 min
                </p>
              </div>
            </div>

            {/* Photo Proof */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos de preuve <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {refundProofImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Preuve ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => handleRemoveProofImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                {uploadingProof ? (
                  <span className="text-sm text-gray-500">Telechargement...</span>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Ajouter des photos</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleProofUpload}
                  disabled={uploadingProof}
                  className="hidden"
                />
              </label>
              {refundProofImages.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Au moins une photo est requise</p>
              )}
            </div>

            {/* Affected Items */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Articles concernes
              </label>
              <div className="space-y-2">
                {order.orderItems?.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refundAffectedItems.includes(item.id)}
                      onChange={() => toggleAffectedItem(item.id)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <img
                      src={item.product?.mainImage || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span className="text-sm text-gray-900">{item.product?.name}</span>
                    <span className="text-sm text-gray-500 ml-auto">x{item.quantity}</span>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Votre demande sera examinee par notre equipe. Reponse sous 48h ouvrees.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRefund}
                disabled={isRefunding || !refundCategory || refundDescription.trim().length < 20 || refundProofImages.length === 0}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefunding ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
              <button
                onClick={() => { setShowRefundModal(false); setRefundCategory(''); setRefundDescription(''); setRefundProofImages([]); setRefundAffectedItems([]); }}
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