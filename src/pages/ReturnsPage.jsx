import React from 'react';
import { Link } from 'react-router-dom';

const ReturnsPage = () => {
  const returnSteps = [
    { step: 1, title: 'Connectez-vous', description: 'Accédez à votre compte et allez dans "Mes commandes"' },
    { step: 2, title: 'Sélectionnez', description: 'Choisissez la commande et les articles à retourner' },
    { step: 3, title: 'Imprimez l\'étiquette', description: 'Téléchargez et imprimez l\'étiquette de retour gratuite' },
    { step: 4, title: 'Expédiez', description: 'Collez l\'étiquette sur votre colis et déposez-le en point relais' },
    { step: 5, title: 'Remboursement', description: 'Une fois reçu, votre remboursement est traité sous 5-10 jours' }
  ];

  const returnConditions = [
    {
      icon: '✅',
      title: 'Articles éligibles',
      items: [
        'Articles non utilisés et dans leur emballage d\'origine',
        'Accessoires et documentation inclus',
        'Étiquettes et emballages intacts',
        'Aucun signe d\'usure ou de dommage'
      ]
    },
    {
      icon: '❌',
      title: 'Articles non échangeables',
      items: [
        'Articles personnalisés ou sur mesure',
        'Produits défectueux (remplacement direct)',
        'Articles endommagés par le client',
        'Produits périmés ou expirés'
      ]
    }
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
                ↩️
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Retours & Remboursements
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Politique de retour simple et gratuite
            </p>
          </div>
        </div>
      </section>

      {/* Policy Overview */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  14 jours
                </div>
                <div className="text-gray-600 font-medium">
                  Délai de retour
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Gratuit
                </div>
                <div className="text-gray-600 font-medium">
                  Retour offert
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  5-10 jours
                </div>
                <div className="text-gray-600 font-medium">
                  Remboursement
                </div>
              </div>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                Vous disposez de <strong>14 jours calendaires</strong> à compter de la réception de votre commande 
                pour retourner un article qui ne vous convient pas. Le retour est <strong>gratuit</strong> pour tous 
                nos clients, et encore plus simple pour les membres UMOD Prime.
              </p>
              <p>
                Une fois votre retour reçu et vérifié, le remboursement est effectué sur votre moyen de paiement 
                initial sous <strong>5 à 10 jours ouvrés</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Steps */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-blue-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Comment Retourner un Article
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Processus simple en 5 étapes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {returnSteps.map((item, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg text-center transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {returnConditions.map((condition, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50"
              >
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">{condition.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {condition.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {condition.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-gray-700">
                      <span className="mr-2 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange & Refund Info */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Échange & Remboursement
            </h2>
            
            <div className="space-y-6 text-gray-700">
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">🔄</span>
                  Échange
                </h3>
                <p>
                  Vous souhaitez échanger un article contre une autre taille ou couleur ? 
                  Contactez notre service client à <a href="mailto:contact@umod.fr" className="text-blue-600 hover:text-blue-700 font-semibold">contact@umod.fr</a>. 
                  Nous organiserons l'échange rapidement.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">💰</span>
                  Remboursement
                </h3>
                <p>
                  Le remboursement est effectué sur votre moyen de paiement initial (carte bancaire, PayPal, etc.) 
                  sous 5 à 10 jours ouvrés après réception et vérification du retour. Vous recevrez un email de 
                  confirmation une fois le remboursement traité.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Articles défectueux
                </h3>
                <p>
                  Si vous recevez un article défectueux, contactez-nous immédiatement. Nous organiserons un 
                  remplacement direct sans frais supplémentaires. Vous n'avez pas besoin de retourner l'article 
                  défectueux dans ce cas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Besoin d'aide pour un retour ?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Notre équipe est disponible pour vous accompagner dans votre démarche
            </p>
            <Link 
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              📞 Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnsPage;

