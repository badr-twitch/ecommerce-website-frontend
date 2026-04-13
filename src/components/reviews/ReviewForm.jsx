import React, { useState, useCallback, useRef } from 'react';
import { Star, Upload, X, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import api from '../../services/api';

const ALLOWED_REVIEW_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_REVIEW_FILE_BYTES = 10 * 1024 * 1024;
const S3_PUBLIC_BASE = (
  import.meta.env.VITE_AWS_S3_PUBLIC_BASE ||
  (import.meta.env.VITE_AWS_S3_BUCKET && import.meta.env.VITE_AWS_REGION
    ? `https://${import.meta.env.VITE_AWS_S3_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com`
    : '')
).replace(/\/$/, '');

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
  const submittingRef = useRef(false);

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
      const isValidType = ALLOWED_REVIEW_MIME.includes(file.type);
      const isValidSize = file.size <= MAX_REVIEW_FILE_BYTES;

      if (!isValidType) {
        toast.error(`${file.name} : format non supporté (JPG, PNG, WebP ou GIF uniquement)`);
        return false;
      }

      if (!isValidSize) {
        toast.error(`${file.name} est trop volumineux (max 10 Mo)`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
    // Allow re-selecting the same file after removal
    e.target.value = '';
  }, []);

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing media
  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files via S3 presigned PUT (matches /api/uploads/presign contract)
  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return [];
    if (!S3_PUBLIC_BASE) {
      // Fail loudly: do NOT silently submit a review missing the photos the user attached.
      const msg = "L'envoi de photos n'est pas configuré. Retirez les photos pour publier l'avis, ou contactez le support.";
      toast.error(msg, { duration: 6000 });
      throw new Error('S3_PUBLIC_BASE_MISSING');
    }

    const uploadPromises = uploadedFiles.map(async (file) => {
      try {
        const presign = await api.post('/uploads/presign', {
          category: 'reviews',
          entityId: String(productId),
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });
        const { uploadUrl, key } = presign.data;
        if (!uploadUrl || !key) throw new Error('Presign response invalide');

        // Bare axios — do not send Authorization header to S3
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          transformRequest: [(data) => data],
        });

        return `${S3_PUBLIC_BASE}/${key}`;
      } catch (error) {
        console.error('File upload failed:', error);
        toast.error(`Échec de l'envoi de ${file.name}`);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter(url => url !== null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Atomic guard against double-submit (faster than state update propagation)
    if (submittingRef.current || loading) return;

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

    submittingRef.current = true;
    setLoading(true);

    try {
      // Upload files first
      const newMediaUrls = await uploadFiles();
      const allMediaUrls = [...mediaFiles, ...newMediaUrls];

      // productId is a UUID server-side — never coerce with parseInt
      const reviewData = {
        ...formData,
        mediaUrls: allMediaUrls,
        productId
      };

      if (existingReview) {
        await api.put(`/reviews/${existingReview.id}`, reviewData);
        toast.success('Avis mis à jour avec succès');
      } else {
        await api.post('/reviews', reviewData);
        toast.success('Avis soumis avec succès et en attente de modération');
      }

      setFormData({ title: '', content: '', rating: 0, tags: [] });
      setMediaFiles([]);
      setUploadedFiles([]);

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Review submission failed:', error);
      // S3 misconfig already toasted in uploadFiles — don't double-toast a generic error
      if (error?.message === 'S3_PUBLIC_BASE_MISSING') {
        // no-op; uploadFiles already informed the user
      } else {
        const code = error.response?.data?.code;
        if (code === 'PURCHASE_REQUIRED') {
          toast.error(error.response.data.error, { duration: 6000 });
        } else {
          toast.error(error.response?.data?.error || 'Erreur lors de la soumission de l\'avis');
        }
      }
    } finally {
      submittingRef.current = false;
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
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
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                Cliquez pour ajouter des photos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP, GIF · 10 Mo max par fichier
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
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
