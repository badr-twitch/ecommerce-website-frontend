import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
            <span className="text-4xl">✅</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Commande confirmée !
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Merci pour votre commande. Nous avons reçu votre paiement et nous préparons votre expédition.
        </p>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prochaines étapes</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email de confirmation</h3>
                <p className="text-sm text-gray-600">Vous recevrez un email de confirmation dans les prochaines minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Préparation de la commande</h3>
                <p className="text-sm text-gray-600">Notre équipe prépare votre commande pour l'expédition</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Suivi de livraison</h3>
                <p className="text-sm text-gray-600">Vous recevrez un numéro de suivi par email</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Continuer les achats
          </Link>
          
          <Link
            to="/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
          >
            Voir mes commandes
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Des questions ? Contactez notre service client au 01 23 45 67 89</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 