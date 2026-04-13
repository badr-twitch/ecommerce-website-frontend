import api from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PUBLIC_CATEGORIES = new Set(['profile-photos', 'products', 'categories']);

function publicProxyUrl(key) {
  return `${API_BASE}/media/public/${key}`;
}

function uploadWithProgress(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    if (typeof onProgress === 'function') {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          onProgress((evt.loaded / evt.total) * 100);
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

class StorageService {
  /**
   * Upload a file to S3 via backend-presigned PUT.
   * Returns the value the caller should persist:
   *   - public categories → full proxy URL (works directly in <img src>)
   *   - refund-proofs → bare S3 key (must be rendered via <SignedImage>)
   */
  async uploadFile(file, { category, entityId, onProgress } = {}) {
    if (!category || !entityId) {
      throw new Error('uploadFile requires { category, entityId }');
    }
    const { data } = await api.post('/uploads/presign', {
      category,
      entityId: String(entityId),
      filename: file.name || 'upload',
      contentType: file.type,
      size: file.size,
    });
    if (!data?.success) throw new Error(data?.error || 'Presign failed');

    await uploadWithProgress(data.uploadUrl, file, onProgress);

    return PUBLIC_CATEGORIES.has(category) ? publicProxyUrl(data.key) : data.key;
  }

  uploadProfilePhoto(file, userId, onProgress) {
    return this.uploadFile(file, { category: 'profile-photos', entityId: userId, onProgress });
  }

  uploadProductImage(file, productId, _index = 0, onProgress) {
    return this.uploadFile(file, { category: 'products', entityId: productId || 'new', onProgress });
  }

  uploadCategoryImage(file, categoryId, onProgress) {
    return this.uploadFile(file, { category: 'categories', entityId: categoryId || 'new', onProgress });
  }

  uploadRefundProof(file, orderId, onProgress) {
    return this.uploadFile(file, { category: 'refund-proofs', entityId: orderId, onProgress });
  }

  /** Fetch a short-lived signed GET URL for a private S3 key (refund-proofs). */
  async fetchSignedUrl(key) {
    const { data } = await api.post('/uploads/sign-get', { key });
    if (!data?.success) throw new Error(data?.error || 'Sign-get failed');
    return data.url;
  }

  // Deletes are handled server-side via product/category/order lifecycle hooks.
  // Kept as no-ops so existing callers don't break.
  async deleteImageByURL(_url) { return false; }
  async deleteProfilePhoto(_url) { return false; }
  async deleteFile(_path) { return false; }

  dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }
}

export default new StorageService();
