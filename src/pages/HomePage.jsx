import React, { useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { WishlistContext } from '../contexts/WishlistContext';
import { ProductRecommendations } from '../components/recommendations';
import MembershipHighlight from '../components/membership/MembershipHighlight';
import useScrollReveal from '../hooks/useScrollReveal';
import { ArrowRight, Truck, Shield, Headphones, Heart, ShoppingCart, Sparkles, Star, Zap } from 'lucide-react';

const HomePage = () => {
  const { addItem } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const revealRef = useScrollReveal();

  const handleAddToCart = useCallback((product) => {
    addItem(product, 1);
  }, [addItem]);

  const handleToggleWishlist = useCallback(async (product) => {
    if (isInWishlist(product.id)) {
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
      category: "Electronique"
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
      name: "Edition Limitee",
      price: "13 939 DH",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      category: "Lifestyle"
    }
  ];

  const categories = [
    { name: "Electronique", icon: Zap, count: "150+", color: "from-primary-500 to-cyan-400" },
    { name: "Mode", icon: Sparkles, count: "200+", color: "from-pink-500 to-rose-400" },
    { name: "Maison", icon: Shield, count: "100+", color: "from-amber-500 to-orange-400" },
    { name: "Sport", icon: Star, count: "80+", color: "from-emerald-500 to-teal-400" },
  ];

  return (
    <div ref={revealRef} className="min-h-screen">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-hero-mesh">
        {/* Animated gradient orbs */}
        <div className="gradient-orb w-[500px] h-[500px] bg-primary-400/30 -top-40 -left-40 animate-float" />
        <div className="gradient-orb w-[400px] h-[400px] bg-secondary-400/20 top-20 -right-32 animate-float-slow" />
        <div className="gradient-orb w-[300px] h-[300px] bg-accent-300/15 bottom-0 left-1/3 animate-float-delayed" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-primary-200/50 rounded-full text-sm font-medium text-primary-700 mb-8 shadow-soft">
              <Sparkles className="w-4 h-4" />
              Nouvelle collection disponible
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ animationDelay: '0.1s' }}>
              <span className="text-gray-900">Decouvrez</span>
              <br />
              <span className="text-gradient-animate">l'Excellence</span>
            </h1>

            <p className="animate-fade-in-up text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Votre boutique en ligne de confiance. Des produits de qualite,
              un service exceptionnel et une experience d'achat moderne.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-2xl shadow-glow-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
              >
                Decouvrir nos produits
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-primary-300 hover:text-primary-700 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                En savoir plus
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto" style={{ animationDelay: '0.4s' }}>
              {[
                { value: "10K+", label: "Clients" },
                { value: "500+", label: "Produits" },
                { value: "4.9", label: "Note moyenne" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80V40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ============ MEMBERSHIP HIGHLIGHT ============ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-8 relative z-10">
        <MembershipHighlight />
      </div>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="text-gradient">UMOD</span> ?
            </h2>
            <div className="section-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                Icon: Truck,
                title: "Livraison Rapide",
                description: "Livraison gratuite en 24h sur toute la France metropolitaine",
                gradient: "from-primary-500 to-cyan-400",
                delay: "stagger-1"
              },
              {
                Icon: Shield,
                title: "Garantie Qualite",
                description: "Tous nos produits sont garantis 2 ans avec retour gratuit",
                gradient: "from-emerald-500 to-teal-400",
                delay: "stagger-2"
              },
              {
                Icon: Headphones,
                title: "Support 24/7",
                description: "Notre equipe est disponible pour vous accompagner a tout moment",
                gradient: "from-violet-500 to-secondary-400",
                delay: "stagger-3"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`reveal ${feature.delay} group card-3d p-8 text-center`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                  <feature.Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES SECTION ============ */}
      <section className="py-20 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explorez nos <span className="text-gradient">categories</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Trouvez exactement ce que vous cherchez
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/categories/${category.name.toLowerCase()}`}
                className={`reveal stagger-${index + 1} group relative bg-white rounded-2xl p-6 lg:p-8 text-center border border-gray-100 hover:border-transparent transition-all duration-500 hover:shadow-3d-lg hover:-translate-y-2 overflow-hidden`}
              >
                {/* Background glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-400">{category.count} produits</p>

                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-medium text-primary-600 flex items-center justify-center gap-1">
                    Explorer <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 reveal">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Produits <span className="text-gradient">vedettes</span>
              </h2>
              <p className="text-gray-500">Decouvrez nos produits les plus populaires</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors group"
            >
              Voir tout
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`reveal stagger-${index + 1} group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-3d-lg hover:-translate-y-2`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-lg shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Wishlist button */}
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 ${
                      isInWishlist(product.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                  </button>

                  {/* Quick add — appears on hover */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/95 backdrop-blur-sm text-gray-900 font-semibold rounded-xl shadow-lg hover:bg-white transition-colors active:scale-[0.97]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold text-primary-600">{product.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile "voir tout" */}
          <div className="sm:hidden text-center mt-8 reveal">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center gap-2"
            >
              Voir tous les produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ RECOMMENDATIONS ============ */}
      <section className="py-20 bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
          <ProductRecommendations
            type="user"
            limit={8}
            showTitle={true}
          />
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 rounded-3xl p-10 sm:p-16 text-center">
            {/* Background orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Restez informe
              </h2>
              <p className="text-primary-100 mb-8 text-lg">
                Recevez nos dernieres offres et nouveautes en avant-premiere
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-5 py-3.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all duration-300"
                />
                <button className="px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 hover:shadow-xl active:scale-[0.97] whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
