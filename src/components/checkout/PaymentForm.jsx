import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement</h2>
        <p className="text-gray-600">Paiement sécurisé via Stripe</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Accepted payment methods */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement acceptées</h3>
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border">Visa</span>
            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border">Mastercard</span>
            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border">Amex</span>
          </div>
        </div>

        {/* Stripe Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations de carte *
          </label>
          <div className={`border rounded-xl p-4 transition-all duration-300 ${
            cardError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
          }`}>
            <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600">{cardError}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Paiement sécurisé</h4>
              <p className="text-sm text-gray-600">
                Vos données bancaires sont traitées directement par Stripe et ne transitent jamais par nos serveurs.
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            J'accepte les <a href="/terms" className="text-blue-600 hover:text-blue-700">conditions générales</a> et la{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700">politique de confidentialité</a>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isProcessing || !stripe || !cardComplete || !termsAccepted}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Traitement en cours...</span>
              </div>
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
