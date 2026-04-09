/**
 * Frontend test data factories
 */

let counter = 0;
const makeId = () => `test-id-${++counter}`;

export function buildUser(overrides = {}) {
  return {
    id: makeId(),
    firebaseUid: 'mock-firebase-uid',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+33612345678',
    role: 'client',
    userType: 'particulier',
    isActive: true,
    emailVerified: true,
    profilePhoto: null,
    ...overrides,
  };
}

export function buildProduct(overrides = {}) {
  const id = overrides.id || makeId();
  return {
    id,
    name: `Product ${id}`,
    description: 'A test product',
    price: 29.99,
    originalPrice: 39.99,
    currency: 'MAD',
    stockQuantity: 100,
    mainImage: '/images/test.jpg',
    images: ['/images/test.jpg'],
    brand: 'TestBrand',
    rating: 4.5,
    reviewCount: 10,
    onSale: false,
    featured: false,
    categoryId: makeId(),
    ...overrides,
  };
}

export function buildOrder(overrides = {}) {
  return {
    id: makeId(),
    orderNumber: `ORD-${Date.now()}`,
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 76.98,
    subtotal: 59.98,
    taxAmount: 12.00,
    shippingAmount: 5.00,
    createdAt: new Date().toISOString(),
    items: [],
    ...overrides,
  };
}

export function buildCartItem(overrides = {}) {
  const id = overrides.id || makeId();
  return {
    id,
    name: `Cart Product ${id}`,
    price: 29.99,
    image: '/images/test.jpg',
    quantity: 1,
    ...overrides,
  };
}

export function resetCounter() {
  counter = 0;
}
