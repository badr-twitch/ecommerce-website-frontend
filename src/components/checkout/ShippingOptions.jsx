import React, { useState } from 'react';
import { Truck, Zap, Award, Package, Clock, Check, Crown, Gift } from 'lucide-react';

const SHIPPING_ICONS = {
  standard: Truck,
  express: Zap,
  premium: Award,
  pickup: Package
};

const ShippingOptions = ({ shippingData, onSelect, onBack, isMember = false }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Livraison standard',
      description: 'Livraison en 3-5 jours ouvrables',
      price: 5.99,
      estimatedDays: '3-5 jours',
      features: ['Suivi en ligne', 'Livraison à domicile', 'Signature requise']
    },
    {
      id: 'express',
      name: 'Livraison express',
      description: 'Livraison en 1-2 jours ouvrables',
      price: 12.99,
      estimatedDays: '1-2 jours',
      features: ['Livraison prioritaire', 'Suivi en temps réel', 'Livraison garantie']
    },
    {
      id: 'premium',
      name: 'Livraison premium',
      description: 'Livraison le jour même (si commandé avant 12h)',
      price: 19.99,
      estimatedDays: 'Le jour même',
      features: ['Livraison le jour même', 'Service premium', 'Contact dédié']
    },
    {
      id: 'pickup',
      name: 'Point relais',
      description: 'Retrait en point relais en 2-3 jours',
      price: 3.99,
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
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Options d'expédition</h2>
            <p className="text-gray-500 text-sm">Choisissez votre méthode de livraison</p>
          </div>
        </div>
      </div>

      {/* Shipping Address Summary */}
      <div className="bg-primary-50/30 rounded-xl p-4 border border-primary-100/50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Adresse de livraison</h3>
        <div className="text-sm text-gray-600">
          <p>{shippingData.firstName} {shippingData.lastName}</p>
          <p>{shippingData.address}</p>
          <p>{shippingData.postalCode} {shippingData.city}</p>
          <p>{shippingData.country}</p>
        </div>
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 cursor-pointer transition-colors duration-200"
        >
          Modifier l'adresse
        </button>
      </div>

      {/* Prime Member Banner */}
      {isMember && (
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-white/90" />
            <div>
              <h4 className="font-semibold">UMOD Prime — Livraison gratuite</h4>
              <p className="text-sm text-white/80">Toutes les options de livraison sont gratuites.</p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Methods */}
      <div className="space-y-3">
        {shippingMethods.map((method) => {
          const MethodIcon = SHIPPING_ICONS[method.id] || Package;
          return (
          <div
            key={method.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
              selectedMethod?.id === method.id
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedMethod?.id === method.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <MethodIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{method.name}</h3>
                    {selectedMethod?.id === method.id && (
                      <span className="badge-primary text-xs">Sélectionné</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {method.estimatedDays}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-0.5">
                    {method.features.map((feature, index) => (
                      <li key={index} className="text-xs text-gray-500 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {isMember ? (
                  <div>
                    <div className="text-base font-bold text-green-600">GRATUIT</div>
                    <div className="text-xs text-gray-400 line-through">{parseFloat(method.price).toFixed(2)} DH</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {parseFloat(method.price).toFixed(2)} DH
                    </div>
                    {method.id === 'pickup' && (
                      <div className="text-xs text-green-600 mt-1">
                        Gratuit dès 322 DH
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
      <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Offres spéciales</h4>
            <p className="text-xs text-gray-500">
              Livraison gratuite dès 536 DH d'achat
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="btn-outline flex-1 cursor-pointer"
        >
          Retour
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="btn-primary flex-1 cursor-pointer"
        >
          Continuer vers le paiement
        </button>
      </div>
    </div>
  );
};

export default ShippingOptions; 