import React from 'react';

const OrderSummary = ({ items, subtotal, shippingCost, total, shippingMethod }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sticky top-8">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Résumé de la commande</h2>
        <p className="text-sm text-gray-600 mt-1">{items.length} article(s)</p>
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
                {(item.price * item.quantity).toFixed(2)} €
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sous-total</span>
          <span className="text-gray-900">{subtotal.toFixed(2)} €</span>
        </div>
        
        {shippingMethod && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Livraison ({shippingMethod.name})
            </span>
            <span className="text-gray-900">{shippingCost.toFixed(2)} €</span>
          </div>
        )}

        {/* Free shipping indicator */}
        {subtotal >= 50 && shippingCost > 0 && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">🎉</span>
              <span className="text-sm text-green-800 font-medium">
                Livraison gratuite !
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Votre commande dépasse 50€
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            TVA incluse
          </p>
        </div>
      </div>

      {/* Shipping Method Summary */}
      {shippingMethod && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="text-xl">{shippingMethod.icon}</div>
            <div>
              <h4 className="font-medium text-gray-900">{shippingMethod.name}</h4>
              <p className="text-sm text-gray-600">{shippingMethod.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Livraison estimée: {shippingMethod.estimatedDays}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="text-xl">🔒</div>
          <div>
            <h4 className="font-medium text-gray-900">Paiement sécurisé</h4>
            <p className="text-xs text-gray-600">
              Vos données sont protégées par un cryptage SSL
            </p>
          </div>
        </div>
      </div>

      {/* Return Policy */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Retours gratuits sous 30 jours</p>
        <p>• Garantie 2 ans sur tous les produits</p>
        <p>• Service client 24/7</p>
      </div>
    </div>
  );
};

export default OrderSummary; 