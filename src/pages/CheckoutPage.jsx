import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShoppingBag, Truck, CreditCard, Check } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import ShippingForm from '../components/checkout/ShippingForm';
import ShippingOptions from '../components/checkout/ShippingOptions';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentForm from '../components/checkout/PaymentForm';

// Load Stripe outside of component to avoid re-creating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    company: '',
    notes: ''
  });

  const [shippingMethod, setShippingMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Stripe state
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const isMember = user?.membershipStatus === 'active' &&
    user?.membershipExpiresAt && new Date(user.membershipExpiresAt) > new Date();

  const getShippingCost = () => isMember ? 0 : (shippingMethod?.price || 0);
  const getMemberDiscount = () => isMember ? Math.round(total * 0.05 * 100) / 100 : 0;
  const getTotalWithShipping = () => total + getShippingCost() - getMemberDiscount();

  // Create PaymentIntent when entering step 3
  useEffect(() => {
    if (currentStep === 3 && !clientSecret) {
      const createIntent = async () => {
        try {
          setPaymentError(null);
          const totalAmount = getTotalWithShipping();
          const result = await paymentService.createPaymentIntent(totalAmount, 'mad');
          setClientSecret(result.clientSecret);
          setPaymentIntentId(result.paymentIntentId);
        } catch (error) {
          console.error('Failed to create payment intent:', error);
          setPaymentError(
            error.response?.data?.error ||
            error.message ||
            'Erreur lors de la préparation du paiement'
          );
        }
      };
      createIntent();
    }
  }, [currentStep]);

  const handleShippingSubmit = (data) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handleShippingMethodSelect = (method) => {
    setShippingMethod(method);
    // Reset payment intent if total changed (different shipping method)
    setClientSecret(null);
    setPaymentIntentId(null);
    setCurrentStep(3);
  };

  // Called by PaymentForm after Stripe confirms the payment
  const handlePaymentSuccess = async (confirmedPaymentIntentId) => {
    try {
      // Create the order on our backend with the verified payment
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item.productId,
          quantity: item.quantity
        })),
        customerFirstName: shippingData.firstName,
        customerLastName: shippingData.lastName,
        customerEmail: shippingData.email,
        customerPhone: shippingData.phone,
        billingAddress: shippingData.address,
        billingCity: shippingData.city,
        billingPostalCode: shippingData.postalCode,
        billingCountry: shippingData.country,
        shippingAddress: shippingData.address,
        shippingCity: shippingData.city,
        shippingPostalCode: shippingData.postalCode,
        shippingCountry: shippingData.country,
        paymentMethod: 'card',
        paymentIntentId: confirmedPaymentIntentId,
        customerNotes: shippingData.notes || ''
      };

      await paymentService.createOrder(orderData);
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Order creation error:', error);
      setPaymentError(
        error.response?.data?.error ||
        'Le paiement a réussi mais la commande n\'a pas pu être créée. Contactez le support.'
      );
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, name: 'Livraison', icon: ShoppingBag, status: currentStep >= 1 ? 'current' : 'upcoming' },
    { id: 2, name: 'Expédition', icon: Truck, status: currentStep >= 2 ? 'current' : 'upcoming' },
    { id: 3, name: 'Paiement', icon: CreditCard, status: currentStep >= 3 ? 'current' : 'upcoming' }
  ];

  // Stripe Elements options — must include clientSecret
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

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Finaliser votre commande</h1>
          <div className="section-divider"></div>

          {/* Progress Steps */}
          <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center justify-center space-x-8">
              {steps.map((step, stepIdx) => {
                const StepIcon = step.icon;
                return (
                  <li key={step.name} className="relative">
                    {stepIdx !== steps.length - 1 ? (
                      <div className={`absolute top-4 left-8 -ml-px mt-0.5 h-0.5 w-16 ${
                        currentStep > step.id ? 'bg-primary-400' : 'bg-gray-200'
                      } transition-colors duration-300`} />
                    ) : null}
                    <div className="relative flex items-center">
                      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                        currentStep > step.id
                          ? 'border-primary-600 bg-primary-600 text-white shadow-glow-primary'
                          : step.status === 'current'
                          ? 'border-primary-600 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow-primary'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}>
                        {currentStep > step.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`ml-3 text-sm font-semibold ${
                        step.status === 'current' ? 'text-primary-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
              {currentStep === 1 && (
                <ShippingForm
                  initialData={shippingData}
                  onSubmit={handleShippingSubmit}
                />
              )}

              {currentStep === 2 && (
                <ShippingOptions
                  shippingData={shippingData}
                  onSelect={handleShippingMethodSelect}
                  onBack={() => setCurrentStep(1)}
                  isMember={isMember}
                />
              )}

              {currentStep === 3 && (
                <>
                  {paymentError && !clientSecret && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <p className="text-red-700 font-medium">Erreur de paiement</p>
                      <p className="text-red-600 text-sm mt-1">{paymentError}</p>
                      <button
                        onClick={() => {
                          setPaymentError(null);
                          setClientSecret(null);
                        }}
                        className="mt-3 text-sm text-red-700 underline hover:text-red-800"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}

                  {!clientSecret && !paymentError && (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-3 text-gray-500">Préparation du paiement...</span>
                    </div>
                  )}

                  {clientSecret && stripeOptions && (
                    <Elements stripe={stripePromise} options={stripeOptions}>
                      <PaymentForm
                        total={getTotalWithShipping()}
                        clientSecret={clientSecret}
                        onPaymentSuccess={handlePaymentSuccess}
                        onBack={() => setCurrentStep(2)}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                      />
                    </Elements>
                  )}

                  {paymentError && clientSecret && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                      <p className="text-red-600 text-sm">{paymentError}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={cartItems}
              subtotal={total}
              shippingCost={getShippingCost()}
              total={getTotalWithShipping()}
              shippingMethod={shippingMethod}
              isMember={isMember}
              memberDiscount={getMemberDiscount()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
