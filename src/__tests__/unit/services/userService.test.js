// Use vi.hoisted so these are available inside vi.mock factories (which are hoisted)
const { mockDeleteUser, mockReauthenticateWithCredential, mockFetch } = vi.hoisted(() => ({
  mockDeleteUser: vi.fn(),
  mockReauthenticateWithCredential: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  deleteUser: (...args) => mockDeleteUser(...args),
  reauthenticateWithCredential: (...args) => mockReauthenticateWithCredential(...args),
  EmailAuthProvider: { credential: vi.fn().mockReturnValue('mock-credential') },
}));

vi.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'mock-uid',
      email: 'test@example.com',
      photoURL: null,
      getIdToken: vi.fn().mockResolvedValue('mock-token'),
    },
  },
}));

vi.mock('../../../services/storageService', () => ({
  default: {
    deleteProfilePhoto: vi.fn().mockResolvedValue(true),
  },
}));

global.fetch = mockFetch;

import userService from '../../../services/userService';
import { auth } from '../../../config/firebase';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('deleteAccount', () => {
    it('completes full deletion flow', async () => {
      mockReauthenticateWithCredential.mockResolvedValue(true);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      mockDeleteUser.mockResolvedValue(true);

      const result = await userService.deleteAccount('password123');

      expect(mockReauthenticateWithCredential).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/delete-account'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(mockDeleteUser).toHaveBeenCalledWith(auth.currentUser);
      expect(result.success).toBe(true);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('throws on wrong password', async () => {
      mockReauthenticateWithCredential.mockRejectedValue({
        code: 'auth/wrong-password',
      });

      await expect(userService.deleteAccount('wrong')).rejects.toThrow('Mot de passe incorrect');
    });

    it('throws when no current user', async () => {
      const original = auth.currentUser;
      auth.currentUser = null;

      await expect(userService.deleteAccount('pw')).rejects.toThrow('Aucun utilisateur connecté');

      auth.currentUser = original;
    });

    it('throws when database deletion fails', async () => {
      mockReauthenticateWithCredential.mockResolvedValue(true);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: 'DB error' }),
      });

      await expect(userService.deleteAccount('pw')).rejects.toThrow('DB error');
    });
  });

  describe('getUserData', () => {
    it('calls /auth/profile endpoint', async () => {
      const profileData = { id: '1', firstName: 'Test', lastName: 'User' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(profileData),
      });

      const result = await userService.getUserData();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/profile'),
        expect.any(Object)
      );
      expect(result).toEqual(profileData);
    });
  });

  describe('exportUserData', () => {
    it('calls /auth/export-data with POST', async () => {
      const exportData = { success: true, data: { orders: [], reviews: [] } };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(exportData),
      });

      const result = await userService.exportUserData();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/export-data'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.success).toBe(true);
    });
  });
});
