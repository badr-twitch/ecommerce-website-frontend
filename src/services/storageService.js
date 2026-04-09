import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'firebase/storage';
import { storage } from '../config/firebase';

class StorageService {
  // Upload file to Firebase Storage
  async uploadFile(file, path, onProgress = null) {
    try {
      // Create a reference to the file location
      const storageRef = ref(storage, path);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            // Handle upload errors
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Storage service error:', error);
      throw error;
    }
  }

  // Upload profile photo
  async uploadProfilePhoto(file, userId) {
    const timestamp = Date.now();
    const fileName = `profile-photos/${userId}/${timestamp}.jpg`;
    
    return await this.uploadFile(file, fileName);
  }

  // Delete file from Firebase Storage
  async deleteFile(path) {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  // Delete profile photo by URL (extract path from URL)
  async deleteProfilePhoto(photoURL) {
    try {
      // Extract the path from the Firebase Storage URL
      const url = new URL(photoURL);
      const path = url.pathname.split('/o/')[1]?.split('?')[0];
      
      if (path) {
        const decodedPath = decodeURIComponent(path);
        return await this.deleteFile(decodedPath);
      }
      return false;
    } catch (error) {
      console.error('Delete profile photo error:', error);
      throw error;
    }
  }

  // Upload product image
  async uploadProductImage(file, productId, index = 0, onProgress = null) {
    const timestamp = Date.now();
    const path = `products/${productId}/${timestamp}-${index}.jpg`;
    return await this.uploadFile(file, path, onProgress);
  }

  // Upload category image
  async uploadCategoryImage(file, categoryId, onProgress = null) {
    const timestamp = Date.now();
    const path = `categories/${categoryId}/${timestamp}.jpg`;
    return await this.uploadFile(file, path, onProgress);
  }

  // Delete image by its download URL (works for any Firebase Storage URL)
  async deleteImageByURL(url) {
    try {
      // Only attempt deletion for Firebase Storage URLs
      if (!url || !url.includes('firebasestorage.googleapis.com')) {
        return false;
      }
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname.split('/o/')[1]?.split('?')[0];
      if (path) {
        const decodedPath = decodeURIComponent(path);
        return await this.deleteFile(decodedPath);
      }
      return false;
    } catch (error) {
      console.error('Delete image by URL error:', error);
      return false;
    }
  }

  // Convert data URL to file object
  dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }
}

export default new StorageService(); 