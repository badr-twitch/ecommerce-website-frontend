import React, { useState, useEffect, useCallback } from 'react';
import { Star, TrendingUp, TrendingDown, Users, MessageSquare, ThumbsUp, ThumbsDown, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ReviewAnalytics = ({ productId = null, timeRange = '30' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        timeRange: currentTimeRange
      });

      if (customDates.startDate && customDates.endDate) {
        params.append('startDate', customDates.startDate);
        params.append('endDate', customDates.endDate);
      }

      if (productId) {
        params.append('productId', productId);
      }

      const response = await api.get(`/reviews/analytics?${params}`);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching review analytics:', error);
      toast.error('Erreur lors du chargement des analyses');
    } finally {
      setLoading(false);
    }
  }, [timeRange, customDates, productId]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((newRange) => {
    setCurrentTimeRange(newRange);
    if (newRange !== 'custom') {
      setCustomDates({ startDate: '', endDate: '' });
    }
  }, []);

  // Handle custom date change
  const handleCustomDateChange = useCallback((field, value) => {
    setCustomDates(prev => ({ ...prev, [field]: value }));
  }, []);

  // Apply custom dates
  const applyCustomDates = useCallback(() => {
    if (!customDates.startDate || !customDates.endDate) {
      toast.error('Veuillez sélectionner une date de début et de fin');
      return;
    }
    
    if (new Date(customDates.startDate) > new Date(customDates.endDate)) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }
    
    fetchAnalytics();
  }, [customDates, fetchAnalytics]);

  // Load data on component mount and parameter changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6'
  };

  // Pie chart colors
  const pieColors = [chartColors.primary, chartColors.secondary, chartColors.accent, chartColors.danger, chartColors.purple];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-gray-500">Aucune donnée d'analyse disponible</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {productId ? 'Analyses des avis du produit' : 'Analyses des avis'}
          </h2>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-3">
            <select
              value={currentTimeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="365">1 an</option>
              <option value="custom">Période personnalisée</option>
            </select>
            
            {currentTimeRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDates.startDate}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-500">à</span>
                <input
                  type="date"
                  value={customDates.endDate}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={applyCustomDates}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {analytics.totalReviews?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-primary-700">Total des avis</div>
              </div>
            </div>
            {analytics.reviewsGrowth && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analytics.reviewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.reviewsGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(analytics.reviewsGrowth)}% vs période précédente</span>
              </div>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-green-700">Note moyenne</div>
              </div>
            </div>
            {analytics.ratingChange && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analytics.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.ratingChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{analytics.ratingChange >= 0 ? '+' : ''}{analytics.ratingChange.toFixed(1)} vs période précédente</span>
              </div>
            )}
          </div>

          <div className="bg-secondary-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-600">
                  {analytics.uniqueReviewers?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-secondary-700">Rédacteurs uniques</div>
              </div>
            </div>
            {analytics.reviewersGrowth && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analytics.reviewersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.reviewersGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(analytics.reviewersGrowth)}% vs période précédente</span>
              </div>
            )}
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.engagementRate?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-orange-700">Taux d'engagement</div>
              </div>
            </div>
            <div className="text-sm text-orange-600 mt-2">
              {analytics.totalVotes?.toLocaleString() || 0} votes utiles
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Review Volume Over Time */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume des avis dans le temps</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.reviewsOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  formatter={(value) => [value, 'Avis']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={chartColors.primary} 
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Distribution */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des notes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.ratingDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rating, count }) => `${rating}★ (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.ratingDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Avis']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Review Sentiment Trend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du sentiment</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.sentimentTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[-1, 1]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  formatter={(value) => [value.toFixed(2), 'Sentiment']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke={chartColors.secondary} 
                  strokeWidth={2}
                  dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Review Categories */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories d'avis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.reviewCategories || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Avis']} />
                <Bar dataKey="count" fill={chartColors.accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Review Quality Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques de qualité</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avis avec médias</span>
                <span className="font-medium">{analytics.reviewsWithMedia || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Achats vérifiés</span>
                <span className="font-medium">{analytics.verifiedPurchases || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avis détaillés (&gt;100 mots)</span>
                <span className="font-medium">{analytics.detailedReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taux de réponse</span>
                <span className="font-medium">{analytics.responseRate || 0}%</span>
              </div>
            </div>
          </div>

          {/* Trustpilot Integration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intégration Trustpilot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avis synchronisés</span>
                <span className="font-medium">{analytics.trustpilotSynced || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En attente de sync</span>
                <span className="font-medium">{analytics.trustpilotPending || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Échecs de sync</span>
                <span className="font-medium">{analytics.trustpilotFailed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dernière sync</span>
                <span className="font-medium">
                  {analytics.lastTrustpilotSync 
                    ? new Date(analytics.lastTrustpilotSync).toLocaleDateString('fr-FR')
                    : 'Jamais'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products by Reviews */}
        {!productId && analytics.topProducts && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les plus commentés</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Produit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avis</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Note moyenne</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.topProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.reviewCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= product.averageRating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({product.averageRating.toFixed(1)})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 text-sm ${
                          product.trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{Math.abs(product.trend)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewAnalytics;
