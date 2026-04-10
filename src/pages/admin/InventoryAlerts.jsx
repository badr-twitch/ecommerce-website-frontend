import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Settings, AlertTriangle, Package, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// FIXED: Create a stable image component to prevent vibration
const StableImage = React.memo(({ src, alt, width = 40, height = 40, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div 
      className={`rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        maxWidth: `${width}px`,
        maxHeight: `${height}px`
      }}
    >
      <img 
        src={imageError ? '/placeholder.png' : (src || '/placeholder.png')} 
        alt={alt}
        className="w-full h-full object-cover"
        width={width}
        height={height}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden' // Prevent flickering
        }}
      />
    </div>
  );
});

StableImage.displayName = 'StableImage';

// FIXED: Completely isolated table component with aggressive memoization
const InventoryTable = React.memo(({ alerts, onPlusClick, onSettingsClick, getStockStatusColor, getStockStatusText }) => {
  // Add render counter for debugging
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log(`🔄 InventoryTable rendered ${renderCount.current} times with ${alerts.length} alerts`);

  // FIXED: Memoize each row individually
  const renderRow = useCallback((product, index) => (
    <tr key={product.id} className="admin-hover-transition hover:bg-primary-50/30 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="admin-flex-container flex items-center">
          {/* FIXED: Use StableImage component with admin CSS classes */}
          <StableImage 
            src={product.imageUrl} 
            alt={product.name}
            width={40}
            height={40}
            className="mr-3 admin-image-container"
          />
          <div>
            <div className="admin-text text-sm font-medium text-gray-900">{product.name}</div>
            <div className="admin-text text-sm text-gray-500">SKU: {product.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.category?.name || 'Non catégorisé'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {product.stockQuantity}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.minStockLevel}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`admin-badge px-2.5 py-1 rounded-full text-xs font-medium ${
          product.stockQuantity === 0 ? 'badge-danger' : product.stockQuantity <= product.minStockLevel ? 'badge-warning' : 'badge-success'
        }`}>
          {getStockStatusText(product)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="admin-flex-container flex space-x-2">
          <button
            onClick={() => onPlusClick(product)}
            className="admin-button text-primary-600 hover:text-primary-900 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Mettre à jour le stock"
          >
            <Plus className="w-4 h-4 admin-icon" />
          </button>
          <button
            onClick={() => onSettingsClick(product)}
            className="admin-button text-green-600 hover:text-green-900 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
            title="Ajuster le stock"
          >
            <Settings className="w-4 h-4 admin-icon" />
          </button>
        </div>
      </td>
    </tr>
  ), [onPlusClick, onSettingsClick, getStockStatusColor, getStockStatusText]);

  // FIXED: Memoize the entire table body
  const tableBody = useMemo(() => {
    console.log(`📊 Creating tableBody memo with ${alerts.length} alerts`);
    return alerts.map((product, index) => renderRow(product, index));
  }, [alerts, renderRow]);

  return (
    <div className="overflow-x-auto">
      <table className="admin-table w-full">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock Actuel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock Minimum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableBody}
        </tbody>
      </table>
    </div>
  );
}, (prevProps, nextProps) => {
  // FIXED: Custom comparison function - only re-render if alerts array actually changed
  console.log(`🔍 InventoryTable comparison: prev=${prevProps.alerts.length}, next=${nextProps.alerts.length}`);
  
  if (prevProps.alerts.length !== nextProps.alerts.length) {
    console.log(`❌ InventoryTable re-rendering: length changed`);
    return false;
  }
  
  // FIXED: Deep compare alerts
  for (let i = 0; i < prevProps.alerts.length; i++) {
    const prev = prevProps.alerts[i];
    const next = nextProps.alerts[i];
    if (prev.id !== next.id || 
        prev.stockQuantity !== next.stockQuantity || 
        prev.minStockLevel !== next.minStockLevel ||
        prev.name !== next.name ||
        prev.category?.name !== next.category?.name) {
      console.log(`❌ InventoryTable re-rendering: data changed at index ${i}`);
      return false;
    }
  }
  
  console.log(`✅ InventoryTable preventing re-render`);
  return true;
});

// FIXED: Create a completely isolated component with stable mounting
const InventoryAlerts = React.memo(() => {
  // Add render counter for debugging
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log(`🔄 InventoryAlerts rendered ${renderCount.current} times`);
  
  // FIXED: Use a stable key to prevent re-mounting
  const componentKey = useRef('inventory-alerts-stable');
  
  // FIXED: Add mounted ref to prevent duplicate API calls
  const mountedRef = useRef(false);
  const dataLoadedRef = useRef(false);
  const initializedRef = useRef(false);

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdateForm, setStockUpdateForm] = useState({
    quantity: '',
    changeType: 'in',
    reason: '',
    notes: ''
  });

  // FIXED: Prevent unnecessary re-renders with stable references
  const stableAlerts = useMemo(() => {
    console.log(`📊 Creating stableAlerts memo with ${alerts.length} alerts`);
    return alerts;
  }, [alerts]);
  
  const stableStats = useMemo(() => {
    console.log(`📊 Creating stableStats memo`);
    return stats;
  }, [stats]);

  // FIXED: Memoize functions to prevent re-creation with stable dependencies
  const loadAlerts = useCallback(async () => {
    // FIXED: Prevent duplicate API calls
    if (mountedRef.current || dataLoadedRef.current || initializedRef.current) {
      console.log(`🚫 Preventing duplicate API call`);
      return;
    }
    
    console.log(`🚀 Starting loadAlerts`);
    mountedRef.current = true;
    dataLoadedRef.current = true;
    initializedRef.current = true;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/inventory/alerts`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(`✅ API response received: ${response.data.data.lowStockProducts.length} alerts`);
      setAlerts(response.data.data.lowStockProducts);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('❌ Error loading inventory alerts:', error);
      toast.error('Erreur lors du chargement des alertes d\'inventaire');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStockUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    console.log(`🔄 handleStockUpdate called for product: ${selectedProduct.name}`);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/inventory/update-stock`,
        {
          productId: selectedProduct.id,
          ...stockUpdateForm
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Stock mis à jour avec succès');
      setShowStockUpdateModal(false);
      setSelectedProduct(null);
      setStockUpdateForm({
        quantity: '',
        changeType: 'in',
        reason: '',
        notes: ''
      });
      // Reset refs to allow fresh API call
      mountedRef.current = false;
      dataLoadedRef.current = false;
      initializedRef.current = false;
      loadAlerts();
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      toast.error('Erreur lors de la mise à jour du stock');
    }
  }, [selectedProduct, stockUpdateForm, loadAlerts]);

  const getStockStatusColor = useCallback((product) => {
    if (product.stockQuantity === 0) return 'bg-red-100 text-red-800';
    if (product.stockQuantity <= product.minStockLevel) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }, []);

  const getStockStatusText = useCallback((product) => {
    if (product.stockQuantity === 0) return 'Rupture de stock';
    if (product.stockQuantity <= product.minStockLevel) return 'Stock faible';
    return 'Stock OK';
  }, []);

  // FIXED: Memoize button click handlers with stable dependencies
  const handlePlusClick = useCallback((product) => {
    console.log(`🔄 handlePlusClick called for product: ${product.name}`);
    setSelectedProduct(product);
    setShowStockUpdateModal(true);
  }, []);

  const handleSettingsClick = useCallback((product) => {
    console.log(`🔄 handleSettingsClick called for product: ${product.name}`);
    setSelectedProduct(product);
    setStockUpdateForm({
      quantity: '',
      changeType: 'adjustment',
      reason: 'Ajustement manuel',
      notes: ''
    });
    setShowStockUpdateModal(true);
  }, []);

  // FIXED: Use stable effect with empty dependency array
  useEffect(() => {
    console.log(`🔄 InventoryAlerts useEffect triggered`);
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des alertes...</p>
      </div>
    );
  }

  return (
    <div key={componentKey.current} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alertes d'Inventaire</h2>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-gray-600">{stableAlerts.length} produit(s) en alerte</span>
        </div>
      </div>

      {/* FIXED: Statistics Cards with stable dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{stableStats.totalProducts || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-primary-600/10">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-6 hover:shadow-3d hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stock Faible</p>
              <p className="text-2xl font-bold text-yellow-600">{stableStats.lowStockProducts || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/10">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-6 hover:shadow-3d hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rupture de Stock</p>
              <p className="text-2xl font-bold text-red-600">{stableStats.outOfStockProducts || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Stock</p>
              <p className="text-2xl font-bold text-green-600">{stableStats.totalStockValue || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/10 to-green-600/10">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Low Stock Products with stable layout */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Produits en Stock Faible</h3>
        </div>
        
        {stableAlerts.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Aucun produit en alerte de stock</p>
          </div>
        ) : (
          <InventoryTable 
            alerts={stableAlerts}
            onPlusClick={handlePlusClick}
            onSettingsClick={handleSettingsClick}
            getStockStatusColor={getStockStatusColor}
            getStockStatusText={getStockStatusText}
          />
        )}
      </div>

      {/* FIXED: Stock Update Modal with stable positioning */}
      {showStockUpdateModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-glass shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mettre à Jour le Stock
                </h3>
                <button
                  onClick={() => setShowStockUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Produit: {selectedProduct.name}</p>
                <p className="text-sm text-gray-600">Stock actuel: {selectedProduct.stockQuantity}</p>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Changement
                  </label>
                  <select
                    value={stockUpdateForm.changeType}
                    onChange={(e) => setStockUpdateForm(prev => ({ ...prev, changeType: e.target.value }))}
                    className="select"
                  >
                    <option value="in">Réception (Ajouter)</option>
                    <option value="out">Vente/Utilisation (Retirer)</option>
                    <option value="adjustment">Ajustement Manuel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={stockUpdateForm.quantity}
                    onChange={(e) => setStockUpdateForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                    min="1"
                    className="input"
                    placeholder="Quantité"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison
                  </label>
                  <input
                    type="text"
                    value={stockUpdateForm.reason}
                    onChange={(e) => setStockUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    className="input"
                    placeholder="Raison du changement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={stockUpdateForm.notes}
                    onChange={(e) => setStockUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="input"
                    placeholder="Notes supplémentaires..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStockUpdateModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Mettre à Jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // FIXED: Custom comparison function - always return true to prevent re-renders
  console.log(`🔍 InventoryAlerts comparison: always preventing re-render`);
  return true;
});

export default InventoryAlerts; 