import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, formatPrice } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Star, Search, Filter, Settings, Heart, ShoppingCart, CheckCircle, XCircle, Frown } from 'lucide-react';
import toast from 'react-hot-toast';

// Memoized FilterSidebar component - defined outside to prevent recreation
const FilterSidebar = React.memo(({
  inputValues,
  categories,
  brands,
  handleInputChange,
  handleFilterChange,
  applyFilters,
  clearFilters,
  isSearching
}) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft sticky top-24">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800">Filtres</h3>
      <button
        onClick={clearFilters}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        Réinitialiser
      </button>
    </div>

    {/* Search */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
              type="text"
              value={inputValues.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Rechercher un produit... (Entrée pour appliquer)"
              className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
            />
      </div>
    </div>

    {/* Category */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
      <select
        value={inputValues.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
        className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>

    {/* Brand */}
    {brands && brands.length > 0 && (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
        <select
          value={inputValues.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
        >
          <option value="">Toutes les marques</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Price Range */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
      <div className="grid grid-cols-2 gap-2">
                    <input
              type="number"
              value={inputValues.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
              placeholder="Min"
              className="px-3 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
            />
                    <input
              type="number"
              value={inputValues.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
              placeholder="Max"
              className="px-3 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
            />
      </div>
    </div>

    {/* Sort */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
      <select
        value={inputValues.sort}
        onChange={(e) => handleFilterChange('sort', e.target.value)}
        className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
      >
        <option value="createdAt">Plus récents</option>
        <option value="name">Nom</option>
        <option value="price">Prix</option>
        <option value="rating">Note</option>
      </select>
    </div>

    {/* Order */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
      <select
        value={inputValues.order}
        onChange={(e) => handleFilterChange('order', e.target.value)}
        className="w-full px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300"
      >
        <option value="desc">Décroissant</option>
        <option value="asc">Croissant</option>
      </select>
    </div>

    {/* Checkboxes */}
    <div className="space-y-3 mb-6">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={inputValues.featured}
          onChange={(e) => handleFilterChange('featured', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span className="ml-2 text-sm text-gray-700">Produits vedettes</span>
      </label>
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={inputValues.onSale}
          onChange={(e) => handleFilterChange('onSale', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span className="ml-2 text-sm text-gray-700">En promotion</span>
      </label>
    </div>

    {/* Apply Filters Button */}
    <button
      onClick={applyFilters}
      disabled={isSearching}
      className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isSearching ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Application...
        </>
      ) : (
        <>
          <Search className="w-4 h-4" /> Appliquer les filtres
        </>
      )}
    </button>
  </div>
));

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    featured: searchParams.get('featured') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    brand: searchParams.get('brand') || ''
  });

  // Separate state for all input values (to prevent focus loss)
  const [inputValues, setInputValues] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    featured: searchParams.get('featured') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    brand: searchParams.get('brand') || ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [brands, setBrands] = useState([]);

  // Load categories and brands
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    const loadBrands = async () => {
      try {
        const response = await productsAPI.getBrands();
        setBrands(response.data.brands || []);
      } catch (error) {
        console.error('Error loading brands:', error);
      }
    };
    loadCategories();
    loadBrands();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          page: searchParams.get('page') || 1,
          limit: 12,
          ...filters
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === false) {
            delete params[key];
          }
        });

        const response = await productsAPI.getAll(params);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (error) {
        setError('Erreur lors du chargement des produits');
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, searchParams]);

  // Only sync input values on mount
  useEffect(() => {
    setInputValues({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      featured: searchParams.get('featured') === 'true',
      onSale: searchParams.get('onSale') === 'true'
    });
  }, []); // Empty dependency array - only run on mount

  // Apply filters function - applies all input values at once
  const applyFilters = useCallback(() => {
    setIsSearching(true);
    setFilters(inputValues); // Apply all input values to filters
    setIsSearching(false);
  }, [inputValues]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false) {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = useCallback((key, value) => {
    // Only update input values, not filters (filters will be applied when button is clicked)
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleInputChange = useCallback((key, value) => {
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    const defaultValues = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'createdAt',
      order: 'desc',
      featured: false,
      onSale: false
    };
    setFilters(defaultValues);
    setInputValues(defaultValues);
  }, []);

  const handleAddToCart = useCallback((product) => {
    addItem(product, 1);
  }, [addItem]);

  const handleToggleWishlist = useCallback(async (product) => {
    const isWishlisted = isInWishlist(product.id);
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist]);

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  }, []);

  const ProductCard = React.memo(({ product }) => (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-200/50 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.mainImage || product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <Star className="w-3 h-3 inline mr-1" /> Vedette
            </span>
          )}
          {product.isOnSale && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              -{product.salePercentage}%
            </span>
          )}
          {product.category && (
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Wishlist button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product); }}
            className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
              isInWishlist(product.id)
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-300'
            }`}
          >
            {isInWishlist(product.id) ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
          </button>

          {/* Quick add to cart button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
            disabled={!product.inStock}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm text-gray-600">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          {product.isOnSale && product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            {formatPrice(product.discountedPrice || product.price)}
          </span>
        </div>

        {/* Stock status */}
        <div className="mb-4">
          {product.inStock ? (
            <span className="text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4 inline mr-1" /> En stock ({product.stockQuantity})
            </span>
          ) : (
            <span className="text-red-600 text-sm font-medium">
              <XCircle className="w-4 h-4 inline mr-1" /> Rupture de stock
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
            disabled={!product.inStock}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 inline mr-1" /> Ajouter
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product); }}
            className={`px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg ${
              isInWishlist(product.id)
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:text-red-500 hover:border-red-300'
            }`}
          >
            {isInWishlist(product.id) ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  ));



  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Nos <span className="text-gradient">Produits</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Decouvrez notre collection complete de produits de qualite
            </p>
            <div className="section-divider mt-6" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:text-primary-600 transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <FilterSidebar
                inputValues={inputValues}
                categories={categories}
                brands={brands}
                handleInputChange={handleInputChange}
                handleFilterChange={handleFilterChange}
                applyFilters={applyFilters}
                clearFilters={clearFilters}
                isSearching={isSearching}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {loading ? 'Chargement...' : `${pagination.totalItems || 0} produits trouvés`}
                  </h2>
                  {!loading && pagination.totalItems > 0 && (
                    <p className="text-gray-600">
                      Page {pagination.currentPage} sur {pagination.totalPages}
                    </p>
                  )}
                </div>

                {/* Active Filters */}
                {Object.values(filters).some(value => value !== '' && value !== false) && (
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                        Recherche: {filters.search}
                      </span>
                    )}
                    {filters.category && (
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm">
                        Catégorie: {categories.find(c => c.id === filters.category)?.name}
                      </span>
                    )}
                    {filters.featured && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Vedettes
                      </span>
                    )}
                    {filters.onSale && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Promotions
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                      <div className="bg-gray-200 h-6 rounded mb-2"></div>
                      <div className="bg-gray-200 h-4 rounded mb-4"></div>
                      <div className="bg-gray-200 h-10 rounded"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <Frown className="w-8 h-8 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Oups !</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && products.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="flex items-center gap-2">
                        {pagination.currentPage > 1 && (
                          <Link
                            to={`?${new URLSearchParams({
                              ...Object.fromEntries(searchParams),
                              page: pagination.currentPage - 1
                            })}`}
                            className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 text-gray-700 hover:text-primary-600 rounded-xl transition-all duration-300"
                          >
                            ← Précédent
                          </Link>
                        )}

                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const page = i + 1;
                          const isCurrent = page === pagination.currentPage;
                          
                          return (
                            <Link
                              key={page}
                              to={`?${new URLSearchParams({
                                ...Object.fromEntries(searchParams),
                                page
                              })}`}
                              className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                                  : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 text-gray-700 hover:text-primary-600'
                              }`}
                            >
                              {page}
                            </Link>
                          );
                        })}

                        {pagination.currentPage < pagination.totalPages && (
                          <Link
                            to={`?${new URLSearchParams({
                              ...Object.fromEntries(searchParams),
                              page: pagination.currentPage + 1
                            })}`}
                            className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 text-gray-700 hover:text-primary-600 rounded-xl transition-all duration-300"
                          >
                            Suivant →
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!loading && !error && products.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600 mb-6">
                    Essayez de modifier vos filtres ou de rechercher autre chose
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage; 