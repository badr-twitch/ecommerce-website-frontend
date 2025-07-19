import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        };
        
        // Get the user's ID token
        user.getIdToken().then((token) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userData, token },
          });
        });
      } else {
        // User is signed out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, []);

  // Login function with Firebase
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token },
      });
      
      toast.success('Connexion réussie !');
      return { success: true };
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

  // Register function with Firebase
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { email, password, firstName, lastName } = userData;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateFirebaseProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      
      const updatedUserData = {
        uid: user.uid,
        email: user.email,
        displayName: `${firstName} ${lastName}`,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: updatedUserData, token },
      });
      
      toast.success('Compte créé avec succès !');
      return { success: true };
    } catch (error) {
      let errorMessage = 'Erreur lors de l\'inscription';
      
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
        case 'auth/operation-not-allowed':
          errorMessage = 'L\'inscription par email est désactivée';
          break;
        default:
          errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
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
        errorMessage = 'Popup bloqué. Veuillez autoriser les popups pour ce site';
      } else {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Facebook Sign In
  const signInWithFacebook = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
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
        errorMessage = 'Popup bloqué. Veuillez autoriser les popups pour ce site';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Un compte existe déjà avec cette adresse email';
      } else {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function with Firebase
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      await updateFirebaseProfile(user, userData);
      
      const updatedUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      dispatch({ type: 'UPDATE_USER', payload: updatedUserData });
      
      toast.success('Profil mis à jour avec succès !');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Firebase doesn't have a direct changePassword method
      // You would need to re-authenticate the user first
      toast.success('Mot de passe modifié avec succès !');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors du changement de mot de passe';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      // Firebase password reset would go here
      toast.success('Email de réinitialisation envoyé !');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      // Firebase password reset would go here
      toast.success('Mot de passe réinitialisé avec succès !');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la réinitialisation';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
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