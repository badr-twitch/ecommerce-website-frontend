import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext';
import NotificationBell from '../notifications/NotificationBell';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { getWishlistCount } = useContext(WishlistContext);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = getWishlistCount();

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo - moved to far left */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/LOGO.png" 
                alt="UMOD Logo" 
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Navigation - centered */}
          <nav className="hidden lg:flex space-x-1">
            {[
              { to: "/", label: "Accueil" },
              { to: "/products", label: "Produits" },
              { to: "/membership", label: "UMOD Prime" },
              { to: "/categories", label: "Catégories" },
              { to: "/about", label: "À propos" },
              { to: "/contact", label: "Contact" }
            ].map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="relative p-3 text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <div className="relative">
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">💝</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-3 text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <div className="relative">
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">🛒</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Notifications - Only show for authenticated users */}
            {user && <NotificationBell />}

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-gray-50">
                  {user.photoURL ? (
                    <div className="relative">
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-500/50 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-200 group-hover:ring-blue-500/50 transition-all duration-300">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">▼</span>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200"
                    >
                      <span className="text-lg">👤</span>
                      <span>Mon profil</span>
                    </Link>
                    <Link 
                      to="/orders" 
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200"
                    >
                      <span className="text-lg">📦</span>
                      <span>Mes commandes</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200"
                      >
                        <span className="text-lg">⚙️</span>
                        <span>Administration</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <button 
                      onClick={logout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg transition-all duration-200"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-gray-50 rounded-lg"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="lg:hidden p-3 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-gray-50">
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 