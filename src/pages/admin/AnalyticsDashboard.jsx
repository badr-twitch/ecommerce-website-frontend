import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch sales analytics
  const fetchSalesAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      } else {
        params.append('period', period);
      }
      
      const response = await api.get(`/admin/analytics/sales?${params}`);
      setSalesData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching sales analytics:', error);
      toast.error('Erreur lors du chargement des analytics de vente');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  // Fetch customer analytics
  const fetchCustomerAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      const response = await api.get(`/admin/analytics/customers?${params}`);
      setCustomerData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching customer analytics:', error);
      toast.error('Erreur lors du chargement des analytics clients');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Fetch product analytics
  const fetchProductAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      const response = await api.get(`/admin/analytics/products?${params}`);
      setProductData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching product analytics:', error);
      toast.error('Erreur lors du chargement des analytics produits');
    } finally {
      setLoading(false);
    }
  }, [period]);

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

  // Export report
  const exportReport = useCallback(async (reportType) => {
    try {
      setExportLoading(true);
      const response = await api.post('/admin/analytics/export', {
        reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format: 'csv'
      });

      // Create and download CSV
      const { data, filename } = response.data.data;
      if (data.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      // Download file
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
  }, [startDate, endDate]);

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
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
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
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
                <option value="365">1 an</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="ml-auto">
              <button
                onClick={() => exportReport(activeTab)}
                disabled={exportLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {exportLoading ? 'Export...' : 'Exporter CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
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
                      ? 'border-blue-500 text-blue-600'
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
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.summary.totalRevenue} DH</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{salesData.summary.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
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
              <div className="bg-white p-6 rounded-lg shadow">
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
              <div className="bg-white p-6 rounded-lg shadow">
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilleurs jours de vente</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.topDays.map((day, index) => (
                      <tr key={index}>
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
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.customerRetention.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clients fidèles</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.customerRetention.returningCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
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
              <div className="bg-white p-6 rounded-lg shadow">
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
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilleurs clients</h3>
                <div className="space-y-4">
                  {customerData.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
            <div className="bg-white p-6 rounded-lg shadow">
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits en stock faible</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productData.lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{product.price} DH</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stockQuantity === 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
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