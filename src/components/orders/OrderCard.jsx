import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const OrderCard = ({ order, showDetails = false, onToggleDetails }) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

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

  const formatDate = (dateString) => {
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
      currency: 'EUR'
    }).format(price);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    if (onToggleDetails) {
      onToggleDetails(order.id, !isExpanded);
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </div>
            <div className="text-sm text-gray-500">
              Commande #{order.orderNumber}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(order.totalAmount)}
            </span>
            
            <button
              onClick={toggleExpansion}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Masquer
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Détails
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Commandé le {formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{order.shippingCity}, {order.shippingCountry}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Order Details (Expandable) */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          {/* Order Items */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Produits commandés</h4>
            <div className="space-y-3">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <img
                    src={item.product?.mainImage || '/placeholder-product.jpg'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.product?.name}</h5>
                    <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
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

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Informations de livraison</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-medium">{order.customerFirstName} {order.customerLastName}</p>
                <p className="text-gray-600">{order.shippingAddress}</p>
                <p className="text-gray-600">{order.shippingCity}, {order.shippingPostalCode}</p>
                <p className="text-gray-600">{order.shippingCountry}</p>
                {order.customerPhone && (
                  <p className="text-gray-600 mt-2">📞 {order.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Résumé de la commande</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                {order.shippingAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Livraison:</span>
                    <span>{formatPrice(order.shippingAmount)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Réduction:</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/orders/${order.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir la commande complète
            </Link>
            
            {order.trackingNumber && (
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Truck className="h-4 w-4 mr-2" />
                Suivre le colis
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
