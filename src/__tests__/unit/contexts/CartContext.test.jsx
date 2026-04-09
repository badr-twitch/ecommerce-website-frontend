import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../../contexts/CartContext';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.cartItems).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });

    it('restores cart from localStorage', () => {
      const savedItems = [
        { id: 'p1', name: 'Product 1', price: 10, quantity: 2, image: null },
      ];
      localStorage.setItem('cart', JSON.stringify(savedItems));

      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].name).toBe('Product 1');
    });
  });

  describe('addItem', () => {
    it('adds a new item to the cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 29.99 });
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0]).toMatchObject({
        id: 'p1',
        name: 'Product 1',
        price: 29.99,
        quantity: 1,
      });
    });

    it('increases quantity when adding existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 29.99 });
      });
      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 29.99 }, 3);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(4);
    });

    it('adds multiple different items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 10 });
      });
      act(() => {
        result.current.addItem({ id: 'p2', name: 'Product 2', price: 20 });
      });

      expect(result.current.cartItems).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes an item from the cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 10 });
        result.current.addItem({ id: 'p2', name: 'Product 2', price: 20 });
      });
      act(() => {
        result.current.removeItem('p1');
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].id).toBe('p2');
    });

    it('does nothing when removing non-existent item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 10 });
      });
      act(() => {
        result.current.removeItem('nonexistent');
      });

      expect(result.current.cartItems).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 10 });
      });
      act(() => {
        result.current.updateQuantity('p1', 5);
      });

      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it('removes item when quantity set to 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'Product 1', price: 10 });
      });
      act(() => {
        result.current.updateQuantity('p1', 0);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'P1', price: 10 });
        result.current.addItem({ id: 'p2', name: 'P2', price: 20 });
      });
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });
  });

  describe('computed values', () => {
    it('calculates total correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'P1', price: 10 }, 2);
        result.current.addItem({ id: 'p2', name: 'P2', price: 15 }, 3);
      });

      // 10*2 + 15*3 = 65
      expect(result.current.total).toBe(65);
    });

    it('calculates item count correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'P1', price: 10 }, 2);
        result.current.addItem({ id: 'p2', name: 'P2', price: 15 }, 3);
      });

      expect(result.current.itemCount).toBe(5);
    });

    it('getItemQuantity returns correct quantity for existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'P1', price: 10 }, 3);
      });

      expect(result.current.getItemQuantity('p1')).toBe(3);
    });

    it('getItemQuantity returns 0 for non-existent item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.getItemQuantity('nonexistent')).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('saves cart to localStorage on changes', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ id: 'p1', name: 'P1', price: 10 });
      });

      const saved = JSON.parse(localStorage.getItem('cart'));
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('p1');
    });
  });

  describe('error handling', () => {
    it('throws when useCart is used outside CartProvider', () => {
      // Suppress console.error from React for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');

      spy.mockRestore();
    });
  });
});
