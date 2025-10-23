import React, { useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { WishlistContext } from '../contexts/WishlistContext';
import { ProductRecommendations } from '../components/recommendations';

const HomePage = () => {
  const { addItem } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  const handleAddToCart = useCallback((product) => {
    addItem(product, 1);
  }, [addItem]);

  const handleToggleWishlist = useCallback(async (product) => {
    const isWishlisted = isInWishlist(product.id);
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist]);

  const featuredProducts = [
    {
      id: 1,
      name: "Produit Premium",
      price: "9 653 DH",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      category: "Électronique"
    },
    {
      id: 2,
      name: "Collection Exclusive",
      price: "3 216 DH",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      category: "Mode"
    },
    {
      id: 3,
      name: "Édition Limitée",
      price: "13 939 DH",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      category: "Lifestyle"
    }
  ];

  const categories = [
    { name: "Électronique", icon: "📱", count: "150+ produits" },
    { name: "Mode", icon: "👕", count: "200+ produits" },
    { name: "Maison", icon: "🏠", count: "100+ produits" },
    { name: "Sport", icon: "⚽", count: "80+ produits" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Découvrez</span>
              <br />
              <span className="text-gray-800">l'Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Votre boutique en ligne française de confiance. Des produits de qualité, 
              un service exceptionnel et une expérience d'achat moderne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                🛍️ Découvrir nos produits
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:text-blue-600 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg">
                ℹ️ En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Pourquoi choisir UMOD ?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nous nous engageons à vous offrir la meilleure expérience d'achat possible
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Livraison Rapide",
                description: "Livraison gratuite en 24h sur toute la France"
              },
              {
                icon: "🛡️",
                title: "Garantie Qualité",
                description: "Tous nos produits sont garantis 2 ans"
              },
              {
                icon: "💬",
                title: "Service Client",
                description: "Support 24/7 pour vous accompagner"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center group hover:shadow-xl transition-all duration-300 border border-gray-200/50">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50/50 to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Explorez nos catégories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trouvez exactement ce que vous cherchez parmi nos nombreuses catégories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/categories/${category.name.toLowerCase()}`}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300 border border-gray-200/50 hover:shadow-xl"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Produits Vedettes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez nos produits les plus populaires et tendance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-200/50">
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </div>

                  {/* Wishlist button */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => handleToggleWishlist(product)}
                      className={`p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
                        isInWishlist(product.id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-300'
                      }`}
                    >
                      {isInWishlist(product.id) ? '💝' : '🤍'}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">{product.price}</p>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    🛒 Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductRecommendations 
            type="user"
            limit={8}
            showTitle={true}
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center max-w-2xl mx-auto border border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Restez informé !
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Recevez nos dernières offres et nouveautés en avant-première
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 