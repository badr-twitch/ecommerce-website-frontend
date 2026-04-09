import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Link, Image as ImageIcon, Loader2 } from 'lucide-react';
import storageService from '../../services/storageService';
import { validateImage, resizeImage } from '../../utils/imageUtils';

export default function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  folder = 'uploads',
  label = 'Image',
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState([]);
  const [error, setError] = useState(null);

  // Normalize value to array for internal handling
  const images = multiple
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : (value ? [value] : []);

  const updateImages = useCallback((newImages) => {
    if (multiple) {
      onChange(newImages);
    } else {
      onChange(newImages[0] || '');
    }
  }, [multiple, onChange]);

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);

    const filesToUpload = multiple
      ? acceptedFiles.slice(0, maxFiles - images.length)
      : acceptedFiles.slice(0, 1);

    if (filesToUpload.length === 0) return;

    // Validate all files
    for (const file of filesToUpload) {
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    // Create upload tracking entries
    const uploadEntries = filesToUpload.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      progress: 0,
    }));
    setUploading(prev => [...prev, ...uploadEntries]);

    const newUrls = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const entry = uploadEntries[i];

      try {
        // Resize before upload
        const optimized = await resizeImage(file);

        const url = await storageService.uploadFile(
          optimized,
          `${folder}/${Date.now()}-${i}.jpg`,
          (progress) => {
            setUploading(prev =>
              prev.map(u => u.id === entry.id ? { ...u, progress } : u)
            );
          }
        );
        newUrls.push(url);
      } catch (err) {
        console.error('Upload failed:', err);
        setError(`Failed to upload ${file.name}`);
      }

      // Remove from uploading list
      setUploading(prev => prev.filter(u => u.id !== entry.id));
    }

    if (newUrls.length > 0) {
      if (multiple) {
        updateImages([...images, ...newUrls]);
      } else {
        // For single mode, replace existing
        updateImages(newUrls);
      }
    }
  }, [images, multiple, maxFiles, folder, updateImages]);

  const removeImage = useCallback(async (index) => {
    const url = images[index];
    // Try to delete from Firebase Storage (silently fails for external URLs)
    await storageService.deleteImageByURL(url);
    const updated = images.filter((_, i) => i !== index);
    updateImages(updated);
  }, [images, updateImages]);

  const addUrl = useCallback(() => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    setError(null);
    if (multiple) {
      updateImages([...images, urlInput.trim()]);
    } else {
      updateImages([urlInput.trim()]);
    }
    setUrlInput('');
  }, [urlInput, images, multiple, updateImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple,
    maxFiles: multiple ? maxFiles - images.length : 1,
    disabled: uploading.length > 0,
  });

  const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-xs font-medium ${
              mode === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-3 h-3 inline mr-1" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 text-xs font-medium ${
              mode === 'url'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Link className="w-3 h-3 inline mr-1" />
            URL
          </button>
        </div>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className={`grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 max-w-xs'}`}>
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={url}
                alt={`${label} ${index + 1}`}
                className="w-full h-32 object-cover"
                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {!multiple && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                  Main
                </span>
              )}
              {multiple && index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                  First
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="truncate flex-1">{u.name}</span>
              <span className="text-xs">{Math.round(u.progress)}%</span>
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone or URL input */}
      {canAddMore && (
        <>
          {mode === 'upload' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              } ${uploading.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              {isDragActive ? (
                <p className="text-sm text-indigo-600">Drop images here...</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Drag & drop {multiple ? 'images' : 'an image'} here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WebP up to 10MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
              <button
                type="button"
                onClick={addUrl}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {multiple && (
        <p className="text-xs text-gray-400">
          {images.length}/{maxFiles} images
        </p>
      )}
    </div>
  );
}
