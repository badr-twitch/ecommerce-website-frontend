import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export { AuthContext };

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  // Get fresh Firebase ID token instead of using stored token
  let token = null;
  if (auth.currentUser && !options.headers?.Authorization) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting fresh Firebase token:', error);
      // Fallback to stored token
      token = localStorage.getItem('token');
    }
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // Only add Authorization if not provided in options
      ...(token && !options.headers?.Authorization && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  // Ensure Content-Type is always application/json for POST requests
  if (config.method === 'POST' && config.body) {
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de requête');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sync user with database
  const syncUserWithDatabase = async (firebaseUser, additionalData = {}) => {
    try {
      // Get custom claims (including phone number)
      const tokenResult = await firebaseUser.getIdTokenResult();
      const customClaims = tokenResult.claims || {};
      const userData = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: firebaseUser.displayName?.split(' ')[0] || additionalData.firstName || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || additionalData.lastName || '',
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL,
        phone: customClaims.phone || additionalData.phone || '',
        // Include clientType and business fields from additionalData
        clientType: additionalData.clientType || 'particulier',
        companyName: additionalData.companyName || null,
        siret: additionalData.siret || null,
        vatNumber: additionalData.vatNumber || null,
        billingAddress: additionalData.billingAddress || null,
        billingCity: additionalData.billingCity || null,
        billingPostalCode: additionalData.billingPostalCode || null,
        billingCountry: additionalData.billingCountry || 'France',
      };
      
      // Try to get existing user from database
      try {
        const existingUser = await apiCall('/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
          }
        });

        if (existingUser.success) {
          return existingUser.user;
        }
      } catch (error) {
        // User doesn't exist in database, continue to create them
        console.log('User not found in database, creating new user...');
      }

      // If user doesn't exist in database, create them
      const newUser = await apiCall('/auth/register-firebase', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        }
      });

      return newUser.user;
    } catch (error) {
      console.error('Error syncing user with database:', error);
      // Return basic user data if database sync fails
      const tokenResult = await firebaseUser.getIdTokenResult();
      const customClaims = tokenResult.claims || {};
      
      return {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        phone: customClaims.phone || '',
      };
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
          
          // Sync with database
          const userData = await syncUserWithDatabase(firebaseUser);
          localStorage.setItem('user', JSON.stringify(userData));
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userData, token },
          });
        } catch (error) {
          console.error('Error in auth state change:', error);
          dispatch({ type: 'AUTH_FAILURE', payload: 'Erreur de synchronisation' });
        }
      } else {
        // User is signed out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, []);

  // Login function with Firebase and database sync
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
      
      // Sync with database
      const userData = await syncUserWithDatabase(firebaseUser);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token },
      });
      
      toast.success('Connexion réussie !');
      return { success: true, requiresVerification: !firebaseUser.emailVerified };
    } catch (error) {
      let errorMessage = 'Erreur de connexion';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cette adresse email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        default:
          errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function with Firebase and database sync
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { email, password, firstName, lastName, clientType, companyName, siret, vatNumber, billingAddress, billingCity, billingPostalCode, billingCountry } = userData;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user's display name in Firebase
      await updateFirebaseProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification before completing registration
      await sendEmailVerification(firebaseUser);

      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
      
      // Prepare additional data for database sync
      const additionalData = {
        firstName,
        lastName,
        clientType: clientType || 'particulier',
        companyName,
        siret,
        vatNumber,
        billingAddress,
        billingCity,
        billingPostalCode,
        billingCountry
      };
      
      // Sync with database
      const updatedUserData = await syncUserWithDatabase(firebaseUser, additionalData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: updatedUserData, token },
      });
      
      toast.success('Compte créé ! Vérifiez votre email pour activer votre compte.');
      return { success: true, requiresVerification: true };
    } catch (error) {
      let errorMessage = 'Erreur lors de la création du compte';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        default:
          errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Email de vérification renvoyé !');
        return { success: true };
      }
      return { success: false, error: 'Aucun utilisateur connecté' };
    } catch (error) {
      const message = error.code === 'auth/too-many-requests'
        ? 'Trop de demandes. Attendez quelques minutes avant de réessayer.'
        : 'Erreur lors de l\'envoi de l\'email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Google Sign In with database sync
  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
      
      // Sync with database
      const userData = await syncUserWithDatabase(firebaseUser);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token },
      });
      
      toast.success('Connexion avec Google réussie !');
      return { success: true };
    } catch (error) {
      let errorMessage = 'Erreur lors de la connexion avec Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Connexion annulée';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqué par le navigateur';
      } else {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Facebook Sign In with database sync
  const signInWithFacebook = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = result.user;
      
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
      
      // Sync with database
      const userData = await syncUserWithDatabase(firebaseUser);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token },
      });
      
      toast.success('Connexion avec Facebook réussie !');
      return { success: true };
    } catch (error) {
      let errorMessage = 'Erreur lors de la connexion avec Facebook';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Connexion annulée';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqué par le navigateur';
      } else {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Déconnexion réussie !');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
      return { success: false, error: error.message };
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      // First, update Firebase profile
      if (auth.currentUser) {
        const firebaseUpdateData = {};
        
        // Only update Firebase fields that are supported
        if (userData.displayName !== undefined) {
          firebaseUpdateData.displayName = userData.displayName;
        }
        if (userData.photoURL !== undefined) {
          firebaseUpdateData.photoURL = userData.photoURL;
        }
        
        // Update Firebase profile
        await updateFirebaseProfile(auth.currentUser, firebaseUpdateData);
      }

      // Then, update backend database
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      
      if (response.success) {
        const updatedUser = { ...state.user, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        
        // Force refresh Firebase token to get updated custom claims
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiCall('/auth/me', {
        method: 'GET',
      });

      if (response.success && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        dispatch({ type: 'UPDATE_USER', payload: response.user });
        return response.user;
      }

      throw new Error(response.message || 'Impossible de récupérer le profil');
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });
      
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Mark email as verified in local state (called after Firebase confirms verification)
  const updateEmailVerified = () => {
    if (state.user) {
      const updatedUser = { ...state.user, emailVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    resendVerificationEmail,
    updateEmailVerified,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    updateProfile,
    refreshUser,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 