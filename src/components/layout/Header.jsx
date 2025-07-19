import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
// Icons temporarily removed due to React 19 compatibility
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UMOD</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Produits
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Catégories
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              À propos
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              🛒
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 transition-colors">
                  👤
                  <span className="hidden sm:block text-sm font-medium">
                    {user.firstName}
                  </span>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mon profil
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mes commandes
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Administration
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors">
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 