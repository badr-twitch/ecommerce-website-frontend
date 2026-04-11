import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../../services/paymentService';
import useModal from '../../hooks/useModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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

// Inner form that has access to Stripe context
const AddCardForm = ({ clientSecret, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardComplete) return;

    setIsSubmitting(true);
    setCardError(null);

    try {
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (error) {
        setCardError(error.message);
        setIsSubmitting(false);
        return;
      }

      if (setupIntent.status === 'succeeded') {
        onSuccess();
      } else {
        setCardError(`Statut inattendu: ${setupIntent.status}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      setCardError(err.message || 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Paiement sécurisé</h4>
            <p className="text-sm text-gray-600">
              Vos données bancaires sont traitées directement par Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="btn-outline flex-1"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !stripe || !cardComplete}
          className="btn-primary flex-1"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enregistrement...</span>
            </div>
          ) : (
            'Ajouter la carte'
          )}
        </button>
      </div>
    </form>
  );
};

const AddPaymentModal = ({ isOpen, onClose, onAdd }) => {
  useModal(isOpen, onClose);
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [setupError, setSetupError] = useState(null);

  // Fetch SetupIntent when modal opens
  useEffect(() => {
    if (isOpen) {
      setClientSecret(null);
      setSetupError(null);
      setLoadingSetup(true);

      paymentService.createSetupIntent()
        .then((result) => {
          setClientSecret(result.clientSecret);
        })
        .catch((err) => {
          console.error('Error creating setup intent:', err);
          setSetupError(
            err.response?.data?.error ||
            err.message ||
            'Erreur lors de la préparation du formulaire'
          );
        })
        .finally(() => {
          setLoadingSetup(false);
        });
    }
  }, [isOpen]);

  const handleSuccess = () => {
    onAdd(); // Trigger reload of payment methods in parent
    onClose();
  };

  const stripeOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#2563eb',
          borderRadius: '12px'
        }
      }
    };
  }, [clientSecret]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in" role="dialog" aria-modal="true">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Ajouter une carte
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Fermer"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {loadingSetup && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          )}

          {setupError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-medium">Erreur</p>
              <p className="text-red-600 text-sm mt-1">{setupError}</p>
              <button
                onClick={onClose}
                className="mt-3 text-sm text-red-700 underline hover:text-red-800"
              >
                Fermer
              </button>
            </div>
          )}

          {clientSecret && stripeOptions && (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <AddCardForm clientSecret={clientSecret} onSuccess={handleSuccess} onClose={onClose} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
