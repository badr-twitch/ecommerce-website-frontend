import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, MessageCircle, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ReviewForm from './ReviewForm';

const ReviewDisplay = ({ productId, productName, productImage }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('');

  // Fetch reviews and summary
  const fetchReviews = useCallback(async (page = 1, sort = 'newest', rating = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        sort: sort
      });
      
      if (rating) {
        params.append('rating', rating);
      }

      const [reviewsResponse, summaryResponse] = await Promise.all([
        api.get(`/reviews/product/${productId}?${params}`),
        api.get(`/reviews/product/${productId}/summary`)
      ]);

      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews);
        setTotalPages(reviewsResponse.data.data.pagination.totalPages);
        setCurrentPage(page);
      }

      if (summaryResponse.data.success) {
        setReviewSummary(summaryResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Handle review submission
  const handleReviewSubmitted = useCallback(() => {
    setShowReviewForm(false);
    fetchReviews(1, sortBy, filterRating);
    toast.success('Votre avis a été soumis et sera publié après modération');
  }, [fetchReviews, sortBy, filterRating]);

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
        // Update local state
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

  // Handle sorting and filtering
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    fetchReviews(1, newSort, filterRating);
  }, [fetchReviews, filterRating]);

  const handleRatingFilter = useCallback((rating) => {
    const newRating = filterRating === rating ? '' : rating;
    setFilterRating(newRating);
    fetchReviews(1, sortBy, newRating);
  }, [fetchReviews, sortBy]);

  // Load reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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

  // Render rating distribution
  const renderRatingDistribution = () => {
    if (!reviewSummary?.ratingDistribution) return null;

    const total = reviewSummary.totalReviews;
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewSummary.ratingDistribution.find(d => d.rating === rating)?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 min-w-[60px]">
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Review Summary Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {reviewSummary?.averageRating || '0.0'}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(parseFloat(reviewSummary?.averageRating || 0), 'lg')}
              </div>
              <div className="text-sm text-gray-600">
                {reviewSummary?.totalReviews || 0} avis
              </div>
            </div>
            
            <div className="ml-6">
              {renderRatingDistribution()}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Laisser un avis
            </button>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Partagez votre expérience</div>
              <div className="text-xs text-gray-500">Aidez d'autres clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              productId={productId}
              productName={productName}
              onSubmit={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="p-6">
        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filtrer par note:</span>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilter(rating.toString())}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterRating === rating.toString()
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating}★
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="rating">Note</option>
              <option value="helpful">Plus utiles</option>
            </select>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {review.user.initials || 'U'}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium text-gray-900">
                        {review.user.name}
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating, 'sm')}
                      </div>
                      {review.verifiedPurchase && (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Achat vérifié</span>
                        </div>
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h4>

                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.content}
                    </p>

                    {/* Review Media */}
                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.mediaUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Review media ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    )}

                    {/* Review Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleVote(review.id, 'helpful')}
                          className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">Utile ({review.helpfulVotes})</span>
                        </button>
                        
                        <button
                          onClick={() => handleVote(review.id, 'not-helpful')}
                          className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">Pas utile ({review.notHelpfulVotes})</span>
                        </button>
                      </div>

                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun avis pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Soyez le premier à partager votre expérience avec ce produit !
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Laisser un avis
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchReviews(currentPage - 1, sortBy, filterRating)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            
            <button
              onClick={() => fetchReviews(currentPage + 1, sortBy, filterRating)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDisplay;
