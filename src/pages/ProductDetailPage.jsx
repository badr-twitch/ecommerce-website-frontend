import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Package, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus } from 'lucide-react';
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
      <div className="w-full h-96 bg-gray-100 rounded-2xl overflow-hidden">
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
      {/* Breadcrumb Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/products" className="hover:text-primary-600 transition-colors duration-200">Produits</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {product.category && (
              <>
                <Link to={`/products?category=${product.categoryId}`} className="hover:text-primary-600 transition-colors duration-200">{product.category.name}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Images */}
          <div className="rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-soft border border-white/60 p-2 lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery product={product} />
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Category + Rating row */}
            <div className="flex items-center justify-between">
              {product.category && (
                <Link to={`/products?category=${product.categoryId}`} className="badge-primary text-xs uppercase tracking-wide">
                  {product.category.name}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (product.averageRating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">
                  ({product.reviewCount || 0} avis)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            {/* Price Block */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 p-5">
              {product.isOnSale && product.originalPrice ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.price ? `${parseFloat(product.price).toFixed(2)} DH` : 'Prix non disponible'}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    {parseFloat(product.originalPrice).toFixed(2)} DH
                  </span>
                  {product.salePercentage && (
                    <span className="badge-danger font-semibold">
                      -{product.salePercentage}%
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {product.price ? `${parseFloat(product.price).toFixed(2)} DH` : 'Prix non disponible'}
                </span>
              )}

              {product.isOnSale && (
                <div className="text-sm text-orange-600 font-medium flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  Produit en promotion
                </div>
              )}

              {/* Stock Status inside price block */}
              <div className={`text-sm font-medium mt-3 pt-3 border-t border-gray-100 ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-500 leading-relaxed">{product.description}</p>
            )}

            {/* Quantity + Add to Cart grouped */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 p-5 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantité</label>
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2 text-gray-900 font-semibold min-w-[3rem] text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isInCart() ? (
                  <Link
                    to="/cart"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Voir le panier
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity <= 0}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
                      product.stockQuantity > 0
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-glow-primary hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au panier
                  </button>
                )}

                <button
                  onClick={handleToggleWishlist}
                  className={`p-3.5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isInWishlist(product.id)
                      ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100'
                      : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isInWishlist(product.id) ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-2 p-3 bg-primary-50/40 rounded-xl text-center">
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-xs font-medium text-gray-600">Livraison gratuite</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-green-50/40 rounded-xl text-center">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-600">Garantie 2 ans</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-orange-50/40 rounded-xl text-center">
                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-xs font-medium text-gray-600">Retours 30 jours</span>
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