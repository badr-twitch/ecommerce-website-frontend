import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Heart, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { toast } from 'react-hot-toast';
import { recommendationsAPI } from '../../services/api';

const FrequentlyBoughtTogether = ({ 
  productId, 
  limit = 4,
  showTitle = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { addItem, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  useEffect(() => {
    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recommendationsAPI.getFrequentlyBoughtTogether(productId, limit);
      
      if (response.data.success) {
        setRecommendations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching frequently bought together:', error);
      setError('Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddSelectedToCart = async () => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter des produits au panier');
      return;
    }
    if (selectedProducts.size === 0) {
      toast.error('Veuillez sélectionner au moins un produit');
      return;
    }

    try {
      let addedCount = 0;
      for (const productId of selectedProducts) {
        const product = recommendations.find(p => p.id === productId);
        if (product && product.stockQuantity > 0) {
          await addItem(product, 1);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`${addedCount} produit(s) ajouté(s) au panier`);
        setSelectedProducts(new Set());
      } else {
        toast.error('Aucun produit disponible en stock');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter des produits au panier');
      return;
    }
    try {
      await addItem(product, 1);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleToggleWishlist = async (product) => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast.success(`${product.name} retiré de la wishlist`);
      } else {
        await addToWishlist(product);
        toast.success(`${product.name} ajouté à la wishlist`);
      }
    } catch (error) {
      toast.error('Erreur lors de la modification de la wishlist');
    }
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-64"></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="w-full h-24 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-center py-6`}>
        <div className="text-gray-500 mb-4">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{error}</p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Fréquemment achetés ensemble
          </h2>
        </div>
      )}

      {/* Bulk Add Section */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-800">
                {selectedProducts.size} produit(s) sélectionné(s)
              </span>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Désélectionner tout
              </button>
            </div>
            <button
              onClick={handleAddSelectedToCart}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter {selectedProducts.size} au panier
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => {
          const isSelected = selectedProducts.has(product.id);
          const inCart = isInCart(product.id);
          
          return (
            <div 
              key={product.id} 
              className={`bg-white rounded-lg shadow-sm border transition-all cursor-pointer ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleProductSelect(product.id)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white border-gray-300'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.mainImage || product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/80 text-gray-600 hover:text-red-500 hover:bg-white'
                  }`}
                  title={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                >
                  <Heart className="w-3 h-3" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>

                {/* Stock Badge */}
                {product.stockQuantity <= 0 && (
                  <div className="absolute top-2 left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Rupture
                  </div>
                )}

                {/* In Cart Badge */}
                {inCart && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Dans le panier
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-medium text-gray-800 mb-1 text-sm line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (product.averageRating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-900">
                    {product.price ? `${parseFloat(product.price).toFixed(2)} DH` : 'Prix non disponible'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.stockQuantity <= 0 || inCart}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.stockQuantity > 0 && !inCart
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {inCart ? 'Déjà dans le panier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Cliquez sur les produits pour les sélectionner, puis ajoutez-les tous ensemble au panier !</p>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;
