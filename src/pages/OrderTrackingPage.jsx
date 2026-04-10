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
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Suivre ma commande
            </h1>
            <p className="mt-2 text-gray-600">
              Entrez votre numéro de commande et l'email utilisé lors de l'achat
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="card p-6 mb-8">
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
                className="input"
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
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
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
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 mb-8">
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
            <div className="card p-6">
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
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span>{order.shippingCity}, {order.shippingCountry}</span>
                  </div>
                )}
                {order.shippingMethod && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-primary-500" />
                    <span>{order.shippingMethod}</span>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>Estimée: {new Date(order.estimatedDeliveryDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <OrderStatus order={order} />

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suivi du colis</h3>
                <div className="bg-primary-50/80 backdrop-blur-sm border border-primary-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Numéro de suivi: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Utilisez ce numéro pour suivre votre colis auprès du transporteur
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Articles commandés</h3>
                <div className="space-y-3">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl hover:bg-primary-50/30 transition-colors duration-200">
                      <img
                        src={item.product?.mainImage || '/placeholder-product.jpg'}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded-xl"
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
