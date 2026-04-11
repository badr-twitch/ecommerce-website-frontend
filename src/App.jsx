import React, { Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Layout from './components/layout/Layout';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';

// Lazy-loaded page components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));
const EmailVerificationPage = React.lazy(() => import('./pages/auth/EmailVerificationPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const NotificationPreferencesPage = React.lazy(() => import('./pages/NotificationPreferencesPage'));
const MembershipPage = React.lazy(() => import('./pages/MembershipPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const ShippingPage = React.lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = React.lazy(() => import('./pages/ReturnsPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const OrderTrackingPage = React.lazy(() => import('./pages/OrderTrackingPage'));
const SharedOrderPage = React.lazy(() => import('./pages/SharedOrderPage'));

const PUBLIC_PATHS = [
  '/login', '/register', '/forgot-password', '/reset-password', '/verify-email',
  '/privacy', '/terms', '/about', '/faq', '/shipping', '/returns', '/help', '/contact',
];

const isPublicPath = (pathname) => {
  if (pathname.startsWith('/orders/shared/')) return true;
  return PUBLIC_PATHS.includes(pathname);
};

// Blocks logged-in users with an unverified email from accessing the app
function EmailVerificationGate({ children }) {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) return null;

  const firebaseVerified = getAuth().currentUser?.emailVerified ?? false;
  if (user && !user.emailVerified && !firebaseVerified && !isPublicPath(location.pathname)) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminProvider>
            <NotificationProvider>
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
              <Router>
                <EmailVerificationGate>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/categories/:slug" element={<CategoryPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/verify-email" element={<EmailVerificationPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/orders/:id" element={<OrderDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      <Route path="/track-order" element={<OrderTrackingPage />} />
                      <Route path="/orders/shared/:token" element={<SharedOrderPage />} />
                      <Route path="/membership" element={<MembershipPage />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/notification-preferences" element={<NotificationPreferencesPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/shipping" element={<ShippingPage />} />
                      <Route path="/returns" element={<ReturnsPage />} />
                      <Route path="/help" element={<HelpPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </Layout>
                </EmailVerificationGate>
              </Router>
            </NotificationProvider>
          </AdminProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
