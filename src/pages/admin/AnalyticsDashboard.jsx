import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const PRESETS = [
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '3 mois' },
  { value: '365', label: '1 an' },
];

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');

  // Input state (what the user is currently editing)
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Applied state (what's actually fetched and displayed)
  const [applied, setApplied] = useState({ period: '30', startDate: '', endDate: '' });

  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Active filter label displayed above charts
  const activeFilterLabel = useMemo(() => {
    if (applied.startDate && applied.endDate) {
      return `${new Date(applied.startDate).toLocaleDateString('fr-FR')} → ${new Date(applied.endDate).toLocaleDateString('fr-FR')}`;
    }
    const labels = { '7': '7 derniers jours', '30': '30 derniers jours', '90': '3 derniers mois', '365': 'Cette année' };
    return labels[applied.period] || `${applied.period} derniers jours`;
  }, [applied]);

  // Whether the custom date form has changed vs what's applied
  const hasPendingCustomRange = startDate && endDate && (
    startDate !== applied.startDate || endDate !== applied.endDate
  );

  // Fetch sales analytics
  const fetchSalesAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (applied.startDate && applied.endDate) {
        params.append('startDate', applied.startDate);
        params.append('endDate', applied.endDate);
      } else {
        params.append('period', applied.period);
      }
      const response = await api.get(`/admin/analytics/sales?${params}`);
      setSalesData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching sales analytics:', error);
      toast.error('Erreur lors du chargement des analytics de vente');
    } finally {
      setLoading(false);
    }
  }, [applied]);

  // Fetch customer analytics
  const fetchCustomerAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (applied.startDate && applied.endDate) {
        params.append('startDate', applied.startDate);
        params.append('endDate', applied.endDate);
      } else {
        params.append('period', applied.period);
      }
      const response = await api.get(`/admin/analytics/customers?${params}`);
      setCustomerData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching customer analytics:', error);
      toast.error('Erreur lors du chargement des analytics clients');
    } finally {
      setLoading(false);
    }
  }, [applied]);

  // Fetch product analytics
  const fetchProductAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period: applied.period });
      const response = await api.get(`/admin/analytics/products?${params}`);
      setProductData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching product analytics:', error);
      toast.error('Erreur lors du chargement des analytics produits');
    } finally {
      setLoading(false);
    }
  }, [applied]);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'sales':
        fetchSalesAnalytics();
        break;
      case 'customers':
        fetchCustomerAnalytics();
        break;
      case 'products':
        fetchProductAnalytics();
        break;
      default:
        break;
    }
  }, [activeTab, fetchSalesAnalytics, fetchCustomerAnalytics, fetchProductAnalytics]);

  // Handle preset button click — auto-applies immediately
  const handlePresetClick = (value) => {
    setPeriod(value);
    setStartDate('');
    setEndDate('');
    setApplied({ period: value, startDate: '', endDate: '' });
  };

  // Handle custom range apply
  const handleApplyCustomRange = () => {
    if (!startDate || !endDate) {
      toast.error('Veuillez sélectionner une date de début et de fin');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }
    setApplied({ period, startDate, endDate });
  };

  // Reset to default
  const handleReset = () => {
    setPeriod('30');
    setStartDate('');
    setEndDate('');
    setApplied({ period: '30', startDate: '', endDate: '' });
  };

  // Export report
  const exportReport = useCallback(async (reportType) => {
    try {
      setExportLoading(true);
      const response = await api.post('/admin/analytics/export', {
        reportType,
        startDate: applied.startDate || undefined,
        endDate: applied.endDate || undefined,
        format: 'csv'
      });

      const { data, filename } = response.data.data;
      if (data.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${data.length} enregistrements exportés avec succès`);
    } catch (error) {
      console.error('❌ Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExportLoading(false);
    }
  }, [applied]);

  // Memoized chart data
  const salesChartData = useMemo(() => {
    if (!salesData?.dailySales) return [];
    return salesData.dailySales.map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-FR'),
      revenue: parseFloat(item.revenue),
      orders: item.orders
    }));
  }, [salesData]);

  const customerChartData = useMemo(() => {
    if (!customerData?.registrationTrends) return [];
    return customerData.registrationTrends.map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-FR'),
      registrations: item.registrations
    }));
  }, [customerData]);

  const salesByStatusData = useMemo(() => {
    if (!salesData?.salesByStatus) return [];
    return salesData.salesByStatus.map((item, index) => ({
      name: item.status,
      value: parseInt(item.count),
      color: COLORS[index % COLORS.length]
    }));
  }, [salesData]);

  const topProductsData = useMemo(() => {
    if (!productData?.topProducts) return [];
    return productData.topProducts.slice(0, 5).map(item => ({
      name: item.product.name,
      revenue: parseFloat(item.totalRevenue),
      sold: item.totalSold
    }));
  }, [productData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 loading-skeleton w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6">
                  <div className="h-4 loading-skeleton w-1/2 mb-2"></div>
                  <div className="h-8 loading-skeleton w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <div className="h-6 loading-skeleton w-1/3 mb-4"></div>
              <div className="h-64 loading-skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Rapports</h1>
          <p className="text-gray-600">Analysez vos performances commerciales en détail</p>
        </div>

        {/* Filters */}
        <div className="card-glass p-6 mb-6 space-y-4">
          {/* Preset buttons row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600 mr-1">Période :</span>
            {PRESETS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePresetClick(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  applied.period === value && !applied.startDate
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom date range row */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-sm !py-2"
              />
            </div>
            <span className="text-gray-400 pb-2">→</span>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-sm !py-2"
              />
            </div>
            <button
              onClick={handleApplyCustomRange}
              disabled={!startDate || !endDate}
              className={`btn-primary text-sm ${
                hasPendingCustomRange
                  ? 'ring-2 ring-primary-300'
                  : 'disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Appliquer
            </button>
            {(startDate || endDate || applied.period !== '30') && (
              <button
                onClick={handleReset}
                className="btn-outline text-sm"
              >
                Réinitialiser
              </button>
            )}

            {/* Export button pushed to the right */}
            <div className="ml-auto">
              <button
                onClick={() => exportReport(activeTab)}
                disabled={exportLoading}
                className="btn-primary text-sm !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 disabled:opacity-50"
              >
                {exportLoading ? 'Export...' : 'Exporter CSV'}
              </button>
            </div>
          </div>

          {/* Active filter badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Affichage :</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              applied.startDate ? 'bg-indigo-100 text-indigo-700' : 'bg-primary-50 text-primary-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block"></span>
              {activeFilterLabel}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'sales', name: 'Ventes', icon: '📊' },
                { id: 'customers', name: 'Clients', icon: '👥' },
                { id: 'products', name: 'Produits', icon: '📦' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sales Analytics */}
        {activeTab === 'sales' && salesData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-hover p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.summary.totalRevenue} DH</p>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/10 to-green-600/10">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.summary.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.summary.averageOrderValue} DH</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Chart */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} DH`, 'Revenus']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Status */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par statut</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Days */}
            <div className="card overflow-hidden">
              <div className="p-6 pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilleurs jours de vente</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.topDays.map((day, index) => (
                      <tr key={index} className="hover:bg-primary-50/30 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(day.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {day.revenue} DH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customer Analytics */}
        {activeTab === 'customers' && customerData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-hover p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.customerRetention.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/10 to-green-600/10">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clients fidèles</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.customerRetention.returningCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="card-hover p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taux de fidélisation</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.customerRetention.retentionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trends */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inscriptions clients</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="registrations" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Customers */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilleurs clients</h3>
                <div className="space-y-4">
                  {customerData.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-primary-50/30 transition-colors duration-200">
                      <div>
                        <p className="font-medium text-gray-900">{customer.customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{customer.totalSpent} DH</p>
                        <p className="text-sm text-gray-600">{customer.orderCount} commande(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Analytics */}
        {activeTab === 'products' && productData && (
          <div className="space-y-6">
            {/* Top Products Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les plus vendus</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} DH`, 'Revenus']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Low Stock Products */}
            <div className="card overflow-hidden">
              <div className="p-6 pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits en stock faible</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productData.lowStockProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-primary-50/30 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{product.price} DH</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stockQuantity === 0
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}>
                            {product.stockQuantity} unité(s)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
