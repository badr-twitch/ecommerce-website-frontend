import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Shield, Award, TrendingUp } from 'lucide-react';

const TrustpilotWidget = ({ 
  businessUnitId = null, 
  showRating = true, 
  showBadge = true, 
  showStats = true,
  size = 'medium',
  theme = 'light'
}) => {
  const [trustpilotData, setTrustpilotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Widget sizes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // Theme variants
  const themeClasses = {
    light: 'bg-white text-gray-900 border-gray-200',
    dark: 'bg-gray-900 text-white border-gray-700',
    blue: 'bg-primary-600 text-white border-primary-700'
  };

  // Load Trustpilot data
  useEffect(() => {
    const loadTrustpilotData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch this from your backend
        // For now, we'll use mock data or environment variables
        const mockData = {
          businessUnitId: businessUnitId || process.env.REACT_APP_TRUSTPILOT_BUSINESS_UNIT_ID,
          rating: 4.7,
          totalReviews: 1247,
          reviewCount: {
            excellent: 789,
            great: 234,
            average: 156,
            poor: 45,
            bad: 23
          },
          trustScore: 9.2,
          verifiedCompany: true,
          responseRate: 98,
          responseTime: '2.4h',
          lastUpdated: new Date().toISOString()
        };

        setTrustpilotData(mockData);
      } catch (err) {
        console.error('Error loading Trustpilot data:', err);
        setError('Impossible de charger les données Trustpilot');
      } finally {
        setLoading(false);
      }
    };

    loadTrustpilotData();
  }, [businessUnitId]);

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

  // Get rating label
  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Très bien';
    if (rating >= 3.5) return 'Bien';
    if (rating >= 3.0) return 'Moyen';
    if (rating >= 2.5) return 'Passable';
    return 'Insuffisant';
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-primary-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get trust score color
  const getTrustScoreColor = (score) => {
    if (score >= 9.0) return 'text-green-600';
    if (score >= 8.0) return 'text-primary-600';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className={`animate-pulse rounded-lg border p-4 ${themeClasses[theme]}`}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-300 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trustpilotData) {
    return null; // Don't show widget if there's an error
  }

  return (
    <div className={`rounded-lg border p-4 ${themeClasses[theme]} ${sizeClasses[size]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Trustpilot</span>
        </div>
        
        {showBadge && (
          <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            <Award className="w-3 h-3" />
            <span>Entreprise vérifiée</span>
          </div>
        )}
      </div>

      {/* Rating Display */}
      {showRating && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl font-bold text-gray-900">
              {trustpilotData.rating}
            </div>
            <div>
              <div className="mb-1">
                {renderStars(trustpilotData.rating, 'md')}
              </div>
              <div className={`text-sm font-medium ${getRatingColor(trustpilotData.rating)}`}>
                {getRatingLabel(trustpilotData.rating)}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Basé sur {trustpilotData.totalReviews.toLocaleString()} avis
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {showStats && (
        <div className="mb-4">
          <div className="space-y-2">
            {[
              { label: 'Excellent', count: trustpilotData.reviewCount.excellent, color: 'bg-green-500' },
              { label: 'Très bien', count: trustpilotData.reviewCount.great, color: 'bg-primary-500' },
              { label: 'Bien', count: trustpilotData.reviewCount.average, color: 'bg-yellow-500' },
              { label: 'Passable', count: trustpilotData.reviewCount.poor, color: 'bg-orange-500' },
              { label: 'Insuffisant', count: trustpilotData.reviewCount.bad, color: 'bg-red-500' }
            ].map((item, index) => {
              const percentage = (item.count / trustpilotData.totalReviews) * 100;
              
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 min-w-[30px] text-right">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trust Score */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium">Score de confiance</span>
          </div>
          <div className={`text-lg font-bold ${getTrustScoreColor(trustpilotData.trustScore)}`}>
            {trustpilotData.trustScore}/10
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{trustpilotData.responseRate}%</div>
          <div className="text-gray-600">Taux de réponse</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{trustpilotData.responseTime}</div>
          <div className="text-gray-600">Temps de réponse</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Dernière mise à jour: {new Date(trustpilotData.lastUpdated).toLocaleDateString('fr-FR')}
        </div>
        
        <a
          href={`https://www.trustpilot.com/review/${trustpilotData.businessUnitId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 transition-colors"
        >
          <span>Voir sur Trustpilot</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Trustpilot Badge */}
      {showBadge && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Entreprise certifiée Trustpilot</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustpilotWidget;
