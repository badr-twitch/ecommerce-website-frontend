import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, TrendingUp, Clock, Users, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductRecommendations = ({ 
  type = 'user', 
  productId = null, 
  categoryId = null, 
  limit = 6,
  showTitle = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [type, productId, categoryId, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      let params = { limit };

      switch (type) {
        case 'user':
          if (!user) {
            // If no user, get trending recommendations instead
            endpoint = '/api/recommendations/trending';
          } else {
            endpoint = '/api/recommendations/user';
          }
          break;
        case 'product':
          endpoint = `/api/recommendations/product/${productId}`;
          break;
        case 'category':
          endpoint = `/api/recommendations/category/${categoryId}`;
          break;
        case 'trending':
          endpoint = '/api/recommendations/trending';
          if (categoryId) params.categoryId = categoryId;
          break;
        case 'frequently-bought':
          endpoint = `/api/recommendations/frequently-bought/${productId}`;
          break;
        default:
          endpoint = '/api/recommendations/trending';
      }

      const response = await axios.get(endpoint, { params });
      
      if (response.data.success) {
        let data = response.data.data;
        
        // For user recommendations, we get an object with different types
        if (type === 'user' && typeof data === 'object') {
          // Combine all recommendation types and take the best ones
          const allRecommendations = [
            ...(data.basedOnPurchaseHistory || []),
            ...(data.basedOnWishlist || []),
            ...(data.basedOnSimilarUsers || []),
            ...(data.trendingInCategories || [])
          ];
          
          // Remove duplicates and sort by relevance score
          const uniqueRecommendations = allRecommendations
            .filter((product, index, self) => 
              index === self.findIndex(p => p.id === product.id)
            )
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            .slice(0, limit);
          
          // If no user recommendations, fall back to trending
          if (uniqueRecommendations.length === 0) {
            console.log('No user recommendations found, fetching trending recommendations...');
            try {
              const trendingResponse = await axios.get('/api/recommendations/trending', { params });
              if (trendingResponse.data.success) {
                data = trendingResponse.data.data;
              }
            } catch (trendingError) {
              console.error('Error fetching trending recommendations:', trendingError);
            }
          } else {
            data = uniqueRecommendations;
          }
        }
        
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} ajouté au panier`);
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

  const getRecommendationTitle = () => {
    switch (type) {
      case 'user':
        return 'Recommandations personnalisées pour vous';
      case 'product':
        return 'Vous pourriez aussi aimer';
      case 'category':
        return 'Produits populaires dans cette catégorie';
      case 'trending':
        return 'Produits tendance';
      case 'frequently-bought':
        return 'Fréquemment achetés ensemble';
      default:
        return 'Recommandations';
    }
  };

  const getRecommendationIcon = () => {
    switch (type) {
      case 'user':
        return <Users className="w-5 h-5" />;
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'category':
        return <TrendingUp className="w-5 h-5" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'frequently-bought':
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="w-full h-32 bg-gray-300 rounded mb-3"></div>
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
      <div className={`${className} text-center py-8`}>
        <div className="text-gray-500 mb-4">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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
    return (
      <div className={`${className} text-center py-8`}>
        <div className="text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune recommandation disponible pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-6">
          {getRecommendationIcon()}
          <h2 className="text-xl font-semibold text-gray-800">
            {getRecommendationTitle()}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-32 object-cover rounded-t-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
              
              {/* Wishlist Button */}
              <button
                onClick={() => handleToggleWishlist(product)}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                  isInWishlist(product.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/80 text-gray-600 hover:text-red-500 hover:bg-white'
                }`}
                title={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
              >
                <Heart className="w-4 h-4" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>

              {/* Stock Badge */}
              {product.stockQuantity <= 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Rupture
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
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
                  {product.price ? `${product.price.toFixed(2)} DH` : 'Prix non disponible'}
                </span>
                
                {product.relevanceScore && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Score: {product.relevanceScore}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stockQuantity <= 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    product.stockQuantity > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
