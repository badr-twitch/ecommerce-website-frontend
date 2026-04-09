import React, { useState } from 'react';

const ShippingOptions = ({ shippingData, onSelect, onBack, isMember = false }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Livraison standard',
      description: 'Livraison en 3-5 jours ouvrables',
      price: 5.99,
      icon: '🚚',
      estimatedDays: '3-5 jours',
      features: ['Suivi en ligne', 'Livraison à domicile', 'Signature requise']
    },
    {
      id: 'express',
      name: 'Livraison express',
      description: 'Livraison en 1-2 jours ouvrables',
      price: 12.99,
      icon: '⚡',
      estimatedDays: '1-2 jours',
      features: ['Livraison prioritaire', 'Suivi en temps réel', 'Livraison garantie']
    },
    {
      id: 'premium',
      name: 'Livraison premium',
      description: 'Livraison le jour même (si commandé avant 12h)',
      price: 19.99,
      icon: '🏆',
      estimatedDays: 'Le jour même',
      features: ['Livraison le jour même', 'Service premium', 'Contact dédié']
    },
    {
      id: 'pickup',
      name: 'Point relais',
      description: 'Retrait en point relais en 2-3 jours',
      price: 3.99,
      icon: '📦',
      estimatedDays: '2-3 jours',
      features: ['Retrait en point relais', 'Horaires étendus', 'Gratuit après 322 DH']
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Options d'expédition</h2>
        <p className="text-gray-600">Choisissez votre méthode de livraison</p>
      </div>

      {/* Shipping Address Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Adresse de livraison</h3>
        <div className="text-sm text-gray-600">
          <p>{shippingData.firstName} {shippingData.lastName}</p>
          <p>{shippingData.address}</p>
          <p>{shippingData.postalCode} {shippingData.city}</p>
          <p>{shippingData.country}</p>
        </div>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
        >
          Modifier l'adresse
        </button>
      </div>

      {/* Prime Member Banner */}
      {isMember && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h4 className="font-semibold">UMOD Prime — Livraison express gratuite</h4>
              <p className="text-sm text-white/80">Toutes les options de livraison sont gratuites avec votre abonnement.</p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Methods */}
      <div className="space-y-4">
        {shippingMethods.map((method) => {
          const displayPrice = isMember ? 0 : method.price;
          return (
          <div
            key={method.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
              selectedMethod?.id === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">{method.name}</h3>
                    {selectedMethod?.id === method.id && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Sélectionné
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{method.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>⏱️ {method.estimatedDays}</span>
                      <span>💰 {isMember ? 'GRATUIT' : `${parseFloat(method.price).toFixed(2)} DH`}</span>
                    </div>
                    <div className="mt-2">
                      <ul className="text-xs text-gray-500 space-y-1">
                        {method.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-green-500 mr-1">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {isMember ? (
                  <div>
                    <div className="text-lg font-bold text-green-600">GRATUIT</div>
                    <div className="text-xs text-gray-400 line-through">{parseFloat(method.price).toFixed(2)} DH</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {parseFloat(method.price).toFixed(2)} DH
                    </div>
                    {method.id === 'pickup' && (
                      <div className="text-xs text-green-600 mt-1">
                        Gratuit après 322 DH
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Special Offers */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎁</div>
          <div>
            <h4 className="font-medium text-gray-900">Offres spéciales</h4>
            <p className="text-sm text-gray-600">
              Livraison gratuite pour les commandes de plus de 536 DH
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
        >
          Retour
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Continuer vers le paiement
        </button>
      </div>
    </div>
  );
};

export default ShippingOptions; 