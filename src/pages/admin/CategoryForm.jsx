import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Save, Plus } from 'lucide-react';

const CategoryForm = ({ category = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load category data if editing
  useEffect(() => {
    if (category) {
      setIsEditing(true);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        imageUrl: category.imageUrl || ''
      });
    }
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/categories/${category.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/categories`;

      const method = isEditing ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(isEditing ? 'Catégorie mise à jour avec succès' : 'Catégorie créée avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error saving category:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Erreur lors de la sauvegarde de la catégorie';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details.map(d => d.msg).join(', ');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
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
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la Catégorie *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Nom de la catégorie"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Description de la catégorie"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'Image
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://example.com/category-image.jpg"
            />
          </div>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aperçu de l'Image
              </label>
              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Category preview"
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
            </div>
          )}

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
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isEditing ? 'Mettre à jour' : 'Créer la catégorie'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 