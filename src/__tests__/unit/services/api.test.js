// Mock firebase config before importing api
vi.mock('../../../config/firebase', () => {
  const mockGetIdToken = vi.fn().mockResolvedValue('mock-firebase-token');
  return {
    auth: {
      currentUser: {
        getIdToken: mockGetIdToken,
      },
    },
    __mocks: { getIdToken: mockGetIdToken },
  };
});

import api, { formatPrice, formatDate, handleAPIError } from '../../../services/api';
import { auth } from '../../../config/firebase';

describe('api service', () => {
  describe('request interceptor', () => {
    it('adds Bearer token from Firebase currentUser', async () => {
      // Create a mock request config
      const config = { headers: {} };

      // The interceptor is already attached to the api instance
      // We test by making a request and checking the config
      // Use the interceptor directly from the api instance
      const interceptor = api.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer mock-firebase-token');
    });

    it('falls back to stored token when Firebase getIdToken fails', async () => {
      localStorage.setItem('token', 'stored-fallback-token');
      auth.currentUser.getIdToken.mockRejectedValueOnce(new Error('Token error'));

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer stored-fallback-token');
    });

    it('does not add token when no currentUser', async () => {
      const originalUser = auth.currentUser;
      auth.currentUser = null;

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();

      // Restore
      auth.currentUser = originalUser;
    });
  });

  describe('response interceptor - error handling', () => {
    it('clears localStorage and redirects on 401 for non-orders requests', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('user', '{}');

      const error = {
        response: { status: 401 },
        config: { url: '/auth/me' },
      };

      const interceptor = api.interceptors.response.handlers[0];

      expect(() => interceptor.rejected(error)).rejects.toBeDefined();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('does not redirect on 401 for /orders requests', () => {
      window.location.href = '';
      localStorage.setItem('token', 'some-token');

      const error = {
        response: { status: 401 },
        config: { url: '/orders' },
      };

      const interceptor = api.interceptors.response.handlers[0];

      expect(() => interceptor.rejected(error)).rejects.toBeDefined();

      // Should NOT redirect
      expect(window.location.href).not.toBe('/login');
    });
  });

  describe('formatPrice', () => {
    it('formats price in EUR by default', () => {
      const formatted = formatPrice(29.99);
      expect(formatted).toContain('29,99');
      expect(formatted).toContain('€');
    });

    it('formats price with custom currency', () => {
      const formatted = formatPrice(100, 'MAD');
      expect(formatted).toContain('100');
    });
  });

  describe('formatDate', () => {
    it('formats date in French locale', () => {
      const formatted = formatDate('2026-01-15');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('janvier');
    });
  });

  describe('handleAPIError', () => {
    it('returns appropriate message for 401', () => {
      const error = { response: { data: {}, status: 401 } };
      expect(handleAPIError(error)).toContain('reconnecter');
    });

    it('returns appropriate message for 403', () => {
      const error = { response: { data: {}, status: 403 } };
      expect(handleAPIError(error)).toContain('refusé');
    });

    it('returns appropriate message for 404', () => {
      const error = { response: { data: {}, status: 404 } };
      expect(handleAPIError(error)).toContain('trouvé');
    });

    it('returns server error message for 500+', () => {
      const error = { response: { data: {}, status: 500 } };
      expect(handleAPIError(error)).toContain('serveur');
    });

    it('returns network error message when no response', () => {
      const error = { request: {} };
      expect(handleAPIError(error)).toContain('connexion');
    });

    it('returns generic error when no response or request', () => {
      const error = {};
      expect(handleAPIError(error)).toContain('inattendue');
    });

    it('returns custom error from server response', () => {
      const error = { response: { data: { error: 'Custom error msg' }, status: 400 } };
      expect(handleAPIError(error)).toBe('Custom error msg');
    });
  });
});
