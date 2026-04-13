import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Banknote, Gift, Truck, Clock, MapPin, FileText, Home, Phone, AlertTriangle } from 'lucide-react';

const ShippingPage = () => {
  const highlights = [
    {
      name: 'Livraison partout au Maroc',
      tag: '2 à 5 jours ouvrés',
      description: 'Nous livrons dans toutes les grandes villes et régions du Royaume.',
      icon: Truck
    },
    {
      name: 'Livraison gratuite dès 300 DH',
      tag: 'Offerte automatiquement',
      description: 'Dès que votre panier atteint 300 DH, la livraison devient gratuite.',
      icon: Gift
    },
    {
      name: 'Paiement à la livraison',
      tag: 'Ou par carte bancaire',
      description: 'Réglez votre commande à la réception, en espèces, ou en ligne par carte.',
      icon: Banknote
    }
  ];

  const steps = [
    { step: 1, title: 'Commande validée', description: 'Vous recevez un email de confirmation avec le récapitulatif de votre commande.' },
    { step: 2, title: 'Préparation', description: 'Nous préparons vos produits avec soin sous 24 à 48h ouvrées.' },
    { step: 3, title: 'Expédition', description: 'Votre commande part vers votre adresse et vous recevez un email de suivi.' },
    { step: 4, title: 'Livraison', description: 'Vous êtes contacté(e) avant la livraison, puis votre colis vous est remis.' }
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
              Livraison rapide et soignée partout au Maroc
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              Comment ça se passe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une livraison simple, transparente et pensée pour les clientes et clients marocains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50 transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  {item.name}
                </h3>
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full">
                    {item.tag}
                  </span>
                </div>
                <p className="text-gray-600 text-center leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery pricing row */}
          <div className="mt-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="flex items-center justify-center text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Zone de livraison</span>
                </div>
                <p className="text-lg font-bold text-gray-900">Tout le Maroc</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center text-gray-500 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Délai standard</span>
                </div>
                <p className="text-lg font-bold text-gray-900">2 à 5 jours ouvrés</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center text-gray-500 mb-2">
                  <Truck className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Frais de livraison</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  Gratuite dès 300 DH
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {/* TODO : confirmer le tarif exact sous 300 DH */}
                  Sous 300 DH : tarif indiqué au checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-primary-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              De la commande à la réception
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quatre étapes claires, un suivi par email à chaque moment clé.
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
              Informations importantes
            </h2>

            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <FileText className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Suivi de commande</h3>
                  <p>Dès l'expédition, vous recevez un email avec les informations de suivi. Vous pouvez également retrouver votre commande à tout moment depuis votre compte, rubrique « Mes commandes ».</p>
                </div>
              </div>

              <div className="flex items-start">
                <Home className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Adresse de livraison</h3>
                  <p>Vérifiez bien votre adresse et votre numéro de téléphone avant de valider votre commande. En cas d'erreur, contactez-nous le plus vite possible : nous essayons toujours de corriger l'expédition avant le départ du colis.</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Contact avant livraison</h3>
                  <p>Le livreur peut vous appeler avant le passage pour confirmer votre disponibilité. Assurez-vous que le numéro renseigné au checkout soit bien joignable.</p>
                </div>
              </div>

              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Colis endommagé</h3>
                  <p>Si votre colis arrive visiblement abîmé, refusez-le ou prenez des photos avant d'ouvrir. Contactez-nous dans les 48h : nous organiserons un remplacement ou un remboursement selon le cas.</p>
                </div>
              </div>

              <div className="flex items-start">
                <Package className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Transporteur</h3>
                  <p>
                    {/* TODO : préciser le transporteur exact une fois confirmé côté business */}
                    Vos commandes sont confiées à un transporteur partenaire couvrant l'ensemble du territoire marocain.
                  </p>
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
            <h2 className="text-3xl font-bold mb-4">Une question sur votre livraison ?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Notre équipe est disponible pour vous répondre du lundi au samedi.
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
