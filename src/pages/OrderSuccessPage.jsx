import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Package, Truck, ShoppingBag, ClipboardList } from 'lucide-react';

const OrderSuccessPage = () => {
  const steps = [
    { icon: Mail, title: 'Email de confirmation', description: 'Vous recevrez un email de confirmation dans les prochaines minutes' },
    { icon: Package, title: 'Préparation de la commande', description: 'Notre équipe prépare votre commande pour l\'expédition' },
    { icon: Truck, title: 'Suivi de livraison', description: 'Vous recevrez un numéro de suivi par email' },
  ];

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10 px-4">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Commande confirmée !
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Merci pour votre commande. Nous avons reçu votre paiement et nous préparons votre expédition.
        </p>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Prochaines étapes</h2>
          <div className="space-y-5 text-left">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Continuer les achats
          </Link>

          <Link to="/orders" className="btn-outline inline-flex items-center justify-center gap-2">
            <ClipboardList className="w-4 h-4" />
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
