import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Package, Truck, Shield, RefreshCw } from 'lucide-react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from 'react-hot-toast';
import { productsAPI } from '../services/api';
import { ProductRecommendations, FrequentlyBoughtTogether } from '../components/recommendations';

function ProductImageGallery({ product }) {
  const items = useMemo(() => {
    const urls = [];
    if (product.mainImage) urls.push(product.mainImage);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !urls.includes(img)) urls.push(img);
      });
    }
    if (urls.length === 0) urls.push('/placeholder-product.jpg');

    return urls.map((url) => ({
      original: url,
      thumbnail: url,
      originalAlt: product.name,
      thumbnailAlt: product.name,
    }));
  }, [product]);

  if (items.length === 1) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={items[0].original}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
        />
      </div>
    );
  }

  return (
    <ImageGallery
      items={items}
      showPlayButton={false}
      showFullscreenButton={true}
      showNav={true}
      thumbnailPosition="bottom"
      lazyLoad={true}
    />
  );
}

const ProductDetailPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, cartItems } = useCart();
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

      const response = await productsAPI.getById(productId);
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
      await addItem(product, quantity);
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
    return cartItems.some(item => item.id === productId);
  };

  const getStockStatus = () => {
    if (product.stockQuantity <= 0) return { text: 'Rupture de stock', color: 'text-red-600' };
    if (product.stockQuantity <= 5) return { text: `Plus que ${product.stockQuantity} en stock`, color: 'text-orange-600' };
    return { text: 'En stock', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="w-full h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Produit non trouvé'}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300"
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
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors duration-200"
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
          <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-soft border border-white/60 p-2">
            <ProductImageGallery product={product} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>
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
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                ({product.reviewCount || 0} avis)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {product.isOnSale && product.originalPrice ? (
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {product.price ? `${parseFloat(product.price).toFixed(2)} DH` : 'Prix non disponible'}
                  </div>
                  <div className="text-xl text-gray-400 line-through">
                    {parseFloat(product.originalPrice).toFixed(2)} DH
                  </div>
                  {product.salePercentage && (
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                      -{product.salePercentage}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  {product.price ? `${parseFloat(product.price).toFixed(2)} DH` : 'Prix non disponible'}
                </div>
              )}

              {product.isOnSale && (
                <div className="text-sm text-orange-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Produit en promotion
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`text-base font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-600">Quantité:</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  disabled={quantity <= 1}
                >
                  <span className="text-lg font-medium">-</span>
                </button>
                <span className="px-5 py-2 text-gray-900 font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  disabled={quantity >= product.stockQuantity}
                >
                  <span className="text-lg font-medium">+</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0 || isInCart()}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  product.stockQuantity > 0 && !isInCart()
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-glow-primary hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isInCart() ? 'Déjà dans le panier' : 'Ajouter au panier'}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border-2 transition-all duration-300 ${
                  isInWishlist(product.id)
                    ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100'
                    : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
              >
                <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-primary-50/50 rounded-xl">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-600">Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Garantie 2 ans</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl">
                <RefreshCw className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">Retours 30 jours</span>
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