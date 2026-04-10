import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, formatPrice } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Star, Search, Filter, SlidersHorizontal, Heart, ShoppingCart, CheckCircle, XCircle, Frown, ChevronLeft, ChevronRight, ArrowUpDown, Package } from 'lucide-react';
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
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-soft sticky top-24">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
          <SlidersHorizontal className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
      </div>
      <button
        onClick={clearFilters}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium cursor-pointer transition-colors duration-200"
      >
        Réinitialiser
      </button>
    </div>

    {/* Search */}
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Recherche</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={inputValues.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Rechercher..."
          className="input pl-10"
        />
      </div>
    </div>

    {/* Category */}
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
      <select
        value={inputValues.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
        className="select cursor-pointer"
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
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Marque</label>
        <select
          value={inputValues.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="select cursor-pointer"
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
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (DH)</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={inputValues.minPrice}
          onChange={(e) => handleInputChange('minPrice', e.target.value)}
          placeholder="Min"
          className="input"
        />
        <input
          type="number"
          value={inputValues.maxPrice}
          onChange={(e) => handleInputChange('maxPrice', e.target.value)}
          placeholder="Max"
          className="input"
        />
      </div>
    </div>

    {/* Sort */}
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Trier par</label>
      <select
        value={inputValues.sort}
        onChange={(e) => handleFilterChange('sort', e.target.value)}
        className="select cursor-pointer"
      >
        <option value="createdAt">Plus récents</option>
        <option value="name">Nom</option>
        <option value="price">Prix</option>
        <option value="rating">Note</option>
      </select>
    </div>

    {/* Order */}
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ordre</label>
      <select
        value={inputValues.order}
        onChange={(e) => handleFilterChange('order', e.target.value)}
        className="select cursor-pointer"
      >
        <option value="desc">Décroissant</option>
        <option value="asc">Croissant</option>
      </select>
    </div>

    {/* Checkboxes */}
    <div className="space-y-3 mb-6">
      <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer">
        <input
          type="checkbox"
          checked={inputValues.featured}
          onChange={(e) => handleFilterChange('featured', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700">Produits vedettes</span>
      </label>
      <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-primary-50/50 transition-colors duration-200 cursor-pointer">
        <input
          type="checkbox"
          checked={inputValues.onSale}
          onChange={(e) => handleFilterChange('onSale', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700">En promotion</span>
      </label>
    </div>

    {/* Apply Filters Button */}
    <button
      onClick={applyFilters}
      disabled={isSearching}
      className="btn-primary w-full cursor-pointer flex items-center justify-center gap-2"
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
      className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-white/60 hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.mainImage || product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3" /> Vedette
            </span>
          )}
          {product.isOnSale && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
              -{product.salePercentage}%
            </span>
          )}
        </div>

        {/* Quick action buttons on hover */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product); }}
            className={`p-2.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer ${
              isInWishlist(product.id)
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className="w-4 h-4" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
            disabled={!product.inStock}
            className="p-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Category tag */}
        {product.category && (
          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
            {product.category.name}
          </span>
        )}

        <h3 className="text-base font-bold text-gray-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Price + Stock row */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            {product.isOnSale && product.originalPrice && (
              <span className="text-sm text-gray-400 line-through block">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.discountedPrice || product.price)}
            </span>
          </div>
          <div>
            {product.inStock ? (
              <span className="badge-success text-xs">
                <CheckCircle className="w-3 h-3 mr-1" /> En stock
              </span>
            ) : (
              <span className="badge-danger text-xs">
                <XCircle className="w-3 h-3 mr-1" /> Épuisé
              </span>
            )}
          </div>
        </div>

        {/* Add to cart CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
          disabled={!product.inStock}
          className="btn-primary w-full mt-4 cursor-pointer text-sm py-2.5"
        >
          <ShoppingCart className="w-4 h-4 mr-1.5" /> Ajouter au panier
        </button>
      </div>
    </div>
  ));



  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <section className="pt-10 pb-6 lg:pt-14 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Nos <span className="text-gradient">Produits</span>
            </h1>
            <p className="text-base lg:text-lg text-gray-500 max-w-xl mx-auto">
              Decouvrez notre collection complete de produits de qualite
            </p>
            <div className="section-divider mt-5" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline w-full cursor-pointer flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
            <div className="flex-1 min-w-0">
              {/* Results Toolbar */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {loading ? 'Chargement...' : `${pagination.totalItems || 0} produits trouvés`}
                    </p>
                    {!loading && pagination.totalItems > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Page {pagination.currentPage} sur {pagination.totalPages}
                      </p>
                    )}
                  </div>

                  {/* Active Filters Tags */}
                  {Object.values(filters).some(value => value !== '' && value !== false) && (
                    <div className="flex flex-wrap gap-1.5">
                      {filters.search && (
                        <span className="badge-primary">
                          Recherche: {filters.search}
                        </span>
                      )}
                      {filters.category && (
                        <span className="badge-secondary">
                          {categories.find(c => c.id === filters.category)?.name}
                        </span>
                      )}
                      {filters.featured && (
                        <span className="badge-warning">Vedettes</span>
                      )}
                      {filters.onSale && (
                        <span className="badge-danger">Promotions</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/60 animate-pulse">
                      <div className="bg-gray-200 h-56" />
                      <div className="p-5 space-y-3">
                        <div className="bg-gray-200 h-3 rounded w-1/3" />
                        <div className="bg-gray-200 h-5 rounded w-3/4" />
                        <div className="bg-gray-200 h-4 rounded w-1/2" />
                        <div className="bg-gray-200 h-10 rounded-xl mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="card-glass p-12 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Frown className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Oups !</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-primary cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && products.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                      <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-1.5">
                        {pagination.currentPage > 1 && (
                          <Link
                            to={`?${new URLSearchParams({
                              ...Object.fromEntries(searchParams),
                              page: pagination.currentPage - 1
                            })}`}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200"
                          >
                            <ChevronLeft className="w-4 h-4" /> Préc.
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
                              className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow-primary'
                                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
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
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200"
                          >
                            Suiv. <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!loading && !error && products.length === 0 && (
                <div className="card-glass p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Essayez de modifier vos filtres ou de rechercher autre chose
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary cursor-pointer"
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