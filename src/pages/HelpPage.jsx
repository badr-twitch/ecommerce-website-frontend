import React from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  const helpCategories = [
    {
      icon: '🛒',
      title: 'Commandes',
      description: 'Gérer vos commandes, suivre vos colis, modifier ou annuler',
      link: '/faq',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🚚',
      title: 'Livraison',
      description: 'Options de livraison, délais, frais et suivi de colis',
      link: '/shipping',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '↩️',
      title: 'Retours',
      description: 'Politique de retour, échange et remboursement',
      link: '/returns',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: '💳',
      title: 'Paiement',
      description: 'Modes de paiement, sécurité, factures et remboursements',
      link: '/faq',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '👤',
      title: 'Mon Compte',
      description: 'Gérer votre compte, mot de passe, adresses et préférences',
      link: '/profile',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '⭐',
      title: 'UMOD Prime',
      description: 'Avantages, gestion et annulation de votre abonnement',
      link: '/membership',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      content: 'contact@umod.fr',
      link: 'mailto:contact@umod.fr',
      description: 'Réponse sous 24h',
      color: 'blue'
    },
    {
      icon: '📞',
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      link: 'tel:+33123456789',
      description: 'Lun-Ven, 9h-18h',
      color: 'purple'
    },
    {
      icon: '💬',
      title: 'Chat en direct',
      content: 'Disponible sur le site',
      link: '#',
      description: 'Lun-Ven, 9h-18h',
      color: 'pink'
    },
    {
      icon: '📋',
      title: 'Formulaire',
      content: 'Formulaire de contact',
      link: '/contact',
      description: 'Réponse sous 48h',
      color: 'green'
    }
  ];

  const quickLinks = [
    { text: 'Questions fréquentes', link: '/faq' },
    { text: 'Politique de confidentialité', link: '/privacy' },
    { text: 'Conditions d\'utilisation', link: '/terms' },
    { text: 'À propos de nous', link: '/about' }
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
                ❓
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Centre d'Aide
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Par où commencer ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sélectionnez une catégorie pour trouver l'aide dont vous avez besoin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50 transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {category.description}
                </p>
                <div className="mt-4 text-center text-blue-600 font-semibold group-hover:text-blue-700">
                  En savoir plus →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-blue-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plusieurs façons de nous joindre
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 transform hover:-translate-y-1 transition-all duration-300 text-center group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${
                  method.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  method.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  method.color === 'pink' ? 'from-pink-500 to-pink-600' :
                  'from-green-500 to-green-600'
                } rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-700 font-medium mb-1">
                  {method.content}
                </p>
                <p className="text-sm text-gray-500">
                  {method.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
              Liens Utiles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.link}
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group"
                >
                  <span className="mr-3 text-xl group-hover:scale-110 transition-transform">→</span>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600">{link.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Help */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Consultez notre FAQ complète ou contactez directement notre équipe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/faq"
                className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                📋 Voir la FAQ
              </Link>
              <Link 
                to="/contact"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300"
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

export default HelpPage;

