import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext';
import NotificationBell from '../notifications/NotificationBell';
import { Search, Heart, ShoppingBag, Menu, X, User, Package, Settings, LogOut, Crown } from 'lucide-react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { getWishlistCount } = useContext(WishlistContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = getWishlistCount();

  // Scroll-aware header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navItems = [
    { to: "/", label: "Accueil" },
    { to: "/products", label: "Produits" },
    { to: "/membership", label: "UMOD Prime" },
    { to: "/categories", label: "Categories" },
    { to: "/about", label: "A propos" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-2xl shadow-3d border-b border-gray-200/30'
            : 'bg-white/60 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <div className="relative">
                <img
                  src="/LOGO.png"
                  alt="UMOD Logo"
                  className="h-12 w-auto transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive(item.to)
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {isActive(item.to) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-44 lg:w-56 px-4 py-2 pl-10 text-sm border-2 border-gray-200 rounded-xl bg-gray-50/80 focus:bg-white focus:outline-none focus:border-primary-400 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-scale-in">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-scale-in">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              {user && <NotificationBell />}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {user.firstName || user.displayName || user.email}
                    </span>
                    {user.membershipStatus === 'active' && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-fade-in-down overflow-hidden">
                        <div className="p-1.5">
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Mon profil</span>
                          </Link>
                          <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Mes commandes</span>
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                              <Settings className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">Administration</span>
                            </Link>
                          )}
                          <div className="my-1.5 border-t border-gray-100" />
                          <button
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Se deconnecter</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-glow-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Inscription
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search (expandable) */}
          {searchOpen && (
            <div className="md:hidden pb-4 animate-slide-down">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits..."
                  autoFocus
                  className="w-full px-4 py-3 pl-10 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-primary-400 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="p-6 pt-24">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {!user && (
                <div className="mt-8 space-y-3">
                  <Link to="/login" className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    Connexion
                  </Link>
                  <Link to="/register" className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-glow-primary">
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
