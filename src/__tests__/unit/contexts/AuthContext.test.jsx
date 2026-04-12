import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';

// Mock Firebase auth functions
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockUpdateProfile = vi.fn();
const mockSendEmailVerification = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signOut: (...args) => mockSignOut(...args),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  updateProfile: (...args) => mockUpdateProfile(...args),
  sendEmailVerification: (...args) => mockSendEmailVerification(...args),
}));

vi.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'mock-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      photoURL: null,
      getIdToken: vi.fn().mockResolvedValue('mock-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
    },
  },
  googleProvider: {},
  facebookProvider: {},
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock global fetch for apiCall
const mockFetch = vi.fn();
global.fetch = mockFetch;

import toast from 'react-hot-toast';
import { auth } from '../../../config/firebase';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

// Helper: create a mock Firebase user
const createMockFirebaseUser = (overrides = {}) => ({
  uid: 'firebase-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: null,
  getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
  ...overrides,
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: onAuthStateChanged calls callback with null (no user) and returns unsubscribe
    mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
      callback(null);
      return vi.fn(); // unsubscribe
    });
  });

  describe('initial state', () => {
    it('starts with no user and not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('throws when useAuth is used outside AuthProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider'
      );
      spy.mockRestore();
    });
  });

  describe('onAuthStateChanged', () => {
    it('syncs authenticated user to state', async () => {
      const firebaseUser = createMockFirebaseUser();
      const dbUser = { id: 'db-1', firstName: 'Test', lastName: 'User', role: 'client' };

      // First fetch: GET /auth/user returns user
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: dbUser }),
      });

      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        callback(firebaseUser);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toMatchObject({ id: 'db-1', firstName: 'Test' });
    });

    it('clears state when user signs out', async () => {
      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        callback(null);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('dispatches AUTH_SUCCESS on valid login', async () => {
      const firebaseUser = createMockFirebaseUser();
      const dbUser = { id: 'db-1', firstName: 'Test', role: 'client' };

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: dbUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it('dispatches AUTH_FAILURE on wrong password', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/wrong-password',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpw');
      });

      expect(loginResult.success).toBe(false);
      expect(result.current.error).toContain('Mot de passe incorrect');
      expect(toast.error).toHaveBeenCalled();
    });

    it('handles user-not-found error', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('nobody@example.com', 'pw');
      });

      expect(loginResult.success).toBe(false);
      expect(result.current.error).toContain('Aucun compte');
    });

    it('handles too-many-requests error', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/too-many-requests',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'pw');
      });

      expect(result.current.error).toContain('Trop de tentatives');
    });
  });

  describe('register', () => {
    it('creates user, sends verification email, returns success', async () => {
      const firebaseUser = createMockFirebaseUser({ emailVerified: false });
      const dbUser = { id: 'db-2', firstName: 'New', lastName: 'User', role: 'client' };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
      mockUpdateProfile.mockResolvedValue();
      mockSendEmailVerification.mockResolvedValue();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: dbUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let regResult;
      await act(async () => {
        regResult = await result.current.register({
          email: 'new@example.com',
          password: 'pass123',
          firstName: 'New',
          lastName: 'User',
        });
      });

      expect(regResult.success).toBe(true);
      expect(regResult.requiresVerification).toBe(true);
      expect(mockSendEmailVerification).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('handles email-already-in-use error', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let regResult;
      await act(async () => {
        regResult = await result.current.register({
          email: 'existing@example.com',
          password: 'pass123',
          firstName: 'Test',
          lastName: 'User',
        });
      });

      expect(regResult.success).toBe(false);
      expect(result.current.error).toContain('déjà utilisée');
    });
  });

  describe('signInWithGoogle', () => {
    it('signs in successfully with Google', async () => {
      const firebaseUser = createMockFirebaseUser();
      const dbUser = { id: 'db-3', firstName: 'Google', role: 'client' };

      mockSignInWithPopup.mockResolvedValue({ user: firebaseUser });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: dbUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let googleResult;
      await act(async () => {
        googleResult = await result.current.signInWithGoogle();
      });

      expect(googleResult.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });

    it('handles popup closed by user', async () => {
      mockSignInWithPopup.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let googleResult;
      await act(async () => {
        googleResult = await result.current.signInWithGoogle();
      });

      expect(googleResult.success).toBe(false);
      expect(result.current.error).toContain('annulée');
    });
  });

  describe('logout', () => {
    it('clears state and localStorage', async () => {
      // First sign in
      const firebaseUser = createMockFirebaseUser();
      const dbUser = { id: 'db-1', role: 'client' };

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: dbUser }),
      });
      mockSignOut.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'pw');
      });

      // Now logout
      // Mock the server logout call
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Déconnexion'));
    });
  });

  describe('changePassword', () => {
    it('calls /auth/change-password API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let changeResult;
      await act(async () => {
        changeResult = await result.current.changePassword('old', 'new');
      });

      expect(changeResult.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/change-password'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('forgotPassword', () => {
    it('calls /auth/forgot-password API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let forgotResult;
      await act(async () => {
        forgotResult = await result.current.forgotPassword('test@example.com');
      });

      expect(forgotResult.success).toBe(true);
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/wrong-password',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('t@t.com', 'wrong');
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('updateEmailVerified', () => {
    it('updates user emailVerified to true', async () => {
      const firebaseUser = createMockFirebaseUser({ emailVerified: false });
      const dbUser = { id: 'db-1', firstName: 'Test', emailVerified: false, role: 'client' };

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, user: dbUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('t@t.com', 'pw');
      });

      act(() => {
        result.current.updateEmailVerified();
      });

      expect(result.current.user.emailVerified).toBe(true);
    });
  });
});
