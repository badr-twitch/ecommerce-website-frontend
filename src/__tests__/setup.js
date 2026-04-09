import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
delete window.location;
window.location = { href: '', assign: vi.fn(), replace: vi.fn(), reload: vi.fn() };

// Silence console.log in tests
vi.spyOn(console, 'log').mockImplementation(() => {});

// Clean up between tests
afterEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
