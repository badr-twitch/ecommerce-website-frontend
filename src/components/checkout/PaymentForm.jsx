import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard } from 'lucide-react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
      padding: '12px'
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626'
    }
  },
  hidePostalCode: true
};

const PaymentForm = ({ total, clientSecret, onPaymentSuccess, onBack, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    if (!termsAccepted) {
      setCardError('Veuillez accepter les conditions générales');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (error) {
        setCardError(error.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else {
        setCardError(`Statut de paiement inattendu: ${paymentIntent.status}`);
        setIsProcessing(false);
      }
    } catch (err) {
      setCardError(err.message || 'Une erreur est survenue lors du paiement');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
            <p className="text-gray-500 text-sm">Paiement sécurisé via Stripe</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Accepted payment methods */}
        <div className="bg-primary-50/30 rounded-xl p-4 border border-primary-100/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Méthodes acceptées</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">Visa</span>
            <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">Mastercard</span>
            <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">Amex</span>
          </div>
        </div>

        {/* Stripe Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations de carte *
          </label>
          <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${
            cardError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}>
            <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600">{cardError}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-green-50/80 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Paiement sécurisé</h4>
              <p className="text-xs text-gray-500">
                Vos données bancaires sont traitées directement par Stripe et ne transitent jamais par nos serveurs.
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
            J'accepte les <a href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">conditions générales</a> et la{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">politique de confidentialité</a>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="btn-outline flex-1 cursor-pointer"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isProcessing || !stripe || !cardComplete || !termsAccepted}
            className="btn-primary flex-1 cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Traitement...
              </span>
            ) : (
              `Payer ${total.toFixed(2)} DH`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
