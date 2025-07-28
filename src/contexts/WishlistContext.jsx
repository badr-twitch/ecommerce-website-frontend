import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export { WishlistContext };

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  hasNetworkError: false,
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
      };

    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_NETWORK_ERROR':
      return {
        ...state,
        hasNetworkError: action.payload,
      };

    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { user } = useAuth();

  const loadWishlist = useCallback(async () => {
    if (!user || !user.id || state.hasNetworkError) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_NETWORK_ERROR', payload: false });

      const response = await usersAPI.getWishlist(user.id);
      dispatch({ type: 'SET_WISHLIST', payload: response.data.products || [] });
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Don't set error state for network errors to prevent infinite loops
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Network error - wishlist will be loaded when connection is restored');
        dispatch({ type: 'SET_NETWORK_ERROR', payload: true });
        return;
      }
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement de la wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, state.hasNetworkError]);

  // Load wishlist from API when user is authenticated
  useEffect(() => {
    if (user && user.id && !state.hasNetworkError) {
      loadWishlist();
    } else if (!user) {
      // Clear wishlist when user logs out
      dispatch({ type: 'CLEAR_WISHLIST' });
      dispatch({ type: 'SET_NETWORK_ERROR', payload: false });
    }
  }, [user?.id, loadWishlist, state.hasNetworkError]);

  const addToWishlist = async (product) => {
    if (!user || !user.id) {
      toast.error('Connectez-vous pour ajouter des produits à votre wishlist');
      return false;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await usersAPI.addToWishlist(user.id, {
        productId: product.id
      });

      dispatch({ type: 'ADD_ITEM', payload: product });
      toast.success(`${product.name} ajouté à votre wishlist`);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'ajout à la wishlist';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !user.id) return false;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await usersAPI.removeFromWishlist(user.id, productId);

      const removedItem = state.items.find(item => item.id === productId);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
      
      if (removedItem) {
        toast.success(`${removedItem.name} retiré de votre wishlist`);
      }
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression de la wishlist';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearWishlist = async () => {
    if (!user || !user.id) return false;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await usersAPI.clearWishlist(user.id);

      dispatch({ type: 'CLEAR_WISHLIST' });
      toast.success('Wishlist vidée');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du vidage de la wishlist';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const isInWishlist = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getWishlistCount = () => {
    return state.items.length;
  };

  const value = {
    wishlistItems: state.items,
    isLoading: state.isLoading,
    error: state.error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 