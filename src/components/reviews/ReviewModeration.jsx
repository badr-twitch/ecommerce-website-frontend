import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, XCircle, Flag, Eye, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    productId: '',
    hasMedia: ''
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [pageSize, setPageSize] = useState(20);
  
  // Selected reviews for bulk actions
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Moderation modal
  const [moderationModal, setModerationModal] = useState({
    show: false,
    review: null,
    action: '',
    notes: ''
  });
  
  // Trustpilot sync
  const [syncingTrustpilot, setSyncingTrustpilot] = useState(false);

  // Fetch reviews for moderation
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

      const response = await api.get(`/reviews/admin?${params}`);
      
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
  }, [filters, sortBy, sortOrder, pageSize]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      status: '',
      rating: '',
      productId: '',
      hasMedia: ''
    });
    setSortBy('createdAt');
    setSortOrder('desc');
    fetchReviews(1, true);
  }, [fetchReviews]);

  // Handle review selection
  const handleReviewSelection = useCallback((reviewId, checked) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(reviewId);
      } else {
        newSet.delete(reviewId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedReviews(new Set(reviews.map(r => r.id)));
      setSelectAll(true);
    } else {
      setSelectedReviews(new Set());
      setSelectAll(false);
    }
  }, [reviews]);

  // Open moderation modal
  const openModerationModal = useCallback((review, action) => {
    setModerationModal({
      show: true,
      review,
      action,
      notes: ''
    });
  }, []);

  // Close moderation modal
  const closeModerationModal = useCallback(() => {
    setModerationModal({
      show: false,
      review: null,
      action: '',
      notes: ''
    });
  }, []);

  // Handle moderation action
  const handleModerationAction = useCallback(async () => {
    const { review, action, notes } = moderationModal;
    
    try {
      const response = await api.put(`/reviews/admin/${review.id}/status`, {
        status: action,
        moderationNotes: notes
      });
      
      if (response.data.success) {
        toast.success(`Avis ${action === 'approved' ? 'approuvé' : action === 'rejected' ? 'rejeté' : 'signalé'} avec succès`);
        
        // Update local state
        setReviews(prev => 
          prev.map(r => 
            r.id === review.id 
              ? { ...r, status: action, moderationNotes: notes }
              : r
          )
        );
        
        // Remove from selection
        setSelectedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(review.id);
          return newSet;
        });
        
        closeModerationModal();
      }
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Erreur lors de la modération de l\'avis');
    }
  }, [moderationModal]);

  // Bulk moderate reviews
  const bulkModerate = useCallback(async (action) => {
    if (selectedReviews.size === 0) {
      toast.error('Aucun avis sélectionné');
      return;
    }

    try {
      const promises = Array.from(selectedReviews).map(reviewId => 
        api.put(`/reviews/admin/${reviewId}/status`, {
          status: action,
          moderationNotes: `Action en masse: ${action}`
        })
      );

      await Promise.all(promises);
      
      toast.success(`${selectedReviews.size} avis ${action === 'approved' ? 'approuvés' : action === 'rejected' ? 'rejetés' : 'signalés'} avec succès`);
      
      // Update local state
      setReviews(prev => 
        prev.map(r => 
          selectedReviews.has(r.id)
            ? { ...r, status: action, moderationNotes: `Action en masse: ${action}` }
            : r
        )
      );
      
      // Clear selection
      setSelectedReviews(new Set());
      setSelectAll(false);
      
      // Refresh data
      fetchReviews(currentPage);
    } catch (error) {
      console.error('Error bulk moderating reviews:', error);
      toast.error('Erreur lors de la modération en masse');
    }
  }, [selectedReviews, currentPage, fetchReviews]);

  // Sync to Trustpilot
  const syncToTrustpilot = useCallback(async () => {
    try {
      setSyncingTrustpilot(true);
      const response = await api.post('/reviews/admin/sync-trustpilot');
      
      if (response.data.success) {
        toast.success('Synchronisation Trustpilot terminée avec succès');
        // Refresh data to show updated Trustpilot status
        fetchReviews(currentPage);
      }
    } catch (error) {
      console.error('Error syncing to Trustpilot:', error);
      toast.error('Erreur lors de la synchronisation Trustpilot');
    } finally {
      setSyncingTrustpilot(false);
    }
  }, [currentPage, fetchReviews]);

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Update select all when reviews change
  useEffect(() => {
    if (reviews.length > 0 && selectedReviews.size === reviews.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [reviews, selectedReviews]);

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

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800'
    };

    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      flagged: 'Signalé'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Get Trustpilot status badge
  const getTrustpilotBadge = (status) => {
    const badges = {
      not_synced: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      synced: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const labels = {
      not_synced: 'Non synchronisé',
      pending: 'En cours',
      synced: 'Synchronisé',
      failed: 'Échec'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
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
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Modération des avis</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={syncToTrustpilot}
              disabled={syncingTrustpilot}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncingTrustpilot ? 'animate-spin' : ''}`} />
              Sync Trustpilot
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {reviews.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-blue-700">En attente</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-green-700">Approuvés</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {reviews.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-red-700">Rejetés</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {reviews.filter(r => r.status === 'flagged').length}
            </div>
            <div className="text-sm text-orange-700">Signalés</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
              <option value="flagged">Signalé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Achat vérifié</label>
            <select
              value={filters.verifiedPurchase}
              onChange={(e) => handleFilterChange('verifiedPurchase', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Vérifiés</option>
              <option value="false">Non vérifiés</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avec médias</label>
            <select
              value={filters.hasMedia}
              onChange={(e) => handleFilterChange('hasMedia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Avec médias</option>
              <option value="false">Sans médias</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Appliquer
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.size > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedReviews.size} avis sélectionné(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkModerate('approved')}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approuver
              </button>
              <button
                onClick={() => bulkModerate('rejected')}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
              <button
                onClick={() => bulkModerate('flagged')}
                className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Date
                  {sortBy === 'createdAt' && (
                    sortOrder === 'asc' ? '↑' : '↓'
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
                    sortOrder === 'asc' ? '↑' : '↓'
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trustpilot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedReviews.has(review.id)}
                    onChange={(e) => handleReviewSelection(review.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
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
                      <div className="text-sm text-gray-500">
                        {review.user.email}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{review.product?.name || 'N/A'}</div>
                </td>
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
                  {getStatusBadge(review.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {getTrustpilotBadge(review.trustpilotStatus)}
                    {review.trustpilotId && (
                      <a
                        href={`https://www.trustpilot.com/review/${review.trustpilotId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Voir
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModerationModal(review, 'approved')}
                      disabled={review.status === 'approved'}
                      className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approuver"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openModerationModal(review, 'rejected')}
                      disabled={review.status === 'rejected'}
                      className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Rejeter"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openModerationModal(review, 'flagged')}
                      disabled={review.status === 'flagged'}
                      className="p-1 text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Signaler"
                    >
                      <Flag className="w-4 h-4" />
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

      {/* Moderation Modal */}
      {moderationModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {moderationModal.action === 'approved' ? 'Approuver l\'avis' :
               moderationModal.action === 'rejected' ? 'Rejeter l\'avis' :
               'Signaler l\'avis'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Êtes-vous sûr de vouloir {moderationModal.action === 'approved' ? 'approuver' :
                moderationModal.action === 'rejected' ? 'rejeter' :
                'signaler'} cet avis ?
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-gray-900 mb-1">
                  {moderationModal.review?.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {moderationModal.review?.content}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes de modération (optionnel)
              </label>
              <textarea
                value={moderationModal.notes}
                onChange={(e) => setModerationModal(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajoutez des notes sur la décision..."
              />
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeModerationModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleModerationAction}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  moderationModal.action === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                  moderationModal.action === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {moderationModal.action === 'approved' ? 'Approuver' :
                 moderationModal.action === 'rejected' ? 'Rejeter' :
                 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
