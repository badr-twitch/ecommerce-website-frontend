import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../services/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Filters from URL
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async (categoryId) => {
    try {
      const params = {
        category: categoryId,
        page,
        limit: 12,
        sort,
        order
      };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [page, sort, order, minPrice, maxPrice]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await categoriesAPI.getBySlug(slug);
        const cat = data.category;
        setCategory(cat);
        await fetchProducts(cat.id);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Catégorie non trouvée');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, fetchProducts]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    // Reset to page 1 when filters change
    if (!newParams.page) params.delete('page');
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    updateFilters({ sort: newSort });
  };

  const handleOrderChange = (newOrder) => {
    setOrder(newOrder);
    updateFilters({ order: newOrder });
  };

  const handlePriceFilter = () => {
    updateFilters({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage > 1 ? String(newPage) : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Catégorie non trouvée'}</h1>
        <Link to="/categories" className="btn-primary">
          Voir toutes les catégories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-600">Accueil</Link>
          <span className="mx-2">/</span>
          <Link to="/categories" className="hover:text-primary-600">Catégories</Link>
          <span className="mx-2">/</span>
          {category.parent && (
            <>
              <Link to={`/categories/${category.parent.slug}`} className="hover:text-primary-600">
                {category.parent.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">{pagination.totalItems} produit{pagination.totalItems !== 1 ? 's' : ''}</p>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sous-catégories</h2>
            <div className="flex flex-wrap gap-3">
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/categories/${sub.slug}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 shadow-sm"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600 font-medium">Trier:</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="select py-2 text-sm cursor-pointer"
              >
                <option value="createdAt">Plus récents</option>
                <option value="name">Nom</option>
                <option value="price">Prix</option>
                <option value="rating">Avis</option>
              </select>
            </div>

            {/* Order */}
            <label htmlFor="order-select" className="sr-only">Ordre de tri</label>
            <select
              id="order-select"
              value={order}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="select py-2 text-sm cursor-pointer"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>

            {/* Price range */}
            <div className="flex items-center gap-2">
              <label htmlFor="min-price" className="sr-only">Prix minimum</label>
              <input
                id="min-price"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min DH"
                className="input w-24 py-2 text-sm"
              />
              <span className="text-gray-400">-</span>
              <label htmlFor="max-price" className="sr-only">Prix maximum</label>
              <input
                id="max-price"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max DH"
                className="input w-24 py-2 text-sm"
              />
              <button
                onClick={handlePriceFilter}
                className="btn-primary py-2 px-4 text-sm cursor-pointer"
              >
                Filtrer
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Aucun produit trouvé dans cette catégorie</p>
            <Link to="/products" className="btn-primary">
              Voir tous les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const discountedPrice = product.isOnSale && product.salePercentage
                ? (product.price * (1 - product.salePercentage / 100)).toFixed(2)
                : null;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100 relative">
                    <img
                      src={product.mainImage || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.isOnSale && product.salePercentage > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{product.salePercentage}%
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        Vedette
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {discountedPrice || product.price} DH
                      </span>
                      {discountedPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.price} DH
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Préc.
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        p === page
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow-primary'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Suiv.
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
