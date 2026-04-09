import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { OrderStatus } from '../components/orders';
import {
  Search,
  Package,
  AlertCircle,
  ArrowLeft,
  Truck,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrder(null);
      setSearched(true);

      const response = await ordersAPI.track(orderNumber.trim(), email.trim().toLowerCase());

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Aucune commande trouvée avec ce numéro et cet email. Vérifiez vos informations.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-indigo-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Suivre ma commande
            </h1>
            <p className="mt-2 text-gray-600">
              Entrez votre numéro de commande et l'email utilisé lors de l'achat
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de commande
              </label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex: ORD-1234567890-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email de la commande
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Suivre ma commande
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !order && !error && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Aucun résultat trouvé</p>
          </div>
        )}

        {/* Order Results */}
        {order && (
          <div className="space-y-6">
            {/* Order Summary Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Commande #{order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Passée le {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {order.shippingCity && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{order.shippingCity}, {order.shippingCountry}</span>
                  </div>
                )}
                {order.shippingMethod && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span>{order.shippingMethod}</span>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Estimée: {new Date(order.estimatedDeliveryDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <OrderStatus order={order} />

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suivi du colis</h3>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="font-medium text-indigo-900">
                        Numéro de suivi: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                      <p className="text-sm text-indigo-700">
                        Utilisez ce numéro pour suivre votre colis auprès du transporteur
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Articles commandés</h3>
                <div className="space-y-3">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                      <img
                        src={item.product?.mainImage || '/placeholder-product.jpg'}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product?.name || 'Produit'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qté: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
