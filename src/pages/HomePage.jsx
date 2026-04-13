import React from 'react';
import { Link } from 'react-router-dom';
import { ProductRecommendations } from '../components/recommendations';
import MembershipHighlight from '../components/membership/MembershipHighlight';
import useScrollReveal from '../hooks/useScrollReveal';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Banknote,
  Sparkles,
  Droplet,
  Droplets,
  Scissors,
  Wind,
  Palette,
  Gift,
} from 'lucide-react';

const HomePage = () => {
  const revealRef = useScrollReveal();

  const categories = [
    {
      name: 'Soins de visage',
      slug: 'soins-de-visage',
      tagline: 'Nettoyer, hydrater, sublimer',
      icon: Droplet,
      color: 'from-rose-400 to-pink-500',
    },
    {
      name: 'Soins de corps',
      slug: 'soins-de-corps',
      tagline: 'Douceur et nutrition au quotidien',
      icon: Droplets,
      color: 'from-amber-400 to-orange-500',
    },
    {
      name: 'Soins capillaires',
      slug: 'soins-capillaires',
      tagline: 'Pour des cheveux forts et lumineux',
      icon: Scissors,
      color: 'from-violet-400 to-purple-500',
    },
    {
      name: 'Parfums',
      slug: 'parfums',
      tagline: 'Une signature qui vous ressemble',
      icon: Wind,
      color: 'from-fuchsia-400 to-rose-500',
    },
    {
      name: 'Maquillage',
      slug: 'maquillage',
      tagline: 'Teint, regard, lèvres : jouez avec les couleurs',
      icon: Palette,
      color: 'from-pink-400 to-red-500',
    },
    {
      name: 'Packages',
      slug: 'packages',
      tagline: 'Coffrets et routines prêts à offrir',
      icon: Gift,
      color: 'from-emerald-400 to-teal-500',
    },
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
              Cosmétiques multi-marques · Livraison partout au Maroc
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ animationDelay: '0.1s' }}>
              <span className="text-gray-900">La beauté,</span>
              <br />
              <span className="text-gradient-animate">réinventée pour vous</span>
            </h1>

            <p className="animate-fade-in-up text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Soins de visage, corps, cheveux, parfums et maquillage : une sélection
              de marques rigoureusement choisies, livrée directement chez vous au Maroc.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-2xl shadow-glow-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
              >
                Découvrir la boutique
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-primary-300 hover:text-primary-700 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Explorer les catégories
              </Link>
            </div>

            {/* Trust badges — replaces fake stats */}
            <div className="animate-fade-in-up mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto" style={{ animationDelay: '0.4s' }}>
              {[
                { Icon: Truck, title: 'Livraison au Maroc', sub: '2 à 5 jours ouvrés' },
                { Icon: Banknote, title: 'Paiement à la livraison', sub: 'Ou par carte bancaire' },
                { Icon: ShieldCheck, title: 'Produits authentiques', sub: 'Sélection multi-marques' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl text-left shadow-soft">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
                    <div className="text-xs text-gray-500 truncate">{sub}</div>
                  </div>
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
              Pourquoi choisir <span className="text-gradient">UMOD</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une expérience beauté pensée pour les clientes et clients marocains.
            </p>
            <div className="section-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                Icon: Truck,
                title: 'Livraison partout au Maroc',
                description: 'Livraison standard en 2 à 5 jours ouvrés, offerte dès 300 DH d\'achat.',
                gradient: 'from-primary-500 to-cyan-400',
                delay: 'stagger-1'
              },
              {
                Icon: Banknote,
                title: 'Paiement à la livraison',
                description: 'Réglez en toute sérénité à la réception de votre commande, ou par carte bancaire.',
                gradient: 'from-emerald-500 to-teal-400',
                delay: 'stagger-2'
              },
              {
                Icon: ShieldCheck,
                title: 'Sélection multi-marques',
                description: 'Des marques soigneusement choisies pour leur qualité, leur efficacité et leur tenue.',
                gradient: 'from-violet-500 to-secondary-400',
                delay: 'stagger-3'
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
              Explorez nos <span className="text-gradient">catégories</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Une routine beauté complète, des soins aux parfums.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className={`reveal stagger-${(index % 4) + 1} group relative bg-white rounded-2xl p-6 lg:p-8 text-center border border-gray-100 hover:border-transparent transition-all duration-500 hover:shadow-3d-lg hover:-translate-y-2 overflow-hidden`}
              >
                {/* Background glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.tagline}</p>

                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm font-medium text-primary-600 flex items-center justify-center gap-1">
                    Découvrir <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRENDING PRODUCTS ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 reveal">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Nos <span className="text-gradient">coups de cœur</span>
              </h2>
              <p className="text-gray-500">Les produits les plus appréciés par notre communauté</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors group"
            >
              Voir tout
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="reveal">
            <ProductRecommendations
              type="trending"
              limit={6}
              showTitle={false}
            />
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

      {/* ============ PERSONAL RECOMMENDATIONS ============ */}
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
                Rejoignez la communauté UMOD
              </h2>
              <p className="text-primary-100 mb-8 text-lg">
                Nouveautés, conseils beauté et offres exclusives, directement dans votre boîte mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  aria-label="Adresse email pour la newsletter"
                  className="flex-1 px-5 py-3.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all duration-300"
                />
                <button className="px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 hover:shadow-xl active:scale-[0.97] whitespace-nowrap cursor-pointer">
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
