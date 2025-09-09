import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Package, Truck, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { ProductRecommendations, FrequentlyBoughtTogether } from '../components/recommendations';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/products/${productId}`);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter des produits au panier');
      return;
    }

    if (product.stockQuantity < quantity) {
      toast.error('Quantité demandée non disponible en stock');
      return;
    }

    try {
      await addToCart(product, quantity);
      toast.success(`${product.name} ajouté au panier`);
      setQuantity(1);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter des produits à votre wishlist');
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast.success(`${product.name} retiré de la wishlist`);
      } else {
        await addToWishlist(product);
        toast.success(`${product.name} ajouté à votre wishlist`);
      }
    } catch (error) {
      toast.error('Erreur lors de la modification de la wishlist');
    }
  };

  const isInCart = () => {
    return cartItems.some(item => item.product.id === productId);
  };

  const getStockStatus = () => {
    if (product.stockQuantity <= 0) return { text: 'Rupture de stock', color: 'text-red-600' };
    if (product.stockQuantity <= 5) return { text: `Plus que ${product.stockQuantity} en stock`, color: 'text-orange-600' };
    return { text: 'En stock', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="h-8 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="w-full h-96 bg-gray-300 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Produit non trouvé'}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </div>
            
            {/* Additional Images (if any) */}
            {product.additionalImages && product.additionalImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.additionalImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-full h-20 bg-gray-100 rounded overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (product.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.reviewCount || 0} avis)
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-gray-900">
              {product.price ? `${product.price.toFixed(2)} €` : 'Prix non disponible'}
            </div>

            {/* Stock Status */}
            <div className={`text-lg font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Quantité:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0 || isInCart()}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  product.stockQuantity > 0 && !isInCart()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isInCart() ? 'Déjà dans le panier' : 'Ajouter au panier'}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  isInWishlist(product.id)
                    ? 'border-red-500 text-red-500 hover:bg-red-50'
                    : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
                }`}
                title={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
              >
                <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Garantie 2 ans</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Retours 30 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mb-16">
          <FrequentlyBoughtTogether 
            productId={productId}
            limit={4}
            showTitle={true}
          />
        </div>

        {/* Product Recommendations */}
        <div className="mb-16">
          <ProductRecommendations 
            type="product"
            productId={productId}
            limit={8}
            showTitle={true}
          />
        </div>

        {/* Category Recommendations */}
        {product.categoryId && (
          <div className="mb-16">
            <ProductRecommendations 
              type="category"
              categoryId={product.categoryId}
              limit={6}
              showTitle={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage; 