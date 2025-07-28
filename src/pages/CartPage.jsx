import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, total, itemCount, updateQuantity, removeItem, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleClearCart = async () => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-gray-800">Confirmer la suppression</div>
          <div className="text-gray-600">Êtes-vous sûr de vouloir vider votre panier ?</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Vider le panier
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center',
      });
    });

    if (confirmed) {
      clearCart();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-6xl mx-auto mb-8">
              🛒
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Votre panier est vide
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Découvrez nos produits exceptionnels et commencez votre shopping dès maintenant !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🛍️ Découvrir nos produits
              </Link>
              <Link 
                to="/categories" 
                className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:text-blue-600 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg"
              >
                📂 Parcourir les catégories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Votre Panier
          </h1>
          <p className="text-gray-600 text-lg">
            {itemCount} article{itemCount > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Articles</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200"
                  >
                    Vider le panier
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200/50">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                              📦
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 text-lg font-semibold text-gray-800 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <span className="text-xl">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Résumé de la commande</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                  <span className="font-semibold text-gray-800">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Livraison</span>
                  <span className="text-green-600 font-semibold">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="space-y-4">
                {user ? (
                  <Link
                    to="/checkout"
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Passer la commande</span>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                    >
                      <span>🔐</span>
                      <span>Se connecter pour commander</span>
                    </Link>
                    <Link
                      to="/register"
                      className="w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 hover:text-blue-600 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-gray-50 flex items-center justify-center space-x-2"
                    >
                      <span>📝</span>
                      <span>Créer un compte</span>
                    </Link>
                  </div>
                )}
                
                <Link
                  to="/products"
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>🛍️</span>
                  <span>Continuer les achats</span>
                </Link>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600">🛡️</span>
                  <span className="text-sm font-semibold text-green-800">Paiement sécurisé</span>
                </div>
                <p className="text-xs text-green-700">
                  Vos données sont protégées par un cryptage SSL 256-bit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">
            Vous pourriez aussi aimer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-full h-48 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl mb-4 flex items-center justify-center text-4xl text-gray-400 group-hover:scale-105 transition-transform duration-300">
                  📦
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Produit Recommandé</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">€99</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300">
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 