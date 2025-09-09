import React, { useState, useCallback } from 'react';
import { Star, Upload, X, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ReviewForm = ({ productId, productName, onSubmit, onCancel, existingReview = null }) => {
  const [formData, setFormData] = useState({
    title: existingReview?.title || '',
    content: existingReview?.content || '',
    rating: existingReview?.rating || 0,
    tags: existingReview?.tags || []
  });
  
  const [mediaFiles, setMediaFiles] = useState(existingReview?.mediaUrls || []);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Available tags for reviews
  const availableTags = [
    'Qualité', 'Prix', 'Livraison', 'Service client', 'Emballage',
    'Facilité d\'utilisation', 'Design', 'Durabilité', 'Rapport qualité-prix'
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rating selection
  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Handle tag selection
  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} n'est pas un type de fichier supporté`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing media
  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to storage
  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return [];

    const uploadPromises = uploadedFiles.map(async (file) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload to your storage service
        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data.url;
      } catch (error) {
        console.error('File upload failed:', error);
        toast.error(`Échec de l'upload de ${file.name}`);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter(url => url !== null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Veuillez ajouter un titre à votre avis');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Veuillez ajouter du contenu à votre avis');
      return;
    }
    
    if (formData.rating === 0) {
      toast.error('Veuillez donner une note à ce produit');
      return;
    }
    
    if (formData.title.length < 3) {
      toast.error('Le titre doit contenir au moins 3 caractères');
      return;
    }
    
    if (formData.content.length < 10) {
      toast.error('Le contenu doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);
    
    try {
      // Upload files first
      const newMediaUrls = await uploadFiles();
      const allMediaUrls = [...mediaFiles, ...newMediaUrls];
      
      // Prepare review data
      const reviewData = {
        ...formData,
        mediaUrls: allMediaUrls,
        productId: parseInt(productId)
      };
      
      if (existingReview) {
        // Update existing review
        await api.put(`/reviews/${existingReview.id}`, reviewData);
        toast.success('Avis mis à jour avec succès');
      } else {
        // Create new review
        await api.post('/reviews', reviewData);
        toast.success('Avis soumis avec succès et en attente de modération');
      }
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        rating: 0,
        tags: []
      });
      setMediaFiles([]);
      setUploadedFiles([]);
      
      // Call parent callback
      if (onSubmit) {
        onSubmit();
      }
      
    } catch (error) {
      console.error('Review submission failed:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la soumission de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  // Render star rating
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || formData.rating);
      const isHovered = starValue <= hoveredRating;
      
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-all duration-200 ${
            isFilled 
              ? 'text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-200'
          } ${isHovered ? 'scale-110' : ''}`}
          onClick={() => handleRatingClick(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star 
            size={32} 
            className={`fill-current transition-all duration-200 ${
              isFilled ? 'drop-shadow-lg' : ''
            }`}
          />
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {existingReview ? 'Modifier votre avis' : 'Laissez votre avis'}
        </h3>
        <p className="text-gray-600">
          {existingReview 
            ? 'Modifiez votre avis pour ce produit'
            : `Partagez votre expérience avec ${productName}`
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Votre note *
          </label>
          <div className="flex items-center space-x-2">
            {renderStars()}
            <span className="ml-3 text-sm text-gray-500">
              {formData.rating > 0 && `${formData.rating}/5`}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre de votre avis *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Résumez votre expérience en quelques mots"
            required
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {formData.title.length}/200
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Votre avis détaillé *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={6}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Décrivez votre expérience avec ce produit. Qu'avez-vous aimé ? Qu'auriez-vous amélioré ?"
            required
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {formData.content.length}/2000
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tags (optionnel)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  formData.tags.includes(tag)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photos/Vidéos (optionnel)
          </label>
          
          {/* Existing Media */}
          {mediaFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Médias existants :</p>
              <div className="flex flex-wrap gap-2">
                {mediaFiles.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,video/mp4"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                Cliquez pour ajouter des photos ou vidéos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP, MP4 (max 10MB par fichier)
              </p>
            </label>
          </div>
          
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Fichiers à uploader :</p>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Vidéo</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate w-20">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi...</span>
              </>
            ) : (
              <span>{existingReview ? 'Mettre à jour' : 'Soumettre'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
