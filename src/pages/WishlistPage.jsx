import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../contexts/WishlistContext';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { wishlistItems, isLoading, error, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleClearWishlist = async () => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-gray-800">Confirmer la suppression</div>
          <div className="text-gray-600">Êtes-vous sûr de vouloir vider votre wishlist ?</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Vider la wishlist
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
      clearWishlist();
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(product => {
      addItem(product, 1);
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-6xl mx-auto mb-8">
              🔐
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Connexion requise
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Connectez-vous pour accéder à votre wishlist et sauvegarder vos produits préférés !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🔐 Se connecter
              </Link>
              <Link 
                to="/register" 
                className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:text-blue-600 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg"
              >
                📝 Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 animate-pulse">
              ⏳
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Chargement...
            </h1>
            <p className="text-xl text-gray-600">
              Chargement de votre wishlist
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-6xl mx-auto mb-8">
              ❌
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Erreur
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🔄 Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-6xl mx-auto mb-8">
              💝
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Votre wishlist est vide
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Commencez à ajouter vos produits préférés à votre wishlist pour les retrouver facilement !
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
            Ma Wishlist
          </h1>
          <p className="text-gray-600 text-lg">
            {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''} dans votre wishlist
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleMoveAllToCart}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>🛒</span>
              <span>Ajouter tout au panier</span>
            </button>
            <button
              onClick={handleClearWishlist}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>🗑️</span>
              <span>Vider la wishlist</span>
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Product Image */}
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-blue-500/10 to-purple-500/10 overflow-hidden">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      📦
                    </div>
                  )}
                </div>
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ✕
                </button>

                {/* Sale badge */}
                {product.isOnSale && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                    -{product.salePercentage}%
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.category && (
                  <p className="text-sm text-gray-500 mb-2">
                    {product.category.name}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {product.inStock ? (
                      <span className="text-green-600">✓ En stock</span>
                    ) : (
                      <span className="text-red-600">✗ Rupture</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {product.inStock ? '🛒 Ajouter au panier' : 'Rupture de stock'}
                  </button>
                  
                  <Link
                    to={`/products/${product.id}`}
                    className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center font-semibold rounded-lg transition-all duration-300"
                  >
                    👁️ Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:text-blue-600 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg"
          >
            <span>🛍️</span>
            <span>Continuer les achats</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage; 