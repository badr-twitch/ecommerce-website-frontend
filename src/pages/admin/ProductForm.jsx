import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Save, Plus } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';

const ProductForm = ({ product = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    categoryId: '',
    mainImage: '',
    images: [],
    isOnSale: false,
    salePercentage: '',
    saleStartDate: '',
    saleEndDate: '',
    isFeatured: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
    if (product) {
      console.log('🔍 Editing product:', product);
      setIsEditing(true);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : '',
        categoryId: product.categoryId || '',
        mainImage: product.mainImage || product.imageUrl || '',
        images: product.images || [],
        isOnSale: product.isOnSale || false,
        salePercentage: product.salePercentage || '',
        saleStartDate: product.saleStartDate || '',
        saleEndDate: product.saleEndDate || '',
        isFeatured: product.isFeatured || false
      });
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('🔍 Categories loaded:', response.data);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Erreur lors du chargement des catégories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('🔍 Input change:', name, value, type, checked);
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Convert stockQuantity to number if it's a valid number
    let processedValue = value;
    if (name === 'stockQuantity' && value !== '') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        processedValue = numValue;
      }
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: processedValue
      };
      
      // Auto-calculate percentage when original price and sale price are both set
      if (name === 'originalPrice' || name === 'price') {
        const originalPrice = parseFloat(name === 'originalPrice' ? processedValue : prev.originalPrice);
        const salePrice = parseFloat(name === 'price' ? processedValue : prev.price);
        
        if (originalPrice && salePrice && originalPrice > salePrice) {
          const percentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          newData.salePercentage = percentage;
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean up form data - convert empty date strings to null
    const cleanedData = { ...formData };
    if (cleanedData.saleStartDate === '') {
      cleanedData.saleStartDate = null;
    }
    if (cleanedData.saleEndDate === '') {
      cleanedData.saleEndDate = null;
    }

    try {
      console.log('🔍 Submitting form data:', cleanedData);
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/products/${product.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/products`;

      const method = isEditing ? 'put' : 'post';
      
      const response = await axios[method](url, cleanedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Response received:', response.data);

      toast.success(isEditing ? 'Produit mis à jour avec succès' : 'Produit créé avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error saving product:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la sauvegarde du produit';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier le Produit' : 'Ajouter un Produit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Produit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="Nom du produit"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU (Référence) *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="Ex: PROD-001"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="Description détaillée du produit"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (DH) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          {/* Promotion Controls */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-600 text-lg">🏷️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contrôle des Promotions</h3>
            </div>

            {/* Sale Toggle */}
            <div className="mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Activer la promotion
                </span>
              </label>
            </div>

            {formData.isOnSale && (
              <div className="space-y-4">
                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix Original (DH)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Prix avant promotion"
                  />
                </div>

                {/* Sale Price and Percentage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix de Vente (DH)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Prix avec promotion"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pourcentage de Réduction (%)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        name="salePercentage"
                        value={formData.salePercentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Ex: 20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const originalPrice = parseFloat(formData.originalPrice);
                          const salePrice = parseFloat(formData.price);
                          if (originalPrice && salePrice && originalPrice > salePrice) {
                            const percentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
                            setFormData(prev => ({ ...prev, salePercentage: percentage }));
                          }
                        }}
                        className="px-3 py-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        title="Recalculer automatiquement"
                      >
                        🔄
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Saisissez manuellement ou cliquez sur 🔄 pour calculer automatiquement
                    </p>
                  </div>
                </div>

                {/* Sale Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Début
                    </label>
                    <input
                      type="datetime-local"
                      name="saleStartDate"
                      value={formData.saleStartDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Fin
                    </label>
                    <input
                      type="datetime-local"
                      name="saleEndDate"
                      value={formData.saleEndDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Price Preview */}
                {formData.originalPrice && formData.price && (
                  <div className="bg-white border border-orange-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu des Prix</h4>
                    <div className="flex items-center space-x-4">
                      <div className="text-lg text-gray-500 line-through">
                        {formData.originalPrice} DH
                      </div>
                      <div className="text-xl font-bold text-orange-600">
                        {formData.price} DH
                      </div>
                      {formData.salePercentage && (
                        <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                          -{formData.salePercentage}%
                        </div>
                      )}
                    </div>
                    {formData.originalPrice && formData.price && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                      <div className="mt-2 text-sm text-green-600">
                        💰 Économie: {(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toFixed(2)} DH
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Status */}
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-600 text-lg">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Statut du Produit</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Produit en vedette (affiché sur la page d'accueil)
                </span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              disabled={categoriesLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {categoriesLoading ? 'Chargement des catégories...' : 'Sélectionner une catégorie'}
              </option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : !categoriesLoading ? (
                <option value="" disabled>Aucune catégorie disponible</option>
              ) : null}
            </select>
          </div>

          {/* Main Image */}
          <ImageUploader
            label="Image Principale"
            value={formData.mainImage}
            onChange={(url) => setFormData(prev => ({ ...prev, mainImage: url }))}
            folder={`products/${product?.id || 'new'}`}
          />

          {/* Gallery Images */}
          <ImageUploader
            label="Images de la Galerie"
            value={formData.images}
            onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
            multiple
            maxFiles={8}
            folder={`products/${product?.id || 'new'}`}
          />

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditing ? 'Mettre à jour' : 'Créer le produit'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 