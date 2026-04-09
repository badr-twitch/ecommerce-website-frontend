import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import { Search, FolderOpen, ShoppingBag, Phone, ArrowRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await categoriesAPI.getAll();
        // Handle both response formats
        const categoriesData = response.data?.data || response.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Erreur lors du chargement des catégories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.slug?.toLowerCase().includes(query)
    );
  });

  // Default category icons if not provided
  const getCategoryIcon = (category) => {
    if (category.icon) return category.icon;
    
    // Default icons based on category name
    const iconMap = {
      'électronique': '📱',
      'mode': '👕',
      'maison': '🏠',
      'sport': '⚽',
      'beauté': '💄',
      'livres': '📚',
      'jouets': '🧸',
      'alimentation': '🍎'
    };
    
    const name = category.name?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    
    return '📦'; // Default icon
  };

  // Get category link
  const getCategoryLink = (category) => {
    if (category.slug) return `/categories/${category.slug}`;
    if (category.name) return `/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
    return '/products';
  };

  // Get product count text
  const getProductCount = (category) => {
    if (category.productCount !== undefined) {
      return `${category.productCount} produit${category.productCount > 1 ? 's' : ''}`;
    }
    if (category.count) return category.count;
    return 'Voir les produits';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-700/90"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                <FolderOpen className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Toutes nos Catégories
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Explorez notre large sélection de produits organisés par catégories
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-gray-900 placeholder-gray-500 text-lg"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Aucune catégorie trouvée
              </h2>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `Aucune catégorie ne correspond à "${searchQuery}"`
                  : 'Aucune catégorie disponible pour le moment'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    {searchQuery ? `Résultats de recherche (${filteredCategories.length})` : `Toutes les catégories (${filteredCategories.length})`}
                  </h2>
                  {searchQuery && (
                    <p className="text-gray-600 mt-2">
                      Recherche : "<strong>{searchQuery}</strong>"
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map((category, index) => (
                  <Link
                    key={category.id || category._id || index}
                    to={getCategoryLink(category)}
                    className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center"
                  >
                    {/* Category Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                      {getCategoryIcon(category)}
                    </div>

                    {/* Category Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {category.name || 'Catégorie sans nom'}
                    </h3>

                    {/* Category Description */}
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Product Count */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-primary-600 group-hover:text-secondary-600 transition-colors">
                        {getProductCount(category)}
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-primary-600 font-semibold text-sm">
                        Explorer →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Parcourez tous nos produits ou contactez-nous pour une assistance personnalisée
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products"
                className="px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5 inline mr-2" />
                Voir tous les produits
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;

