import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export { CartContext };

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }

    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
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

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculate totals whenever items change
  useEffect(() => {
    const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update totals in state
    dispatch({ type: 'SET_TOTALS', payload: { total, itemCount } });
  }, [state.items]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product, quantity = 1) => {
    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.mainImage || product.images?.[0],
      quantity,
    };

    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id: itemId, quantity } });
    }
  };

  const removeItem = (itemId) => {
    const item = state.items.find(item => item.id === itemId);
    if (item) {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      toast.success(`${item.name} retiré du panier`);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Panier vidé');
  };

  const getItemQuantity = (itemId) => {
    const item = state.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotal = () => {
    return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    cartItems: state.items,
    total: getTotal(),
    itemCount: getItemCount(),
    isLoading: state.isLoading,
    error: state.error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 