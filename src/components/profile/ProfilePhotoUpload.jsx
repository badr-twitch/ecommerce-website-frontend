import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import storageService from '../../services/storageService';
import toast from 'react-hot-toast';
import { Camera, Trash2, User } from 'lucide-react';

const ProfilePhotoUpload = ({ currentPhotoURL, onPhotoChange, isLoading }) => {
  const { user } = useAuth();
  const [previewURL, setPreviewURL] = useState(currentPhotoURL);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 300x300)
        const maxSize = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress the image first
      const compressedDataUrl = await compressImage(file);
      setPreviewURL(compressedDataUrl);
      
      // Convert compressed data URL back to file
      const compressedFile = storageService.dataURLtoFile(compressedDataUrl, 'profile-photo.jpg');
      
      // Upload to Firebase Storage
      const downloadURL = await storageService.uploadProfilePhoto(
        compressedFile, 
        user.uid,
        (progress) => setUploadProgress(progress)
      );
      
      setIsUploading(false);
      setUploadProgress(0);
      onPhotoChange(downloadURL); // Pass the Firebase Storage URL
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Delete from Firebase Storage if there's an existing photo
      if (currentPhotoURL && currentPhotoURL.startsWith('https://')) {
        await storageService.deleteProfilePhoto(currentPhotoURL);
      }
      
      setPreviewURL('');
      onPhotoChange('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      // Still remove from UI even if storage deletion fails
      setPreviewURL('');
      onPhotoChange('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photo de profil
      </label>
      
      <div className="flex items-center space-x-4">
        {/* Current Photo Preview */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-white shadow-soft flex items-center justify-center">
            {previewURL ? (
              <img
                src={previewURL}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
                <div className="text-white text-xs">{Math.round(uploadProgress)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
              className="btn-primary"
            >
              {isUploading ? 'Téléchargement...' : <><Camera className="w-4 h-4 mr-1.5" /> Choisir une image</>}
            </button>
            
            {previewURL && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isLoading || isUploading}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Supprimer
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            Formats acceptés: JPG, PNG, GIF (max 5MB)
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUpload; 