import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ShoppingCart, TrendingDown, AlertTriangle, RotateCcw } from 'lucide-react';

const SmartReorder = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await ordersAPI.getReorderSuggestions();
      if (response.data.success && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      // Silently fail — this is a nice-to-have feature
    } finally {
      setLoading(false);
    }
  };

  const handleReorderAll = () => {
    const inStockItems = suggestions.filter(s => s.inStock);
    if (inStockItems.length === 0) {
      toast.error('Aucun produit en stock');
      return;
    }
    inStockItems.forEach(s => {
      addItem({
        id: s.productId,
        name: s.name,
        mainImage: s.image,
        price: s.currentPrice
      }, 1);
    });
    navigate('/cart');
  };

  const handleReorderOne = (suggestion) => {
    if (!suggestion.inStock) {
      toast.error('Ce produit est en rupture de stock');
      return;
    }
    addItem({
      id: suggestion.productId,
      name: suggestion.name,
      mainImage: suggestion.image,
      price: suggestion.currentPrice
    }, 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(price);
  };

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-secondary-50 border border-indigo-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <RotateCcw className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vous achetez souvent</h3>
            <p className="text-sm text-gray-600">Basé sur vos commandes précédentes</p>
          </div>
        </div>
        {suggestions.filter(s => s.inStock).length > 1 && (
          <button
            onClick={handleReorderAll}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Tout commander
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.productId}
            className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3 items-start"
          >
            <img
              src={suggestion.image || '/placeholder-product.jpg'}
              alt={suggestion.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</h4>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(suggestion.currentPrice)}
                </span>
                {suggestion.priceDropped && (
                  <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    -{formatPrice(suggestion.priceDifference)}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Commandé {suggestion.orderCount} fois
                {suggestion.daysUntilPredictedReorder <= 7 && suggestion.daysUntilPredictedReorder > 0 && (
                  <span className="text-indigo-600 font-medium"> — bientôt</span>
                )}
              </p>

              {!suggestion.inStock ? (
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  Rupture de stock
                </div>
              ) : (
                <button
                  onClick={() => handleReorderOne(suggestion)}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Ajouter au panier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartReorder;
