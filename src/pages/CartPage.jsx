import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { ShoppingCart, Trash2, Minus, Plus, ShieldCheck, ArrowRight, LogIn, UserPlus, ShoppingBag, FolderOpen, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, total, itemCount, updateQuantity, removeItem, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
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
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow-primary/20">
              <ShoppingCart className="w-14 h-14 text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Votre panier est vide
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
              Découvrez nos produits exceptionnels et commencez votre shopping dès maintenant !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-glow-primary hover:shadow-lg hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-5 h-5" />
                Découvrir nos produits
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:text-primary-600 hover:border-primary-300 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg"
              >
                <FolderOpen className="w-5 h-5" />
                Parcourir les catégories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Votre Panier
          </h1>
          <div className="section-divider mb-0"></div>
          <p className="text-gray-500 text-lg mt-3">
            {itemCount} article{itemCount > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Articles</h2>
                  <button
                    onClick={handleClearCart}
                    className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vider le panier
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-primary-50/30 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl overflow-hidden shadow-sm">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xl font-bold text-primary-600">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-lg font-semibold text-gray-800 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xl font-bold text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Résumé de la commande</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                  <span className="font-semibold text-gray-800">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Livraison</span>
                  <span className="text-green-600 font-semibold">Gratuite</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-gradient">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="space-y-3">
                {user ? (
                  <Link
                    to="/checkout"
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-glow-primary hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Passer la commande
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-glow-primary hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-5 h-5" />
                      Se connecter pour commander
                    </Link>
                    <Link
                      to="/register"
                      className="w-full px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 hover:text-primary-600 hover:border-primary-300 text-base font-semibold rounded-xl transition-all duration-300 hover:bg-primary-50/30 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Créer un compte
                    </Link>
                  </div>
                )}

                <Link
                  to="/products"
                  className="w-full px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-center rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continuer les achats
                </Link>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50/80 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Paiement sécurisé</span>
                </div>
                <p className="text-xs text-green-600">
                  Vos données sont protégées par un cryptage SSL 256-bit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gradient mb-8 text-center">
            Vous pourriez aussi aimer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card-3d bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/60 group">
                <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Produit Recommandé</h3>
                <p className="text-xl font-bold text-primary-600 mb-4">1 061 DH</p>
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5">
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