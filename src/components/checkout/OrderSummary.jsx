import React from 'react';
import { Gift, Crown, Lock, Truck, Shield, RefreshCw, Check } from 'lucide-react';

const OrderSummary = ({ items, subtotal, shippingCost, total, shippingMethod, isMember = false, memberDiscount = 0 }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6 sticky top-24">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Résumé de la commande</h2>
        <p className="text-sm text-gray-500 mt-1">{items.length} article(s)</p>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={item.image || '/placeholder-product.jpg'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500">
                Quantité: {item.quantity}
              </p>
            </div>
            <div className="flex-shrink-0">
              <p className="text-sm font-medium text-gray-900">
                {(item.price * item.quantity).toFixed(2)} DH
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 border-t border-gray-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sous-total</span>
          <span className="text-gray-900 font-medium">{subtotal.toFixed(2)} DH</span>
        </div>

        {shippingMethod && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Livraison
            </span>
            {isMember ? (
              <span className="text-green-600 font-semibold">GRATUITE</span>
            ) : (
              <span className="text-gray-900 font-medium">{shippingCost.toFixed(2)} DH</span>
            )}
          </div>
        )}

        {/* Member discount */}
        {isMember && memberDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600 font-medium">Remise Prime -5%</span>
            <span className="text-secondary-600 font-medium">-{memberDiscount.toFixed(2)} DH</span>
          </div>
        )}

        {/* Free shipping indicator */}
        {!isMember && subtotal >= 536 && shippingCost === 0 && (
          <div className="bg-green-50/80 rounded-xl p-3 border border-green-100">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                Livraison gratuite !
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Votre commande dépasse 536 DH
            </p>
          </div>
        )}

        {/* Prime member benefits summary */}
        {isMember && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-3 border border-secondary-100">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-secondary-600" />
              <span className="text-sm text-secondary-800 font-medium">
                Avantages UMOD Prime
              </span>
            </div>
            <p className="text-xs text-secondary-600 mt-1">
              Livraison gratuite + 5% de remise
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gradient">{total.toFixed(2)} DH</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">TVA incluse</p>
        </div>
      </div>

      {/* Shipping Method Summary */}
      {shippingMethod && (
        <div className="mt-6 p-4 bg-primary-50/50 rounded-xl border border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{shippingMethod.name}</h4>
              <p className="text-xs text-gray-500">{shippingMethod.estimatedDays}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 p-3.5 bg-green-50/80 rounded-xl border border-green-100">
        <div className="flex items-center gap-2 mb-1.5">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-800">Paiement sécurisé</span>
        </div>
        <p className="text-xs text-green-600">Cryptage SSL 256-bit</p>
      </div>

      {/* Return Policy */}
      <div className="mt-3 space-y-1.5 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-gray-400" /> Retours gratuits sous 30 jours
        </p>
        <p className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-gray-400" /> Garantie 2 ans
        </p>
      </div>
    </div>
  );
};

export default OrderSummary; 