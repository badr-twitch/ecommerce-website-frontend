import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Eye, Package, Truck, CheckCircle, XCircle, Clock, User, MapPin, CreditCard, RefreshCw, MessageSquare, Trash2, Send, AlertTriangle, Image } from 'lucide-react';

const REFUND_REASON_LABELS = {
  defective: 'Produit defectueux',
  wrong_item: 'Mauvais article recu',
  damaged_in_shipping: 'Endommage pendant la livraison',
  not_as_described: 'Non conforme a la description',
  missing_parts: 'Pieces manquantes',
};

const OrderDetail = ({ order, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  // Refund state
  const [showRefundSection, setShowRefundSection] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundType, setRefundType] = useState('full');
  const [isRefunding, setIsRefunding] = useState(false);
  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  // Refund review state
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isApprovingRefund, setIsApprovingRefund] = useState(false);
  const [isRejectingRefund, setIsRejectingRefund] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState(null);

  useEffect(() => {
    if (order) {
      loadOrderDetails();
      loadNotes();
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const loadNotes = async () => {
    try {
      const response = await axios.get(`${apiBase}/admin/orders/${order.id}/notes`, getAuthHeaders());
      setNotes(response.data.data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const response = await axios.post(
        `${apiBase}/admin/orders/${order.id}/notes`,
        { content: newNote, isInternal: true },
        getAuthHeaders()
      );
      setNotes(prev => [response.data.data, ...prev]);
      setNewNote('');
      toast.success('Note ajoutée');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${apiBase}/admin/orders/${order.id}/notes/${noteId}`, getAuthHeaders());
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Note supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Veuillez indiquer une raison');
      return;
    }
    setIsRefunding(true);
    try {
      const data = { reason: refundReason };
      if (refundType === 'partial' && refundAmount) {
        data.amount = parseFloat(refundAmount);
      }
      await axios.post(
        `${apiBase}/admin/orders/${order.id}/refund`,
        data,
        getAuthHeaders()
      );
      toast.success('Remboursement effectué avec succès');
      onStatusUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du remboursement');
    } finally {
      setIsRefunding(false);
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
      case 'refund_requested':
        return <AlertTriangle className="w-4 h-4" />;
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
      case 'refund_requested':
        return 'bg-orange-100 text-orange-800';
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
        return 'Expediee';
      case 'delivered':
        return 'Livree';
      case 'cancelled':
        return 'Annulee';
      case 'refund_requested':
        return 'Remboursement demande';
      case 'refunded':
        return 'Remboursee';
      default:
        return status;
    }
  };

  const handleApproveRefund = async () => {
    setIsApprovingRefund(true);
    try {
      await axios.post(`${apiBase}/admin/orders/${order.id}/approve-refund`, {}, getAuthHeaders());
      toast.success('Remboursement approuve avec succes');
      onStatusUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'approbation');
    } finally {
      setIsApprovingRefund(false);
    }
  };

  const handleRejectRefund = async () => {
    if (!rejectReason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }
    setIsRejectingRefund(true);
    try {
      await axios.post(`${apiBase}/admin/orders/${order.id}/reject-refund`, { reason: rejectReason }, getAuthHeaders());
      toast.success('Demande de remboursement rejetee');
      setShowRejectReason(false);
      setRejectReason('');
      onStatusUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du rejet');
    } finally {
      setIsRejectingRefund(false);
    }
  };

  if (!orderDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Détails de la Commande</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des détails...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
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
                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                  {getStatusIcon(orderDetails.status)}
                  <span className="ml-2">{getStatusText(orderDetails.status)}</span>
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{orderDetails.totalAmount} DH</p>
                <p className="text-sm text-gray-600">{orderDetails.orderItems?.length || 0} article(s)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50/50 rounded-xl p-6">
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
            <div className="bg-gray-50/50 rounded-xl p-6">
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
            <div className="bg-gray-50/50 rounded-xl overflow-hidden border border-gray-100">
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
                          {item.unitPrice} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(item.unitPrice * item.quantity).toFixed(2)} DH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="mt-6 bg-primary-50/50 rounded-xl p-6">
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
                  className="textarea"
                  placeholder="Ajouter un commentaire sur la mise à jour du statut..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={loading || status === orderDetails.status}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      status === orderDetails.status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Refund Section */}
          {!['cancelled', 'refunded'].includes(orderDetails.status) && (
            <div className="mt-6">
              {!showRefundSection ? (
                <button
                  onClick={() => setShowRefundSection(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Rembourser cette commande
                </button>
              ) : (
                <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Remboursement
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="full"
                          checked={refundType === 'full'}
                          onChange={() => setRefundType('full')}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm">Total ({orderDetails.totalAmount} DH)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="partial"
                          checked={refundType === 'partial'}
                          onChange={() => setRefundType('partial')}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm">Partiel</span>
                      </label>
                    </div>
                    {refundType === 'partial' && (
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="Montant en DH"
                        max={parseFloat(orderDetails.totalAmount)}
                        min={0.01}
                        step={0.01}
                        className="input focus:border-orange-500"
                      />
                    )}
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={2}
                      placeholder="Raison du remboursement (obligatoire)"
                      className="textarea focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleRefund}
                        disabled={isRefunding || !refundReason.trim()}
                        className="btn-danger disabled:opacity-50"
                      >
                        {isRefunding ? 'Traitement...' : 'Confirmer le remboursement'}
                      </button>
                      <button
                        onClick={() => { setShowRefundSection(false); setRefundReason(''); setRefundAmount(''); }}
                        className="btn-outline"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refund Review Panel */}
          {orderDetails.status === 'refund_requested' && orderDetails.refundReason && (
            <div className="mt-6 bg-orange-50/50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Demande de remboursement à examiner
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Catégorie : </span>
                  <span className="text-sm text-gray-900">{REFUND_REASON_LABELS[orderDetails.refundReason] || orderDetails.refundReason}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Description :</span>
                  <p className="text-sm text-gray-900 mt-1 bg-white/60 rounded-lg p-3">{orderDetails.refundDescription}</p>
                </div>
                {orderDetails.refundProofImages?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Photos de preuve :</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {orderDetails.refundProofImages.map((img, i) => (
                        <button key={i} onClick={() => setFullSizeImage(img)} className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg">
                          <img src={img} alt={`Preuve ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-orange-200 hover:opacity-80 transition-opacity cursor-pointer" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {orderDetails.refundAffectedItems?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Articles concernés :</span>
                    <ul className="mt-1 space-y-1">
                      {orderDetails.refundAffectedItems.map((itemId, i) => {
                        const item = orderDetails.orderItems?.find(oi => oi.id === itemId);
                        return (
                          <li key={i} className="text-sm text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                            {item?.product?.name || `Article #${itemId}`}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="border-t border-orange-200 pt-4 space-y-3">
                  {!showRejectReason ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleApproveRefund}
                        disabled={isApprovingRefund}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                      >
                        {isApprovingRefund ? 'Traitement...' : 'Approuver le remboursement'}
                      </button>
                      <button
                        onClick={() => setShowRejectReason(true)}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
                      >
                        Rejeter la demande
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Raison du rejet (obligatoire)..."
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleRejectRefund}
                          disabled={isRejectingRefund || !rejectReason.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
                        >
                          {isRejectingRefund ? 'Traitement...' : 'Confirmer le rejet'}
                        </button>
                        <button
                          onClick={() => { setShowRejectReason(false); setRejectReason(''); }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Size Image Modal */}
          {fullSizeImage && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={() => setFullSizeImage(null)}>
              <div className="relative max-w-3xl max-h-[80vh]">
                <button onClick={() => setFullSizeImage(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
                <img src={fullSizeImage} alt="Preuve agrandie" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="mt-6 bg-gray-50/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notes internes ({notes.length})
            </h3>

            {/* Add note form */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Ajouter une note..."
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNote.trim()}
                className="btn-primary px-3 py-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Notes list */}
            {notes.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white/80 rounded-xl p-3 border border-gray-100 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {note.author ? `${note.author.firstName} ${note.author.lastName}` : 'Admin'} — {new Date(note.createdAt).toLocaleDateString('fr-FR')}{' '}
                          {new Date(note.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">Aucune note pour cette commande</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 