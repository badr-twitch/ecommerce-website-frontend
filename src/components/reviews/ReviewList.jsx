import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ReviewList = ({ productId = null, showProductInfo = true }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Filters and search
  const [filters, setFilters] = useState({
    rating: '',
    status: 'approved',
    verifiedPurchase: '',
    hasMedia: '',
    searchQuery: ''
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [pageSize, setPageSize] = useState(20);
  
  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: [],
    verifiedPurchaseCount: 0,
    mediaCount: 0
  });

  // Fetch reviews with filters
  const fetchReviews = useCallback(async (page = 1, resetPage = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        sort: sortBy,
        order: sortOrder
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      // Add product filter if specified
      if (productId) {
        params.append('productId', productId);
      }

      const response = await api.get(`/reviews?${params}`);
      
      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalReviews(response.data.data.pagination.totalReviews);
        if (resetPage) {
          setCurrentPage(1);
        } else {
          setCurrentPage(page);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, pageSize, productId]);

  // Fetch review statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/reviews/stats', {
        params: { productId }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [productId]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Handle sorting
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  // Apply filters
  const applyFilters = useCallback(() => {
    fetchReviews(1, true);
  }, [fetchReviews]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      rating: '',
      status: 'approved',
      verifiedPurchase: '',
      hasMedia: '',
      searchQuery: ''
    });
    setSortBy('newest');
    setSortOrder('desc');
    fetchReviews(1, true);
  }, [fetchReviews]);

  // Handle helpful/not helpful votes
  const handleVote = useCallback(async (reviewId, voteType) => {
    if (!user) {
      toast.error('Vous devez être connecté pour voter');
      return;
    }

    try {
      const endpoint = voteType === 'helpful' ? 'helpful' : 'not-helpful';
      const response = await api.post(`/reviews/${reviewId}/${endpoint}`);
      
      if (response.data.success) {
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? {
                  ...review,
                  helpfulVotes: response.data.data.helpfulVotes,
                  notHelpfulVotes: response.data.data.notHelpfulVotes
                }
              : review
          )
        );
        toast.success('Vote enregistré avec succès');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Erreur lors de l\'enregistrement du vote');
    }
  }, [user]);

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  // Render star rating
  const renderStars = (rating, size = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Render rating distribution chart
  const renderRatingChart = () => {
    if (!stats.ratingDistribution || stats.ratingDistribution.length === 0) {
      return <div className="text-gray-500 text-sm">Aucune donnée disponible</div>;
    }

    const maxCount = Math.max(...stats.ratingDistribution.map(d => d.count));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const data = stats.ratingDistribution.find(d => d.rating === rating);
          const count = data?.count || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 min-w-[40px]">
                <span className="text-sm text-gray-600">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 min-w-[30px] text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {productId ? 'Avis du produit' : 'Tous les avis'}
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-1">
              {renderStars(stats.averageRating, 'lg')}
            </div>
            <div className="text-sm text-gray-600">
              {stats.totalReviews} avis au total
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
            <div className="text-sm text-blue-700">Total des avis</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.verifiedPurchaseCount}</div>
            <div className="text-sm text-green-700">Achats vérifiés</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.mediaCount}</div>
            <div className="text-sm text-purple-700">Avec médias</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-yellow-700">Note moyenne</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Répartition des notes</h3>
          {renderRatingChart()}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les avis..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les notes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>

          {/* Verified Purchase Filter */}
          <div>
            <select
              value={filters.verifiedPurchase}
              onChange={(e) => handleFilterChange('verifiedPurchase', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les avis</option>
              <option value="true">Achats vérifiés</option>
              <option value="false">Achats non vérifiés</option>
            </select>
          </div>

          {/* Media Filter */}
          <div>
            <select
              value={filters.hasMedia}
              onChange={(e) => handleFilterChange('hasMedia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les avis</option>
              <option value="true">Avec médias</option>
              <option value="false">Sans médias</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={applyFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Appliquer les filtres
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Afficher:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">avis par page</span>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Date
                  {sortBy === 'createdAt' && (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('rating')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Note
                  {sortBy === 'rating' && (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              {showProductInfo && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating, 'sm')}
                    <span className="text-sm text-gray-600">({review.rating})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {review.user.initials || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {review.user.name}
                      </div>
                      {review.verifiedPurchase && (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>Achat vérifié</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {showProductInfo && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.product?.name || 'N/A'}</div>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {review.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {review.content}
                    </p>
                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {review.mediaUrls.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-8 h-8 object-cover rounded border border-gray-200"
                          />
                        ))}
                        {review.mediaUrls.length > 3 && (
                          <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                            +{review.mediaUrls.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(review.id, 'helpful')}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Marquer comme utile"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{review.helpfulVotes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleVote(review.id, 'not-helpful')}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                      title="Marquer comme pas utile"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm">{review.notHelpfulVotes}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, totalReviews)} sur {totalReviews} avis
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchReviews(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchReviews(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => fetchReviews(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Reviews State */}
      {!loading && reviews.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun avis trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
