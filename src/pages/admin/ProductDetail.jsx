import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';

const ProductDetail = ({ product, onClose, onEdit, onDelete }) => {
  if (!product) return null;

  // Helper function to format stock
  const formatStock = (stockQuantity) => {
    if (stockQuantity === null || stockQuantity === undefined) return '0 unité(s)';
    if (stockQuantity === 0) return '0 unité(s)';
    if (stockQuantity === 1) return '1 unité';
    return `${stockQuantity} unités`;
  };

  // Helper function to get stock color
  const getStockColor = (stockQuantity) => {
    if (!stockQuantity || stockQuantity === 0) return 'text-red-600';
    if (stockQuantity <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Détails du Produit</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Image */}
          {product.imageUrl && (
            <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden shadow-soft">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-gray-500">
                Image non disponible
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Prix</label>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-gray-900">{product.price} DH</p>
                  {product.isOnSale && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      PROMO
                    </span>
                  )}
                </div>
                {product.isOnSale && product.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    Prix original: {product.originalPrice} DH
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Stock</label>
                <p className={`text-lg font-semibold ${getStockColor(product.stockQuantity)}`}>
                  {formatStock(product.stockQuantity)}
                </p>
              </div>
            </div>

            {/* Promotion Details */}
            {product.isOnSale && (
              <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Détails de la Promotion</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {product.salePercentage && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Réduction</label>
                      <p className="text-lg font-semibold text-orange-600">-{product.salePercentage}%</p>
                    </div>
                  )}
                  {product.saleStartDate && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Début</label>
                      <p className="text-sm text-gray-900">
                        {new Date(product.saleStartDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {product.saleEndDate && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Fin</label>
                      <p className="text-sm text-gray-900">
                        {new Date(product.saleEndDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500">Catégorie</label>
              <p className="text-gray-900">{product.category?.name || 'Non catégorisé'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">ID du Produit</label>
              <p className="text-sm text-gray-600 font-mono">{product.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Date de Création</label>
              <p className="text-gray-900">
                {new Date(product.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {product.updatedAt && product.updatedAt !== product.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Dernière Modification</label>
                <p className="text-gray-900">
                  {new Date(product.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 