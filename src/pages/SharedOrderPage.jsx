import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, Gift, Clock, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { ordersAPI, formatPrice } from '../services/api';

const STATUS_LABELS = {
  pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  processing: { label: 'En préparation', icon: Package, color: 'text-indigo-600 bg-indigo-50' },
  shipped: { label: 'Expédiée', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Livrée', icon: Home, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Annulée', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
};

const SharedOrderPage = () => {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedOrder = async () => {
      try {
        const { data } = await ordersAPI.getSharedOrder(token);
        setOrder(data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 410) {
          setError('Ce lien de partage a expiré.');
        } else if (status === 404) {
          setError('Lien de partage invalide.');
        } else {
          setError('Impossible de charger la commande.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSharedOrder();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Lien non disponible</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const StatusIcon = statusInfo?.icon || Package;
  const isGift = order.shareType === 'gift';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {isGift ? (
            <>
              <Gift className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-900">{order.message}</h1>
            </>
          ) : (
            <>
              <Package className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-900">Commande #{order.orderNumber}</h1>
            </>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Status badge */}
        {order.status && (
          <div className="flex justify-center mb-6">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusInfo.label}
            </span>
          </div>
        )}

        {/* Estimated delivery */}
        {order.estimatedDeliveryDate && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 text-center">
            <p className="text-sm text-gray-600">
              Livraison estimée : <span className="font-semibold text-gray-900">
                {new Date(order.estimatedDeliveryDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </p>
          </div>
        )}

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">
                {isGift ? 'Contenu du cadeau' : 'Articles commandés'}
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <li key={index} className="flex items-center gap-4 p-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Quantité : {item.quantity}</p>
                  </div>
                  {!isGift && item.price && (
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {!isGift && order.totalAmount && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Status-only view (no items) */}
        {order.shareType === 'status' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">
              Cette commande contient <span className="font-semibold">{order.itemCount}</span> article{order.itemCount > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-8">
          Lien partagé de manière sécurisée
        </p>
      </div>
    </div>
  );
};

export default SharedOrderPage;
