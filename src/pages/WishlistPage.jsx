import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Lock, UserPlus, Loader2, AlertCircle, RefreshCw, Heart, ShoppingBag, FolderOpen, ShoppingCart, Trash2, Eye, Package, Check, X } from 'lucide-react';
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
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock className="w-16 h-16 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Connexion requise
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
              Connectez-vous pour accéder à votre wishlist et sauvegarder vos produits préférés !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="btn-primary px-8 py-4 text-lg">
                <Lock className="w-5 h-5 mr-2" />Se connecter
              </Link>
              <Link to="/register" className="btn-outline px-8 py-4 text-lg">
                <UserPlus className="w-5 h-5 mr-2" />Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Chargement...
            </h1>
            <p className="text-xl text-gray-500">
              Chargement de votre wishlist
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Erreur
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-8 py-4 text-lg cursor-pointer"
            >
              <RefreshCw className="w-5 h-5 mr-1" /> Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-16 h-16 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Votre wishlist est vide
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
              Commencez à ajouter vos produits préférés à votre wishlist pour les retrouver facilement !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary px-8 py-4 text-lg">
                <ShoppingBag className="w-5 h-5 mr-1" /> Découvrir nos produits
              </Link>
              <Link to="/categories" className="btn-outline px-8 py-4 text-lg">
                <FolderOpen className="w-5 h-5 mr-1" /> Parcourir les catégories
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Ma Wishlist
          </h1>
          <div className="section-divider mb-0"></div>
          <p className="text-gray-500 text-lg mt-3">
            {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''} dans votre wishlist
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleMoveAllToCart}
              className="btn-primary cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Ajouter tout au panier
            </button>
            <button
              onClick={handleClearWishlist}
              className="btn-danger cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Vider la wishlist
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 overflow-hidden hover:shadow-lg transition-all duration-300 group card-3d">
              {/* Product Image */}
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 overflow-hidden">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                </div>
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  aria-label="Retirer de la wishlist"
                  className="absolute top-2 right-2 w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
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
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    {product.inStock ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> En stock
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Rupture
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="btn-primary w-full text-sm py-2 cursor-pointer"
                  >
                    {product.inStock ? <><ShoppingCart className="w-4 h-4 mr-1" /> Ajouter au panier</> : 'Rupture de stock'}
                  </button>

                  <Link
                    to={`/products/${product.id}`}
                    className="btn-outline w-full text-sm py-2"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-16 text-center">
          <Link to="/products" className="btn-outline px-8 py-4 text-lg">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage; 