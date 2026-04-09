import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Rocket, Store, Truck, Clock, MapPin, FileText, Home, Phone, AlertTriangle } from 'lucide-react';

const ShippingPage = () => {
  const shippingOptions = [
    {
      name: 'Livraison Standard',
      price: '4,99€',
      freeThreshold: 'Gratuite dès 50€',
      duration: '3-5 jours ouvrés',
      description: 'Livraison à domicile ou en point relais',
      icon: Package
    },
    {
      name: 'Livraison Express',
      price: '9,99€',
      freeThreshold: 'Gratuite pour UMOD Prime',
      duration: '24-48h',
      description: 'Livraison rapide à domicile uniquement',
      icon: Rocket
    },
    {
      name: 'Livraison Point Relais',
      price: 'Gratuite',
      freeThreshold: 'Toujours gratuite',
      duration: '3-5 jours ouvrés',
      description: 'Retrait dans un point relais près de chez vous',
      icon: Store
    }
  ];

  const steps = [
    { step: 1, title: 'Commande validée', description: 'Vous recevez un email de confirmation' },
    { step: 2, title: 'Préparation', description: 'Votre commande est préparée dans nos entrepôts' },
    { step: 3, title: 'Expédition', description: 'Vous recevez un email avec le numéro de suivi' },
    { step: 4, title: 'Livraison', description: 'Votre colis arrive à l\'adresse indiquée' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-secondary-600/90 to-pink-600/90"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Truck className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Livraison
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Options de livraison rapides et sécurisées partout en France
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              Options de Livraison
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez l'option qui vous convient le mieux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50 transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {option.name}
                </h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                    {option.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.freeThreshold}
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <strong>Délai :</strong> <span className="ml-2">{option.duration}</span>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{option.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-primary-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              Processus de Livraison
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              De la commande à la réception, suivez votre colis étape par étape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg text-center transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto">
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

      {/* Important Info */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6">
              Informations Importantes
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <FileText className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Suivi de commande</h3>
                  <p>Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pouvez suivre votre colis en temps réel depuis votre compte ou via le lien fourni.</p>
                </div>
              </div>

              <div className="flex items-start">
                <Home className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Adresse de livraison</h3>
                  <p>Assurez-vous que l'adresse de livraison est correcte. En cas d'erreur, contactez-nous immédiatement. Les modifications d'adresse après expédition peuvent entraîner des frais supplémentaires.</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Absence lors de la livraison</h3>
                  <p>Si vous êtes absent, le transporteur laissera un avis de passage. Vous pourrez reprogrammer la livraison ou récupérer votre colis au point relais indiqué.</p>
                </div>
              </div>

              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Colis endommagé</h3>
                  <p>Si votre colis arrive endommagé, refusez-le ou signalez-le immédiatement avec des photos. Nous organiserons un remplacement ou un remboursement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Besoin d'aide ?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Notre équipe est disponible pour répondre à toutes vos questions sur la livraison
            </p>
            <Link 
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Phone className="w-5 h-5 inline mr-1" /> Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPage;

