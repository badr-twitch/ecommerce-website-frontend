import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';

const ProductDetail = ({ product, onClose, onEdit, onDelete }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Détails du Produit</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
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
                <p className="text-lg font-semibold text-gray-900">€{product.price}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Stock</label>
                <p className={`text-lg font-semibold ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock} unité(s)
                </p>
              </div>
            </div>

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