import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import storageService from './storageService';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && !options.headers?.Authorization && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (config.method === 'POST' && config.body) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return await response.json();
};

class UserService {
  // Delete user account completely
  async deleteAccount(password) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      // Step 1: Re-authenticate user (required for sensitive operations)
      if (password) {
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, password);
          await reauthenticateWithCredential(currentUser, credential);
          console.log('✅ User re-authenticated successfully');
        } catch (reauthError) {
          if (reauthError.code === 'auth/wrong-password') {
            throw new Error('Mot de passe incorrect');
          } else if (reauthError.code === 'auth/user-mismatch') {
            throw new Error('Erreur d\'authentification');
          } else {
            throw new Error('Erreur lors de la ré-authentification: ' + reauthError.message);
          }
        }
      }

      // Step 2: Delete user data from database first
      const dbResponse = await apiCall('/auth/delete-account', {
        method: 'DELETE'
      });

      if (!dbResponse.success) {
        throw new Error(dbResponse.message || 'Erreur lors de la suppression des données utilisateur');
      }

      // Step 3: Delete user files from Firebase Storage
      try {
        if (currentUser.photoURL) {
          await storageService.deleteProfilePhoto(currentUser.photoURL);
        }
      } catch (storageError) {
        console.warn('Erreur lors de la suppression des fichiers de stockage:', storageError);
        // Continue with account deletion even if storage cleanup fails
      }

      // Step 4: Delete Firebase Auth user
      await deleteUser(currentUser);

      // Step 5: Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return { success: true, message: 'Compte supprimé avec succès' };
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Veuillez entrer votre mot de passe pour confirmer la suppression du compte');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      } else if (error.message.includes('Mot de passe incorrect')) {
        throw error; // Re-throw our custom password error
      } else {
        throw new Error('Erreur lors de la suppression du compte: ' + error.message);
      }
    }
  }

  // Get user data for confirmation
  async getUserData() {
    try {
      const response = await apiCall('/auth/profile');
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  // Export user data before deletion
  async exportUserData() {
    try {
      const response = await apiCall('/auth/export-data', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}

export default new UserService(); 