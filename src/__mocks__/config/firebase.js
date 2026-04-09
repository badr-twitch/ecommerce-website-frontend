// Mock Firebase client SDK
// This replaces src/config/firebase.js in tests

const mockGetIdToken = vi.fn().mockResolvedValue('mock-firebase-token');
const mockGetIdTokenResult = vi.fn().mockResolvedValue({
  claims: {},
  token: 'mock-firebase-token',
});

export const auth = {
  currentUser: {
    uid: 'mock-firebase-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    photoURL: null,
    getIdToken: mockGetIdToken,
    getIdTokenResult: mockGetIdTokenResult,
  },
  onAuthStateChanged: vi.fn((callback) => {
    // Call with mock user by default
    callback(auth.currentUser);
    // Return unsubscribe function
    return vi.fn();
  }),
};

export const googleProvider = {};
export const facebookProvider = {};
export const storage = {};

// Expose mock functions for test assertions
export const __mocks = {
  getIdToken: mockGetIdToken,
  getIdTokenResult: mockGetIdTokenResult,
};

export default {};
