import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const values = [
    {
      icon: '🎯',
      title: 'Excellence',
      description: 'Nous nous engageons à offrir des produits et services de la plus haute qualité.'
    },
    {
      icon: '🤝',
      title: 'Intégrité',
      description: 'Transparence et honnêteté dans toutes nos interactions avec nos clients.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Nous restons à la pointe de la technologie pour améliorer votre expérience.'
    },
    {
      icon: '❤️',
      title: 'Service Client',
      description: 'Votre satisfaction est notre priorité absolue. Nous sommes là pour vous aider.'
    }
  ];

  const team = [
    {
      name: 'Équipe UMOD',
      role: 'Développement & Innovation',
      description: 'Notre équipe passionnée travaille sans relâche pour vous offrir la meilleure expérience d\'achat en ligne.'
    },
    {
      name: 'Service Client',
      role: 'Support & Assistance',
      description: 'Notre équipe de support est disponible pour répondre à toutes vos questions et résoudre vos problèmes.'
    },
    {
      name: 'Logistique',
      role: 'Livraison & Stock',
      description: 'Nous garantissons une livraison rapide et sécurisée de vos commandes partout en France.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Clients satisfaits' },
    { number: '5,000+', label: 'Produits disponibles' },
    { number: '24/7', label: 'Support client' },
    { number: '99%', label: 'Taux de satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                ℹ️
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              À propos de UMOD
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Votre boutique en ligne française de confiance depuis 2020
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Notre Histoire
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                Fondée en 2020, UMOD est née d'une vision simple : rendre l'achat en ligne accessible, 
                agréable et fiable pour tous. Nous avons commencé avec une petite sélection de produits 
                soigneusement choisis et une détermination à offrir un service client exceptionnel.
              </p>
              <p>
                Aujourd'hui, nous sommes fiers d'être l'une des boutiques en ligne les plus appréciées 
                de France, avec des milliers de clients satisfaits et une gamme de produits qui ne cesse 
                de s'élargir. Notre succès repose sur trois piliers fondamentaux : la qualité de nos 
                produits, l'excellence de notre service client et notre engagement envers l'innovation.
              </p>
              <p>
                Chez UMOD, nous croyons que chaque achat devrait être une expérience positive. C'est pourquoi 
                nous investissons continuellement dans l'amélioration de notre plateforme, l'expansion de 
                notre catalogue et le renforcement de notre équipe pour mieux vous servir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident tout ce que nous faisons
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-blue-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Notre Équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des professionnels dévoués à votre service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                  👥
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-4 text-center">
                  {member.role}
                </p>
                <p className="text-gray-600 text-center leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
            <p className="text-lg leading-relaxed text-blue-100 mb-6">
              Offrir à chaque client une expérience d'achat exceptionnelle en combinant des produits 
              de qualité, un service client irréprochable et une plateforme innovante et facile à utiliser.
            </p>
            <p className="text-lg leading-relaxed text-blue-100">
              Nous nous engageons à évoluer constamment pour répondre à vos besoins et à rester 
              votre partenaire de confiance pour tous vos achats en ligne.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Rejoignez l'aventure UMOD
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Découvrez notre sélection de produits et profitez d'une expérience d'achat exceptionnelle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🛍️ Découvrir nos produits
              </Link>
              <Link 
                to="/contact"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                📞 Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

